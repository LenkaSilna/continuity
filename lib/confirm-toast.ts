"use client";

import { toast } from "sonner";

type ConfirmToastOptions = {
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
};

export function confirmToast({
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}: ConfirmToastOptions): void {
  const id = toast(message, {
    duration: 8000,
    action: {
      label: confirmLabel,
      onClick: () => onConfirm(),
    },
    cancel: {
      label: cancelLabel,
      onClick: () => toast.dismiss(id),
    },
  });
}
