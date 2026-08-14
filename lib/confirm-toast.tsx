import { toast } from "sonner";
import { Button } from "@/app/_components/button";

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
      <div className="flex w-full items-center justify-between gap-4 rounded-(--cui-radius-xl) border border-(--border) bg-(--surface) px-4 py-3 text-sm shadow-(--cui-shadow-md)">
        <div className="min-w-0">
          <p className="font-medium text-(--text)">{message}</p>
          {detail && (
            <p className="mt-0.5 truncate text-xs text-(--text-muted)">{detail}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => toast.dismiss(id)}>
            {cancelLabel}
          </Button>
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
            className="h-9.5 rounded-(--cui-radius-full) bg-red-600 px-4 text-xs font-semibold text-white transition-colors hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    { duration: Infinity, position: "bottom-center" },
  );
}
