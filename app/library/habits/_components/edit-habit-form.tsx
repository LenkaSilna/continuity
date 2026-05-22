"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { deleteHabit, updateHabit, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { showSuccess } from "@/lib/toast";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { EditFormActions } from "@/app/_components/edit-form-actions";
import type { Habit } from "@/lib/types";

const initialState: ActionState = {};

export function EditHabitForm({ habit }: { habit: Habit }) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateHabit.bind(null, habit.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok) {
      showSuccess(t.common.saved);
      router.push("/library/habits");
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.habits.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.habits.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <FormField label={`${t.library.habits.form.name} ${t.common.requiredField}`}>
        <input
          name="name"
          required
          defaultValue={habit.name}
          placeholder={t.library.habits.form.namePlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <FormField label={t.library.habits.form.description}>
        <textarea
          name="description"
          rows={3}
          defaultValue={habit.description ?? ""}
          placeholder={t.library.habits.form.descriptionPlaceholder}
          className={fieldInputCn}
        />
      </FormField>

      <EditFormActions
        isPending={isPending}
        isDeleting={isDeleting}
        onDelete={() =>
          confirmToast({
            message: t.library.habits.card.confirmDelete,
            confirmLabel: t.common.delete,
            cancelLabel: t.common.cancel,
            onConfirm: () =>
              startDelete(async () => {
                await deleteHabit(habit.id);
                router.push("/library/habits");
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
