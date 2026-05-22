"use client";

import { toast } from "sonner";
import { showSuccess } from "./toast";

type ConfirmToastOptions = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  successMessage?: string;
};

export function confirmToast({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  successMessage,
}: ConfirmToastOptions): void {
  const id = toast(message, {
    duration: 8000,
    position: "bottom-center",
    action: {
      label: confirmLabel,
      onClick: () => {
        toast.dismiss(id);
        onConfirm();
        if (successMessage) showSuccess(successMessage);
      },
    },
    cancel: {
      label: cancelLabel,
      onClick: () => toast.dismiss(id),
    },
  });
}
