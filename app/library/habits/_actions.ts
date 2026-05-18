"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionState = {
  errorCode?: "name_required" | "generic";
  errorDetail?: string;
  ok?: boolean;
};

export async function addHabit(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("habits").insert({
    name,
    description: String(formData.get("description") ?? "").trim() || null,
  });

  if (error) return { errorCode: "generic", errorDetail: error.message };
  revalidatePath("/library/habits");
  return { ok: true };
}

export async function updateHabit(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("habits")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) return { errorCode: "generic", errorDetail: error.message };
  revalidatePath("/library/habits");
  revalidatePath(`/library/habits/${id}`);
  return { ok: true };
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.from("habits").delete().eq("id", id);
  revalidatePath("/library/habits");
}
