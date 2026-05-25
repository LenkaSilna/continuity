import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModuleFlags } from "./types";

export const DEFAULT_MODULE_FLAGS: ModuleFlags = {
  module_products: true,
  module_supplements: true,
  module_habits: true,
  module_routine: true,
  module_observations: true,
  module_cycle: true,
  module_journal: true,
  module_ai: true,
};

export async function getModuleFlags(
  supabase: SupabaseClient,
): Promise<ModuleFlags> {
  const { data } = await supabase
    .from("profile")
    .select(
      "module_products, module_supplements, module_habits, module_routine, module_observations, module_cycle, module_journal, module_ai",
    )
    .maybeSingle<ModuleFlags>();

  return data ?? DEFAULT_MODULE_FLAGS;
}
