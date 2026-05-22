import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getModuleFlagsCached } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import type { CalendarView, CycleIntensity, Profile } from "@/lib/types";
import {
  addDays,
  addMonths,
  isValidView,
  monthGridDays,
  parseISODate,
  startOfMonth,
  startOfWeek,
  toISODate,
  weekDays,
} from "@/lib/calendar";
import { TopNav } from "../_components/top-nav";
import { BackToDashboard } from "../_components/back-to-dashboard";
import { CalendarHeader } from "./_components/calendar-header";
import { MonthView } from "./_components/month-view";
import { WeekView } from "./_components/week-view";

type SearchParams = Promise<{ view?: string; date?: string }>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { view: viewParam, date: dateParam } = await searchParams;

  const [t, profileRes, flags] = await Promise.all([
    getMessages(),
    supabase
      .from("profile")
      .select("calendar_view")
      .maybeSingle<Pick<Profile, "calendar_view">>(),
    getModuleFlagsCached(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const focus = dateParam ? parseISODate(dateParam) : today;
  const focusISO = toISODate(focus);

  const view: CalendarView = isValidView(viewParam)
    ? viewParam
    : (profileRes.data?.calendar_view ?? "month");

  if (view === "day") {
    redirect(`/calendar/${focusISO}`);
  }

  // Visible date range.
  const range =
    view === "month"
      ? (() => {
          const grid = monthGridDays(focus);
          return { start: grid[0], end: grid[grid.length - 1] };
        })()
      : (() => {
          const wk = weekDays(focus);
          return { start: wk[0], end: wk[wk.length - 1] };
        })();

  const startISO = toISODate(range.start);
  const endISO = toISODate(range.end);

  const [logsRes, notesRes, cyclesRes] = await Promise.all([
    flags.module_routine
      ? supabase
          .from("daily_log")
          .select("log_date")
          .gte("log_date", startISO)
          .lte("log_date", endISO)
      : Promise.resolve({ data: [] }),
    flags.module_journal
      ? supabase
          .from("daily_notes")
          .select("log_date, mood")
          .gte("log_date", startISO)
          .lte("log_date", endISO)
      : Promise.resolve({ data: [] }),
    flags.module_cycle
      ? supabase
          .from("cycle_log")
          .select("log_date, intensity")
          .gte("log_date", startISO)
          .lte("log_date", endISO)
      : Promise.resolve({ data: [] }),
  ]);

  const hasLogByDate = new Set(
    (logsRes.data ?? []).map((r) => r.log_date as string),
  );
  const moodByDate = new Map<string, number>();
  for (const n of notesRes.data ?? []) {
    const d = n.log_date as string;
    const m = n.mood as number | null;
    if (m != null) moodByDate.set(d, m);
  }
  const intensityByDate = new Map<string, CycleIntensity>();
  for (const c of cyclesRes.data ?? []) {
    intensityByDate.set(
      c.log_date as string,
      c.intensity as CycleIntensity,
    );
  }

  // Title + nav hrefs
  const title =
    view === "month"
      ? `${t.calendar.months[focus.getMonth()]} ${focus.getFullYear()}`
      : (() => {
          const wkStart = startOfWeek(focus);
          const wkEnd = addDays(wkStart, 6);
          if (wkStart.getMonth() === wkEnd.getMonth()) {
            return `${wkStart.getDate()}.–${wkEnd.getDate()}. ${t.calendar.months[wkStart.getMonth()]} ${wkStart.getFullYear()}`;
          }
          return `${wkStart.getDate()}. ${t.calendar.months[wkStart.getMonth()]} – ${wkEnd.getDate()}. ${t.calendar.months[wkEnd.getMonth()]} ${wkEnd.getFullYear()}`;
        })();

  const prevISO = toISODate(
    view === "month" ? startOfMonth(addMonths(focus, -1)) : addDays(focus, -7),
  );
  const nextISO = toISODate(
    view === "month" ? startOfMonth(addMonths(focus, 1)) : addDays(focus, 7),
  );
  // Big skip: ±1 year for month view, ±1 month for week view.
  const prevBigISO = toISODate(
    view === "month"
      ? startOfMonth(addMonths(focus, -12))
      : addMonths(focus, -1),
  );
  const nextBigISO = toISODate(
    view === "month"
      ? startOfMonth(addMonths(focus, 12))
      : addMonths(focus, 1),
  );

  const hrefFor = (d: string) => `/calendar?view=${view}&date=${d}`;

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-2">
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.calendar.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.calendar.subtitle}
          </p>
        </header>

        <CalendarHeader
          view={view}
          date={focusISO}
          title={title}
          prevHref={hrefFor(prevISO)}
          nextHref={hrefFor(nextISO)}
          prevBigHref={hrefFor(prevBigISO)}
          nextBigHref={hrefFor(nextBigISO)}
          todayHref={hrefFor(todayISO)}
          labels={{
            prev: t.calendar.prev,
            next: t.calendar.next,
            prevBig: t.calendar.prevBig,
            nextBig: t.calendar.nextBig,
            today: t.calendar.today,
            views: t.calendar.views,
          }}
        />

        {view === "month" ? (
          <MonthView
            focus={focus}
            today={today}
            moodByDate={moodByDate}
            intensityByDate={intensityByDate}
            hasLogByDate={hasLogByDate}
            weekdaysShort={t.calendar.weekdaysShort}
          />
        ) : (
          <WeekView
            focus={focus}
            today={today}
            moodByDate={moodByDate}
            intensityByDate={intensityByDate}
            hasLogByDate={hasLogByDate}
            weekdaysShort={t.calendar.weekdaysShort}
          />
        )}

        <section className="space-y-1 text-xs text-zinc-500">
          <p>● {t.calendar.cellLegend.mood}</p>
          <p>● {t.calendar.cellLegend.period}</p>
          <p>✓ {t.calendar.cellLegend.log}</p>
        </section>
      </main>
    </>
  );
}
