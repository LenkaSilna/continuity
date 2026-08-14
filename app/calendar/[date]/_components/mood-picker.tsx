import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setMood } from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import { moodColor } from "@/lib/calendar";
import { showError } from "@/lib/toast";

export function MoodPicker({
  date,
  mood,
}: {
  date: string;
  mood: number | null;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [localMood, setLocalMood] = useState(mood);
  const [isPending, setIsPending] = useState(false);
  const [syncedMood, setSyncedMood] = useState(mood);
  const serverRef = useRef(mood);

  useEffect(() => {
    serverRef.current = mood;
  }, [mood]);

  if (mood !== syncedMood) {
    setSyncedMood(mood);
    setLocalMood(mood);
  }

  const levels = [1, 2, 3, 4, 5] as const;
  const labels = t.calendar.day.mood.levels;

  const handle = async (next: number | null) => {
    if (isPending) return;
    setLocalMood(next);
    setIsPending(true);
    const result = await setMood(date, next);
    setIsPending(false);
    if (result?.error) {
      showError(t.calendar.errors.generic);
      setLocalMood(serverRef.current);
    } else {
      queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
      queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
    }
  };

  return (
    <section className="space-y-2 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
          {t.calendar.day.mood.title}
        </h2>
        <span className="text-xs text-(--text-muted)">{t.calendar.day.mood.hint}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {levels.map((level) => {
          const active = localMood === level;
          return (
            <button
              key={level}
              type="button"
              disabled={isPending}
              onClick={() => handle(active ? null : level)}
              aria-pressed={active}
              className={[
                "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center rounded-md border px-2 py-2 text-xs transition disabled:opacity-50",
                active
                  ? "border-accent"
                  : "border-(--border) hover:border-(--accent-border)",
              ].join(" ")}
              style={{ backgroundColor: moodColor(level) ?? undefined }}
            >
              <span className="text-sm font-semibold text-black">{level}</span>
              <span className="text-[10px] text-black/80">
                {labels[String(level) as keyof typeof labels]}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          disabled={isPending || localMood === null}
          onClick={() => handle(null)}
          className="rounded-md border border-(--border) px-3 py-2 text-xs text-(--text-muted) transition-colors hover:bg-(--surface-2) disabled:opacity-50"
        >
          {t.calendar.day.mood.clear}
        </button>
      </div>
    </section>
  );
}
