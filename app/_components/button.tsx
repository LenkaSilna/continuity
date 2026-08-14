import type { ComponentPropsWithoutRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "quiet";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-(--on-accent) shadow-(--cui-shadow-accent) hover:bg-(--accent-hover) active:bg-(--accent-pressed)",
  secondary:
    "border border-(--accent-border) bg-accent-soft text-(--accent-text) hover:bg-(--accent-soft-2)",
  ghost:
    "border border-(--border) bg-transparent text-(--text-muted) hover:bg-(--surface-2) hover:text-(--text)",
  quiet: "bg-transparent text-(--accent-text) hover:bg-accent-soft",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-[38px] px-(--space-4) text-[length:var(--cui-text-sm)]",
  md: "h-[46px] px-(--space-5) text-[length:var(--cui-text-base)]",
  lg: "h-[54px] px-(--space-8) text-[length:var(--cui-text-md)]",
};

// eslint-disable-next-line react-refresh/only-export-components -- class builder shared with non-<button> callers (e.g. Link), colocated by design
export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return [
    "inline-flex items-center justify-center gap-2 rounded-(--cui-radius-full) font-semibold whitespace-nowrap transition-colors",
    "duration-(--cui-dur) ease-(--cui-ease) disabled:pointer-events-none disabled:opacity-45",
    "focus-visible:outline-3 focus-visible:outline-(--accent-border) focus-visible:outline-offset-2",
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    className,
  ].join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}
