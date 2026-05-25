import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { AddObservationForm } from "@/app/library/observations/_components/add-observation-form";
import { ObservationsList } from "@/app/library/observations/_components/observations-list";
import type { Tag } from "@/lib/types";

export function ObservationsPage() {
  const { t } = useI18n();

  const { data: tags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ["observations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tags")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as Tag[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["observation-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tags")
        .select("category")
        .not("category", "is", null)
        .order("category", { ascending: true });
      return [...new Set((data ?? []).map((row) => row.category as string))];
    },
  });

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.observations.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.observations.subtitle}
          </p>
        </header>

        <AddObservationForm categories={categories} />

        {!tagsLoading && <ObservationsList tags={tags} />}
      </main>
    </>
  );
}
