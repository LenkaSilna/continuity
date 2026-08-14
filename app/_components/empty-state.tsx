export function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-dashed border-(--border) p-6 text-center text-sm text-(--text-muted)">
      {message}
    </p>
  );
}
