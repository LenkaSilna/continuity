import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toggleDailyLog } from "../../_actions";
import { useI18n } from "@/lib/i18n/client";
import { showError } from "@/lib/toast";
import type { ItemKind, TimeOfDay } from "@/lib/types";

export type ChecklistItem = {
  kind: ItemKind;
  itemId: string;
  name: string;
};

export type SlotItems = Record<TimeOfDay, ChecklistItem[]>;

export function RoutineChecklist({
  date,
  slots,
  logged,
}: {
  date: string;
  slots: SlotItems;
  logged: Set<string>;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [localLogged, setLocalLogged] = useState(logged);
  const [pendingKeys, setPendingKeys] = useState(new Set<string>());
  const serverRef = useRef(logged);

  useEffect(() => {
    serverRef.current = logged;
    setLocalLogged(logged);
  }, [logged]);

  const order: TimeOfDay[] = ["morning", "afternoon", "evening"];
  const slotLabels = t.routine.slots;
  const allEmpty = order.every((s) => slots[s].length === 0);

  const handleToggle = async (
    key: string,
    slot: TimeOfDay,
    kind: ItemKind,
    itemId: string,
  ) => {
    if (pendingKeys.has(key)) return;
    setLocalLogged((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setPendingKeys((prev) => new Set([...prev, key]));
    const result = await toggleDailyLog(date, slot, kind, itemId);
    setPendingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    if (result?.error) {
      showError(t.calendar.errors.generic);
      setLocalLogged(serverRef.current);
    } else {
      queryClient.invalidateQueries({ queryKey: ["calendar-day", date] });
      queryClient.invalidateQueries({ queryKey: ["calendar-data"] });
    }
  };

  return (
    <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {t.calendar.day.routine.title}
      </h2>

      {allEmpty ? (
        <p className="text-sm text-zinc-500">
          {t.calendar.day.routine.empty}
        </p>
      ) : (
        <div className="space-y-4">
          {order.map((slot) => {
            const items = slots[slot];
            return (
              <div key={slot} className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {slotLabels[slot]}
                </h3>
                {items.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    {t.calendar.day.routine.slotEmpty}
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {items.map((item) => {
                      const key = `${slot}|${item.kind}|${item.itemId}`;
                      const checked = localLogged.has(key);
                      const isItemPending = pendingKeys.has(key);
                      return (
                        <li key={key}>
                          <button
                            type="button"
                            disabled={isItemPending}
                            onClick={() =>
                              handleToggle(key, slot, item.kind, item.itemId)
                            }
                            aria-pressed={checked}
                            className={[
                              "flex w-full min-h-[44px] items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition disabled:opacity-50",
                              checked
                                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900",
                            ].join(" ")}
                          >
                            <span
                              aria-hidden
                              className={[
                                "grid h-5 w-5 shrink-0 place-items-center rounded border",
                                checked
                                  ? "border-emerald-600 bg-emerald-600 text-white"
                                  : "border-zinc-300 dark:border-zinc-700",
                              ].join(" ")}
                            >
                              {checked ? (
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-3 w-3"
                                >
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              ) : null}
                            </span>
                            <span className="flex-1">{item.name}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
