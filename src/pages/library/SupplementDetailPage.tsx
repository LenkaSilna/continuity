import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { ErrorState } from "@/app/_components/error-state";
import { EditSupplementForm } from "@/app/library/supplements/_components/edit-supplement-form";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";

export function SupplementDetailPage() {
  const { id } = useParams({ from: "/_protected/library/supplements/$id" });
  const { t } = useI18n();

  const { data: supplement, isLoading, isError } = useQuery({
    queryKey: ["supplement", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplements")
        .select("*")
        .eq("id", id)
        .maybeSingle<Supplement>();
      if (error) throw error;
      return data as Supplement | null;
    },
  });

  const { data: types = [], isError: isTypesError } = useQuery({
    queryKey: ["supplement-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplement_types")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SupplementType[];
    },
  });

  const { data: brands = [], isError: isBrandsError } = useQuery({
    queryKey: ["supplement-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("supplement_brands")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SupplementBrand[];
    },
  });

  if (isError || isTypesError || isBrandsError) {
    return <ErrorState message={t.common.errorGeneric} />;
  }

  if (!isLoading && !supplement) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Not found</p>
      </main>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            to="/library/supplements"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.library.supplements.back}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.supplements.edit}
          </h1>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}

        {supplement && (
          <EditSupplementForm supplement={supplement} types={types} brands={brands} />
        )}
      </main>
    </>
  );
}
