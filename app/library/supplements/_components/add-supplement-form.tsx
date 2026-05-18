"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { addSupplement, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
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
  const [state, formAction, isPending] = useActionState(
    addSupplement,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const brandListId = useId();

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required")
      return t.library.supplements.errors.nameRequired;
    if (state.errorCode === "generic")
      return state.errorDetail ?? t.library.supplements.errors.generic;
    return null;
  })();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-md border-2 border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-100 dark:hover:text-zinc-100"
      >
        + {t.library.supplements.add}
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
        {t.library.supplements.add}
      </h3>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.name} {t.common.requiredField}
        </span>
        <input
          name="name"
          required
          placeholder={t.library.supplements.form.namePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.brand}
        </span>
        <input
          name="brand"
          list={brandListId}
          autoComplete="off"
          placeholder={t.library.supplements.form.brandPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <datalist id={brandListId}>
          {brands.map((b) => (
            <option key={b.id} value={b.name} />
          ))}
        </datalist>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.type}
        </span>
        <select
          name="type_id"
          defaultValue=""
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{t.library.supplements.form.typeNone}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.dosage}
        </span>
        <input
          name="dosage"
          placeholder={t.library.supplements.form.dosagePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.purpose}
        </span>
        <input
          name="purpose"
          placeholder={t.library.supplements.form.purposePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.ingredients}
        </span>
        <span className="block text-xs text-zinc-500">
          {t.library.supplements.form.ingredientsHint}
        </span>
        <textarea
          name="ingredients"
          rows={4}
          placeholder={t.library.supplements.form.ingredientsPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.notes}
        </span>
        <textarea
          name="notes"
          rows={2}
          placeholder={t.library.supplements.form.notesPlaceholder}
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
          {t.library.supplements.cancel}
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
