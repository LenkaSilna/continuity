import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "./supabase/server";
import type { ModuleFlags } from "./types";

export async function getModuleFlags(
  supabase: SupabaseClient,
): Promise<ModuleFlags> {
  const { data } = await supabase
    .from("profile")
    .select(
      "module_products, module_supplements, module_habits, module_routine, module_observations, module_cycle, module_journal, module_ai",
    )
    .maybeSingle<ModuleFlags>();

  return (
    data ?? {
      module_products: true,
      module_supplements: true,
      module_habits: true,
      module_routine: true,
      module_observations: true,
      module_cycle: true,
      module_journal: true,
      module_ai: true,
    }
  );
}

// Deduplicated per-request: calling this multiple times in the same render
// tree (e.g. TopNav + page) issues only one DB query.
export const getModuleFlagsCached = cache(async (): Promise<ModuleFlags> => {
  const supabase = await createServerSupabaseClient();
  return getModuleFlags(supabase);
});

// Redirects to /dashboard if module is disabled.
export async function requireModule(
  supabase: SupabaseClient,
  key: keyof ModuleFlags,
): Promise<void> {
  const flags = await getModuleFlags(supabase);
  if (!flags[key]) redirect("/dashboard");
}
