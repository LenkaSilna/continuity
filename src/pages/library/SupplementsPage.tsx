import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { AddSupplementForm } from "@/app/library/supplements/_components/add-supplement-form";
import { SupplementTypesSection } from "@/app/library/supplements/_components/supplement-types-section";
import { SupplementBrandsSection } from "@/app/library/supplements/_components/supplement-brands-section";
import { SupplementsList } from "@/app/library/supplements/_components/supplements-list";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";

export function SupplementsPage() {
  const { t } = useI18n();

  const { data: types = [] } = useQuery({
    queryKey: ["supplement-types"],
    queryFn: async () => {
      const { data } = await supabase
        .from("supplement_types")
        .select("*")
        .order("position", { ascending: true });
      return (data ?? []) as SupplementType[];
    },
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["supplement-brands"],
    queryFn: async () => {
      const { data } = await supabase
        .from("supplement_brands")
        .select("*")
        .order("name", { ascending: true });
      return (data ?? []) as SupplementBrand[];
    },
  });

  const { data: supplements = [], isLoading } = useQuery({
    queryKey: ["supplements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("supplements")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as Supplement[];
    },
  });

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.supplements.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.supplements.subtitle}
          </p>
        </header>

        <AddSupplementForm types={types} brands={brands} />

        <SupplementTypesSection types={types} />

        <SupplementBrandsSection brands={brands} />

        {!isLoading && <SupplementsList supplements={supplements} types={types} brands={brands} />}
      </main>
    </>
  );
}
