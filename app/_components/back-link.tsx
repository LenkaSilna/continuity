export function BackLink({
  fallback,
  label,
}: {
  fallback: string;
  label: string;
}) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.history.length > 1) {
      e.preventDefault();
      window.history.back();
    }
  };

  return (
    <a
      href={fallback}
      onClick={handleClick}
      aria-label={label}
      className="-ml-3 mb-2 inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="h-5 w-5"
      >
        <path d="M3 11 12 3l9 8" />
        <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
      </svg>
    </a>
  );
}
