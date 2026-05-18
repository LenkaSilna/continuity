"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useTransition } from "react";
import {
  deleteSupplement,
  updateSupplement,
  type ActionState,
} from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
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
  const [state, formAction, isPending] = useActionState(
    boundUpdate,
    initialState,
  );
  const [isDeleting, startDelete] = useTransition();
  const brandListId = useId();
  const currentBrandName =
    brands.find((b) => b.id === supplement.brand_id)?.name ?? "";

  useEffect(() => {
    if (state.ok) {
      router.push("/library/supplements");
      router.refresh();
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required")
      return t.library.supplements.errors.nameRequired;
    if (state.errorCode === "generic")
      return state.errorDetail ?? t.library.supplements.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.supplements.form.name} {t.common.requiredField}
        </span>
        <input
          name="name"
          required
          defaultValue={supplement.name}
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
          defaultValue={currentBrandName}
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
          defaultValue={supplement.type_id ?? ""}
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
          defaultValue={supplement.dosage ?? ""}
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
          defaultValue={supplement.purpose ?? ""}
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
          defaultValue={supplement.ingredients ?? ""}
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
          defaultValue={supplement.notes ?? ""}
          placeholder={t.library.supplements.form.notesPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {isPending ? t.common.saving : t.common.save}
          </button>
          <Link
            href="/library/supplements"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-700"
          >
            {t.library.supplements.cancel}
          </Link>
        </div>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
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
            });
          }}
          className="rounded-md border border-red-300 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
        >
          {t.common.delete}
        </button>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </form>
  );
}
