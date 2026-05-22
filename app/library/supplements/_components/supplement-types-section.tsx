"use client";

import { useActionState, useTransition } from "react";
import { addSupplementType, deleteSupplementType, type ActionState } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { CollapsibleSection } from "@/app/_components/collapsible-section";
import { EmptyState } from "@/app/_components/empty-state";
import { LibraryChip } from "@/app/_components/library-chip";
import type { SupplementType } from "@/lib/types";

const initialState: ActionState = {};

export function SupplementTypesSection({ types }: { types: SupplementType[] }) {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(addSupplementType, initialState);
  const [deletingId, startDelete] = useTransition();

  const errorMessage = (() => {
    if (state.errorCode === "name_required") return t.library.supplements.errors.nameRequired;
    if (state.errorCode === "type_exists") return t.library.supplements.errors.typeExists;
    if (state.errorCode === "generic") return t.library.supplements.errors.generic;
    return null;
  })();

  return (
    <CollapsibleSection
      title={t.library.supplements.types.title}
      subtitle={t.library.supplements.types.subtitle}
      defaultOpen={types.length === 0}
    >
      {types.length === 0 ? (
        <EmptyState message={t.library.supplements.types.empty} />
      ) : (
        <ul className="flex flex-wrap gap-2">
          {types.map((type) => (
            <LibraryChip
              key={type.id}
              label={type.name}
              deleteAriaLabel={`Delete ${type.name}`}
              disabled={deletingId}
              onDelete={() =>
                confirmToast({
                  message: t.library.supplements.types.confirmDelete,
                  confirmLabel: t.common.delete,
                  cancelLabel: t.common.cancel,
                  onConfirm: () => startDelete(() => deleteSupplementType(type.id)),
                  successMessage: t.common.deleted,
                })
              }
            />
          ))}
        </ul>
      )}

      <form action={formAction} className="flex gap-2">
        <input
          name="name"
          required
          placeholder={t.library.supplements.types.addPlaceholder}
          className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {t.library.supplements.types.add}
        </button>
      </form>

      {errorMessage && (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      )}
    </CollapsibleSection>
  );
}
