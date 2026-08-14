type ToggleChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export function ToggleChip({ label, active, onClick }: ToggleChipProps) {
  return (
    <button
      type="button"
      data-chip
      aria-pressed={active}
      onClick={onClick}
      className={[
        "inline-flex h-8 items-center rounded-(--cui-radius-full) border px-(--space-4)",
        "text-[length:var(--cui-text-sm)] font-medium transition-colors duration-(--cui-dur) ease-(--cui-ease)",
        active
          ? "border-transparent bg-accent text-(--on-accent)"
          : "border-(--border) text-(--text-muted) hover:border-(--accent-border) hover:text-(--text)",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
