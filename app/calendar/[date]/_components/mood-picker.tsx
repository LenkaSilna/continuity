"use client";

import { useTransition } from "react";
import { setMood } from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import { moodColor } from "@/lib/calendar";

export function MoodPicker({
  date,
  mood,
}: {
  date: string;
  mood: number | null;
}) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();

  const levels = [1, 2, 3, 4, 5] as const;
  const labels = t.calendar.day.mood.levels;

  return (
    <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {t.calendar.day.mood.title}
        </h2>
        <span className="text-xs text-zinc-500">{t.calendar.day.mood.hint}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => {
          const active = mood === level;
          return (
            <button
              key={level}
              type="button"
              disabled={isPending}
              onClick={() => start(() => setMood(date, active ? null : level))}
              aria-pressed={active}
              className={[
                "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center rounded-md border px-2 py-2 text-xs transition disabled:opacity-50",
                active
                  ? "border-zinc-900 dark:border-zinc-100"
                  : "border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600",
              ].join(" ")}
              style={{ backgroundColor: moodColor(level) ?? undefined }}
            >
              <span className="text-sm font-semibold text-zinc-900">{level}</span>
              <span className="text-[10px] text-zinc-900/80">
                {labels[String(level) as keyof typeof labels]}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          disabled={isPending || mood === null}
          onClick={() => start(() => setMood(date, null))}
          className="rounded-md border border-zinc-300 px-3 py-2 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          {t.calendar.day.mood.clear}
        </button>
      </div>
    </section>
  );
}
