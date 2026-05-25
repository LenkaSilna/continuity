export function ErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-zinc-500">{message}</p>
    </main>
  );
}
