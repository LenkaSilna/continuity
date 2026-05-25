import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { getModuleFlags } from "@/lib/modules";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { RoutineTabs } from "@/app/routine/_components/routine-tabs";
import type {
  Habit,
  ItemKind,
  Product,
  ProductBrand,
  RoutineItem,
  Supplement,
  SupplementBrand,
} from "@/lib/types";

export function RoutinePage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const { data: flags } = useQuery({
    queryKey: ["module-flags"],
    queryFn: () => getModuleFlags(supabase),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["routine-data"],
    enabled: !!flags?.module_routine,
    queryFn: async () => {
      const [
        { data: products },
        { data: productBrands },
        { data: supplements },
        { data: supplementBrands },
        { data: habits },
        { data: routineItems },
      ] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true).order("name"),
        supabase.from("product_brands").select("*"),
        supabase.from("supplements").select("*").eq("is_active", true).order("name"),
        supabase.from("supplement_brands").select("*"),
        supabase.from("habits").select("*").eq("is_active", true).order("name"),
        supabase.from("routine_items").select("*").order("created_at"),
      ]);
      return { products, productBrands, supplements, supplementBrands, habits, routineItems };
    },
  });

  if (flags && !flags.module_routine) {
    navigate({ to: "/dashboard" });
    return null;
  }

  const enabledKinds: ItemKind[] = [];
  if (flags?.module_products) enabledKinds.push("product");
  if (flags?.module_supplements) enabledKinds.push("supplement");
  if (flags?.module_habits) enabledKinds.push("habit");

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">{t.routine.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.routine.subtitle}</p>
        </header>

        {!isLoading && data && (
          <RoutineTabs
            products={(data.products ?? []) as Product[]}
            productBrands={(data.productBrands ?? []) as ProductBrand[]}
            supplements={(data.supplements ?? []) as Supplement[]}
            supplementBrands={(data.supplementBrands ?? []) as SupplementBrand[]}
            habits={(data.habits ?? []) as Habit[]}
            routineItems={(data.routineItems ?? []) as RoutineItem[]}
            enabledKinds={enabledKinds}
          />
        )}
      </main>
    </>
  );
}
