"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ItemKind, TimeOfDay } from "@/lib/types";

const KIND_TO_COLUMN: Record<ItemKind, "product_id" | "supplement_id" | "habit_id"> = {
  product: "product_id",
  supplement: "supplement_id",
  habit: "habit_id",
};

export async function addRoutineItem(
  timeOfDay: TimeOfDay,
  itemKind: ItemKind,
  itemId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("routine_items").insert({
    time_of_day: timeOfDay,
    item_kind: itemKind,
    [KIND_TO_COLUMN[itemKind]]: itemId,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/routine");
  return { ok: true };
}

export async function deleteRoutineItem(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.from("routine_items").delete().eq("id", id);
  revalidatePath("/routine");
}
