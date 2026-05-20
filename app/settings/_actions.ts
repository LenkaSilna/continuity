"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAccent, isTheme } from "@/lib/theme";
import type { Accent, ModuleFlags, ThemeMode } from "@/lib/types";

const MODULE_KEYS: (keyof ModuleFlags)[] = [
  "module_products",
  "module_supplements",
  "module_habits",
  "module_routine",
  "module_observations",
  "module_cycle",
  "module_journal",
  "module_ai",
];

async function updateProfile(
  patch: Record<string, unknown>,
): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };

  const { error } = await supabase
    .from("profile")
    .update(patch)
    .eq("user_id", user.id);
  if (error) return { error: error.message };
  return {};
}

export async function setTheme(theme: ThemeMode): Promise<void> {
  if (!isTheme(theme)) return;
  await updateProfile({ theme });
  revalidatePath("/", "layout");
}

export async function setAccent(accent: Accent): Promise<void> {
  if (!isAccent(accent)) return;
  await updateProfile({ accent });
  revalidatePath("/", "layout");
}

export async function setModule(
  key: keyof ModuleFlags,
  value: boolean,
): Promise<void> {
  if (!MODULE_KEYS.includes(key)) return;
  await updateProfile({ [key]: value });
  revalidatePath("/", "layout");
}
