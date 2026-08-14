import type { ComponentPropsWithoutRef } from "react";

export type CardVariant = "default" | "flat" | "raised" | "soft";

const VARIANT_CLASS: Record<CardVariant, string> = {
  default: "border border-(--border) bg-(--surface) shadow-(--cui-shadow-sm)",
  flat: "border border-(--border) bg-(--surface)",
  raised: "border border-(--border) bg-(--surface) shadow-(--cui-shadow-md)",
  soft: "bg-(--surface-2)",
};

// eslint-disable-next-line react-refresh/only-export-components -- class builder shared with non-<div> callers (e.g. Link), colocated by design
export function cardClass(variant: CardVariant = "default", className = ""): string {
  return [
    "rounded-(--cui-radius-xl) p-(--space-6) transition-colors duration-(--cui-dur) ease-(--cui-ease)",
    VARIANT_CLASS[variant],
    className,
  ].join(" ");
}

export function Card({
  variant = "default",
  className,
  ...props
}: ComponentPropsWithoutRef<"div"> & { variant?: CardVariant }) {
  return <div className={cardClass(variant, className)} {...props} />;
}
