// Streamed skeleton — shown instantly while the dashboard's data loads.
// No async work here, so it paints as soon as the layout + first paint resolve.

export default function DashboardLoading() {
  return (
    <>
      <header className="safe-top sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-zinc-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <span className="text-2xl font-semibold tracking-tight">
          Continuity
        </span>
        <div
          aria-hidden
          className="h-9 w-9 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
        />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-12">
        <div className="space-y-2">
          <div className="h-7 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-60 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="h-24 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />
        <div className="h-40 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />

        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))}
        </div>
      </main>
    </>
  );
}
