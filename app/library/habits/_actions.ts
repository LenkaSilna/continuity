import { supabase } from "@/lib/supabase/browser";

export type ActionState = {
  errorCode?: "name_required" | "generic";
  errorDetail?: string;
  ok?: boolean;
};

export async function addHabit(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const { error } = await supabase.from("habits").insert({
    name,
    description: String(formData.get("description") ?? "").trim() || null,
  });

  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function updateHabit(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const { error } = await supabase
    .from("habits")
    .update({
      name,
      description: String(formData.get("description") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function deleteHabit(id: string): Promise<void> {
  await supabase.from("habits").delete().eq("id", id);
}
