import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getLocale, getMessages } from "@/lib/i18n/server";
import type { CycleIntensity, ItemKind, Profile } from "@/lib/types";
import { PROMPT_TYPES } from "@/lib/ai-prompts";
import { toISODate } from "@/lib/calendar";
import { TopNav } from "../_components/top-nav";
import { PencilIcon } from "../_components/icons";

const intensityDot: Record<CycleIntensity, string> = {
  light: "bg-rose-300",
  medium: "bg-rose-500",
  heavy: "bg-rose-700",
};

function moodHue(mood: number): string {
  const hue = ((5 - mood) / 4) * 120;
  return `hsl(${hue}, 60%, 65%)`;
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const [{ data: profile, error }, t, locale] = await Promise.all([
    supabase.from("profile").select("*").maybeSingle<Profile>(),
    getMessages(),
    getLocale(),
  ]);
  const tableMissing = error?.code === "PGRST205" || error?.code === "42P01";

  if (!tableMissing && !error && !profile) {
    redirect("/profile");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  // Compact "Dnes" summary: mood, period intensity, routine X/Y.
  let todayMood: number | null = null;
  let todayPeriod: CycleIntensity | null = null;
  let routineTotal = 0;
  let routineDone = 0;

  if (profile) {
    const kindEnabled: Record<ItemKind, boolean> = {
      product: profile.module_products,
      supplement: profile.module_supplements,
      habit: profile.module_habits,
    };

    const [
      { data: routineItems },
      { data: logs },
      { data: noteRow },
      { data: cycleRow },
    ] = await Promise.all([
      profile.module_routine
        ? supabase
            .from("routine_items")
            .select("id, item_kind")
            .is("archived_at", null)
        : Promise.resolve({ data: [] }),
      profile.module_routine
        ? supabase
            .from("daily_log")
            .select("id, item_kind")
            .eq("log_date", todayISO)
        : Promise.resolve({ data: [] }),
      profile.module_journal
        ? supabase
            .from("daily_notes")
            .select("mood")
            .eq("log_date", todayISO)
            .maybeSingle<{ mood: number | null }>()
        : Promise.resolve({ data: null }),
      profile.module_cycle
        ? supabase
            .from("cycle_log")
            .select("intensity")
            .eq("log_date", todayISO)
            .maybeSingle<{ intensity: CycleIntensity }>()
        : Promise.resolve({ data: null }),
    ]);

    routineTotal = (
      (routineItems ?? []) as { item_kind: ItemKind }[]
    ).filter((r) => kindEnabled[r.item_kind]).length;
    routineDone = (
      (logs ?? []) as { item_kind: ItemKind }[]
    ).filter((r) => kindEnabled[r.item_kind]).length;

    todayMood = noteRow?.mood ?? null;
    todayPeriod = cycleRow?.intensity ?? null;
  }

  const todayTitle =
    profile &&
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(today);
  const todayTitleCapitalised =
    todayTitle &&
    todayTitle.charAt(0).toLocaleUpperCase(locale) + todayTitle.slice(1);

  const hasAnySummaryModule =
    profile &&
    (profile.module_journal ||
      profile.module_cycle ||
      profile.module_routine);

  return (
    <>
      <TopNav />
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
            {/* ── O mně ─────────────────────────────────────────── */}
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
                aria-label={t.common.edit}
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                <PencilIcon />
                <span className="hidden sm:inline">{t.common.edit}</span>
              </Link>
            </section>

            {/* ── Dnes — kompaktní karta s prokliknutím na den ──── */}
            {hasAnySummaryModule && (
              <Link
                href={`/calendar/${todayISO}`}
                className="block rounded-lg border border-zinc-200 p-5 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                      {t.today.title}
                    </h2>
                    <p className="text-lg font-medium">
                      {todayTitleCapitalised}
                    </p>
                  </div>
                  <span aria-hidden className="shrink-0 text-zinc-400">
                    →
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  {profile.module_journal && (
                    <div className="space-y-1">
                      <dt className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.calendar.day.mood.title}
                      </dt>
                      <dd className="flex items-center gap-2">
                        {todayMood != null ? (
                          <>
                            <span
                              aria-hidden
                              className="inline-block h-3 w-3 rounded-full border border-zinc-300 dark:border-zinc-700"
                              style={{ backgroundColor: moodHue(todayMood) }}
                            />
                            <span className="font-medium">
                              {todayMood}
                              <span className="text-xs text-zinc-500">/5</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </dd>
                    </div>
                  )}

                  {profile.module_cycle && (
                    <div className="space-y-1">
                      <dt className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.calendar.day.period.title}
                      </dt>
                      <dd className="flex items-center gap-2">
                        {todayPeriod ? (
                          <>
                            <span
                              aria-hidden
                              className={`inline-block h-3 w-3 rounded-full ${intensityDot[todayPeriod]}`}
                            />
                            <span className="font-medium">
                              {t.calendar.day.period[todayPeriod]}
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400">
                            {t.calendar.day.period.none}
                          </span>
                        )}
                      </dd>
                    </div>
                  )}

                  {profile.module_routine && (
                    <div className="space-y-1">
                      <dt className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.calendar.day.routine.title}
                      </dt>
                      <dd>
                        {routineTotal > 0 ? (
                          <span className="font-medium">
                            {routineDone}
                            <span className="text-xs text-zinc-500">
                              {" "}
                              / {routineTotal}
                            </span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </Link>
            )}

            {/* ── AI prompty ────────────────────────────────────── */}
            {profile.module_ai && (
              <section className="space-y-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.ai.dashboardTitle}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {t.ai.dashboardHint}
                  </p>
                </div>
                <ul className="space-y-2">
                  {PROMPT_TYPES.map((type) => (
                    <li key={type}>
                      <Link
                        href={`/ai/${type}`}
                        className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium">
                            {t.ai.types[type].title}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {t.ai.types[type].desc}
                          </p>
                        </div>
                        <span aria-hidden className="shrink-0 text-zinc-400">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : null}
      </main>
    </>
  );
}
