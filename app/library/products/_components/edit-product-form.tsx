"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useTransition } from "react";
import { deleteProduct, updateProduct, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { showSuccess } from "@/lib/toast";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { EditFormActions } from "@/app/_components/edit-form-actions";
import type { Product, ProductBrand, ProductType } from "@/lib/types";

const initialState: ActionState = {};

export function EditProductForm({
  product,
  types,
  brands,
}: {
  product: Product;
  types: ProductType[];
  brands: ProductBrand[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);
  const [isDeleting, startDelete] = useTransition();
  const brandListId = useId();
  const currentBrandName = brands.find((b) => b.id === product.brand_id)?.name ?? "";

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      router.push("/library/products");
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.products.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.products.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <FormField label={`${t.library.products.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          defaultValue={product.name}
          placeholder={t.library.products.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.products.form.brand}>
        <input
          name="brand"
          list={brandListId}
          autoComplete="off"
          defaultValue={currentBrandName}
          placeholder={t.library.products.form.brandPlaceholder}
          className={fieldInputCn}
        />
        <datalist id={brandListId}>
          {brands.map((b) => (
            <option key={b.id} value={b.name} />
          ))}
        </datalist>
      </FormField>

      <FormField label={t.library.products.form.type}>
        <select name="type_id" defaultValue={product.type_id ?? ""} className={fieldInputCn}>
          <option value="">{t.library.products.form.typeNone}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t.library.products.form.activeIngredients}>
        <input
          name="active_ingredients"
          defaultValue={product.active_ingredients ?? ""}
          placeholder={t.library.products.form.activeIngredientsPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField
        label={t.library.products.form.inci}
        hint={t.library.products.form.inciHint}
      >
        <textarea
          name="inci"
          rows={4}
          defaultValue={product.inci ?? ""}
          placeholder={t.library.products.form.inciPlaceholder}
          className={`${fieldInputCn} font-mono text-xs`}
        />
      </FormField>

      <FormField label={t.library.products.form.notes}>
        <textarea
          name="notes"
          rows={2}
          defaultValue={product.notes ?? ""}
          placeholder={t.library.products.form.notesPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <EditFormActions
        isPending={isPending}
        isDeleting={isDeleting}
        onDelete={() =>
          confirmToast({
            message: t.library.products.card.confirmDelete,
            confirmLabel: t.common.delete,
            cancelLabel: t.common.cancel,
            onConfirm: () =>
              startDelete(async () => {
                await deleteProduct(product.id);
                router.push("/library/products");
                router.refresh();
              }),
            successMessage: t.common.deleted,
          })
        }
        saveLabel={t.common.save}
        savingLabel={t.common.saving}
        deletingLabel={t.common.deleting}
        deleteLabel={t.common.delete}
      />

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
