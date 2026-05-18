"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addHabit, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";

const initialState: ActionState = {};

export function AddHabitForm() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(addHabit, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required")
      return t.library.habits.errors.nameRequired;
    if (state.errorCode === "generic")
      return state.errorDetail ?? t.library.habits.errors.generic;
    return null;
  })();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border-2 border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
      >
        + {t.library.habits.add}
      </button>
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

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.habits.form.name} {t.common.requiredField}
        </span>
        <input
          name="name"
          required
          placeholder={t.library.habits.form.namePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.habits.form.description}
        </span>
        <textarea
          name="description"
          rows={2}
          placeholder={t.library.habits.form.descriptionPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isPending ? t.common.saving : t.common.save}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
        >
          {t.library.habits.cancel}
        </button>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
      {state.ok && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          {t.common.saved}
        </p>
      )}
    </form>
  );
}
