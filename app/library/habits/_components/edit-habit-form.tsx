import { useState, useTransition } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { deleteHabit, updateHabit, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { showSuccess } from "@/lib/toast";
import { withDelete } from "@/lib/with-delete";
import { FormField, fieldInputCn } from "@/app/_components/form-field";
import { EditFormActions } from "@/app/_components/edit-form-actions";
import type { Habit } from "@/lib/types";

export function EditHabitForm({ habit }: { habit: Habit }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ActionState>({});
  const [isPending, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startSave(async () => {
      const result = await updateHabit(habit.id, formData);
      setState(result);
      if (result.ok) {
        showSuccess(t.common.saved);
        queryClient.invalidateQueries({ queryKey: ["habits"] });
        queryClient.invalidateQueries({ queryKey: ["routine-data"] });
        queryClient.invalidateQueries({ queryKey: ["calendar-day"] });
        navigate({ to: "/library/habits" });
      }
    });
  };

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.habits.errors.nameRequired;
    if (state.errorCode === "generic") return t.library.habits.errors.generic;
    return null;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            detail: habit.name,
            confirmLabel: t.common.delete,
            cancelLabel: t.common.cancel,
            onConfirm: () =>
              withDelete({
                action: () => deleteHabit(habit.id),
                start: startDelete,
                queryClient,
                invalidateKeys: [["habits"], ["routine-data"], ["calendar-day"]],
                navigate: () => navigate({ to: "/library/habits" }),
                errorMessage: t.common.errorGeneric,
                successMessage: t.common.deleted,
              }),
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
