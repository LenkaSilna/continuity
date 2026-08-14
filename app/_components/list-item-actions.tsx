import { Link } from "@tanstack/react-router";
import { PencilIcon, TrashIcon } from "./icons";

export function ListItemActions({
  editHref,
  editAriaLabel,
  onDelete,
  deleteAriaLabel,
  isDeleting,
}: {
  editHref: string;
  editAriaLabel: string;
  onDelete: () => void;
  deleteAriaLabel: string;
  isDeleting: boolean;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Link
        to={editHref}
        aria-label={editAriaLabel}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-(--border) text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
      >
        <PencilIcon />
      </Link>
      <button
        type="button"
        aria-label={deleteAriaLabel}
        disabled={isDeleting}
        onClick={onDelete}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-(--border) text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text) disabled:opacity-50"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
