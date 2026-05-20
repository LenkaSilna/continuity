"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import { deleteObservation, updateObservation, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import type { Tag } from "@/lib/types";

const initialState: ActionState = {};

export function EditObservationForm({ tag }: { tag: Tag }) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateObservation.bind(null, tag.id);
  const [state, formAction, isPending] = useActionState(
    boundUpdate,
    initialState,
  );
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok) {
      router.push("/library/observations");
      router.refresh();
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required")
      return t.library.observations.errors.nameRequired;
    if (state.errorCode === "exists")
      return t.library.observations.errors.exists;
    if (state.errorCode === "generic")
      return state.errorDetail ?? t.library.observations.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.observations.form.name} {t.common.requiredField}
        </span>
        <input
          name="name"
          required
          defaultValue={tag.name}
          placeholder={t.library.observations.form.namePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.observations.form.category}
        </span>
        <input
          name="category"
          defaultValue={tag.category ?? ""}
          placeholder={t.library.observations.form.categoryPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

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
            href="/library/observations"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-700"
          >
            {t.library.observations.cancel}
          </Link>
        </div>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
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
