"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addSupplementBrand,
  deleteSupplementBrand,
  type ActionState,
} from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import type { SupplementBrand } from "@/lib/types";

const initialState: ActionState = {};

export function SupplementBrandsSection({
  brands,
}: {
  brands: SupplementBrand[];
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    addSupplementBrand,
    initialState,
  );
  const [deletingId, startDelete] = useTransition();

  const errorMessage = (() => {
    if (state.errorCode === "name_required")
      return t.library.supplements.errors.nameRequired;
    if (state.errorCode === "brand_exists")
      return t.library.supplements.errors.brandExists;
    if (state.errorCode === "generic")
      return state.errorDetail ?? t.library.supplements.errors.generic;
    return null;
  })();

  return (
    <section className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            {t.library.supplements.brands.title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {brands.length} · {t.library.supplements.brands.subtitle}
          </p>
        </div>
        <span className="text-xl text-zinc-400" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          {brands.length === 0 ? (
            <p className="text-sm text-zinc-500">
              {t.library.supplements.brands.empty}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <li
                  key={brand.id}
                  className="inline-flex items-center gap-0.5 rounded-full border border-zinc-300 bg-white py-0.5 pl-3 pr-0.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <span>{brand.name}</span>
                  <button
                    type="button"
                    aria-label={`Delete ${brand.name}`}
                    disabled={deletingId}
                    onClick={() => {
                      confirmToast({
                        message: t.library.supplements.brands.confirmDelete,
                        confirmLabel: t.common.delete,
                        cancelLabel: t.common.cancel,
                        onConfirm: () =>
                          startDelete(() => deleteSupplementBrand(brand.id)),
                      });
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full text-base leading-none text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form action={formAction} className="flex gap-2">
            <input
              name="name"
              required
              placeholder={t.library.supplements.brands.addPlaceholder}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {t.library.supplements.brands.add}
            </button>
          </form>

          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {errorMessage}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
