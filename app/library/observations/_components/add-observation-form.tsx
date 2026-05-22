"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { addObservation, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showSuccess } from "@/lib/toast";
import { AddDashedButton } from "@/app/_components/add-dashed-button";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { FormActions } from "@/app/_components/form-actions";

const initialState: ActionState = {};

export function AddObservationForm({ categories }: { categories: string[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addObservation, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const categoryListId = useId();

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      formRef.current?.reset();
    }
  }, [state]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.observations.errors.nameRequired;
    if (state.errorCode === "exists") return t.library.observations.errors.exists;
    if (state.errorCode === "generic") return t.library.observations.errors.generic;
    return null;
  })();

  if (!open) {
    return (
      <AddDashedButton onClick={() => setOpen(true)}>
        + {t.library.observations.add}
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
        {t.library.observations.add}
      </h3>

      <FormField label={`${t.library.observations.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          placeholder={t.library.observations.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.observations.form.category}>
        <input
          name="category"
          list={categoryListId}
          autoComplete="off"
          placeholder={t.library.observations.form.categoryPlaceholder}
          className={fieldInputCn}
        />
        <datalist id={categoryListId}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </FormField>

      <label className="flex items-center gap-3">
        <span className="text-xs font-medium">
          {t.library.observations.form.color}
        </span>
        <input
          type="color"
          name="color"
          defaultValue="#a78bfa"
          className="h-9 w-12 cursor-pointer rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="text-xs text-zinc-500">
          {t.library.observations.form.colorHint}
        </span>
      </label>

      <FormActions
        isPending={isPending}
        onCancel={() => setOpen(false)}
        saveLabel={t.common.save}
        savingLabel={t.common.saving}
        cancelLabel={t.library.observations.cancel}
      />

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
