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
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        <PencilIcon />
      </Link>
      <button
        type="button"
        aria-label={deleteAriaLabel}
        disabled={isDeleting}
        onClick={onDelete}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
