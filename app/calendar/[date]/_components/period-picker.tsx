import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [localIntensity, setLocalIntensity] = useState(intensity);
  const [isPending, setIsPending] = useState(false);
  const [syncedIntensity, setSyncedIntensity] = useState(intensity);
  const serverRef = useRef(intensity);

  useEffect(() => {
    if (isPending) return;
    serverRef.current = intensity;
  }, [intensity, isPending]);

  if (!isPending && intensity !== syncedIntensity) {
    setSyncedIntensity(intensity);
    setLocalIntensity(intensity);
  }

  const options: { value: CycleIntensity | null; label: string }[] = [
    { value: null, label: t.calendar.day.period.none },
    { value: "light", label: t.calendar.day.period.light },
    { value: "medium", label: t.calendar.day.period.medium },
    { value: "heavy", label: t.calendar.day.period.heavy },
  ];

  const handle = async (value: CycleIntensity | null) => {
    if (isPending) return;
    setLocalIntensity(value);
    setIsPending(true);
    const result = await setCycle(date, value);
    setIsPending(false);
    if (result?.error) {
      showError(t.calendar.errors.generic);
      setLocalIntensity(serverRef.current);
    } else {
      queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
      queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
    }
  };

  return (
    <section className="space-y-2 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
        {t.calendar.day.period.title}
      </h2>
      <div className="flex flex-wrap gap-2">
        {options.map(({ value, label }) => {
          const active = localIntensity === value;
          return (
            <button
              key={value ?? "none"}
              type="button"
              disabled={isPending}
              onClick={() => handle(value)}
              aria-pressed={active}
              className={[
                "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm transition disabled:opacity-50",
                active
                  ? "border-transparent bg-accent text-(--on-accent)"
                  : "border-(--border) text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
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
