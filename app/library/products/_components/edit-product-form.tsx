"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useTransition } from "react";
import {
  deleteProduct,
  updateProduct,
  type ActionState,
} from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import type { Product, ProductType } from "@/lib/types";

const initialState: ActionState = {};

export function EditProductForm({
  product,
  types,
}: {
  product: Product;
  types: ProductType[];
}) {
  const { t } = useI18n();
  const router = useRouter();
  const boundUpdate = updateProduct.bind(null, product.id);
  const [state, formAction, isPending] = useActionState(boundUpdate, initialState);
  const [isDeleting, startDelete] = useTransition();

  useEffect(() => {
    if (state.ok) {
      router.push("/library/products");
      router.refresh();
    }
  }, [state.ok, router]);

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.products.errors.nameRequired;
    if (state.errorCode === "generic") return state.errorDetail ?? t.library.products.errors.generic;
    return null;
  })();

  return (
    <form action={formAction} className="space-y-4">
      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.products.form.name} {t.common.requiredField}
        </span>
        <input
          name="name"
          required
          defaultValue={product.name}
          placeholder={t.library.products.form.namePlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">{t.library.products.form.brand}</span>
        <input
          name="brand"
          defaultValue={product.brand ?? ""}
          placeholder={t.library.products.form.brandPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">{t.library.products.form.type}</span>
        <select
          name="type_id"
          defaultValue={product.type_id ?? ""}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">{t.library.products.form.typeNone}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">
          {t.library.products.form.activeIngredients}
        </span>
        <input
          name="active_ingredients"
          defaultValue={product.active_ingredients ?? ""}
          placeholder={t.library.products.form.activeIngredientsPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">{t.library.products.form.inci}</span>
        <span className="block text-xs text-zinc-500">
          {t.library.products.form.inciHint}
        </span>
        <textarea
          name="inci"
          rows={4}
          defaultValue={product.inci ?? ""}
          placeholder={t.library.products.form.inciPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      <label className="block space-y-1">
        <span className="text-xs font-medium">{t.library.products.form.notes}</span>
        <textarea
          name="notes"
          rows={2}
          defaultValue={product.notes ?? ""}
          placeholder={t.library.products.form.notesPlaceholder}
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
            href="/library/products"
            className="rounded-md border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-700"
          >
            {t.library.products.cancel}
          </Link>
        </div>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            if (confirm(t.library.products.card.confirmDelete)) {
              startDelete(async () => {
                await deleteProduct(product.id);
                router.push("/library/products");
                router.refresh();
              });
            }
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
