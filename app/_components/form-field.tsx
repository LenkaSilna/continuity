import type { ReactNode } from "react";

export const fieldInputCn =
  "w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2 text-(--text)";

export function FormField({
  label,
  hint,
  children,
}: {
  label: ReactNode;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium">{label}</span>
      {hint && <span className="block text-xs text-(--text-muted)">{hint}</span>}
      {children}
    </label>
  );
}
