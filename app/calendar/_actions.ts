"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CalendarView, CycleIntensity, ItemKind, TimeOfDay } from "@/lib/types";

// ─── view persistence ────────────────────────────────────────────

export async function setCalendarView(formData: FormData): Promise<void> {
  const view = String(formData.get("view") ?? "") as CalendarView;
  const date = String(formData.get("date") ?? "");
  if (view !== "month" && view !== "week" && view !== "day") return;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profile")
    .update({ calendar_view: view })
    .eq("user_id", user.id);
  revalidatePath("/calendar");
  redirect(`/calendar?view=${view}&date=${date}`);
}

// ─── routine usage log ───────────────────────────────────────────

type LogRef =
  | { item_kind: "product"; product_id: string }
  | { item_kind: "supplement"; supplement_id: string }
  | { item_kind: "habit"; habit_id: string };

function refColumn(
  kind: ItemKind,
): "product_id" | "supplement_id" | "habit_id" {
  if (kind === "product") return "product_id";
  if (kind === "supplement") return "supplement_id";
  return "habit_id";
}

export async function toggleDailyLog(
  date: string,
  timeOfDay: TimeOfDay,
  kind: ItemKind,
  itemId: string,
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "generic" };
    const col = refColumn(kind);

    const { data: existing } = await supabase
      .from("daily_log")
      .select("id")
      .eq("log_date", date)
      .eq("time_of_day", timeOfDay)
      .eq("item_kind", kind)
      .eq(col, itemId)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from("daily_log").delete().eq("id", existing.id);
    } else {
      const ref: LogRef =
        kind === "product"
          ? { item_kind: "product", product_id: itemId }
          : kind === "supplement"
            ? { item_kind: "supplement", supplement_id: itemId }
            : { item_kind: "habit", habit_id: itemId };
      await supabase.from("daily_log").insert({
        log_date: date,
        time_of_day: timeOfDay,
        ...ref,
      });
    }

    revalidatePath("/calendar");
    revalidatePath(`/calendar/${date}`);
    return {};
  } catch {
    return { error: "generic" };
  }
}

// ─── mood + notes ────────────────────────────────────────────────

export async function setMood(date: string, mood: number | null): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "generic" };
    if (mood === null) {
      // Keep notes intact: only null the mood field if a row exists.
      await supabase.from("daily_notes").upsert({ log_date: date, mood: null });
    } else {
      await supabase.from("daily_notes").upsert({ log_date: date, mood });
    }
    revalidatePath("/calendar");
    revalidatePath(`/calendar/${date}`);
    return {};
  } catch {
    return { error: "generic" };
  }
}

export async function setNotes(date: string, notes: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("daily_notes").upsert({
    log_date: date,
    notes: notes.trim() || null,
  });
  revalidatePath(`/calendar/${date}`);
}

// ─── menstruation ────────────────────────────────────────────────

export async function setCycle(
  date: string,
  intensity: CycleIntensity | null,
): Promise<{ error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "generic" };
    if (intensity === null) {
      await supabase.from("cycle_log").delete().eq("log_date", date);
    } else {
      await supabase
        .from("cycle_log")
        .upsert({ log_date: date, intensity });
    }
    revalidatePath("/calendar");
    revalidatePath(`/calendar/${date}`);
    return {};
  } catch {
    return { error: "generic" };
  }
}

// ─── tags (observations) per day ─────────────────────────────────

export type TagActionState = {
  errorCode?: "name_required" | "generic";
  errorDetail?: string;
  ok?: boolean;
};

export async function attachTag(date: string, tagId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "generic" };
  const { error } = await supabase.from("daily_tags").upsert({ log_date: date, tag_id: tagId });
  if (error) return { error: error.message };
  revalidatePath(`/calendar/${date}`);
  return {};
}

export async function detachTag(date: string, tagId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "generic" };
  const { error } = await supabase
    .from("daily_tags")
    .delete()
    .eq("log_date", date)
    .eq("tag_id", tagId);
  if (error) return { error: error.message };
  revalidatePath(`/calendar/${date}`);
  return {};
}

// Create a tag on the fly + attach to this day. Used from day detail.
export async function createAndAttachTag(
  date: string,
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { errorCode: "generic" };

  // Try existing first (unique on user_id+name).
  const { data: existing } = await supabase
    .from("tags")
    .select("id")
    .eq("name", name)
    .maybeSingle();

  let tagId = existing?.id as string | undefined;

  if (!tagId) {
    const { data: inserted, error } = await supabase
      .from("tags")
      .insert({ name })
      .select("id")
      .single();
    if (error || !inserted)
      return { errorCode: "generic", errorDetail: error?.message };
    tagId = inserted.id as string;
  }

  await supabase.from("daily_tags").upsert({ log_date: date, tag_id: tagId });
  revalidatePath(`/calendar/${date}`);
  revalidatePath("/library/observations");
  return { ok: true };
}
