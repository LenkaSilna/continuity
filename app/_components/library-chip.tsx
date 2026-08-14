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
    <li className="inline-flex h-8 items-center gap-1 rounded-(--cui-radius-full) border border-(--border) bg-(--surface) pl-3 pr-1 text-sm text-(--text)">
      <span>{label}</span>
      <button
        type="button"
        aria-label={deleteAriaLabel}
        disabled={disabled}
        onClick={onDelete}
        className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-sm leading-none text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text) disabled:opacity-50"
      >
        ×
      </button>
    </li>
  );
}
