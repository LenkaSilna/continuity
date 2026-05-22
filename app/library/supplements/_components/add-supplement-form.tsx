"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { addSupplement, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showSuccess } from "@/lib/toast";
import { AddDashedButton } from "@/app/_components/add-dashed-button";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { FormActions } from "@/app/_components/form-actions";
import type { SupplementBrand, SupplementType } from "@/lib/types";

const initialState: ActionState = {};

export function AddSupplementForm({
  types,
  brands,
}: {
  types: SupplementType[];
  brands: SupplementBrand[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addSupplement, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const brandListId = useId();

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      formRef.current?.reset();
    }
  }, [state]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.supplements.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.supplements.errors.generic;
    return null;
  })();

  if (!open) {
    return (
      <AddDashedButton onClick={() => setOpen(true)}>
        + {t.library.supplements.add}
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
        {t.library.supplements.add}
      </h3>

      <FormField label={`${t.library.supplements.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          placeholder={t.library.supplements.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.supplements.form.brand}>
        <input
          name="brand"
          list={brandListId}
          autoComplete="off"
          placeholder={t.library.supplements.form.brandPlaceholder}
          className={fieldInputCn}
        />
        <datalist id={brandListId}>
          {brands.map((b) => (
            <option key={b.id} value={b.name} />
          ))}
        </datalist>
      </FormField>

      <FormField label={t.library.supplements.form.type}>
        <select name="type_id" defaultValue="" className={fieldInputCn}>
          <option value="">{t.library.supplements.form.typeNone}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label={t.library.supplements.form.dosage}>
        <input
          name="dosage"
          placeholder={t.library.supplements.form.dosagePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.supplements.form.purpose}>
        <input
          name="purpose"
          placeholder={t.library.supplements.form.purposePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField
        label={t.library.supplements.form.ingredients}
        hint={t.library.supplements.form.ingredientsHint}
      >
        <textarea
          name="ingredients"
          rows={4}
          placeholder={t.library.supplements.form.ingredientsPlaceholder}
          className={`${fieldInputCn} font-mono text-xs`}
        />
      </FormField>

      <FormField label={t.library.supplements.form.notes}>
        <textarea
          name="notes"
          rows={2}
          placeholder={t.library.supplements.form.notesPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormActions
        isPending={isPending}
        onCancel={() => setOpen(false)}
        saveLabel={t.common.save}
        savingLabel={t.common.saving}
        cancelLabel={t.library.supplements.cancel}
      />

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
