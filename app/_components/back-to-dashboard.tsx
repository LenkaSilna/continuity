import Link from "next/link";
import { getMessages } from "@/lib/i18n/server";

export async function BackToDashboard() {
  const t = await getMessages();
  const label = t.common.backToDashboard;
  return (
    <Link
      href="/dashboard"
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
        className="h-5 w-5 sm:hidden"
      >
        <path d="M3 11 12 3l9 8" />
        <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
      </svg>
      <span className="hidden sm:inline">← {label}</span>
    </Link>
  );
}
