import Link from "next/link";
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
}) {
  const navBtn =
    "inline-flex h-9 items-center rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-1.5">
        <Link aria-label={labels.prevBig} href={prevBigHref} className={navBtn}>
          «
        </Link>
        <Link aria-label={labels.prev} href={prevHref} className={navBtn}>
          ‹
        </Link>
        <h2 className="flex-1 text-center text-lg font-medium tracking-tight">
          {title}
        </h2>
        <Link aria-label={labels.next} href={nextHref} className={navBtn}>
          ›
        </Link>
        <Link aria-label={labels.nextBig} href={nextBigHref} className={navBtn}>
          »
        </Link>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Link href={todayHref} className={navBtn}>
          {labels.today}
        </Link>

        <form action={setCalendarView} className="flex gap-1">
          <input type="hidden" name="date" value={date} />
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              type="submit"
              name="view"
              value={v}
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
        </form>
      </div>
    </div>
  );
}
