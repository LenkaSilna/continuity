import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkinType } from "./skin-types";
import type {
  CycleIntensity,
  DataBlock,
  Gender,
  Lifestyle,
  Profile,
  TimeOfDay,
} from "./types";
import type { Locale } from "./i18n/messages";

export type PromptType =
  | "skincare"
  | "supplements"
  | "correlation"
  | "weekly";

export const PROMPT_TYPES: readonly PromptType[] = [
  "skincare",
  "supplements",
  "correlation",
  "weekly",
] as const;

export function isPromptType(v: string): v is PromptType {
  return (PROMPT_TYPES as readonly string[]).includes(v);
}

// ─── helpers ────────────────────────────────────────────────────

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return toISO(d);
}

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function joinLines(lines: (string | null | undefined | false)[]): string {
  return lines.filter(Boolean).join("\n");
}

// ─── localised label dictionaries ───────────────────────────────

const GENDER_LABEL: Record<Locale, Record<Gender, string>> = {
  cs: { female: "žena", male: "muž", "prefer-not-to-say": "raději neuvádí" },
  en: { female: "female", male: "male", "prefer-not-to-say": "prefer not to say" },
};

const LIFESTYLE_LABEL: Record<Locale, Record<Lifestyle, string>> = {
  cs: { sedentary: "sedavý", light: "převážně sedavý", active: "aktivní", very_active: "velmi aktivní" },
  en: { sedentary: "sedentary", light: "lightly active", active: "active", very_active: "very active" },
};

const SLOT_LABEL: Record<Locale, Record<TimeOfDay, string>> = {
  cs: { morning: "ráno", afternoon: "odpoledne", evening: "večer" },
  en: { morning: "morning", afternoon: "afternoon", evening: "evening" },
};

const INTENSITY_LABEL: Record<Locale, Record<CycleIntensity, string>> = {
  cs: { light: "slabá", medium: "střední", heavy: "silná" },
  en: { light: "light", medium: "medium", heavy: "heavy" },
};

const SKIN_TYPE_LABEL: Record<Locale, Record<SkinType, string>> = {
  cs: {
    dry: "suchá", oily: "mastná", combination: "smíšená", normal: "normální",
    sensitive: "citlivá", dehydrated: "dehydrovaná", mature: "zralá", "acne-prone": "náchylná k akné",
  },
  en: {
    dry: "dry", oily: "oily", combination: "combination", normal: "normal",
    sensitive: "sensitive", dehydrated: "dehydrated", mature: "mature", "acne-prone": "acne-prone",
  },
};

// ─── localised string table ──────────────────────────────────────

type PromptStrings = {
  // profile
  profileSection: string;
  profileEmpty: string;
  labelName: string;
  labelAge: string;
  labelGender: string;
  labelSkinType: string;
  labelLifestyle: string;
  labelChildren: string;
  // metadata labels
  labelActive: string;
  labelComposition: string;
  labelDosage: string;
  labelPurpose: string;
  labelIngredients: string;
  labelNote: string;
  // data context
  dataContextSection: string;
  dataContextSince: (date: string, days: number | null) => string;
  dataContextUnknown: string;
  dataContextWindow: (days: number, from: string, to: string) => string;
  dataContextActiveDays: (active: number, total: number) => string;
  // common
  noRecords: string;
  none: string;
  noData: string;
  questionSection: string;
  // skincare
  skincareTitle: string;
  skincareLibrarySection: string;
  skincareLibraryEmpty: string;
  skincareRoutineSection: string;
  skincareRoutineNote: string;
  skincareRoutineEmpty: string;
  skincareLast30Section: string;
  skincareMoodAvg: (val: string) => string;
  skincarePeriodRecords: (n: number) => string;
  skincareObsSection: string;
  skincareObsEmpty: string;
  skincareObsCount: (n: number) => string;
  skincareQuestion: string;
  // supplements
  supplementsTitle: string;
  supplementsLibrarySection: string;
  supplementsLibraryEmpty: string;
  supplementsRoutineSection: string;
  supplementsRoutineNote: string;
  supplementsRoutineEmpty: string;
  supplementsUsageSection: string;
  supplementsUsageCount: (n: number) => string;
  supplementsQuestion: string;
  // correlation
  correlationTitle: string;
  correlationLibrarySkinSection: string;
  correlationLibrarySupplementSection: string;
  correlationDataSection: string;
  correlationDataEmpty: string;
  correlationLibraryNone: string;
  correlationPeriodLabel: string;
  correlationTagsLabel: string;
  correlationUsedLabel: string;
  correlationQuestion: string;
  // weekly
  weeklyTitle: string;
  weeklyRoutineSection: (n: number) => string;
  weeklyRoutineNote: string;
  weeklyRoutineEmpty: string;
  weeklyDaysSection: string;
  weeklyDaysEmpty: string;
  weeklyDoneLabel: string;
  weeklyPeriodLabel: string;
  weeklyTagsLabel: string;
  weeklyQuestion: string;
  // custom prompt
  customTitle: string;
  customSkincareLibrarySection: string;
  customSkincareRoutineSection: string;
  customSkincareRoutineNote: string;
  customSkincareLibraryEmpty: string;
  customSkincareRoutineEmpty: string;
  customSupplementsLibrarySection: string;
  customSupplementsRoutineSection: string;
  customSupplementsRoutineNote: string;
  customSupplementsLibraryEmpty: string;
  customSupplementsRoutineEmpty: string;
  customHabitsLibrarySection: string;
  customHabitsRoutineSection: string;
  customHabitsRoutineNote: string;
  customHabitsLibraryEmpty: string;
  customHabitsRoutineEmpty: string;
  customObsSection: string;
  customObsEmpty: string;
  customObsCount: (n: number) => string;
  customMoodSection: string;
  customMoodNoteLabel: string;
  customCycleSection: string;
  customNoQuestion: string;
};

const STRINGS: Record<Locale, PromptStrings> = {
  cs: {
    profileSection: "## O mně",
    profileEmpty: "(profil nevyplněn)",
    labelName: "Jméno",
    labelAge: "Věk",
    labelGender: "Pohlaví",
    labelSkinType: "Typ pleti",
    labelLifestyle: "Životní styl",
    labelChildren: "Děti",
    labelActive: "aktivní",
    labelComposition: "složení",
    labelDosage: "dávkování",
    labelPurpose: "účel",
    labelIngredients: "složení",
    labelNote: "poznámka",
    dataContextSection: "## Kontext dat",
    dataContextSince: (date, days) =>
      `- Data sleduji od: ${date}${days ? ` (celkem ~${days} dní)` : ""}`,
    dataContextUnknown: "- Data sleduji od: (neznámo)",
    dataContextWindow: (days, from, to) =>
      `- Okno analýzy: posledních ${days} dní (${from} – ${to})`,
    dataContextActiveDays: (active, total) =>
      `- Aktivní dny v okně: ${active} z ${total}`,
    noRecords: "- (žádné záznamy)",
    none: "- (žádné)",
    noData: "- (žádná data)",
    questionSection: "## Otázka",
    skincareTitle: "# Žádost o radu se skincare",
    skincareLibrarySection: "## Co teď používám",
    skincareLibraryEmpty: "- (zatím nic v knihovně)",
    skincareRoutineSection: "## Záměrná pleťová rutina",
    skincareRoutineNote:
      "Produkty jsou v denních slotech vědomě. Nenavrhuj změny načasování, pokud o to nejsem požádána — výjimkou jsou bezpečnostní kontraindikace nebo zásadní chyby (např. retinol + AHA ráno).",
    skincareRoutineEmpty: "- (zatím žádné produkty v rutině)",
    skincareLast30Section: "## Posledních 30 dní",
    skincareMoodAvg: (val) =>
      `- průměrná nálada (1=nejlepší, 5=nejhorší): ${val}`,
    skincarePeriodRecords: (n) => `- záznamů menstruace: ${n}`,
    skincareObsSection: "## Pozorování pleti za 30 dní",
    skincareObsEmpty: "- (žádné relevantní tagy)",
    skincareObsCount: (n) => `(${n}× za 30 dní)`,
    skincareQuestion:
      "Co bys mi doporučil/a změnit, přidat nebo vynechat v rutině? Co by mohlo vysvětlit poslední pozorování pleti?",
    supplementsTitle: "# Žádost o radu se suplementací",
    supplementsLibrarySection: "## Co teď beru",
    supplementsLibraryEmpty: "- (zatím nic v knihovně)",
    supplementsRoutineSection: "## Záměrná denní rutina",
    supplementsRoutineNote:
      "Doplňky jsou v denních slotech vědomě — vím, kdy mám co brát. Nenavrhuj změny načasování, pokud o to nejsem požádána — výjimkou jsou bezpečnostní kontraindikace nebo zásadní chyby (např. látky, které se vzájemně blokují v absorpci).",
    supplementsRoutineEmpty: "- (zatím žádné doplňky v rutině)",
    supplementsUsageSection: "## Skutečné užívání za 30 dní",
    supplementsUsageCount: (n) => `${n}× za 30 dní`,
    supplementsQuestion:
      "Mám smysluplné dávkování? Kombinují se látky dobře dohromady a s jídlem? Něco chybí, něco je zbytečné? Vidíš ve skutečném užívání vzor nepravidelnosti? Na časování změny nenavrhu, pokud nejde o kontraindikaci nebo zásadní chybu.",
    correlationTitle: "# Žádost o nalezení vzorů (korelace)",
    correlationLibrarySkinSection: "## Knihovna — kosmetika",
    correlationLibrarySupplementSection: "## Knihovna — doplňky",
    correlationDataSection: "## Data za 60 dní (1=nejlepší nálada, 5=nejhorší)",
    correlationDataEmpty: "- (žádná data)",
    correlationLibraryNone: "- (žádná)",
    correlationPeriodLabel: "perioda",
    correlationTagsLabel: "tagy",
    correlationUsedLabel: "použito",
    correlationQuestion:
      "Najdi prosím vzory: které dny mám horší náladu, jestli to koreluje s cyklem, použitím konkrétních produktů (viz složení v knihovně), doplňků, návyků nebo pozorováními. Vidíš opakující se kombinace, které stojí za pozornost?",
    weeklyTitle: "# Týdenní reflexe (7 dní)",
    weeklyRoutineSection: (n) => `## Záměrná rutina (${n} položek)`,
    weeklyRoutineNote:
      "Položky jsou v denních slotech vědomě. Nenavrhuj změny načasování, pokud o to nejsem požádána — výjimkou jsou bezpečnostní kontraindikace nebo zásadní chyby.",
    weeklyRoutineEmpty: "- (žádná)",
    weeklyDaysSection: "## Skutečné dny",
    weeklyDaysEmpty: "- (žádná data za 7 dní)",
    weeklyDoneLabel: "splněno",
    weeklyPeriodLabel: "perioda",
    weeklyTagsLabel: "tagy",
    weeklyQuestion:
      "Shrň prosím můj týden: kde jsem byla konzistentní, kde jsem vynechávala, co se v náladě nebo pozorováních opakovalo. Jeden konkrétní návrh na příští týden.",
    customTitle: "# Vlastní prompt",
    customSkincareLibrarySection: "## Kosmetika — knihovna",
    customSkincareRoutineSection: "## Záměrná pleťová rutina",
    customSkincareRoutineNote:
      "Produkty jsou v denních slotech vědomě. Nenavrhuj změny načasování, pokud o to nejsem požádána — výjimkou jsou kontraindikace.",
    customSkincareLibraryEmpty: "- (žádné produkty)",
    customSkincareRoutineEmpty: "- (žádné produkty v rutině)",
    customSupplementsLibrarySection: "## Doplňky — knihovna",
    customSupplementsRoutineSection: "## Záměrná denní rutina (doplňky)",
    customSupplementsRoutineNote:
      "Doplňky jsou v denních slotech vědomě — vím, kdy mám co brát. Nenavrhuj změny načasování, pokud o to nejsem požádána — výjimkou jsou kontraindikace.",
    customSupplementsLibraryEmpty: "- (žádné doplňky)",
    customSupplementsRoutineEmpty: "- (žádné doplňky v rutině)",
    customHabitsLibrarySection: "## Návyky — knihovna",
    customHabitsRoutineSection: "## Záměrná rutina (návyky)",
    customHabitsRoutineNote:
      "Návyky jsou v denních slotech vědomě. Nenavrhuj změny načasování bez dotazu.",
    customHabitsLibraryEmpty: "- (žádné návyky)",
    customHabitsRoutineEmpty: "- (žádné návyky v rutině)",
    customObsSection: "## Pozorování / tagy (posledních 30 dní)",
    customObsEmpty: "- (žádné záznamy)",
    customObsCount: (n) => `(${n}× za 30 dní)`,
    customMoodSection:
      "## Nálada a zápisky (posledních 30 dní, 1=nejlepší, 5=nejhorší)",
    customMoodNoteLabel: "poznámka",
    customCycleSection: "## Menstruační cyklus (posledních 30 dní)",
    customNoQuestion: "(žádná otázka)",
  },
  en: {
    profileSection: "## About me",
    profileEmpty: "(profile not filled)",
    labelName: "Name",
    labelAge: "Age",
    labelGender: "Gender",
    labelSkinType: "Skin type",
    labelLifestyle: "Lifestyle",
    labelChildren: "Children",
    labelActive: "active",
    labelComposition: "composition",
    labelDosage: "dosage",
    labelPurpose: "purpose",
    labelIngredients: "ingredients",
    labelNote: "note",
    dataContextSection: "## Data context",
    dataContextSince: (date, days) =>
      `- Tracking since: ${date}${days ? ` (~${days} days total)` : ""}`,
    dataContextUnknown: "- Tracking since: (unknown)",
    dataContextWindow: (days, from, to) =>
      `- Analysis window: last ${days} days (${from} – ${to})`,
    dataContextActiveDays: (active, total) =>
      `- Active days in window: ${active} of ${total}`,
    noRecords: "- (no records)",
    none: "- (none)",
    noData: "- (no data)",
    questionSection: "## Question",
    skincareTitle: "# Skincare advice request",
    skincareLibrarySection: "## What I'm currently using",
    skincareLibraryEmpty: "- (nothing in library yet)",
    skincareRoutineSection: "## Intentional skincare routine",
    skincareRoutineNote:
      "Products are in their time slots intentionally. Do not suggest timing changes unless asked — except for safety contraindications or critical mistakes (e.g. retinol + AHA in the morning).",
    skincareRoutineEmpty: "- (no products in routine yet)",
    skincareLast30Section: "## Last 30 days",
    skincareMoodAvg: (val) => `- average mood (1=best, 5=worst): ${val}`,
    skincarePeriodRecords: (n) => `- menstruation records: ${n}`,
    skincareObsSection: "## Skin observations (last 30 days)",
    skincareObsEmpty: "- (no relevant tags)",
    skincareObsCount: (n) => `(${n}× in 30 days)`,
    skincareQuestion:
      "What would you recommend changing, adding or removing from my routine? What might explain my recent skin observations?",
    supplementsTitle: "# Supplement advice request",
    supplementsLibrarySection: "## What I'm currently taking",
    supplementsLibraryEmpty: "- (nothing in library yet)",
    supplementsRoutineSection: "## Intentional daily routine",
    supplementsRoutineNote:
      "Supplements are in their time slots intentionally — I know when to take what. Do not suggest timing changes unless asked — except for safety contraindications or critical mistakes (e.g. substances that block each other's absorption).",
    supplementsRoutineEmpty: "- (no supplements in routine yet)",
    supplementsUsageSection: "## Actual usage (last 30 days)",
    supplementsUsageCount: (n) => `${n}× in 30 days`,
    supplementsQuestion:
      "Is my dosage reasonable? Do the substances combine well with each other and with food? Is anything missing or unnecessary? Do you see a pattern of inconsistency in actual usage? Do not suggest timing changes unless there is a contraindication or critical mistake.",
    correlationTitle: "# Pattern analysis request (correlation)",
    correlationLibrarySkinSection: "## Library — skincare",
    correlationLibrarySupplementSection: "## Library — supplements",
    correlationDataSection: "## Data (60 days, 1=best mood, 5=worst)",
    correlationDataEmpty: "- (no data)",
    correlationLibraryNone: "- (none)",
    correlationPeriodLabel: "period",
    correlationTagsLabel: "tags",
    correlationUsedLabel: "used",
    correlationQuestion:
      "Please find patterns: on which days my mood is worse, whether it correlates with my cycle, specific products (see composition in library), supplements, habits or observations. Do you see recurring combinations worth noting?",
    weeklyTitle: "# Weekly reflection (7 days)",
    weeklyRoutineSection: (n) => `## Intentional routine (${n} items)`,
    weeklyRoutineNote:
      "Items are in their time slots intentionally. Do not suggest timing changes unless asked — except for safety contraindications or critical mistakes.",
    weeklyRoutineEmpty: "- (none)",
    weeklyDaysSection: "## Actual days",
    weeklyDaysEmpty: "- (no data for the last 7 days)",
    weeklyDoneLabel: "done",
    weeklyPeriodLabel: "period",
    weeklyTagsLabel: "tags",
    weeklyQuestion:
      "Please summarise my week: where I was consistent, where I skipped, what recurred in mood or observations. One specific suggestion for next week.",
    customTitle: "# Custom prompt",
    customSkincareLibrarySection: "## Skincare — library",
    customSkincareRoutineSection: "## Intentional skincare routine",
    customSkincareRoutineNote:
      "Products are in their time slots intentionally. Do not suggest timing changes unless asked — except for contraindications.",
    customSkincareLibraryEmpty: "- (no products)",
    customSkincareRoutineEmpty: "- (no products in routine)",
    customSupplementsLibrarySection: "## Supplements — library",
    customSupplementsRoutineSection: "## Intentional daily routine (supplements)",
    customSupplementsRoutineNote:
      "Supplements are in their time slots intentionally — I know when to take what. Do not suggest timing changes unless asked — except for contraindications.",
    customSupplementsLibraryEmpty: "- (no supplements)",
    customSupplementsRoutineEmpty: "- (no supplements in routine)",
    customHabitsLibrarySection: "## Habits — library",
    customHabitsRoutineSection: "## Intentional routine (habits)",
    customHabitsRoutineNote:
      "Habits are in their time slots intentionally. Do not suggest timing changes unless asked.",
    customHabitsLibraryEmpty: "- (no habits)",
    customHabitsRoutineEmpty: "- (no habits in routine)",
    customObsSection: "## Observations / tags (last 30 days)",
    customObsEmpty: "- (no records)",
    customObsCount: (n) => `(${n}× in 30 days)`,
    customMoodSection: "## Mood & notes (last 30 days, 1=best, 5=worst)",
    customMoodNoteLabel: "note",
    customCycleSection: "## Menstrual cycle (last 30 days)",
    customNoQuestion: "(no question)",
  },
};

// ─── data types ──────────────────────────────────────────────────

type ProductRow = {
  id: string;
  name: string;
  brand_id: string | null;
  type_id: string | null;
  active_ingredients: string | null;
  inci: string | null;
  notes: string | null;
};

type SupplementRow = {
  id: string;
  name: string;
  brand_id: string | null;
  dosage: string | null;
  purpose: string | null;
  ingredients: string | null;
  notes: string | null;
};

type HabitRow = {
  id: string;
  name: string;
  description: string | null;
};

type RoutineItemRow = {
  id: string;
  time_of_day: TimeOfDay;
  item_kind: "product" | "supplement" | "habit";
  product_id: string | null;
  supplement_id: string | null;
  habit_id: string | null;
  position: number;
};

type LogRow = {
  log_date: string;
  time_of_day: TimeOfDay;
  item_kind: "product" | "supplement" | "habit";
  product_id: string | null;
  supplement_id: string | null;
  habit_id: string | null;
};

type NoteRow = { log_date: string; mood: number | null; notes: string | null };
type CycleRow = { log_date: string; intensity: CycleIntensity };

type DataContext = {
  firstDate: string | null;
  activeDays: number;
  windowDays: number;
  fromISO: string;
};

// ─── data loaders ───────────────────────────────────────────────

async function loadProducts(supabase: SupabaseClient): Promise<ProductRow[]> {
  const { data } = await supabase
    .from("products")
    .select("id, name, brand_id, type_id, active_ingredients, inci, notes")
    .eq("is_active", true);
  return (data ?? []) as ProductRow[];
}

async function loadSupplements(supabase: SupabaseClient): Promise<SupplementRow[]> {
  const { data } = await supabase
    .from("supplements")
    .select("id, name, brand_id, dosage, purpose, ingredients, notes")
    .eq("is_active", true);
  return (data ?? []) as SupplementRow[];
}

async function loadHabits(supabase: SupabaseClient): Promise<HabitRow[]> {
  const { data } = await supabase
    .from("habits")
    .select("id, name, description")
    .eq("is_active", true);
  return (data ?? []) as HabitRow[];
}

async function loadBrandsMap(
  supabase: SupabaseClient,
  table: "product_brands" | "supplement_brands",
): Promise<Map<string, string>> {
  const { data } = await supabase.from(table).select("id, name");
  return new Map(
    ((data ?? []) as { id: string; name: string }[]).map((b) => [b.id, b.name]),
  );
}

async function loadTypesMap(
  supabase: SupabaseClient,
  table: "product_types" | "supplement_types",
): Promise<Map<string, string>> {
  const { data } = await supabase.from(table).select("id, name");
  return new Map(
    ((data ?? []) as { id: string; name: string }[]).map((t) => [t.id, t.name]),
  );
}

async function loadActiveRoutine(supabase: SupabaseClient): Promise<RoutineItemRow[]> {
  const { data } = await supabase
    .from("routine_items")
    .select("id, time_of_day, item_kind, product_id, supplement_id, habit_id, position")
    .is("archived_at", null)
    .order("position", { ascending: true });
  return (data ?? []) as RoutineItemRow[];
}

async function loadLogs(supabase: SupabaseClient, fromISO: string): Promise<LogRow[]> {
  const { data } = await supabase
    .from("daily_log")
    .select("log_date, time_of_day, item_kind, product_id, supplement_id, habit_id")
    .gte("log_date", fromISO)
    .order("log_date", { ascending: true });
  return (data ?? []) as LogRow[];
}

async function loadNotes(supabase: SupabaseClient, fromISO: string): Promise<NoteRow[]> {
  const { data } = await supabase
    .from("daily_notes")
    .select("log_date, mood, notes")
    .gte("log_date", fromISO)
    .order("log_date", { ascending: true });
  return (data ?? []) as NoteRow[];
}

async function loadCycles(supabase: SupabaseClient, fromISO: string): Promise<CycleRow[]> {
  const { data } = await supabase
    .from("cycle_log")
    .select("log_date, intensity")
    .gte("log_date", fromISO)
    .order("log_date", { ascending: true });
  return (data ?? []) as CycleRow[];
}

async function loadDailyTagsWithNames(
  supabase: SupabaseClient,
  fromISO: string,
): Promise<{ log_date: string; name: string }[]> {
  const [{ data: tagRows }, { data: tags }] = await Promise.all([
    supabase.from("daily_tags").select("log_date, tag_id").gte("log_date", fromISO),
    supabase.from("tags").select("id, name"),
  ]);
  const tagMap = new Map(
    ((tags ?? []) as { id: string; name: string }[]).map((t) => [t.id, t.name]),
  );
  return ((tagRows ?? []) as { log_date: string; tag_id: string }[])
    .map((r) => ({ log_date: r.log_date, name: tagMap.get(r.tag_id) ?? "" }))
    .filter((r) => r.name);
}

async function loadDataContext(
  supabase: SupabaseClient,
  fromISO: string,
): Promise<DataContext> {
  const today = toISO(new Date());
  const [{ data: first }, { data: inWindow }] = await Promise.all([
    supabase.from("daily_log").select("log_date").order("log_date", { ascending: true }).limit(1),
    supabase.from("daily_log").select("log_date").gte("log_date", fromISO),
  ]);
  const firstDate = ((first ?? []) as { log_date: string }[])[0]?.log_date ?? null;
  const activeDays = new Set(
    ((inWindow ?? []) as { log_date: string }[]).map((r) => r.log_date),
  ).size;
  const windowDays =
    Math.round(
      (new Date(today).getTime() - new Date(fromISO).getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;
  return { firstDate, activeDays, windowDays, fromISO };
}

// ─── block formatters ────────────────────────────────────────────

async function buildProfileBlock(
  supabase: SupabaseClient,
  s: PromptStrings,
  locale: Locale,
): Promise<{ profile: Profile | null; text: string }> {
  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .maybeSingle<Profile>();

  if (!profile) {
    return { profile: null, text: `${s.profileSection}\n${s.profileEmpty}` };
  }

  const age = calcAge(profile.date_of_birth);
  const parts: string[] = [];
  if (profile.name) parts.push(`${s.labelName}: ${profile.name}`);
  if (age !== null) parts.push(`${s.labelAge}: ${age}`);
  if (profile.gender) parts.push(`${s.labelGender}: ${GENDER_LABEL[locale][profile.gender]}`);
  if (profile.skin_types?.length) {
    const localised = profile.skin_types.map(
      (st) => SKIN_TYPE_LABEL[locale][st as SkinType] ?? st,
    );
    parts.push(`${s.labelSkinType}: ${localised.join(", ")}`);
  }
  parts.push(`${s.labelLifestyle}: ${LIFESTYLE_LABEL[locale][profile.lifestyle]}`);
  if (profile.children_count > 0) parts.push(`${s.labelChildren}: ${profile.children_count}`);

  return {
    profile,
    text: `${s.profileSection}\n${parts.map((p) => `- ${p}`).join("\n")}`,
  };
}

function dataContextBlock(ctx: DataContext, s: PromptStrings): string {
  const today = toISO(new Date());
  const totalDays = ctx.firstDate
    ? Math.round(
        (new Date(today).getTime() - new Date(ctx.firstDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1
    : null;
  return joinLines([
    s.dataContextSection,
    ctx.firstDate
      ? s.dataContextSince(ctx.firstDate, totalDays)
      : s.dataContextUnknown,
    s.dataContextWindow(ctx.windowDays, ctx.fromISO, today),
    s.dataContextActiveDays(ctx.activeDays, ctx.windowDays),
  ]);
}

// ─── prompt builders ────────────────────────────────────────────

async function buildSkincare(supabase: SupabaseClient, locale: Locale): Promise<string> {
  const s = STRINGS[locale];
  const sl = SLOT_LABEL[locale];

  const [{ text: profileText }, products, productBrands, productTypes, routine] =
    await Promise.all([
      buildProfileBlock(supabase, s, locale),
      loadProducts(supabase),
      loadBrandsMap(supabase, "product_brands"),
      loadTypesMap(supabase, "product_types"),
      loadActiveRoutine(supabase),
    ]);

  const productLines = products.map((p) => {
    const brand = p.brand_id ? productBrands.get(p.brand_id) : null;
    const type = p.type_id ? productTypes.get(p.type_id) : null;
    const parts: string[] = [p.name];
    if (brand) parts.push(`(${brand})`);
    if (type) parts.push(`— ${type}`);
    const meta: string[] = [];
    if (p.active_ingredients) meta.push(`${s.labelActive}: ${p.active_ingredients}`);
    if (p.notes) meta.push(`${s.labelNote}: ${p.notes}`);
    return `- ${parts.join(" ")}${meta.length ? `\n  ${meta.join("; ")}` : ""}`;
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  const routineLines = routine
    .filter((r) => r.item_kind === "product" && r.product_id)
    .flatMap((r) => {
      const p = productById.get(r.product_id!);
      if (!p) return [];
      const head = `- ${sl[r.time_of_day]}: ${p.name}`;
      if (p.active_ingredients)
        return [`${head}\n  ${s.labelComposition}: ${p.active_ingredients}`];
      return [head];
    });

  const fromISO = daysAgo(30);
  const [notes, tags, cycles, dataCtx] = await Promise.all([
    loadNotes(supabase, fromISO),
    loadDailyTagsWithNames(supabase, fromISO),
    loadCycles(supabase, fromISO),
    loadDataContext(supabase, fromISO),
  ]);

  const skinTags = tags.filter((t) =>
    /akné|akne|vyrážka|citlivá|svědění|štípe|červen|suchá|mast/i.test(t.name),
  );
  const tagCount = new Map<string, number>();
  for (const t of skinTags) tagCount.set(t.name, (tagCount.get(t.name) ?? 0) + 1);
  const tagLines = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `- ${name} ${s.skincareObsCount(n)}`);

  const moodAvg = notes
    .filter((n) => n.mood != null)
    .reduce((acc, n, _, arr) => acc + (n.mood ?? 0) / arr.length, 0);

  return joinLines([
    s.skincareTitle,
    "",
    profileText,
    "",
    s.skincareLibrarySection,
    productLines.length ? productLines.join("\n") : s.skincareLibraryEmpty,
    "",
    s.skincareRoutineSection,
    s.skincareRoutineNote,
    routineLines.length ? routineLines.join("\n") : s.skincareRoutineEmpty,
    "",
    dataContextBlock(dataCtx, s),
    "",
    s.skincareLast30Section,
    s.skincareMoodAvg(moodAvg ? moodAvg.toFixed(1) : "—"),
    s.skincarePeriodRecords(cycles.length),
    "",
    s.skincareObsSection,
    tagLines.length ? tagLines.join("\n") : s.skincareObsEmpty,
    "",
    s.questionSection,
    s.skincareQuestion,
  ]);
}

async function buildSupplements(supabase: SupabaseClient, locale: Locale): Promise<string> {
  const s = STRINGS[locale];
  const sl = SLOT_LABEL[locale];

  const [{ text: profileText }, supplements, supplementBrands, routine] = await Promise.all([
    buildProfileBlock(supabase, s, locale),
    loadSupplements(supabase),
    loadBrandsMap(supabase, "supplement_brands"),
    loadActiveRoutine(supabase),
  ]);
  const fromISO = daysAgo(30);
  const [logs, dataCtx] = await Promise.all([
    loadLogs(supabase, fromISO),
    loadDataContext(supabase, fromISO),
  ]);

  const supplementLines = supplements.map((sup) => {
    const brand = sup.brand_id ? supplementBrands.get(sup.brand_id) : null;
    const parts: string[] = [sup.name];
    if (brand) parts.push(`(${brand})`);
    const meta: string[] = [];
    if (sup.dosage) meta.push(`${s.labelDosage}: ${sup.dosage}`);
    if (sup.purpose) meta.push(`${s.labelPurpose}: ${sup.purpose}`);
    if (sup.ingredients) meta.push(`${s.labelIngredients}: ${sup.ingredients}`);
    if (sup.notes) meta.push(`${s.labelNote}: ${sup.notes}`);
    return `- ${parts.join(" ")}${meta.length ? `\n  ${meta.join("; ")}` : ""}`;
  });

  const supplementById = new Map(supplements.map((sup) => [sup.id, sup]));
  const routineLines = routine
    .filter((r) => r.item_kind === "supplement" && r.supplement_id)
    .flatMap((r) => {
      const sup = supplementById.get(r.supplement_id!);
      if (!sup) return [];
      const head = `- ${sl[r.time_of_day]}: ${sup.name}`;
      const meta: string[] = [];
      if (sup.dosage) meta.push(`${s.labelDosage}: ${sup.dosage}`);
      if (sup.ingredients) meta.push(`${s.labelIngredients}: ${sup.ingredients}`);
      return meta.length ? [`${head}\n  ${meta.join("; ")}`] : [head];
    });

  const supplementName = (id: string) => supplementById.get(id)?.name ?? "?";
  const supplementLogs = logs.filter((l) => l.item_kind === "supplement");
  const usageByName = new Map<string, number>();
  for (const l of supplementLogs) {
    const name = l.supplement_id ? supplementName(l.supplement_id) : null;
    if (!name || name === "?") continue;
    usageByName.set(name, (usageByName.get(name) ?? 0) + 1);
  }
  const usageLines = [...usageByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `- ${name}: ${s.supplementsUsageCount(n)}`);

  return joinLines([
    s.supplementsTitle,
    "",
    profileText,
    "",
    s.supplementsLibrarySection,
    supplementLines.length ? supplementLines.join("\n") : s.supplementsLibraryEmpty,
    "",
    s.supplementsRoutineSection,
    s.supplementsRoutineNote,
    routineLines.length ? routineLines.join("\n") : s.supplementsRoutineEmpty,
    "",
    dataContextBlock(dataCtx, s),
    "",
    s.supplementsUsageSection,
    usageLines.length ? usageLines.join("\n") : s.noRecords,
    "",
    s.questionSection,
    s.supplementsQuestion,
  ]);
}

async function buildCorrelation(supabase: SupabaseClient, locale: Locale): Promise<string> {
  const s = STRINGS[locale];
  const sl = SLOT_LABEL[locale];
  const il = INTENSITY_LABEL[locale];

  const { text: profileText } = await buildProfileBlock(supabase, s, locale);
  const fromISO = daysAgo(60);

  const [products, supplements, habits, logs, notes, cycles, tags, dataCtx] =
    await Promise.all([
      loadProducts(supabase),
      loadSupplements(supabase),
      loadHabits(supabase),
      loadLogs(supabase, fromISO),
      loadNotes(supabase, fromISO),
      loadCycles(supabase, fromISO),
      loadDailyTagsWithNames(supabase, fromISO),
      loadDataContext(supabase, fromISO),
    ]);

  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const supplementMap = new Map(supplements.map((sup) => [sup.id, sup.name]));
  const habitMap = new Map(habits.map((h) => [h.id, h.name]));

  const byDate = new Map<
    string,
    { logs: string[]; mood?: number; period?: CycleIntensity; tags: string[] }
  >();
  for (const l of logs) {
    const d = byDate.get(l.log_date) ?? { logs: [], tags: [] };
    let name = "";
    if (l.item_kind === "product" && l.product_id) name = productMap.get(l.product_id) ?? "";
    else if (l.item_kind === "supplement" && l.supplement_id) name = supplementMap.get(l.supplement_id) ?? "";
    else if (l.item_kind === "habit" && l.habit_id) name = habitMap.get(l.habit_id) ?? "";
    if (name) d.logs.push(`${sl[l.time_of_day]}/${name}`);
    byDate.set(l.log_date, d);
  }
  for (const n of notes) {
    const d = byDate.get(n.log_date) ?? { logs: [], tags: [] };
    if (n.mood != null) d.mood = n.mood;
    byDate.set(n.log_date, d);
  }
  for (const c of cycles) {
    const d = byDate.get(c.log_date) ?? { logs: [], tags: [] };
    d.period = c.intensity;
    byDate.set(c.log_date, d);
  }
  for (const tag of tags) {
    const d = byDate.get(tag.log_date) ?? { logs: [], tags: [] };
    d.tags.push(tag.name);
    byDate.set(tag.log_date, d);
  }

  const dayLines = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, d]) => {
      const parts: string[] = [date];
      if (d.mood != null) parts.push(`mood=${d.mood}`);
      if (d.period) parts.push(`${s.correlationPeriodLabel}=${il[d.period]}`);
      if (d.tags.length) parts.push(`${s.correlationTagsLabel}=[${d.tags.join(", ")}]`);
      if (d.logs.length) parts.push(`${s.correlationUsedLabel}=[${d.logs.join(", ")}]`);
      return `- ${parts.join(" | ")}`;
    });

  const productCatalog = products
    .map((p) => {
      const parts = [`- ${p.name}`];
      if (p.active_ingredients) parts.push(`${s.labelComposition}: ${p.active_ingredients}`);
      return parts.join(" — ");
    })
    .join("\n");

  const supplementCatalog = supplements
    .map((sup) => {
      const parts = [`- ${sup.name}`];
      const meta: string[] = [];
      if (sup.dosage) meta.push(`${s.labelDosage}: ${sup.dosage}`);
      if (sup.ingredients) meta.push(`${s.labelIngredients}: ${sup.ingredients}`);
      if (meta.length) parts.push(meta.join("; "));
      return parts.join(" — ");
    })
    .join("\n");

  return joinLines([
    s.correlationTitle,
    "",
    profileText,
    "",
    s.correlationLibrarySkinSection,
    productCatalog || s.correlationLibraryNone,
    "",
    s.correlationLibrarySupplementSection,
    supplementCatalog || s.correlationLibraryNone,
    "",
    dataContextBlock(dataCtx, s),
    "",
    s.correlationDataSection,
    dayLines.length ? dayLines.join("\n") : s.correlationDataEmpty,
    "",
    s.questionSection,
    s.correlationQuestion,
  ]);
}

async function buildWeekly(supabase: SupabaseClient, locale: Locale): Promise<string> {
  const s = STRINGS[locale];
  const sl = SLOT_LABEL[locale];
  const il = INTENSITY_LABEL[locale];

  const { text: profileText } = await buildProfileBlock(supabase, s, locale);
  const fromISO = daysAgo(7);

  const [products, supplements, habits, routine, logs, notes, cycles, tags, dataCtx] =
    await Promise.all([
      loadProducts(supabase),
      loadSupplements(supabase),
      loadHabits(supabase),
      loadActiveRoutine(supabase),
      loadLogs(supabase, fromISO),
      loadNotes(supabase, fromISO),
      loadCycles(supabase, fromISO),
      loadDailyTagsWithNames(supabase, fromISO),
      loadDataContext(supabase, fromISO),
    ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const supplementById = new Map(supplements.map((sup) => [sup.id, sup]));
  const habitById = new Map(habits.map((h) => [h.id, h]));

  const planLines = routine
    .map((r) => {
      const slot = sl[r.time_of_day];
      if (r.item_kind === "product" && r.product_id) {
        const p = productById.get(r.product_id);
        if (!p) return null;
        const head = `- ${slot}/${p.name}`;
        return p.active_ingredients
          ? `${head}\n  ${s.labelComposition}: ${p.active_ingredients}`
          : head;
      }
      if (r.item_kind === "supplement" && r.supplement_id) {
        const sup = supplementById.get(r.supplement_id);
        if (!sup) return null;
        const head = `- ${slot}/${sup.name}`;
        const meta: string[] = [];
        if (sup.dosage) meta.push(`${s.labelDosage}: ${sup.dosage}`);
        if (sup.ingredients) meta.push(`${s.labelIngredients}: ${sup.ingredients}`);
        return meta.length ? `${head}\n  ${meta.join("; ")}` : head;
      }
      if (r.item_kind === "habit" && r.habit_id) {
        const h = habitById.get(r.habit_id);
        if (!h) return null;
        return `- ${slot}/${h.name}`;
      }
      return null;
    })
    .filter((line): line is string => Boolean(line));

  const dayMap = new Map<
    string,
    { mood?: number; period?: CycleIntensity; logged: number; tags: string[] }
  >();
  for (const l of logs) {
    const d = dayMap.get(l.log_date) ?? { logged: 0, tags: [] };
    d.logged += 1;
    dayMap.set(l.log_date, d);
  }
  for (const n of notes) {
    const d = dayMap.get(n.log_date) ?? { logged: 0, tags: [] };
    if (n.mood != null) d.mood = n.mood;
    dayMap.set(n.log_date, d);
  }
  for (const c of cycles) {
    const d = dayMap.get(c.log_date) ?? { logged: 0, tags: [] };
    d.period = c.intensity;
    dayMap.set(c.log_date, d);
  }
  for (const tag of tags) {
    const d = dayMap.get(tag.log_date) ?? { logged: 0, tags: [] };
    d.tags.push(tag.name);
    dayMap.set(tag.log_date, d);
  }

  const dayLines = [...dayMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, d]) => {
      const parts: string[] = [date, `${s.weeklyDoneLabel}=${d.logged}`];
      if (d.mood != null) parts.push(`mood=${d.mood}`);
      if (d.period) parts.push(`${s.weeklyPeriodLabel}=${il[d.period]}`);
      if (d.tags.length) parts.push(`${s.weeklyTagsLabel}=[${d.tags.join(", ")}]`);
      return `- ${parts.join(" | ")}`;
    });

  return joinLines([
    s.weeklyTitle,
    "",
    profileText,
    "",
    dataContextBlock(dataCtx, s),
    "",
    s.weeklyRoutineSection(planLines.length),
    s.weeklyRoutineNote,
    planLines.length ? planLines.join("\n") : s.weeklyRoutineEmpty,
    "",
    s.weeklyDaysSection,
    dayLines.length ? dayLines.join("\n") : s.weeklyDaysEmpty,
    "",
    s.questionSection,
    s.weeklyQuestion,
  ]);
}

// ─── custom prompt builder ──────────────────────────────────────

export async function buildCustomPrompt(
  supabase: SupabaseClient,
  customPrompt: { question: string; data_blocks: DataBlock[] },
  locale: Locale,
): Promise<string> {
  const s = STRINGS[locale];
  const sl = SLOT_LABEL[locale];
  const il = INTENSITY_LABEL[locale];
  const blocks = new Set(customPrompt.data_blocks);
  const fromISO = daysAgo(30);
  const needsRoutine =
    blocks.has("products") || blocks.has("supplements") || blocks.has("habits");

  const [
    profileResult,
    products,
    productBrands,
    productTypes,
    supplements,
    supplementBrands,
    habits,
    routine,
    notes,
    cycles,
    tags,
    dataCtxResult,
  ] = await Promise.all([
    blocks.has("profile") ? buildProfileBlock(supabase, s, locale) : Promise.resolve(null),
    blocks.has("products") ? loadProducts(supabase) : Promise.resolve([] as ProductRow[]),
    blocks.has("products")
      ? loadBrandsMap(supabase, "product_brands")
      : Promise.resolve(new Map<string, string>()),
    blocks.has("products")
      ? loadTypesMap(supabase, "product_types")
      : Promise.resolve(new Map<string, string>()),
    blocks.has("supplements")
      ? loadSupplements(supabase)
      : Promise.resolve([] as SupplementRow[]),
    blocks.has("supplements")
      ? loadBrandsMap(supabase, "supplement_brands")
      : Promise.resolve(new Map<string, string>()),
    blocks.has("habits") ? loadHabits(supabase) : Promise.resolve([] as HabitRow[]),
    needsRoutine ? loadActiveRoutine(supabase) : Promise.resolve([] as RoutineItemRow[]),
    blocks.has("mood") ? loadNotes(supabase, fromISO) : Promise.resolve([] as NoteRow[]),
    blocks.has("cycle") ? loadCycles(supabase, fromISO) : Promise.resolve([] as CycleRow[]),
    blocks.has("observations")
      ? loadDailyTagsWithNames(supabase, fromISO)
      : Promise.resolve([] as { log_date: string; name: string }[]),
    blocks.has("data_context") ? loadDataContext(supabase, fromISO) : Promise.resolve(null),
  ]);

  const parts: (string | null | undefined | false)[] = [s.customTitle];

  if (profileResult) {
    parts.push("", profileResult.text);
  }

  if (blocks.has("products")) {
    const productById = new Map(products.map((p) => [p.id, p]));
    const productLines = products.map((p) => {
      const brand = p.brand_id ? productBrands.get(p.brand_id) : null;
      const type = p.type_id ? productTypes.get(p.type_id) : null;
      const head = [p.name, brand && `(${brand})`, type && `— ${type}`]
        .filter(Boolean)
        .join(" ");
      const meta: string[] = [];
      if (p.active_ingredients) meta.push(`${s.labelActive}: ${p.active_ingredients}`);
      if (p.notes) meta.push(`${s.labelNote}: ${p.notes}`);
      return `- ${head}${meta.length ? `\n  ${meta.join("; ")}` : ""}`;
    });
    const routineProductLines = routine
      .filter((r) => r.item_kind === "product" && r.product_id)
      .flatMap((r) => {
        const p = productById.get(r.product_id!);
        if (!p) return [];
        const head = `- ${sl[r.time_of_day]}: ${p.name}`;
        return p.active_ingredients
          ? [`${head}\n  ${s.labelComposition}: ${p.active_ingredients}`]
          : [head];
      });
    parts.push(
      "",
      s.customSkincareLibrarySection,
      productLines.length ? productLines.join("\n") : s.customSkincareLibraryEmpty,
      "",
      s.customSkincareRoutineSection,
      s.customSkincareRoutineNote,
      routineProductLines.length
        ? routineProductLines.join("\n")
        : s.customSkincareRoutineEmpty,
    );
  }

  if (blocks.has("supplements")) {
    const supplementById = new Map(supplements.map((sup) => [sup.id, sup]));
    const supplementLines = supplements.map((sup) => {
      const brand = sup.brand_id ? supplementBrands.get(sup.brand_id) : null;
      const head = [sup.name, brand && `(${brand})`].filter(Boolean).join(" ");
      const meta: string[] = [];
      if (sup.dosage) meta.push(`${s.labelDosage}: ${sup.dosage}`);
      if (sup.purpose) meta.push(`${s.labelPurpose}: ${sup.purpose}`);
      if (sup.ingredients) meta.push(`${s.labelIngredients}: ${sup.ingredients}`);
      if (sup.notes) meta.push(`${s.labelNote}: ${sup.notes}`);
      return `- ${head}${meta.length ? `\n  ${meta.join("; ")}` : ""}`;
    });
    const routineSupplementLines = routine
      .filter((r) => r.item_kind === "supplement" && r.supplement_id)
      .flatMap((r) => {
        const sup = supplementById.get(r.supplement_id!);
        if (!sup) return [];
        const head = `- ${sl[r.time_of_day]}: ${sup.name}`;
        const meta: string[] = [];
        if (sup.dosage) meta.push(`${s.labelDosage}: ${sup.dosage}`);
        if (sup.ingredients) meta.push(`${s.labelIngredients}: ${sup.ingredients}`);
        return meta.length ? [`${head}\n  ${meta.join("; ")}`] : [head];
      });
    parts.push(
      "",
      s.customSupplementsLibrarySection,
      supplementLines.length ? supplementLines.join("\n") : s.customSupplementsLibraryEmpty,
      "",
      s.customSupplementsRoutineSection,
      s.customSupplementsRoutineNote,
      routineSupplementLines.length
        ? routineSupplementLines.join("\n")
        : s.customSupplementsRoutineEmpty,
    );
  }

  if (blocks.has("habits")) {
    const habitById = new Map(habits.map((h) => [h.id, h]));
    const habitLines = habits.map(
      (h) => `- ${h.name}${h.description ? ` — ${h.description}` : ""}`,
    );
    const routineHabitLines = routine
      .filter((r) => r.item_kind === "habit" && r.habit_id)
      .flatMap((r) => {
        const h = habitById.get(r.habit_id!);
        if (!h) return [];
        return [`- ${sl[r.time_of_day]}: ${h.name}`];
      });
    parts.push(
      "",
      s.customHabitsLibrarySection,
      habitLines.length ? habitLines.join("\n") : s.customHabitsLibraryEmpty,
      "",
      s.customHabitsRoutineSection,
      s.customHabitsRoutineNote,
      routineHabitLines.length ? routineHabitLines.join("\n") : s.customHabitsRoutineEmpty,
    );
  }

  if (blocks.has("observations")) {
    const tagCount = new Map<string, number>();
    for (const t of tags) tagCount.set(t.name, (tagCount.get(t.name) ?? 0) + 1);
    const tagLines = [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, n]) => `- ${name} ${s.customObsCount(n)}`);
    parts.push(
      "",
      s.customObsSection,
      tagLines.length ? tagLines.join("\n") : s.customObsEmpty,
    );
  }

  if (blocks.has("mood")) {
    const moodLines = notes
      .filter((n) => n.mood != null || n.notes)
      .map((n) => {
        const p: string[] = [n.log_date];
        if (n.mood != null) p.push(`mood=${n.mood}`);
        if (n.notes) p.push(`${s.customMoodNoteLabel}: ${n.notes}`);
        return `- ${p.join(" | ")}`;
      });
    parts.push(
      "",
      s.customMoodSection,
      moodLines.length ? moodLines.join("\n") : s.noRecords,
    );
  }

  if (blocks.has("cycle")) {
    const cycleLines = cycles.map(
      (c) => `- ${c.log_date}: ${il[c.intensity]}`,
    );
    parts.push(
      "",
      s.customCycleSection,
      cycleLines.length ? cycleLines.join("\n") : s.noRecords,
    );
  }

  if (dataCtxResult) {
    parts.push("", dataContextBlock(dataCtxResult, s));
  }

  parts.push("", s.questionSection, customPrompt.question || s.customNoQuestion);

  return joinLines(parts);
}

// ─── public API ─────────────────────────────────────────────────

export async function buildPrompt(
  supabase: SupabaseClient,
  type: PromptType,
  locale: Locale,
): Promise<string> {
  switch (type) {
    case "skincare":
      return buildSkincare(supabase, locale);
    case "supplements":
      return buildSupplements(supabase, locale);
    case "correlation":
      return buildCorrelation(supabase, locale);
    case "weekly":
      return buildWeekly(supabase, locale);
  }
}
