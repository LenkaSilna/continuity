import { supabase } from "@/lib/supabase/browser";

export async function savePromptOverride(
  promptType: string,
  text: string,
): Promise<{ error?: string }> {
  const { error } = await supabase.from("prompt_overrides").upsert(
    { prompt_type: promptType, saved_text: text },
    { onConflict: "user_id,prompt_type" },
  );
  return error ? { error: error.message } : {};
}

export async function deletePromptOverride(
  promptType: string,
): Promise<{ error?: string }> {
  const { error } = await supabase
    .from("prompt_overrides")
    .delete()
    .eq("prompt_type", promptType);
  return error ? { error: error.message } : {};
}
