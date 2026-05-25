import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { addProduct, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showSuccess } from "@/lib/toast";
import { AddDashedButton } from "@/app/_components/add-dashed-button";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { FormActions } from "@/app/_components/form-actions";
import type { ProductBrand, ProductType } from "@/lib/types";

const initialState: ActionState = {};

export function AddProductForm({
  types,
  brands,
}: {
  types: ProductType[];
  brands: ProductBrand[];
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    (_: ActionState, fd: FormData) => addProduct(fd),
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const brandListId = useId();

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      formRef.current?.reset();
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["routine-data"] });
      queryClient.invalidateQueries({ queryKey: ["calendar-day"] });
    }
  }, [state.ok]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.products.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.products.errors.generic;
    return null;
  })();

  if (!open) {
    return (
      <AddDashedButton onClick={() => setOpen(true)}>
        + {t.library.products.add}
      </AddDashedButton>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide">
        {t.library.products.add}
      </h3>

      <FormField label={`${t.library.products.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          placeholder={t.library.products.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.products.form.brand}>
        <input
          name="brand"
          list={brandListId}
          autoComplete="off"
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
        <select name="type_id" defaultValue="" className={fieldInputCn}>
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
          placeholder={t.library.products.form.inciPlaceholder}
          className={`${fieldInputCn} font-mono text-xs`}
        />
      </FormField>

      <FormField label={t.library.products.form.notes}>
        <textarea
          name="notes"
          rows={2}
          placeholder={t.library.products.form.notesPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormActions
        isPending={isPending}
        onCancel={() => setOpen(false)}
        saveLabel={t.common.save}
        savingLabel={t.common.saving}
        cancelLabel={t.library.products.cancel}
      />

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
