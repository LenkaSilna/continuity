"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import type { ModuleFlags } from "@/lib/types";

// Returns false during SSR, true on the client. Avoids the
// useEffect/setState mount pattern that the lint rule flags.
const noop = () => () => {};
function useIsClient(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function NavDrawer({ flags }: { flags: ModuleFlags }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const mounted = useIsClient();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Prevent body scroll while drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => setOpen(false);

  const sectionClass =
    "px-3 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500";

  const linkClass =
    "flex min-h-[44px] items-center rounded-md px-3 text-sm text-zinc-900 transition hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-900";

  const drawerNode = (
    <>
      <div
        onClick={close}
        aria-hidden
        className={[
          "fixed inset-0 z-[100] bg-black/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t.menu.open}
        className={[
          "safe-top safe-bottom fixed right-0 top-0 z-[101] flex h-full w-72 max-w-[85vw] flex-col border-l border-zinc-200 bg-white text-zinc-900 shadow-xl transition-transform will-change-transform dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-lg font-semibold tracking-tight">
            {t.common.appName}
          </span>
          <button
            type="button"
            aria-label={t.menu.close}
            onClick={close}
            className="grid h-9 w-9 place-items-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-4 w-4"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col overflow-y-auto px-1 pb-2">
          <div className={sectionClass}>{t.menu.sections.main}</div>
          <Link href="/dashboard" onClick={close} className={linkClass}>
            {t.menu.home}
          </Link>
          <Link href="/calendar" onClick={close} className={linkClass}>
            {t.calendar.title}
          </Link>
          {flags.module_routine && (
            <Link href="/routine" onClick={close} className={linkClass}>
              {t.routine.title}
            </Link>
          )}
          {flags.module_ai && (
            <Link href="/ai" onClick={close} className={linkClass}>
              {t.ai.title}
            </Link>
          )}

          {(flags.module_products ||
            flags.module_supplements ||
            flags.module_habits ||
            flags.module_observations) && (
            <div className={sectionClass}>{t.menu.sections.library}</div>
          )}
          {flags.module_products && (
            <Link
              href="/library/products"
              onClick={close}
              className={linkClass}
            >
              {t.library.products.title}
            </Link>
          )}
          {flags.module_supplements && (
            <Link
              href="/library/supplements"
              onClick={close}
              className={linkClass}
            >
              {t.library.supplements.title}
            </Link>
          )}
          {flags.module_habits && (
            <Link href="/library/habits" onClick={close} className={linkClass}>
              {t.library.habits.title}
            </Link>
          )}
          {flags.module_observations && (
            <Link
              href="/library/observations"
              onClick={close}
              className={linkClass}
            >
              {t.library.observations.title}
            </Link>
          )}

          <div className={sectionClass}>{t.menu.sections.account}</div>
          <Link href="/profile" onClick={close} className={linkClass}>
            {t.profile.title}
          </Link>
          <Link href="/settings" onClick={close} className={linkClass}>
            {t.settings.title}
          </Link>

          <form action="/auth/signout" method="post" className="mt-2 px-3">
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-zinc-300 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              {t.common.signOut}
            </button>
          </form>
        </nav>
      </aside>
    </>
  );

  return (
    <>
      <button
        type="button"
        aria-label={t.menu.open}
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="h-4 w-4"
        >
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
      {mounted ? createPortal(drawerNode, document.body) : null}
    </>
  );
}
