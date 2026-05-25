import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { EditObservationForm } from "@/app/library/observations/_components/edit-observation-form";
import type { Tag } from "@/lib/types";

export function ObservationDetailPage() {
  const { id } = useParams({ from: "/_protected/library/observations/$id" });
  const { t } = useI18n();

  const { data: tag, isLoading } = useQuery({
    queryKey: ["observation", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("tags")
        .select("*")
        .eq("id", id)
        .maybeSingle<Tag>();
      return data as Tag | null;
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

  if (!isLoading && !tag) {
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
            to="/library/observations"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.library.observations.back}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.observations.edit}
          </h1>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}

        {tag && <EditObservationForm tag={tag} categories={categories} />}
      </main>
    </>
  );
}
