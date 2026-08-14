import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteSupplement } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { withDelete } from "@/lib/with-delete";
import { EmptyState } from "@/app/_components/empty-state";
import { ListItemActions } from "@/app/_components/list-item-actions";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";

export function SupplementsList({
  supplements,
  types,
  brands,
}: {
  supplements: Supplement[];
  types: SupplementType[];
  brands: SupplementBrand[];
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isPending, start] = useTransition();
  const typeName = (id: string | null) =>
    id ? types.find((type) => type.id === id)?.name ?? null : null;
  const brandName = (id: string | null) =>
    id ? brands.find((brand) => brand.id === id)?.name ?? null : null;

  if (supplements.length === 0) {
    return <EmptyState message={t.library.supplements.empty} />;
  }

  return (
    <ul className="space-y-2">
      {supplements.map((s) => {
        const tn = typeName(s.type_id);
        const bn = brandName(s.brand_id);
        return (
          <li
            key={s.id}
            className="flex items-start justify-between gap-3 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{s.name}</span>
                <span className="text-sm text-(--text-muted)">
                  {bn || t.library.supplements.card.noBrand}
                </span>
              </div>
              {tn && (
                <span className="inline-block rounded-full bg-(--surface-2) px-2 py-0.5 text-xs text-(--text-muted)">
                  {tn}
                </span>
              )}
              {s.dosage && (
                <p className="text-xs text-(--text-muted)">
                  <span className="text-(--text-muted)">{t.library.supplements.form.dosage}:</span>{" "}
                  {s.dosage}
                </p>
              )}
              {s.purpose && (
                <p className="text-xs text-(--text-muted)">
                  <span className="text-(--text-muted)">{t.library.supplements.form.purpose}:</span>{" "}
                  {s.purpose}
                </p>
              )}
              {s.ingredients && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-(--text-muted) transition-colors hover:text-(--text)">
                    {t.library.supplements.form.ingredients}
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap wrap-break-word font-mono text-[11px] text-(--text-muted)">
                    {s.ingredients}
                  </p>
                </details>
              )}
              {s.notes && (
                <p className="whitespace-pre-wrap text-xs text-(--text-muted)">
                  {s.notes}
                </p>
              )}
            </div>
            <ListItemActions
              editHref={`/library/supplements/${s.id}`}
              editAriaLabel={`Edit ${s.name}`}
              deleteAriaLabel={`Delete ${s.name}`}
              isDeleting={isPending}
              onDelete={() =>
                confirmToast({
                  message: t.library.supplements.card.confirmDelete,
                  detail: s.name,
                  confirmLabel: t.common.delete,
                  cancelLabel: t.common.cancel,
                  onConfirm: () =>
                    withDelete({
                      action: () => deleteSupplement(s.id),
                      start,
                      queryClient,
                      invalidateKeys: [["supplements"], ["routine-data"], ["calendar-day"]],
                      errorMessage: t.common.errorGeneric,
                      successMessage: t.common.deleted,
                    }),
                })
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
