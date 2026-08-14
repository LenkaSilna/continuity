import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n/client";
import { confirmToast } from "@/lib/confirm-toast";
import { withDelete } from "@/lib/with-delete";
import { TrashIcon } from "@/app/_components/icons";
import type {
  Habit,
  ItemKind,
  Product,
  ProductBrand,
  RoutineItem,
  Supplement,
  SupplementBrand,
  TimeOfDay,
} from "@/lib/types";
import { addRoutineItem, deleteRoutineItem } from "../_actions";

type Row = { routineId: string; label: string; sub?: string };

const KIND_TO_LIBRARY: Record<ItemKind, "products" | "supplements" | "habits"> = {
  product: "products",
  supplement: "supplements",
  habit: "habits",
};

export function SlotPanel({
  slot,
  products,
  productBrands,
  supplements,
  supplementBrands,
  habits,
  routineItems,
  enabledKinds,
}: {
  slot: TimeOfDay;
  products: Product[];
  productBrands: ProductBrand[];
  supplements: Supplement[];
  supplementBrands: SupplementBrand[];
  habits: Habit[];
  routineItems: RoutineItem[];
  enabledKinds: ItemKind[];
}) {
  const enabledSet = new Set(enabledKinds);
  const { t } = useI18n();
  const slotItems = useMemo(
    () => routineItems.filter((r) => r.time_of_day === slot),
    [routineItems, slot],
  );

  const productRows: Row[] = useMemo(
    () =>
      slotItems.flatMap<Row>((r) => {
        if (r.item_kind !== "product" || !r.product_id) return [];
        const p = products.find((x) => x.id === r.product_id);
        if (!p) return [];
        const brand = p.brand_id
          ? productBrands.find((b) => b.id === p.brand_id)?.name
          : null;
        const row: Row = { routineId: r.id, label: p.name };
        if (brand) row.sub = brand;
        return [row];
      }),
    [slotItems, products, productBrands],
  );

  const supplementRows: Row[] = useMemo(
    () =>
      slotItems.flatMap<Row>((r) => {
        if (r.item_kind !== "supplement" || !r.supplement_id) return [];
        const s = supplements.find((x) => x.id === r.supplement_id);
        if (!s) return [];
        const brand = s.brand_id
          ? supplementBrands.find((b) => b.id === s.brand_id)?.name
          : null;
        const sub = [brand, s.dosage].filter(Boolean).join(" · ");
        const row: Row = { routineId: r.id, label: s.name };
        if (sub) row.sub = sub;
        return [row];
      }),
    [slotItems, supplements, supplementBrands],
  );

  const habitRows: Row[] = useMemo(
    () =>
      slotItems.flatMap<Row>((r) => {
        if (r.item_kind !== "habit" || !r.habit_id) return [];
        const h = habits.find((x) => x.id === r.habit_id);
        if (!h) return [];
        return [{ routineId: r.id, label: h.name }];
      }),
    [slotItems, habits],
  );

  const usedProductIds = new Set(
    slotItems
      .filter((r) => r.item_kind === "product")
      .map((r) => r.product_id!),
  );
  const usedSupplementIds = new Set(
    slotItems
      .filter((r) => r.item_kind === "supplement")
      .map((r) => r.supplement_id!),
  );
  const usedHabitIds = new Set(
    slotItems.filter((r) => r.item_kind === "habit").map((r) => r.habit_id!),
  );

  return (
    <div className="space-y-5">
      {enabledSet.has("product") && (
        <Section
          kind="product"
          slot={slot}
          rows={productRows}
          library={products.map((p) => ({
            id: p.id,
            label: p.name,
            sub: p.brand_id
              ? productBrands.find((b) => b.id === p.brand_id)?.name
              : undefined,
          }))}
          usedIds={usedProductIds}
        />
      )}
      {enabledSet.has("supplement") && (
        <Section
          kind="supplement"
          slot={slot}
          rows={supplementRows}
          library={supplements.map((s) => ({
            id: s.id,
            label: s.name,
            sub: s.brand_id
              ? supplementBrands.find((b) => b.id === s.brand_id)?.name
              : undefined,
          }))}
          usedIds={usedSupplementIds}
        />
      )}
      {enabledSet.has("habit") && (
        <Section
          kind="habit"
          slot={slot}
          rows={habitRows}
          library={habits.map((h) => ({ id: h.id, label: h.name }))}
          usedIds={usedHabitIds}
        />
      )}
    </div>
  );

  function Section({
    kind,
    slot,
    rows,
    library,
    usedIds,
  }: {
    kind: ItemKind;
    slot: TimeOfDay;
    rows: Row[];
    library: { id: string; label: string; sub?: string }[];
    usedIds: Set<string>;
  }) {
    const sectionKey = KIND_TO_LIBRARY[kind];
    const queryClient = useQueryClient();
    const [pickerOpen, setPickerOpen] = useState(false);
    const [isPending, start] = useTransition();
    const pickerRef = useRef<HTMLDivElement>(null);
    const libraryEmpty = library.length === 0;
    const available = library.filter((item) => !usedIds.has(item.id));

    useEffect(() => {
      if (pickerOpen) {
        pickerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, [pickerOpen]);

    return (
      <section className="rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) p-4 shadow-(--cui-shadow-sm)">
        <header className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
            {t.routine.sections[sectionKey]}
          </h2>
          {!libraryEmpty && (
            <button
              type="button"
              onClick={() => setPickerOpen((v) => !v)}
              className={[
                "rounded-md border px-2 py-1 text-xs transition-colors",
                pickerOpen
                  ? "border-transparent bg-accent text-(--on-accent)"
                  : "border-(--border) text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
              ].join(" ")}
            >
              {t.routine.add[sectionKey]}
            </button>
          )}
        </header>

        {libraryEmpty ? (
          <p className="text-xs text-(--text-muted)">
            {t.routine.libraryEmpty[sectionKey]}{" "}
            <Link
              to={`/library/${sectionKey}`}
              className="underline underline-offset-2 hover:text-(--text)"
            >
              {t.routine.libraryEmptyLink}
            </Link>
          </p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-(--text-muted)">{t.routine.empty[sectionKey]}</p>
        ) : (
          <ul className="space-y-1.5">
            {rows.map((row) => (
              <li
                key={row.routineId}
                className="flex items-center justify-between gap-2 rounded-md bg-(--surface-2) px-3 py-2"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium">{row.label}</span>
                  {row.sub && (
                    <span className="ml-2 text-xs text-(--text-muted)">
                      {row.sub}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${row.label}`}
                  disabled={isPending}
                  onClick={() =>
                    confirmToast({
                      message: t.routine.card.confirmRemove,
                      detail: row.label,
                      confirmLabel: t.common.delete,
                      cancelLabel: t.common.cancel,
                      onConfirm: () =>
                        withDelete({
                          action: () => deleteRoutineItem(row.routineId),
                          start,
                          queryClient,
                          invalidateKeys: [["routine-data"], ["calendar-day"]],
                          errorMessage: t.common.errorGeneric,
                          successMessage: t.common.deleted,
                        }),
                    })
                  }
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-(--border) text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text) disabled:opacity-50"
                >
                  <TrashIcon />
                </button>
              </li>
            ))}
          </ul>
        )}

        {pickerOpen && !libraryEmpty && (
          <div ref={pickerRef} className="mt-3 rounded-md border border-(--border) bg-(--surface) p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
                {t.routine.picker.title}
              </span>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded px-2 py-0.5 text-xs text-(--text-muted) transition-colors hover:bg-(--surface-2)"
              >
                {t.routine.picker.cancel}
              </button>
            </div>
            {available.length === 0 ? (
              <p className="py-1 text-xs text-(--text-muted)">
                {t.routine.picker.allAdded}
              </p>
            ) : (
              <ul className="space-y-1">
                {available.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        start(async () => {
                          await addRoutineItem(slot, kind, item.id);
                          queryClient.invalidateQueries({ queryKey: ["routine-data"] });
                          queryClient.invalidateQueries({ queryKey: ["calendar-day"] });
                          setPickerOpen(false);
                        })
                      }
                      className="flex w-full items-baseline justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-(--surface-2) disabled:opacity-50"
                    >
                      <span className="truncate">{item.label}</span>
                      {item.sub && (
                        <span className="shrink-0 text-xs text-(--text-muted)">
                          {item.sub}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>
    );
  }
}
