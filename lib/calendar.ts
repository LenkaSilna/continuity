import type { CalendarView } from "./types";

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

// Monday-first weekday: Monday=0 … Sunday=6
export function weekdayMondayFirst(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -weekdayMondayFirst(date));
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// 6 × 7 grid of dates: from Monday on/before the 1st of `date`'s month
// to Sunday on/after the last day.
export function monthGridDays(date: Date): Date[] {
  const start = startOfWeek(startOfMonth(date));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

export function weekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function isValidView(v: string | undefined): v is CalendarView {
  return v === "month" || v === "week" || v === "day";
}

// Mood 1–5 → mid-saturation pastel that reads in light + dark themes.
// 1 = green (good), 5 = red (bad).
export function moodColor(mood: number | null | undefined): string | null {
  if (mood == null) return null;
  const clamped = Math.max(1, Math.min(5, mood));
  const hue = ((5 - clamped) / 4) * 120; // 120 = green at 1, 0 = red at 5
  return `hsl(${hue}, 60%, 65%)`;
}
