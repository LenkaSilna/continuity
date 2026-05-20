"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionState = {
  errorCode?: "name_required" | "exists" | "generic";
  errorDetail?: string;
  ok?: boolean;
};

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const colorRaw = String(formData.get("color") ?? "").trim();
  return {
    name,
    category: categoryRaw || null,
    color: colorRaw || null,
  };
}

export async function addObservation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { name, category, color } = readForm(formData);
  if (!name) return { errorCode: "name_required" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("tags").insert({ name, category, color });

  if (error) {
    if (error.code === "23505") return { errorCode: "exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  revalidatePath("/library/observations");
  return { ok: true };
}

export async function updateObservation(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { name, category, color } = readForm(formData);
  if (!name) return { errorCode: "name_required" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("tags")
    .update({ name, category, color })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { errorCode: "exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  revalidatePath("/library/observations");
  revalidatePath(`/library/observations/${id}`);
  return { ok: true };
}

export async function deleteObservation(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.from("tags").delete().eq("id", id);
  revalidatePath("/library/observations");
}
