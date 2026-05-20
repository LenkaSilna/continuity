"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteObservation } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import type { Tag } from "@/lib/types";

export function ObservationsList({ tags }: { tags: Tag[] }) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();

  if (tags.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {t.library.observations.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <span
              aria-hidden
              className="mt-1 inline-block h-3 w-3 shrink-0 rounded-full border border-zinc-300 dark:border-zinc-700"
              style={{ backgroundColor: tag.color ?? "transparent" }}
            />
            <div className="min-w-0 space-y-0.5">
              <span className="font-medium">{tag.name}</span>
              <p className="text-xs text-zinc-500">
                {tag.category ?? t.library.observations.card.noCategory}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-1">
            <Link
              href={`/library/observations/${tag.id}`}
              className="rounded-md border border-zinc-300 px-2 py-1 text-center text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {t.common.edit}
            </Link>
            <button
              type="button"
              aria-label={`Delete ${tag.name}`}
              disabled={isPending}
              onClick={() => {
                confirmToast({
                  message: t.library.observations.card.confirmDelete,
                  confirmLabel: t.common.delete,
                  cancelLabel: t.common.cancel,
                  onConfirm: () => start(() => deleteObservation(tag.id)),
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
