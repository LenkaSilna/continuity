import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";
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
import { SlotPanel } from "./slot-panel";

const SLOTS: TimeOfDay[] = ["morning", "afternoon", "evening"];

export function RoutineTabs({
  products,
  productBrands,
  supplements,
  supplementBrands,
  habits,
  routineItems,
  enabledKinds,
}: {
  products: Product[];
  productBrands: ProductBrand[];
  supplements: Supplement[];
  supplementBrands: SupplementBrand[];
  habits: Habit[];
  routineItems: RoutineItem[];
  enabledKinds: ItemKind[];
}) {
  const { t } = useI18n();
  const [active, setActive] = useState<TimeOfDay>("morning");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={t.routine.title}
        className="flex gap-1 rounded-(--cui-radius-full) bg-(--surface-3) p-1"
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
              className={`flex-1 rounded-(--cui-radius-full) px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-(--surface) text-(--text) shadow-(--cui-shadow-sm)"
                  : "text-(--text-muted) hover:text-(--text)"
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
        enabledKinds={enabledKinds}
      />
    </div>
  );
}
