type Props = {
  rows?: number;
  tall?: boolean;
};

export function PageSkeleton({ rows = 4, tall = false }: Props) {
  return (
    <>
      <header className="safe-top sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-(--border) bg-background/80 px-4 py-2">
        <span className="font-display text-2xl font-semibold tracking-tight text-(--text)">Continuity</span>
        <div
          aria-hidden
          className="h-9 w-9 animate-pulse rounded-md bg-(--surface-2)"
        />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <div className="h-7 w-36 animate-pulse rounded bg-(--surface-2)" />
        <div className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className={[
                "animate-pulse rounded-(--cui-radius-xl) border border-(--border) bg-(--surface-2)",
                tall ? "h-32" : "h-16",
              ].join(" ")}
            />
          ))}
        </div>
      </main>
    </>
  );
}
