import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { PROMPT_TYPES } from "@/lib/ai-prompts";
import { toISODate } from "@/lib/calendar";
import { TopNav } from "@/app/_components/top-nav";
import { PencilIcon } from "@/app/_components/icons";
import type { CycleIntensity, ItemKind, Profile } from "@/lib/types";

const intensityDot: Record<CycleIntensity, string> = {
  light: "bg-rose-300",
  medium: "bg-rose-500",
  heavy: "bg-rose-700",
};

function moodHue(mood: number): string {
  const hue = ((5 - mood) / 4) * 120;
  return `hsl(${hue}, 60%, 65%)`;
}

export function DashboardPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const r = await supabase.auth.getUser();
      return r.data.user as import("@supabase/supabase-js").User | null;
    },
  });

  const { data: profile, error: profileError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profile").select("*").maybeSingle<Profile>();
      if (error) throw error;
      return data as Profile | null;
    },
  });

  // Redirect to /profile if no profile yet
  if (profile === null && !profileError) {
    navigate({ to: "/profile" });
  }

  const p = profile;
  const tableMissing =
    (profileError as any)?.code === "PGRST205" || (profileError as any)?.code === "42P01";

  const kindEnabled: Record<ItemKind, boolean> = p
    ? { product: p.module_products, supplement: p.module_supplements, habit: p.module_habits }
    : { product: true, supplement: true, habit: true };

  const { data: todayStats } = useQuery({
    queryKey: ["today-stats", todayISO],
    enabled: !!p,
    queryFn: async () => {
      const [routineItems, logs, noteRow, cycleRow] = await Promise.all([
        p!.module_routine
          ? supabase.from("routine_items").select("id, item_kind").is("archived_at", null)
          : Promise.resolve({ data: [] }),
        p!.module_routine
          ? supabase.from("daily_log").select("id, item_kind").eq("log_date", todayISO)
          : Promise.resolve({ data: [] }),
        p!.module_journal
          ? supabase.from("daily_notes").select("mood").eq("log_date", todayISO).maybeSingle<{ mood: number | null }>()
          : Promise.resolve({ data: null }),
        p!.module_cycle
          ? supabase.from("cycle_log").select("intensity").eq("log_date", todayISO).maybeSingle<{ intensity: CycleIntensity }>()
          : Promise.resolve({ data: null }),
      ]);

      const routineTotal = ((routineItems.data ?? []) as { item_kind: ItemKind }[]).filter(
        (r) => kindEnabled[r.item_kind],
      ).length;
      const routineDone = ((logs.data ?? []) as { item_kind: ItemKind }[]).filter(
        (r) => kindEnabled[r.item_kind],
      ).length;

      return {
        routineTotal,
        routineDone,
        todayMood: noteRow.data?.mood ?? null,
        todayPeriod: cycleRow.data?.intensity ?? null,
      };
    },
  });

  const todayTitle =
    p &&
    new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(today);
  const todayTitleCapitalised =
    todayTitle && todayTitle.charAt(0).toLocaleUpperCase(locale) + todayTitle.slice(1);

  const hasAnySummaryModule =
    p && (p.module_journal || p.module_cycle || p.module_routine);

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-12">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t.dashboard.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.common.signedInAs} <strong>{user?.email}</strong>
          </p>
        </header>

        {tableMissing ? (
          <section className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="font-medium text-amber-900 dark:text-amber-200">{t.dbError.notInitialised}</p>
            <p className="text-amber-800 dark:text-amber-300">
              {t.dbError.runMigration}{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">
                supabase/migrations/0001_initial_schema.sql
              </code>{" "}
              {t.dbError.andReload}
            </p>
          </section>
        ) : profileError ? (
          <section className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {t.dbError.generic} {(profileError as any)?.message}
          </section>
        ) : p ? (
          <>
            <section className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="min-w-0 space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.dashboard.aboutMe}
                </h2>
                <p className="truncate text-lg font-medium">
                  {p.name || <span className="text-zinc-400">{t.dashboard.empty}</span>}
                </p>
              </div>
              <Link
                to="/profile"
                aria-label={t.common.edit}
                className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                <PencilIcon />
                <span className="hidden sm:inline">{t.common.edit}</span>
              </Link>
            </section>

            {hasAnySummaryModule && todayStats && (
              <Link
                to="/calendar/$date"
                params={{ date: todayISO }}
                className="block rounded-lg border border-zinc-200 p-5 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                      {t.today.title}
                    </h2>
                    <p className="text-lg font-medium">{todayTitleCapitalised}</p>
                  </div>
                  <span aria-hidden className="shrink-0 text-zinc-400">→</span>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  {p.module_journal && (
                    <div className="space-y-1">
                      <dt className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.calendar.day.mood.title}
                      </dt>
                      <dd className="flex items-center gap-2">
                        {todayStats.todayMood != null ? (
                          <>
                            <span
                              aria-hidden
                              className="inline-block h-3 w-3 rounded-full border border-zinc-300 dark:border-zinc-700"
                              style={{ backgroundColor: moodHue(todayStats.todayMood) }}
                            />
                            <span className="font-medium">
                              {todayStats.todayMood}
                              <span className="text-xs text-zinc-500">/5</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </dd>
                    </div>
                  )}
                  {p.module_cycle && (
                    <div className="space-y-1">
                      <dt className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.calendar.day.period.title}
                      </dt>
                      <dd className="flex items-center gap-2">
                        {todayStats.todayPeriod ? (
                          <>
                            <span
                              aria-hidden
                              className={`inline-block h-3 w-3 rounded-full ${intensityDot[todayStats.todayPeriod]}`}
                            />
                            <span className="font-medium">
                              {t.calendar.day.period[todayStats.todayPeriod]}
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400">{t.calendar.day.period.none}</span>
                        )}
                      </dd>
                    </div>
                  )}
                  {p.module_routine && (
                    <div className="space-y-1">
                      <dt className="text-xs uppercase tracking-wide text-zinc-500">
                        {t.calendar.day.routine.title}
                      </dt>
                      <dd>
                        {todayStats.routineTotal > 0 ? (
                          <span className="font-medium">
                            {todayStats.routineDone}
                            <span className="text-xs text-zinc-500"> / {todayStats.routineTotal}</span>
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

            {p.module_ai && (
              <section className="space-y-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                    {t.ai.dashboardTitle}
                  </h2>
                  <p className="text-xs text-zinc-500">{t.ai.dashboardHint}</p>
                </div>
                <ul className="space-y-2">
                  {PROMPT_TYPES.map((type) => (
                    <li key={type}>
                      <Link
                        to="/ai/$type"
                        params={{ type }}
                        className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-sm font-medium">{t.ai.types[type].title}</p>
                          <p className="text-xs text-zinc-500">{t.ai.types[type].desc}</p>
                        </div>
                        <span aria-hidden className="shrink-0 text-zinc-400">→</span>
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
