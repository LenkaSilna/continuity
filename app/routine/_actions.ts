import { supabase } from "@/lib/supabase/browser";
import type { ActionState, ItemKind, TimeOfDay } from "@/lib/types";

export type { ActionState } from "@/lib/types";

const KIND_TO_COLUMN: Record<ItemKind, "product_id" | "supplement_id" | "habit_id"> = {
  product: "product_id",
  supplement: "supplement_id",
  habit: "habit_id",
};

export async function addRoutineItem(
  timeOfDay: TimeOfDay,
  itemKind: ItemKind,
  itemId: string,
): Promise<ActionState> {
  const { error } = await supabase.from("routine_items").insert({
    time_of_day: timeOfDay,
    item_kind: itemKind,
    [KIND_TO_COLUMN[itemKind]]: itemId,
  });
  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function deleteRoutineItem(id: string): Promise<ActionState> {
  const { error } = await supabase.from("routine_items").delete().eq("id", id);
  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}
