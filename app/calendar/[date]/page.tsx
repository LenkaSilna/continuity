import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getModuleFlags } from "@/lib/modules";
import { getLocale, getMessages } from "@/lib/i18n/server";
import type {
  CycleIntensity,
  Habit,
  ItemKind,
  Product,
  RoutineItem,
  Supplement,
  Tag,
  TimeOfDay,
} from "@/lib/types";
import { addDays, addMonths, parseISODate, toISODate } from "@/lib/calendar";
import { TopNav } from "../../_components/top-nav";
import { CalendarHeader } from "../_components/calendar-header";
import { MoodPicker } from "./_components/mood-picker";
import { PeriodPicker } from "./_components/period-picker";
import {
  RoutineChecklist,
  type ChecklistItem,
  type SlotItems,
} from "./_components/routine-checklist";
import { ObservationsPicker } from "./_components/observations-picker";
import { NotesEditor } from "./_components/notes-editor";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function CalendarDayPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  if (!ISO_DATE_RE.test(date)) notFound();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const flags = await getModuleFlags(supabase);

  const [
    { data: products },
    { data: supplements },
    { data: habits },
    { data: routineItems },
    { data: logs },
    { data: noteRow },
    { data: cycleRow },
    { data: allTags },
    { data: dailyTagRows },
  ] = await Promise.all([
    supabase.from("products").select("id, name").eq("is_active", true),
    supabase.from("supplements").select("id, name").eq("is_active", true),
    supabase.from("habits").select("id, name").eq("is_active", true),
    supabase
      .from("routine_items")
      .select("*")
      .is("archived_at", null)
      .order("position", { ascending: true }),
    supabase
      .from("daily_log")
      .select("*")
      .eq("log_date", date),
    supabase
      .from("daily_notes")
      .select("mood, notes")
      .eq("log_date", date)
      .maybeSingle<{ mood: number | null; notes: string | null }>(),
    supabase
      .from("cycle_log")
      .select("intensity")
      .eq("log_date", date)
      .maybeSingle<{ intensity: CycleIntensity }>(),
    supabase
      .from("tags")
      .select("*")
      .order("name", { ascending: true }),
    supabase.from("daily_tags").select("tag_id").eq("log_date", date),
  ]);

  const productMap = new Map(
    ((products ?? []) as Pick<Product, "id" | "name">[]).map((p) => [p.id, p.name]),
  );
  const supplementMap = new Map(
    ((supplements ?? []) as Pick<Supplement, "id" | "name">[]).map((s) => [s.id, s.name]),
  );
  const habitMap = new Map(
    ((habits ?? []) as Pick<Habit, "id" | "name">[]).map((h) => [h.id, h.name]),
  );

  const kindEnabled: Record<ItemKind, boolean> = {
    product: flags.module_products,
    supplement: flags.module_supplements,
    habit: flags.module_habits,
  };

  const slots: SlotItems = { morning: [], afternoon: [], evening: [] };
  for (const ri of (routineItems ?? []) as RoutineItem[]) {
    if (!kindEnabled[ri.item_kind]) continue;
    let name: string | undefined;
    let itemId: string | undefined;
    if (ri.item_kind === "product" && ri.product_id) {
      name = productMap.get(ri.product_id);
      itemId = ri.product_id;
    } else if (ri.item_kind === "supplement" && ri.supplement_id) {
      name = supplementMap.get(ri.supplement_id);
      itemId = ri.supplement_id;
    } else if (ri.item_kind === "habit" && ri.habit_id) {
      name = habitMap.get(ri.habit_id);
      itemId = ri.habit_id;
    }
    if (name && itemId) {
      const entry: ChecklistItem = { kind: ri.item_kind, itemId, name };
      slots[ri.time_of_day as TimeOfDay].push(entry);
    }
  }

  const logged = new Set<string>();
  for (const log of (logs ?? []) as {
    time_of_day: TimeOfDay;
    item_kind: ItemKind;
    product_id: string | null;
    supplement_id: string | null;
    habit_id: string | null;
  }[]) {
    const itemId =
      log.product_id ?? log.supplement_id ?? log.habit_id ?? "";
    if (!itemId) continue;
    logged.add(`${log.time_of_day}|${log.item_kind}|${itemId}`);
  }

  const assignedIds = new Set(
    ((dailyTagRows ?? []) as { tag_id: string }[]).map((r) => r.tag_id),
  );

  const t = await getMessages();
  const locale = await getLocale();

  const dt = parseISODate(date);
  const rawTitle = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dt);
  const title =
    rawTitle.charAt(0).toLocaleUpperCase(locale) + rawTitle.slice(1);

  const prevISO = toISODate(addDays(dt, -1));
  const nextISO = toISODate(addDays(dt, 1));
  const prevBigISO = toISODate(addMonths(dt, -1));
  const nextBigISO = toISODate(addMonths(dt, 1));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = toISODate(today);

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10">
        <header className="space-y-3">
          <Link
            href="/calendar"
            className="-ml-3 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.calendar.day.back}
          </Link>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <CalendarHeader
            view="day"
            date={date}
            title=""
            prevHref={`/calendar/${prevISO}`}
            nextHref={`/calendar/${nextISO}`}
            prevBigHref={`/calendar/${prevBigISO}`}
            nextBigHref={`/calendar/${nextBigISO}`}
            todayHref={`/calendar/${todayISO}`}
            labels={{
              prev: t.calendar.prev,
              next: t.calendar.next,
              prevBig: t.calendar.prevBig,
              nextBig: t.calendar.nextBig,
              today: t.calendar.today,
              views: t.calendar.views,
            }}
          />
        </header>

        {flags.module_journal && (
          <MoodPicker date={date} mood={noteRow?.mood ?? null} />
        )}
        {flags.module_cycle && (
          <PeriodPicker date={date} intensity={cycleRow?.intensity ?? null} />
        )}
        {flags.module_routine && (
          <RoutineChecklist date={date} slots={slots} logged={logged} />
        )}
        {flags.module_observations && (
          <ObservationsPicker
            date={date}
            allTags={(allTags ?? []) as Tag[]}
            assignedIds={assignedIds}
          />
        )}
        {flags.module_journal && (
          <NotesEditor date={date} initial={noteRow?.notes ?? ""} />
        )}
      </main>
    </>
  );
}
