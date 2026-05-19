"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
import type {
  Habit,
  Product,
  ProductBrand,
  RoutineItem,
  Supplement,
  SupplementBrand,
  TimeOfDay,
} from "@/lib/types";
import { SlotPanel } from "./slot-panel";

const SLOTS: TimeOfDay[] = ["morning", "afternoon", "evening"];

export function RoutineTabs({
  products,
  productBrands,
  supplements,
  supplementBrands,
  habits,
  routineItems,
}: {
  products: Product[];
  productBrands: ProductBrand[];
  supplements: Supplement[];
  supplementBrands: SupplementBrand[];
  habits: Habit[];
  routineItems: RoutineItem[];
}) {
  const { t } = useI18n();
  const [active, setActive] = useState<TimeOfDay>("morning");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={t.routine.title}
        className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {SLOTS.map((slot) => {
          const isActive = slot === active;
          return (
            <button
              key={slot}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(slot)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {t.routine.slots[slot]}
            </button>
          );
        })}
      </div>

      <SlotPanel
        slot={active}
        products={products}
        productBrands={productBrands}
        supplements={supplements}
        supplementBrands={supplementBrands}
        habits={habits}
        routineItems={routineItems}
      />
    </div>
  );
}
