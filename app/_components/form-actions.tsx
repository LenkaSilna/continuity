export function FormActions({
  isPending,
  onCancel,
  saveLabel,
  savingLabel,
  cancelLabel,
}: {
  isPending: boolean;
  onCancel: () => void;
  saveLabel: string;
  savingLabel: string;
  cancelLabel: string;
}) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 flex-1 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending ? savingLabel : saveLabel}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 px-4 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
      >
        {cancelLabel}
      </button>
    </div>
  );
}
