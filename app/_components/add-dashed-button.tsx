import type { ReactNode } from "react";

export function AddDashedButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-md border-2 border-dashed border-(--border) px-4 py-3 text-sm font-medium text-(--text-muted) transition-colors hover:border-(--accent-border) hover:text-(--accent-text)"
    >
      {children}
    </button>
  );
}
