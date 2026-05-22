"use client";

import { useTransition } from "react";
import { deleteHabit } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { EmptyState } from "@/app/_components/empty-state";
import { ListItemActions } from "@/app/_components/list-item-actions";
import type { Habit } from "@/lib/types";

export function HabitsList({ habits }: { habits: Habit[] }) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();

  if (habits.length === 0) {
    return <EmptyState message={t.library.habits.empty} />;
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
          <ListItemActions
            editHref={`/library/habits/${h.id}`}
            editAriaLabel={`Edit ${h.name}`}
            deleteAriaLabel={`Delete ${h.name}`}
            isDeleting={isPending}
            onDelete={() =>
              confirmToast({
                message: t.library.habits.card.confirmDelete,
                confirmLabel: t.common.delete,
                cancelLabel: t.common.cancel,
                onConfirm: () => start(() => deleteHabit(h.id)),
                successMessage: t.common.deleted,
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}
