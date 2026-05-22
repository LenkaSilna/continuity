type Props = {
  rows?: number;
  tall?: boolean;
};

export function PageSkeleton({ rows = 4, tall = false }: Props) {
  return (
    <>
      <header className="safe-top sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/80 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950/80">
        <span className="text-2xl font-semibold tracking-tight">Continuity</span>
        <div
          aria-hidden
          className="h-9 w-9 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
        />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="h-7 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={[
                "animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900",
                tall ? "h-32" : "h-16",
              ].join(" ")}
            />
          ))}
        </div>
      </main>
    </>
  );
}
