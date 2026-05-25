import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { AddHabitForm } from "@/app/library/habits/_components/add-habit-form";
import { HabitsList } from "@/app/library/habits/_components/habits-list";
import type { Habit } from "@/lib/types";

export function HabitsPage() {
  const { t } = useI18n();

  const { data: habits = [], isLoading } = useQuery({
    queryKey: ["habits"],
    queryFn: async () => {
      const { data } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as Habit[];
    },
  });

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.library.habits.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.library.habits.subtitle}
          </p>
        </header>

        <AddHabitForm />

        {!isLoading && <HabitsList habits={habits} />}
      </main>
    </>
  );
}
