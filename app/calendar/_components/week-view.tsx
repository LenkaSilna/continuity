import type { CycleIntensity } from "@/lib/types";
import { isSameDay, toISODate, weekDays } from "@/lib/calendar";
import { DayCell } from "./day-cell";

export function WeekView({
  focus,
  today,
  moodByDate,
  intensityByDate,
  hasLogByDate,
  weekdaysShort,
}: {
  focus: Date;
  today: Date;
  moodByDate: Map<string, number>;
  intensityByDate: Map<string, CycleIntensity>;
  hasLogByDate: Set<string>;
  weekdaysShort: readonly string[];
}) {
  const days = weekDays(focus);

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500">
        {weekdaysShort.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const iso = toISODate(d);
          return (
            <DayCell
              key={iso}
              date={d}
              iso={iso}
              mood={moodByDate.get(iso) ?? null}
              period={intensityByDate.get(iso) ?? null}
              hasLog={hasLogByDate.has(iso)}
              isToday={isSameDay(d, today)}
              muted={false}
              size="week"
            />
          );
        })}
      </div>
    </div>
  );
}
