import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
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

// Redirects to /dashboard if module is disabled.
export async function requireModule(
  supabase: SupabaseClient,
  key: keyof ModuleFlags,
): Promise<void> {
  const flags = await getModuleFlags(supabase);
  if (!flags[key]) redirect("/dashboard");
}
