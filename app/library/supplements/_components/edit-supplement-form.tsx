"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useTransition } from "react";
import { deleteSupplement, updateSupplement, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { showSuccess } from "@/lib/toast";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { EditFormActions } from "@/app/_components/edit-form-actions";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";

const initialState: ActionState = {};

export function EditSupplementForm({
  supplement,
  types,
  brands,
}: {
  supplement: Supplement;
  types: SupplementType[];
  brands: SupplementBrand[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateSupplement.bind(null, supplement.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);
  const [isDeleting, startDelete] = useTransition();
  const brandListId = useId();
  const currentBrandName = brands.find((b) => b.id === supplement.brand_id)?.name ?? "";

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      router.push("/library/supplements");
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.supplements.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.supplements.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <FormField label={`${t.library.supplements.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          defaultValue={supplement.name}
          placeholder={t.library.supplements.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.supplements.form.brand}>
        <input
          name="brand"
          list={brandListId}
          autoComplete="off"
          defaultValue={currentBrandName}
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
        <select
          name="type_id"
          defaultValue={supplement.type_id ?? ""}
          className={fieldInputCn}
        >
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
          defaultValue={supplement.dosage ?? ""}
          placeholder={t.library.supplements.form.dosagePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.supplements.form.purpose}>
        <input
          name="purpose"
          defaultValue={supplement.purpose ?? ""}
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
          defaultValue={supplement.ingredients ?? ""}
          placeholder={t.library.supplements.form.ingredientsPlaceholder}
          className={`${fieldInputCn} font-mono text-xs`}
        />
      </FormField>

      <FormField label={t.library.supplements.form.notes}>
        <textarea
          name="notes"
          rows={2}
          defaultValue={supplement.notes ?? ""}
          placeholder={t.library.supplements.form.notesPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <EditFormActions
        isPending={isPending}
        isDeleting={isDeleting}
        onDelete={() =>
          confirmToast({
            message: t.library.supplements.card.confirmDelete,
            confirmLabel: t.common.delete,
            cancelLabel: t.common.cancel,
            onConfirm: () =>
              startDelete(async () => {
                await deleteSupplement(supplement.id);
                router.push("/library/supplements");
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
