import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";
import { TopNav } from "../../_components/top-nav";
import { SupplementTypesSection } from "./_components/supplement-types-section";
import { SupplementBrandsSection } from "./_components/supplement-brands-section";
import { AddSupplementForm } from "./_components/add-supplement-form";
import { SupplementsList } from "./_components/supplements-list";

export default async function SupplementsLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: types }, { data: brands }, { data: supplements }] =
    await Promise.all([
      supabase
        .from("supplement_types")
        .select("*")
        .order("position", { ascending: true }),
      supabase
        .from("supplement_brands")
        .select("*")
        .order("name", { ascending: true }),
      supabase
        .from("supplements")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            href="/dashboard"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.common.backToDashboard}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.supplements.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.supplements.subtitle}
          </p>
        </header>

        <SupplementTypesSection types={(types ?? []) as SupplementType[]} />

        <SupplementBrandsSection
          brands={(brands ?? []) as SupplementBrand[]}
        />

        <AddSupplementForm
          types={(types ?? []) as SupplementType[]}
          brands={(brands ?? []) as SupplementBrand[]}
        />

        <SupplementsList
          supplements={(supplements ?? []) as Supplement[]}
          types={(types ?? []) as SupplementType[]}
          brands={(brands ?? []) as SupplementBrand[]}
        />
      </main>
    </>
  );
}
