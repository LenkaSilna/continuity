import { useActionState, useEffect, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addProductBrand, deleteProductBrand, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { withDelete } from "@/lib/with-delete";
import { CollapsibleSection } from "@/app/_components/collapsible-section";
import { EmptyState } from "@/app/_components/empty-state";
import { LibraryChip } from "@/app/_components/library-chip";
import type { ProductBrand } from "@/lib/types";

const initialState: ActionState = {};

export function ProductBrandsSection({ brands }: { brands: ProductBrand[] }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [state, formAction, isPending] = useActionState(
    (_: ActionState, fd: FormData) => addProductBrand(fd),
    initialState,
  );
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok) queryClient.invalidateQueries({ queryKey: ["product-brands"] });
  }, [state.ok]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.products.errors.nameRequired;
    if (state.errorCode === "brand_exists") return t.library.products.errors.brandExists;
    if (state.errorCode === "generic") return t.library.products.errors.generic;
    return null;
  })();

  return (
    <CollapsibleSection
      title={t.library.products.brands.title}
      subtitle={t.library.products.brands.subtitle}
      defaultOpen={false}
    >
      {brands.length === 0 ? (
        <EmptyState message={t.library.products.brands.empty} />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <LibraryChip
              key={brand.id}
              label={brand.name}
              deleteAriaLabel={`Delete ${brand.name}`}
              disabled={isDeleting}
              onDelete={() =>
                confirmToast({
                  message: t.library.products.brands.confirmDelete,
                  detail: brand.name,
                  confirmLabel: t.common.delete,
                  cancelLabel: t.common.cancel,
                  onConfirm: () =>
                    withDelete({
                      action: () => deleteProductBrand(brand.id),
                      start: startDelete,
                      queryClient,
                      invalidateKeys: [["product-brands"]],
                      errorMessage: t.common.errorGeneric,
                      successMessage: t.common.deleted,
                    }),
                })
              }
            />
          ))}
        </ul>
      )}

      <form action={formAction} className="flex gap-2">
        <input
          name="name"
          required
          placeholder={t.library.products.brands.addPlaceholder}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t.library.products.brands.add}
        </button>
      </form>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </CollapsibleSection>
  );
}
