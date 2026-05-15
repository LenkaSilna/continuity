"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addProductType,
  deleteProductType,
  type ActionState,
} from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import type { ProductType } from "@/lib/types";

const initialState: ActionState = {};

export function ProductTypesSection({ types }: { types: ProductType[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(types.length === 0);
  const [state, formAction, isPending] = useActionState(addProductType, initialState);
  const [deletingId, startDelete] = useTransition();

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.products.errors.nameRequired;
    if (state.errorCode === "type_exists") return t.library.products.errors.typeExists;
    if (state.errorCode === "generic") return state.errorDetail ?? t.library.products.errors.generic;
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
            {t.library.products.types.title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {types.length} · {t.library.products.types.subtitle}
          </p>
        </div>
        <span className="text-xl text-zinc-400" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-zinc-200 p-4 dark:border-zinc-800">
          {types.length === 0 ? (
            <p className="text-sm text-zinc-500">{t.library.products.types.empty}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {types.map((type) => (
                <li
                  key={type.id}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-300 bg-white py-1 pl-3 pr-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                >
                  <span>{type.name}</span>
                  <button
                    type="button"
                    aria-label={`Delete ${type.name}`}
                    disabled={deletingId}
                    onClick={() => {
                      if (confirm(t.library.products.types.confirmDelete)) {
                        startDelete(() => deleteProductType(type.id));
                      }
                    }}
                    className="grid h-7 w-7 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
              placeholder={t.library.products.types.addPlaceholder}
              className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {t.library.products.types.add}
            </button>
          </form>

          {errorMessage && (
            <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
          )}
        </div>
      )}
    </section>
  );
}
