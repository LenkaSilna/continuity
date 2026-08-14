import { Button } from "./button";

export function EditFormActions({
  isPending,
  isDeleting,
  onDelete,
  saveLabel,
  savingLabel,
  deletingLabel,
  deleteLabel,
}: {
  isPending: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  saveLabel: string;
  savingLabel: string;
  deletingLabel: string;
  deleteLabel: string;
}) {
  return (
    <div className="safe-bottom sticky bottom-0 -mx-4 flex items-center gap-2 border-t border-(--border) bg-background/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <Button type="submit" disabled={isPending} className="flex-1">
        {isPending ? savingLabel : saveLabel}
      </Button>
      <button
        type="button"
        disabled={isDeleting}
        onClick={onDelete}
        className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-red-200 px-4 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
      >
        {isDeleting ? deletingLabel : deleteLabel}
      </button>
    </div>
  );
}
