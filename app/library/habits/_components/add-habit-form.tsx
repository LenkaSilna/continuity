"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addHabit, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showSuccess } from "@/lib/toast";
import { AddDashedButton } from "@/app/_components/add-dashed-button";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { FormActions } from "@/app/_components/form-actions";

const initialState: ActionState = {};

export function AddHabitForm() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addHabit, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      formRef.current?.reset();
    }
  }, [state]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.habits.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.habits.errors.generic;
    return null;
  })();

  if (!open) {
    return (
      <AddDashedButton onClick={() => setOpen(true)}>
        + {t.library.habits.add}
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
        {t.library.habits.add}
      </h3>

      <FormField label={`${t.library.habits.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          placeholder={t.library.habits.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.habits.form.description}>
        <textarea
          name="description"
          rows={2}
          placeholder={t.library.habits.form.descriptionPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormActions
        isPending={isPending}
        onCancel={() => setOpen(false)}
        saveLabel={t.common.save}
        savingLabel={t.common.saving}
        cancelLabel={t.library.habits.cancel}
      />

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
