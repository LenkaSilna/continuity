import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Profile } from "@/lib/types";
import { TopNav } from "../_components/top-nav";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .maybeSingle<Profile>();

  const t = await getMessages();
  const tableMissing = error?.code === "PGRST205" || error?.code === "42P01";

  if (!tableMissing && !error && !profile) {
    redirect("/profile");
  }

  const signOutButton = (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        aria-label={t.common.signOut}
        title={t.common.signOut}
        className="grid h-9 w-9 place-items-center rounded-md border border-zinc-300 text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </form>
  );

  return (
    <>
      <TopNav rightSlot={signOutButton} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-12">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.common.signedInAs} <strong>{user.email}</strong>
          </p>
        </header>

        {tableMissing ? (
          <section className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              {t.dbError.notInitialised}
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              {t.dbError.runMigration}{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">
                supabase/migrations/0001_initial_schema.sql
              </code>{" "}
              {t.dbError.andReload}
            </p>
          </section>
        ) : error ? (
          <section className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {t.dbError.generic} {error.message}
          </section>
        ) : profile ? (
          <>
            <section className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="min-w-0 space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.dashboard.aboutMe}
                </h2>
                <p className="truncate text-lg font-medium">
                  {profile.name || (
                    <span className="text-zinc-400">{t.dashboard.empty}</span>
                  )}
                </p>
              </div>
              <Link
                href="/profile"
                className="inline-flex h-9 shrink-0 items-center rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                {t.common.edit}
              </Link>
            </section>

            <section className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t.dashboard.roadmap}
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                <li>✓ {t.dashboard.sections.profileDone}</li>
                <li>
                  →{" "}
                  <Link
                    href="/library/products"
                    className="-mx-1 inline-flex min-h-[32px] items-center rounded px-1 underline underline-offset-2 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    {t.dashboard.sections.products}
                  </Link>
                </li>
                <li>
                  →{" "}
                  <Link
                    href="/library/supplements"
                    className="-mx-1 inline-flex min-h-[32px] items-center rounded px-1 underline underline-offset-2 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    {t.dashboard.sections.supplements}
                  </Link>
                </li>
                <li>
                  →{" "}
                  <Link
                    href="/library/habits"
                    className="-mx-1 inline-flex min-h-[32px] items-center rounded px-1 underline underline-offset-2 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    {t.dashboard.sections.habits}
                  </Link>
                </li>
                <li>
                  →{" "}
                  <Link
                    href="/routine"
                    className="-mx-1 inline-flex min-h-[32px] items-center rounded px-1 underline underline-offset-2 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
                  >
                    {t.dashboard.sections.routine}
                  </Link>
                </li>
                <li>○ {t.dashboard.sections.calendar}</li>
                <li>○ {t.dashboard.sections.ai}</li>
              </ul>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
