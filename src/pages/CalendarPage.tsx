import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearch, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { getModuleFlags } from "@/lib/modules";
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
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { CalendarHeader } from "@/app/calendar/_components/calendar-header";
import { MonthView } from "@/app/calendar/_components/month-view";
import { WeekView } from "@/app/calendar/_components/week-view";
import type { CalendarView, CycleIntensity, Profile } from "@/lib/types";

export function CalendarPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { view: viewParam, date: dateParam } = useSearch({ from: "/_protected/calendar" });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  const focus = dateParam ? parseISODate(dateParam) : today;
  const focusISO = toISODate(focus);

  const { data: profileData } = useQuery({
    queryKey: ["profile-calendar-view"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile")
        .select("calendar_view")
        .maybeSingle<Pick<Profile, "calendar_view">>();
      return data as Pick<Profile, "calendar_view"> | null;
    },
  });

  const { data: flags } = useQuery({
    queryKey: ["module-flags"],
    queryFn: async () => getModuleFlags(supabase),
  });

  const view: CalendarView = isValidView(viewParam)
    ? viewParam
    : (profileData?.calendar_view ?? "month");

  if (view === "day") {
    navigate({ to: "/calendar/$date", params: { date: focusISO } });
    return null;
  }

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

  const { data: calData } = useQuery({
    queryKey: ["calendar-data", view, focusISO],
    enabled: !!flags,
    queryFn: async () => {
      const [logsRes, notesRes, cyclesRes] = await Promise.all([
        flags!.module_routine
          ? supabase.from("daily_log").select("log_date").gte("log_date", startISO).lte("log_date", endISO)
          : Promise.resolve({ data: [] }),
        flags!.module_journal
          ? supabase.from("daily_notes").select("log_date, mood").gte("log_date", startISO).lte("log_date", endISO)
          : Promise.resolve({ data: [] }),
        flags!.module_cycle
          ? supabase.from("cycle_log").select("log_date, intensity").gte("log_date", startISO).lte("log_date", endISO)
          : Promise.resolve({ data: [] }),
      ]);

      const hasLogByDate = new Set(
        (logsRes.data ?? []).map((r) => (r as { log_date: string }).log_date),
      );
      const moodByDate = new Map<string, number>();
      for (const n of notesRes.data ?? []) {
        const rec = n as { log_date: string; mood: number | null };
        if (rec.mood != null) moodByDate.set(rec.log_date, rec.mood);
      }
      const intensityByDate = new Map<string, CycleIntensity>();
      for (const c of cyclesRes.data ?? []) {
        const rec = c as { log_date: string; intensity: CycleIntensity };
        intensityByDate.set(rec.log_date, rec.intensity);
      }
      return { hasLogByDate, moodByDate, intensityByDate };
    },
  });

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
  const prevBigISO = toISODate(
    view === "month" ? startOfMonth(addMonths(focus, -12)) : addMonths(focus, -1),
  );
  const nextBigISO = toISODate(
    view === "month" ? startOfMonth(addMonths(focus, 12)) : addMonths(focus, 1),
  );

  const hrefFor = (d: string) => `/calendar?view=${view}&date=${d}`;

  void locale;

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-2">
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">{t.calendar.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.calendar.subtitle}</p>
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
          onViewChange={(v) => {
            queryClient.invalidateQueries({ queryKey: ["profile-calendar-view"] });
            navigate({ to: "/calendar", search: { view: v, date: focusISO } });
          }}
        />

        {calData && view === "month" && (
          <MonthView
            focus={focus}
            today={today}
            moodByDate={calData.moodByDate}
            intensityByDate={calData.intensityByDate}
            hasLogByDate={calData.hasLogByDate}
            weekdaysShort={t.calendar.weekdaysShort}
          />
        )}

        {calData && view === "week" && (
          <WeekView
            focus={focus}
            today={today}
            moodByDate={calData.moodByDate}
            intensityByDate={calData.intensityByDate}
            hasLogByDate={calData.hasLogByDate}
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
