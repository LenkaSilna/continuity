type ToggleChipProps = {
  label: string;
  active: boolean;
  onClick: () => void;
  name?: string;
  value?: string;
};

export function ToggleChip({ label, active, onClick, name, value }: ToggleChipProps) {
  return (
    <button
      type="button"
      data-chip
      aria-pressed={active}
      onClick={onClick}
      className={[
        "inline-flex h-8 items-center rounded-full border px-3 text-sm transition-colors",
        active
          ? "border-[var(--accent)] bg-[var(--accent-soft)] text-zinc-900 dark:text-zinc-100"
          : "border-zinc-300 text-zinc-600 hover:border-zinc-500 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
