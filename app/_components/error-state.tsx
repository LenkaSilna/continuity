export function ErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-(--text-muted)">{message}</p>
    </main>
  );
}
