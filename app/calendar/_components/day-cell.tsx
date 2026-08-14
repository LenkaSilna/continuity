import { Link } from "@tanstack/react-router";
import type { CycleIntensity } from "@/lib/types";
import { moodColor } from "@/lib/calendar";

const intensityClass: Record<CycleIntensity, string> = {
  light: "bg-rose-300 dark:bg-rose-400/70",
  medium: "bg-rose-500 dark:bg-rose-500",
  heavy: "bg-rose-700 dark:bg-rose-300",
};

export function DayCell({
  date,
  iso,
  mood,
  period,
  hasLog,
  isToday,
  muted,
  size = "month",
}: {
  date: Date;
  iso: string;
  mood: number | null;
  period: CycleIntensity | null;
  hasLog: boolean;
  isToday: boolean;
  muted: boolean;
  size?: "month" | "week";
}) {
  const bg = moodColor(mood);
  // Mood pastel is mid-light → force dark text for readability in both themes.
  const textOverride = bg ? "text-black" : "";

  return (
    <Link
      to="/calendar/$date"
      params={{ date: iso }}
      aria-label={iso}
      className={[
        "relative flex flex-col rounded-md border text-xs transition",
        size === "month" ? "min-h-[56px] p-1.5" : "min-h-[112px] p-2",
        muted
          ? "border-(--border) text-(--text-soft)"
          : "border-(--border) hover:border-(--accent-border)",
        isToday ? "ring-2 ring-accent" : "",
        textOverride,
      ].join(" ")}
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <span className={muted ? "" : "font-medium"}>{date.getDate()}</span>

      <div className="mt-auto flex items-center justify-between gap-1">
        {period ? (
          <span
            aria-hidden
            className={`h-2 w-2 rounded-full ${intensityClass[period]}`}
          />
        ) : (
          <span aria-hidden />
        )}
        {hasLog ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="h-3 w-3 text-emerald-700 dark:text-emerald-300"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <span aria-hidden />
        )}
      </div>
    </Link>
  );
}
