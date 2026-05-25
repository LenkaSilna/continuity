import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteObservation } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { withDelete } from "@/lib/with-delete";
import { EmptyState } from "@/app/_components/empty-state";
import { ListItemActions } from "@/app/_components/list-item-actions";
import type { Tag } from "@/lib/types";

export function ObservationsList({ tags }: { tags: Tag[] }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isPending, start] = useTransition();

  if (tags.length === 0) {
    return <EmptyState message={t.library.observations.empty} />;
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
          <ListItemActions
            editHref={`/library/observations/${tag.id}`}
            editAriaLabel={`Edit ${tag.name}`}
            deleteAriaLabel={`Delete ${tag.name}`}
            isDeleting={isPending}
            onDelete={() =>
              confirmToast({
                message: t.library.observations.card.confirmDelete,
                detail: tag.name,
                confirmLabel: t.common.delete,
                cancelLabel: t.common.cancel,
                onConfirm: () =>
                  withDelete({
                    action: () => deleteObservation(tag.id),
                    start,
                    queryClient,
                    invalidateKeys: [["observations"], ["calendar-day"]],
                    errorMessage: t.common.errorGeneric,
                    successMessage: t.common.deleted,
                  }),
              })
            }
          />
        </li>
      ))}
    </ul>
  );
}
