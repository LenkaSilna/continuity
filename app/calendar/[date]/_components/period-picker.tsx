"use client";

import { useOptimistic, useTransition } from "react";
import { setCycle } from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import type { CycleIntensity } from "@/lib/types";
import { showError } from "@/lib/toast";

const intensityDot: Record<CycleIntensity, string> = {
  light: "bg-rose-300",
  medium: "bg-rose-500",
  heavy: "bg-rose-700",
};

export function PeriodPicker({
  date,
  intensity,
}: {
  date: string;
  intensity: CycleIntensity | null;
}) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();
  const [optimisticIntensity, setOptimisticIntensity] = useOptimistic(intensity);

  const options: { value: CycleIntensity | null; label: string }[] = [
    { value: null, label: t.calendar.day.period.none },
    { value: "light", label: t.calendar.day.period.light },
    { value: "medium", label: t.calendar.day.period.medium },
    { value: "heavy", label: t.calendar.day.period.heavy },
  ];

  return (
    <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t.calendar.day.period.title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => {
          const active = optimisticIntensity === value;
          return (
            <button
              key={value ?? "none"}
              type="button"
              disabled={isPending}
              onClick={() =>
                start(async () => {
                  setOptimisticIntensity(value);
                  const result = await setCycle(date, value);
                  if (result?.error) showError(t.calendar.errors.generic);
                })
              }
              aria-pressed={active}
              className={[
                "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition disabled:opacity-50",
                active
                  ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900",
              ].join(" ")}
            >
              {value ? (
                <span
                  aria-hidden
                  className={`h-2 w-2 rounded-full ${intensityDot[value]}`}
                />
              ) : null}
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
