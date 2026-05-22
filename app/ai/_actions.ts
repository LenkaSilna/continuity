"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function savePromptOverride(
  promptType: string,
  text: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const { error } = await supabase.from("prompt_overrides").upsert(
    { prompt_type: promptType, saved_text: text },
    { onConflict: "user_id,prompt_type" },
  );
  return error ? { error: error.message } : {};
}

export async function deletePromptOverride(
  promptType: string,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const { error } = await supabase
    .from("prompt_overrides")
    .delete()
    .eq("prompt_type", promptType);
  return error ? { error: error.message } : {};
}
