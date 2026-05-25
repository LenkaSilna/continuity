import { useEffect, useRef, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setNotes } from "../../_actions";
import { useI18n } from "@/lib/i18n/client";

export function NotesEditor({
  date,
  initial,
}: {
  date: string;
  initial: string;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [value, setValue] = useState(initial);
  const [isPending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const lastSaved = useRef(initial);

  useEffect(() => {
    if (value === lastSaved.current) return;
    const handle = setTimeout(() => {
      start(async () => {
        await setNotes(date, value);
        lastSaved.current = value;
        setSavedAt(Date.now());
        queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [value, date]);

  return (
    <section className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {t.calendar.day.notes.title}
        </h2>
        {isPending ? (
          <span className="text-xs text-zinc-500">{t.common.saving}</span>
        ) : savedAt ? (
          <span className="text-xs text-emerald-600 dark:text-emerald-400">
            {t.common.saved}
          </span>
        ) : null}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder={t.calendar.day.notes.placeholder}
        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      />
    </section>
  );
}
