"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  attachTag,
  createAndAttachTag,
  detachTag,
  type TagActionState,
} from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import type { Tag } from "@/lib/types";

const initialState: TagActionState = {};

export function ObservationsPicker({
  date,
  allTags,
  assignedIds,
}: {
  date: string;
  allTags: Tag[];
  assignedIds: Set<string>;
}) {
  const { t } = useI18n();
  const [isPending, start] = useTransition();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCreate = async (
    prev: TagActionState,
    formData: FormData,
  ): Promise<TagActionState> => {
    const result = await createAndAttachTag(date, prev, formData);
    if (result.ok) {
      setQuery("");
      inputRef.current?.focus();
    }
    return result;
  };

  const [createState, createAction, isCreating] = useActionState(
    handleCreate,
    initialState,
  );

  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  const matches = trimmed
    ? allTags.filter(
        (tag) =>
          !assignedIds.has(tag.id) &&
          tag.name.toLowerCase().includes(lower),
      )
    : allTags.filter((tag) => !assignedIds.has(tag.id));

  const exactExists =
    trimmed.length > 0 &&
    allTags.some((tag) => tag.name.toLowerCase() === lower);

  const assigned = allTags.filter((tag) => assignedIds.has(tag.id));

  return (
    <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t.calendar.day.observations.title}
      </h2>

      {assigned.length === 0 ? (
        <p className="text-xs text-zinc-500">
          {t.calendar.day.observations.empty}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {assigned.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => start(() => detachTag(date, tag.id))}
                className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-xs hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full border border-zinc-300 dark:border-zinc-700"
                  style={{ backgroundColor: tag.color ?? "transparent" }}
                />
                {tag.name}
                <span aria-hidden className="text-zinc-400">
                  ×
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form action={createAction} className="space-y-2">
        <input
          ref={inputRef}
          name="name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.calendar.day.observations.addPlaceholder}
          className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          autoComplete="off"
        />

        {matches.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {matches.slice(0, 12).map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    start(async () => {
                      await attachTag(date, tag.id);
                      setQuery("");
                      inputRef.current?.focus();
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-zinc-300 px-3 py-1 text-xs text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full border border-zinc-300 dark:border-zinc-700"
                    style={{ backgroundColor: tag.color ?? "transparent" }}
                  />
                  + {tag.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        {trimmed && !exactExists && (
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            + {t.calendar.day.observations.createNew}: <strong>{trimmed}</strong>
          </button>
        )}

        {createState.errorCode === "generic" && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {createState.errorDetail ?? t.calendar.errors.generic}
          </p>
        )}
      </form>
    </section>
  );
}
