import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { withDelete } from "@/lib/with-delete";
import { EmptyState } from "@/app/_components/empty-state";
import { ListItemActions } from "@/app/_components/list-item-actions";
import type { Product, ProductBrand, ProductType } from "@/lib/types";

export function ProductsList({
  products,
  types,
  brands,
}: {
  products: Product[];
  types: ProductType[];
  brands: ProductBrand[];
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [isPending, start] = useTransition();
  const typeName = (id: string | null) =>
    id ? types.find((type) => type.id === id)?.name ?? null : null;
  const brandName = (id: string | null) =>
    id ? brands.find((brand) => brand.id === id)?.name ?? null : null;

  if (products.length === 0) {
    return <EmptyState message={t.library.products.empty} />;
  }

  return (
    <ul className="space-y-2">
      {products.map((p) => {
        const tn = typeName(p.type_id);
        const bn = brandName(p.brand_id);
        return (
          <li
            key={p.id}
            className="flex items-start justify-between gap-3 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-(--text-muted)">
                  {bn || t.library.products.card.noBrand}
                </span>
              </div>
              {tn && (
                <span className="inline-block rounded-full bg-(--surface-2) px-2 py-0.5 text-xs text-(--text-muted)">
                  {tn}
                </span>
              )}
              {p.active_ingredients && (
                <p className="text-xs text-(--text-muted)">
                  {p.active_ingredients}
                </p>
              )}
              {p.inci && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-(--text-muted) transition-colors hover:text-(--text)">
                    INCI
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap wrap-break-word font-mono text-[11px] text-(--text-muted)">
                    {p.inci}
                  </p>
                </details>
              )}
              {p.notes && (
                <p className="whitespace-pre-wrap text-xs text-(--text-muted)">
                  {p.notes}
                </p>
              )}
            </div>
            <ListItemActions
              editHref={`/library/products/${p.id}`}
              editAriaLabel={`Edit ${p.name}`}
              deleteAriaLabel={`Delete ${p.name}`}
              isDeleting={isPending}
              onDelete={() =>
                confirmToast({
                  message: t.library.products.card.confirmDelete,
                  detail: p.name,
                  confirmLabel: t.common.delete,
                  cancelLabel: t.common.cancel,
                  onConfirm: () =>
                    withDelete({
                      action: () => deleteProduct(p.id),
                      start,
                      queryClient,
                      invalidateKeys: [["products"], ["routine-data"], ["calendar-day"]],
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
