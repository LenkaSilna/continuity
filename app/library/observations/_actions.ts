import { supabase } from "@/lib/supabase/browser";

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

export async function addObservation(formData: FormData): Promise<ActionState> {
  const { name, category, color } = readForm(formData);
  if (!name) return { errorCode: "name_required" };

  const { error } = await supabase.from("tags").insert({ name, category, color });

  if (error) {
    if (error.code === "23505") return { errorCode: "exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  return { ok: true };
}

export async function updateObservation(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  const { name, category, color } = readForm(formData);
  if (!name) return { errorCode: "name_required" };

  const { error } = await supabase
    .from("tags")
    .update({ name, category, color })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { errorCode: "exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  return { ok: true };
}

export async function deleteObservation(id: string): Promise<void> {
  await supabase.from("tags").delete().eq("id", id);
}
