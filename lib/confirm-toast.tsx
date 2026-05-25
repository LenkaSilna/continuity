import { toast } from "sonner";

type ConfirmToastOptions = {
  message: string;
  detail?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void | Promise<void>;
};

export function confirmToast({
  message,
  detail,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmToastOptions): void {
  toast.custom(
    (id) => (
      <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm shadow-md dark:border-zinc-800 dark:bg-zinc-950">
        <div className="min-w-0">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{message}</p>
          {detail && (
            <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">{detail}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => toast.dismiss(id)}
            className="h-8 rounded-md bg-zinc-100 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(id);
              try {
                await onConfirm();
              } catch (error) {
                console.error("Confirm action failed:", error);
              }
            }}
            className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-medium text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity, position: "bottom-center" },
  );
}
