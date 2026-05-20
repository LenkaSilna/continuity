export default function CalendarLoading() {
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

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-7 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </main>
    </>
  );
}
