"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteSupplement } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import type { Supplement, SupplementBrand, SupplementType } from "@/lib/types";

export function SupplementsList({
  supplements,
  types,
  brands,
}: {
  supplements: Supplement[];
  types: SupplementType[];
  brands: SupplementBrand[];
}) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();
  const typeName = (id: string | null) =>
    id ? types.find((type) => type.id === id)?.name ?? null : null;
  const brandName = (id: string | null) =>
    id ? brands.find((brand) => brand.id === id)?.name ?? null : null;

  if (supplements.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
        {t.library.supplements.empty}
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {supplements.map((s) => {
        const tn = typeName(s.type_id);
        const bn = brandName(s.brand_id);
        return (
          <li
            key={s.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-medium">{s.name}</span>
                <span className="text-sm text-zinc-500">
                  {bn || t.library.supplements.card.noBrand}
                </span>
              </div>
              {tn && (
                <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {tn}
                </span>
              )}
              {s.dosage && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-500">
                    {t.library.supplements.form.dosage}:
                  </span>{" "}
                  {s.dosage}
                </p>
              )}
              {s.purpose && (
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="text-zinc-500">
                    {t.library.supplements.form.purpose}:
                  </span>{" "}
                  {s.purpose}
                </p>
              )}
              {s.ingredients && (
                <details className="text-xs">
                  <summary className="cursor-pointer text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
                    {t.library.supplements.form.ingredients}
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap wrap-break-word font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                    {s.ingredients}
                  </p>
                </details>
              )}
              {s.notes && (
                <p className="whitespace-pre-wrap text-xs text-zinc-500 dark:text-zinc-500">
                  {s.notes}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-1">
              <Link
                href={`/library/supplements/${s.id}`}
                className="rounded-md border border-zinc-300 px-2 py-1 text-center text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
              >
                {t.common.edit}
              </Link>
              <button
                type="button"
                aria-label={`Delete ${s.name}`}
                disabled={isPending}
                onClick={() => {
                  confirmToast({
                    message: t.library.supplements.card.confirmDelete,
                    confirmLabel: t.common.delete,
                    cancelLabel: t.common.cancel,
                    onConfirm: () => start(() => deleteSupplement(s.id)),
                  });
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
