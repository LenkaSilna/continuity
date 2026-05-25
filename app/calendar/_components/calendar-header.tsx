import { Link } from "@tanstack/react-router";
import type { CalendarView } from "@/lib/types";
import { setCalendarView } from "../_actions";

export function CalendarHeader({
  view,
  date,
  title,
  prevHref,
  nextHref,
  prevBigHref,
  nextBigHref,
  todayHref,
  labels,
  onViewChange,
}: {
  view: CalendarView;
  date: string;
  title: string;
  prevHref: string;
  nextHref: string;
  prevBigHref: string;
  nextBigHref: string;
  todayHref: string;
  labels: {
    prev: string;
    next: string;
    prevBig: string;
    nextBig: string;
    today: string;
    views: { month: string; week: string; day: string };
  };
  onViewChange?: (view: CalendarView) => void;
}) {
  const navBtn =
    "inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-1.5">
        <Link aria-label={labels.prevBig} to={prevBigHref} className={navBtn}>
          «
        </Link>
        <Link aria-label={labels.prev} to={prevHref} className={navBtn}>
          ‹
        </Link>
        <h2 className="flex-1 text-center text-lg font-medium tracking-tight">
          {title}
        </h2>
        <Link aria-label={labels.next} to={nextHref} className={navBtn}>
          ›
        </Link>
        <Link aria-label={labels.nextBig} to={nextBigHref} className={navBtn}>
          »
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link to={todayHref} className={navBtn}>
          {labels.today}
        </Link>

        {onViewChange && (
          <div className="flex gap-1">
            {(["month", "week", "day"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setCalendarView(v, date);
                  onViewChange(v);
                }}
                className={[
                  "rounded-md px-3 py-1.5 text-sm transition",
                  view === v
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900",
                ].join(" ")}
              >
                {labels.views[v]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
