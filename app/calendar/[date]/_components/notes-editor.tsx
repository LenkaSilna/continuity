import { useEffect, useRef, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setNotes } from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showError } from "@/lib/toast";

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
        const result = await setNotes(date, value);
        if (result.error) {
          showError(t.calendar.errors.generic);
          return;
        }
        lastSaved.current = value;
        setSavedAt(Date.now());
        queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
      });
    }, 800);
    return () => clearTimeout(handle);
  }, [value, date, queryClient, t.calendar.errors.generic]);

  return (
    <section className="space-y-2 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
          {t.calendar.day.notes.title}
        </h2>
        {isPending ? (
          <span className="text-xs text-(--text-muted)">{t.common.saving}</span>
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
        className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text)"
      />
    </section>
  );
}
