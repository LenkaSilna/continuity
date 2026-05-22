"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DATA_BLOCKS, type DataBlock } from "@/lib/types";

export type CustomPromptActionState = {
  errorCode?: "name_required" | "not_found" | "generic";
};

function parseBlocks(formData: FormData): DataBlock[] {
  return (formData.getAll("data_blocks") as string[]).filter(
    (v): v is DataBlock => (DATA_BLOCKS as readonly string[]).includes(v),
  );
}

export async function createCustomPrompt(
  _prev: CustomPromptActionState,
  formData: FormData,
): Promise<CustomPromptActionState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return { errorCode: "name_required" };

  const question = (formData.get("question") as string | null) ?? "";
  const data_blocks = parseBlocks(formData);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorCode: "generic" };

  const { data, error } = await supabase
    .from("custom_prompts")
    .insert({ user_id: user.id, name, question, data_blocks })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createCustomPrompt]", error?.message);
    return { errorCode: "generic" };
  }

  redirect(`/ai/custom/${data.id}`);
}

export async function updateCustomPrompt(
  id: string,
  _prev: CustomPromptActionState,
  formData: FormData,
): Promise<CustomPromptActionState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return { errorCode: "name_required" };

  const question = (formData.get("question") as string | null) ?? "";
  const data_blocks = parseBlocks(formData);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { errorCode: "generic" };

  const { error } = await supabase
    .from("custom_prompts")
    .update({ name, question, data_blocks })
    .eq("id", id);

  if (error) {
    console.error("[updateCustomPrompt]", error.message);
    return { errorCode: "generic" };
  }

  redirect(`/ai/custom/${id}`);
}

export async function deleteCustomPrompt(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ai");

  await supabase.from("custom_prompts").delete().eq("id", id);
  redirect("/ai");
}
