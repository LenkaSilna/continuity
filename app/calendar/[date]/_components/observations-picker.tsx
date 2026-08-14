import { useActionState, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  attachTag,
  createAndAttachTag,
  detachTag,
  type TagActionState,
} from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showError } from "@/lib/toast";
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
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [query, setQuery] = useState("");
  const [localAssigned, setLocalAssigned] = useState(assignedIds);
  const [syncedAssigned, setSyncedAssigned] = useState(assignedIds);
  const serverRef = useRef(assignedIds);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPending) return;
    serverRef.current = assignedIds;
  }, [assignedIds, isPending]);

  if (!isPending && assignedIds !== syncedAssigned) {
    setSyncedAssigned(assignedIds);
    setLocalAssigned(assignedIds);
  }

  const handleDetach = async (tagId: string) => {
    if (isPending) return;
    setLocalAssigned((prev) => {
      const next = new Set(prev);
      next.delete(tagId);
      return next;
    });
    setIsPending(true);
    const result = await detachTag(date, tagId);
    setIsPending(false);
    if (result?.error) {
      showError(t.calendar.errors.generic);
      setLocalAssigned(serverRef.current);
    } else {
      queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
    }
  };

  const handleAttach = async (tagId: string) => {
    if (isPending) return;
    setLocalAssigned((prev) => {
      const next = new Set(prev);
      next.add(tagId);
      return next;
    });
    setQuery("");
    inputRef.current?.focus();
    setIsPending(true);
    const result = await attachTag(date, tagId);
    setIsPending(false);
    if (result?.error) {
      showError(t.calendar.errors.generic);
      setLocalAssigned(serverRef.current);
    } else {
      queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
    }
  };

  const handleCreate = async (
    _: TagActionState,
    formData: FormData,
  ): Promise<TagActionState> => {
    const result = await createAndAttachTag(date, formData);
    if (result.ok) {
      setQuery("");
      inputRef.current?.focus();
      queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
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
          !localAssigned.has(tag.id) &&
          tag.name.toLowerCase().includes(lower),
      )
    : allTags.filter((tag) => !localAssigned.has(tag.id));

  const exactExists =
    trimmed.length > 0 &&
    allTags.some((tag) => tag.name.toLowerCase() === lower);

  const assigned = allTags.filter((tag) => localAssigned.has(tag.id));

  return (
    <section className="space-y-3 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
        {t.calendar.day.observations.title}
      </h2>

      {assigned.length === 0 ? (
        <p className="text-xs text-(--text-muted)">
          {t.calendar.day.observations.empty}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {assigned.map((tag) => (
            <li key={tag.id}>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleDetach(tag.id)}
                className="inline-flex h-8 items-center gap-1.5 rounded-(--cui-radius-full) border border-(--border) px-3 text-sm transition-colors hover:bg-(--surface-2) disabled:opacity-50"
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full border border-(--border)"
                  style={{ backgroundColor: tag.color ?? "transparent" }}
                />
                {tag.name}
                <span aria-hidden className="text-(--text-soft)">
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
          className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-sm text-(--text)"
          autoComplete="off"
        />

        {matches.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {matches.slice(0, 12).map((tag) => (
              <li key={tag.id}>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleAttach(tag.id)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-(--cui-radius-full) border border-dashed border-(--border) px-3 text-sm text-(--text-muted) transition-colors hover:border-(--accent-border) hover:text-(--text) disabled:opacity-50"
                >
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full border border-(--border)"
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
            className="rounded-md border border-(--border) px-3 py-1.5 text-xs text-(--text-muted) transition-colors hover:bg-(--surface-2) disabled:opacity-50"
          >
            + {t.calendar.day.observations.createNew}: <strong>{trimmed}</strong>
          </button>
        )}

        {createState.errorCode === "generic" && (
          <p className="text-xs text-red-600 dark:text-red-400">
            {t.calendar.errors.generic}
          </p>
        )}
      </form>
    </section>
  );
}
