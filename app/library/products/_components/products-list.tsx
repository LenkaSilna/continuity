"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteProduct } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import type { Product, ProductType } from "@/lib/types";

export function ProductsList({
  products,
  types,
}: {
  products: Product[];
  types: ProductType[];
}) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();
  const typeName = (id: string | null) =>
    id ? types.find((type) => type.id === id)?.name ?? null : null;

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {t.library.products.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {products.map((p) => {
        const tn = typeName(p.type_id);
        return (
          <li
            key={p.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{p.name}</span>
                <span className="text-sm text-zinc-500">
                  {p.brand || t.library.products.card.noBrand}
                </span>
              </div>
              {tn && (
                <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {tn}
                </span>
              )}
              {p.active_ingredients && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  {p.active_ingredients}
                </p>
              )}
              {p.inci && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    INCI
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap wrap-break-word font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                    {p.inci}
                  </p>
                </details>
              )}
              {p.notes && (
                <p className="whitespace-pre-wrap text-xs text-zinc-500 dark:text-zinc-500">
                  {p.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <Link
                href={`/library/products/${p.id}`}
                className="rounded-md border border-zinc-300 px-2 py-1 text-center text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {t.common.edit}
              </Link>
              <button
                type="button"
                aria-label={`Delete ${p.name}`}
                disabled={isPending}
                onClick={() => {
                  if (confirm(t.library.products.card.confirmDelete)) {
                    start(() => deleteProduct(p.id));
                  }
                }}
                className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
              >
                {t.common.delete}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
