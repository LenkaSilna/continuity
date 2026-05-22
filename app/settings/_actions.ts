"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isAccent, isTheme } from "@/lib/theme";
import {
  ACCENT_COOKIE,
  THEME_COOKIE,
  appearanceCookieOpts,
} from "@/lib/appearance";
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

const cookieOpts = appearanceCookieOpts();

export async function setTheme(theme: ThemeMode): Promise<{ error?: string }> {
  if (!isTheme(theme)) return {};
  const [result, cookieStore] = await Promise.all([
    updateProfile({ theme }),
    cookies(),
  ]);
  if (!result.error) cookieStore.set(THEME_COOKIE, theme, cookieOpts);
  revalidatePath("/", "layout");
  return result;
}

export async function setAccent(accent: Accent): Promise<{ error?: string }> {
  if (!isAccent(accent)) return {};
  const [result, cookieStore] = await Promise.all([
    updateProfile({ accent }),
    cookies(),
  ]);
  if (!result.error) cookieStore.set(ACCENT_COOKIE, accent, cookieOpts);
  revalidatePath("/", "layout");
  return result;
}

export async function setModule(
  key: keyof ModuleFlags,
  value: boolean,
): Promise<{ error?: string }> {
  if (!MODULE_KEYS.includes(key)) return {};
  const result = await updateProfile({ [key]: value });
  revalidatePath("/", "layout");
  return result;
}
