import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import type { Tag } from "@/lib/types";
import { TopNav } from "../../../_components/top-nav";
import { EditObservationForm } from "../_components/edit-observation-form";

export default async function EditObservationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_observations");

  const [{ data: tag }, { data: categoryRows }] = await Promise.all([
    supabase.from("tags").select("*").eq("id", id).maybeSingle<Tag>(),
    supabase
      .from("tags")
      .select("category")
      .not("category", "is", null)
      .order("category", { ascending: true }),
  ]);

  if (!tag) notFound();

  const categories = [
    ...new Set((categoryRows ?? []).map((r) => r.category as string)),
  ];

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            href="/library/observations"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.library.observations.back}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.observations.edit}
          </h1>
        </header>

        <EditObservationForm tag={tag} categories={categories} />
      </main>
    </>
  );
}
