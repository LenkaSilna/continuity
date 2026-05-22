"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useTransition } from "react";
import { deleteObservation, updateObservation, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { showSuccess } from "@/lib/toast";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { EditFormActions } from "@/app/_components/edit-form-actions";
import type { Tag } from "@/lib/types";

const initialState: ActionState = {};

export function EditObservationForm({
  tag,
  categories,
}: {
  tag: Tag;
  categories: string[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateObservation.bind(null, tag.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);
  const [isDeleting, startDelete] = useTransition();
  const categoryListId = useId();

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      router.push("/library/observations");
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.observations.errors.nameRequired;
    if (state.errorCode === "exists") return t.library.observations.errors.exists;
    if (state.errorCode === "generic") return t.library.observations.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <FormField label={`${t.library.observations.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          defaultValue={tag.name}
          placeholder={t.library.observations.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.observations.form.category}>
        <input
          name="category"
          list={categoryListId}
          autoComplete="off"
          defaultValue={tag.category ?? ""}
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
          defaultValue={tag.color ?? "#a78bfa"}
          className="h-9 w-12 cursor-pointer rounded-md border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
        />
        <span className="text-xs text-zinc-500">
          {t.library.observations.form.colorHint}
        </span>
      </label>

      <EditFormActions
        isPending={isPending}
        isDeleting={isDeleting}
        onDelete={() =>
          confirmToast({
            message: t.library.observations.card.confirmDelete,
            confirmLabel: t.common.delete,
            cancelLabel: t.common.cancel,
            onConfirm: () =>
              startDelete(async () => {
                await deleteObservation(tag.id);
                router.push("/library/observations");
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
