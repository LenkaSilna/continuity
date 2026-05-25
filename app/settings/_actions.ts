import { supabase } from "@/lib/supabase/browser";
import { isAccent, isTheme } from "@/lib/theme";
import { applyAppearance } from "@/lib/appearance";
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

async function updateProfile(patch: Record<string, unknown>): Promise<{ error?: string }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in" };
  const { error } = await supabase.from("profile").update(patch).eq("user_id", user.id);
  if (error) return { error: error.message };
  return {};
}

export async function setTheme(theme: ThemeMode): Promise<{ error?: string }> {
  if (!isTheme(theme)) return {};
  const result = await updateProfile({ theme });
  if (!result.error) applyAppearance({ theme });
  return result;
}

export async function setAccent(accent: Accent): Promise<{ error?: string }> {
  if (!isAccent(accent)) return {};
  const result = await updateProfile({ accent });
  if (!result.error) applyAppearance({ accent });
  return result;
}

export async function setModule(
  key: keyof ModuleFlags,
  value: boolean,
): Promise<{ error?: string }> {
  if (!MODULE_KEYS.includes(key)) return {};
  return updateProfile({ [key]: value });
}
