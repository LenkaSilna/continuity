import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Habit } from "@/lib/types";
import { TopNav } from "../../_components/top-nav";
import { AddHabitForm } from "./_components/add-habit-form";
import { HabitsList } from "./_components/habits-list";

export default async function HabitsLibraryPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: false });

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
            {t.library.habits.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.habits.subtitle}
          </p>
        </header>

        <AddHabitForm />

        <HabitsList habits={(habits ?? []) as Habit[]} />
      </main>
    </>
  );
}
