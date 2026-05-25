type LibraryChipProps = {
  label: string;
  onDelete: () => void;
  disabled?: boolean;
  deleteAriaLabel: string;
};

export function LibraryChip({
  label,
  onDelete,
  disabled,
  deleteAriaLabel,
}: LibraryChipProps) {
  return (
    <li className="inline-flex h-8 items-center gap-1 rounded-full border border-zinc-300 bg-white pl-3 pr-1 text-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span>{label}</span>
      <button
        type="button"
        aria-label={deleteAriaLabel}
        disabled={disabled}
        onClick={onDelete}
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm leading-none text-zinc-500 transition hover:bg-zinc-200 hover:text-zinc-900 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        ×
      </button>
    </li>
  );
}
