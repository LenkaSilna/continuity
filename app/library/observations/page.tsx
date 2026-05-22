import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import type { Tag } from "@/lib/types";
import { TopNav } from "../../_components/top-nav";
import { BackToDashboard } from "../../_components/back-to-dashboard";
import { AddObservationForm } from "./_components/add-observation-form";
import { ObservationsList } from "./_components/observations-list";

export default async function ObservationsLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_observations");

  const [{ data: tags }, { data: categoryRows }] = await Promise.all([
    supabase.from("tags").select("*").order("created_at", { ascending: false }),
    supabase
      .from("tags")
      .select("category")
      .eq("user_id", user.id)
      .not("category", "is", null)
      .order("category", { ascending: true }),
  ]);

  const categories = [
    ...new Set((categoryRows ?? []).map((r) => r.category as string)),
  ];

  const t = await getMessages();

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

        <ObservationsList tags={(tags ?? []) as Tag[]} />
      </main>
    </>
  );
}
