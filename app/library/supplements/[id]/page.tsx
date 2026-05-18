import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";
import { TopNav } from "../../../_components/top-nav";
import { EditSupplementForm } from "../_components/edit-supplement-form";

export default async function EditSupplementPage({
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

  const [{ data: supplement }, { data: types }, { data: brands }] =
    await Promise.all([
      supabase
        .from("supplements")
        .select("*")
        .eq("id", id)
        .maybeSingle<Supplement>(),
      supabase
        .from("supplement_types")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("supplement_brands")
        .select("*")
        .order("name", { ascending: true }),
    ]);

  if (!supplement) notFound();

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            href="/library/supplements"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.library.supplements.back}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.supplements.edit}
          </h1>
        </header>

        <EditSupplementForm
          supplement={supplement}
          types={(types ?? []) as SupplementType[]}
          brands={(brands ?? []) as SupplementBrand[]}
        />
      </main>
    </>
  );
}
