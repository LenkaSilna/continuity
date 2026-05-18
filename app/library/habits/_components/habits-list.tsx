"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteHabit } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import type { Habit } from "@/lib/types";

export function HabitsList({ habits }: { habits: Habit[] }) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();

  if (habits.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {t.library.habits.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {habits.map((h) => (
        <li
          key={h.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="min-w-0 flex-1 space-y-1">
            <span className="font-medium">{h.name}</span>
            {h.description && (
              <p className="whitespace-pre-wrap text-xs text-zinc-600 dark:text-zinc-400">
                {h.description}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <Link
              href={`/library/habits/${h.id}`}
              className="rounded-md border border-zinc-300 px-2 py-1 text-center text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {t.common.edit}
            </Link>
            <button
              type="button"
              aria-label={`Delete ${h.name}`}
              disabled={isPending}
              onClick={() => {
                confirmToast({
                  message: t.library.habits.card.confirmDelete,
                  confirmLabel: t.common.delete,
                  cancelLabel: t.common.cancel,
                  onConfirm: () => start(() => deleteHabit(h.id)),
                });
              }}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
            >
              {t.common.delete}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
