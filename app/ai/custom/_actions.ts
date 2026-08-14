import { supabase } from "@/lib/supabase/browser";
import { DATA_BLOCKS, type DataBlock } from "@/lib/types";
import { PERIOD_PRESETS, CUSTOM_PROMPT_DEFAULT_PERIOD_DAYS } from "@/lib/ai-prompts";

export type CustomPromptActionState = {
  errorCode?: "name_required" | "not_found" | "generic";
  createdId?: string;
};

function parseBlocks(formData: FormData): DataBlock[] {
  return (formData.getAll("data_blocks") as string[]).filter(
    (v): v is DataBlock => (DATA_BLOCKS as readonly string[]).includes(v),
  );
}

function parsePeriodDays(formData: FormData): number {
  const raw = Number(formData.get("period_days"));
  return (PERIOD_PRESETS as readonly number[]).includes(raw)
    ? raw
    : CUSTOM_PROMPT_DEFAULT_PERIOD_DAYS;
}

export async function createCustomPrompt(
  formData: FormData,
): Promise<CustomPromptActionState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return { errorCode: "name_required" };

  const question = (formData.get("question") as string | null) ?? "";
  const data_blocks = parseBlocks(formData);
  const period_days = parsePeriodDays(formData);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { errorCode: "generic" };

  const { data, error } = await supabase
    .from("custom_prompts")
    .insert({ user_id: user.id, name, question, data_blocks, period_days })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createCustomPrompt]", error?.message);
    return { errorCode: "generic" };
  }

  return { createdId: data.id as string };
}

export async function updateCustomPrompt(
  id: string,
  formData: FormData,
): Promise<CustomPromptActionState> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  if (!name) return { errorCode: "name_required" };

  const question = (formData.get("question") as string | null) ?? "";
  const data_blocks = parseBlocks(formData);
  const period_days = parsePeriodDays(formData);

  const { error } = await supabase
    .from("custom_prompts")
    .update({ name, question, data_blocks, period_days })
    .eq("id", id);

  if (error) {
    console.error("[updateCustomPrompt]", error.message);
    return { errorCode: "generic" };
  }

  return {};
}

export async function deleteCustomPrompt(
  id: string,
): Promise<{ errorCode?: "generic"; errorDetail?: string; ok?: boolean }> {
  const { error } = await supabase.from("custom_prompts").delete().eq("id", id);
  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}
