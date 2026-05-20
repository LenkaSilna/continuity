import type { SupabaseClient } from "@supabase/supabase-js";
import type { SkinType } from "./skin-types";
import type {
  CycleIntensity,
  Gender,
  Lifestyle,
  Profile,
  TimeOfDay,
} from "./types";

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

const GENDER_LABEL: Record<Gender, string> = {
  female: "žena",
  male: "muž",
  "prefer-not-to-say": "raději neuvádí",
};

const LIFESTYLE_LABEL: Record<Lifestyle, string> = {
  sedentary: "sedavý",
  light: "převážně sedavý",
  active: "aktivní",
  very_active: "velmi aktivní",
};

const SLOT_LABEL: Record<TimeOfDay, string> = {
  morning: "ráno",
  afternoon: "odpoledne",
  evening: "večer",
};

const INTENSITY_LABEL: Record<CycleIntensity, string> = {
  light: "slabá",
  medium: "střední",
  heavy: "silná",
};

const SKIN_TYPE_LABEL: Record<SkinType, string> = {
  dry: "suchá",
  oily: "mastná",
  combination: "smíšená",
  normal: "normální",
  sensitive: "citlivá",
  dehydrated: "dehydrovaná",
  mature: "zralá",
  "acne-prone": "náchylná k akné",
};

function joinLines(lines: (string | null | undefined | false)[]): string {
  return lines.filter(Boolean).join("\n");
}

// Profile preamble shared across all prompt types.
async function buildProfileBlock(
  supabase: SupabaseClient,
): Promise<{ profile: Profile | null; text: string }> {
  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .maybeSingle<Profile>();

  if (!profile) {
    return { profile: null, text: "## O mně\n(profil nevyplněn)" };
  }

  const age = calcAge(profile.date_of_birth);
  const parts: string[] = [];
  if (profile.name) parts.push(`Jméno: ${profile.name}`);
  if (age !== null) parts.push(`Věk: ${age}`);
  if (profile.gender) parts.push(`Pohlaví: ${GENDER_LABEL[profile.gender]}`);
  if (profile.skin_types?.length) {
    const localised = profile.skin_types.map(
      (s) => SKIN_TYPE_LABEL[s as SkinType] ?? s,
    );
    parts.push(`Typ pleti: ${localised.join(", ")}`);
  }
  parts.push(`Životní styl: ${LIFESTYLE_LABEL[profile.lifestyle]}`);
  if (profile.children_count > 0)
    parts.push(`Děti: ${profile.children_count}`);

  return {
    profile,
    text: `## O mně\n${parts.map((p) => `- ${p}`).join("\n")}`,
  };
}

// ─── data loaders ───────────────────────────────────────────────

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

async function loadProducts(supabase: SupabaseClient): Promise<ProductRow[]> {
  const { data } = await supabase
    .from("products")
    .select("id, name, brand_id, type_id, active_ingredients, inci, notes")
    .eq("is_active", true);
  return (data ?? []) as ProductRow[];
}

async function loadSupplements(
  supabase: SupabaseClient,
): Promise<SupplementRow[]> {
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

async function loadActiveRoutine(
  supabase: SupabaseClient,
): Promise<RoutineItemRow[]> {
  const { data } = await supabase
    .from("routine_items")
    .select(
      "id, time_of_day, item_kind, product_id, supplement_id, habit_id, position",
    )
    .is("archived_at", null)
    .order("position", { ascending: true });
  return (data ?? []) as RoutineItemRow[];
}

type LogRow = {
  log_date: string;
  time_of_day: TimeOfDay;
  item_kind: "product" | "supplement" | "habit";
  product_id: string | null;
  supplement_id: string | null;
  habit_id: string | null;
};

async function loadLogs(
  supabase: SupabaseClient,
  fromISO: string,
): Promise<LogRow[]> {
  const { data } = await supabase
    .from("daily_log")
    .select(
      "log_date, time_of_day, item_kind, product_id, supplement_id, habit_id",
    )
    .gte("log_date", fromISO)
    .order("log_date", { ascending: true });
  return (data ?? []) as LogRow[];
}

type NoteRow = { log_date: string; mood: number | null; notes: string | null };

async function loadNotes(
  supabase: SupabaseClient,
  fromISO: string,
): Promise<NoteRow[]> {
  const { data } = await supabase
    .from("daily_notes")
    .select("log_date, mood, notes")
    .gte("log_date", fromISO)
    .order("log_date", { ascending: true });
  return (data ?? []) as NoteRow[];
}

type CycleRow = { log_date: string; intensity: CycleIntensity };

async function loadCycles(
  supabase: SupabaseClient,
  fromISO: string,
): Promise<CycleRow[]> {
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
    supabase
      .from("daily_tags")
      .select("log_date, tag_id")
      .gte("log_date", fromISO),
    supabase.from("tags").select("id, name"),
  ]);
  const tagMap = new Map(
    ((tags ?? []) as { id: string; name: string }[]).map((t) => [t.id, t.name]),
  );
  return ((tagRows ?? []) as { log_date: string; tag_id: string }[])
    .map((r) => ({
      log_date: r.log_date,
      name: tagMap.get(r.tag_id) ?? "",
    }))
    .filter((r) => r.name);
}

// ─── prompt builders ────────────────────────────────────────────

async function buildSkincare(supabase: SupabaseClient): Promise<string> {
  const [{ text: profileText }, products, productBrands, productTypes, routine] =
    await Promise.all([
      buildProfileBlock(supabase),
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
    if (p.active_ingredients) meta.push(`aktivní: ${p.active_ingredients}`);
    if (p.notes) meta.push(`poznámka: ${p.notes}`);
    return `- ${parts.join(" ")}${meta.length ? `\n  ${meta.join("; ")}` : ""}`;
  });

  const productById = new Map(products.map((p) => [p.id, p]));
  const routineLines = routine
    .filter((r) => r.item_kind === "product" && r.product_id)
    .flatMap((r) => {
      const p = productById.get(r.product_id!);
      if (!p) return [];
      const head = `- ${SLOT_LABEL[r.time_of_day]}: ${p.name}`;
      if (p.active_ingredients)
        return [`${head}\n  složení: ${p.active_ingredients}`];
      return [head];
    });

  const fromISO = daysAgo(30);
  const [notes, tags, cycles] = await Promise.all([
    loadNotes(supabase, fromISO),
    loadDailyTagsWithNames(supabase, fromISO),
    loadCycles(supabase, fromISO),
  ]);

  const skinTags = tags.filter((t) =>
    /akné|akne|vyrážka|citlivá|svědění|štípe|červen|suchá|mast/i.test(t.name),
  );
  const tagCount = new Map<string, number>();
  for (const t of skinTags) {
    tagCount.set(t.name, (tagCount.get(t.name) ?? 0) + 1);
  }
  const tagLines = [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `- ${name} (${n}× za 30 dní)`);

  const moodAvg = notes
    .filter((n) => n.mood != null)
    .reduce((acc, n, _, arr) => acc + (n.mood ?? 0) / arr.length, 0);

  return joinLines([
    "# Žádost o radu se skincare",
    "",
    profileText,
    "",
    "## Co teď používám",
    productLines.length ? productLines.join("\n") : "- (zatím nic v knihovně)",
    "",
    "## Současná pleťová rutina (template)",
    routineLines.length
      ? routineLines.join("\n")
      : "- (zatím žádné produkty v rutině)",
    "",
    "## Posledních 30 dní",
    `- průměrná nálada (1=nejlepší, 5=nejhorší): ${
      moodAvg ? moodAvg.toFixed(1) : "—"
    }`,
    `- záznamů menstruace: ${cycles.length}`,
    "",
    "## Pozorování pleti za 30 dní",
    tagLines.length ? tagLines.join("\n") : "- (žádné relevantní tagy)",
    "",
    "## Otázka",
    "Co bys mi doporučil/a změnit, přidat nebo vynechat v rutině? Co by mohlo vysvětlit poslední pozorování pleti?",
  ]);
}

async function buildSupplements(supabase: SupabaseClient): Promise<string> {
  const [
    { text: profileText },
    supplements,
    supplementBrands,
    routine,
    fromISO,
  ] = await Promise.all([
    buildProfileBlock(supabase),
    loadSupplements(supabase),
    loadBrandsMap(supabase, "supplement_brands"),
    loadActiveRoutine(supabase),
    Promise.resolve(daysAgo(30)),
  ]);

  const supplementLines = supplements.map((s) => {
    const brand = s.brand_id ? supplementBrands.get(s.brand_id) : null;
    const parts: string[] = [s.name];
    if (brand) parts.push(`(${brand})`);
    const meta: string[] = [];
    if (s.dosage) meta.push(`dávkování: ${s.dosage}`);
    if (s.purpose) meta.push(`účel: ${s.purpose}`);
    if (s.ingredients) meta.push(`složení: ${s.ingredients}`);
    if (s.notes) meta.push(`poznámka: ${s.notes}`);
    return `- ${parts.join(" ")}${meta.length ? `\n  ${meta.join("; ")}` : ""}`;
  });

  const supplementById = new Map(supplements.map((s) => [s.id, s]));
  const supplementName = (id: string) =>
    supplementById.get(id)?.name ?? "?";
  const routineLines = routine
    .filter((r) => r.item_kind === "supplement" && r.supplement_id)
    .flatMap((r) => {
      const s = supplementById.get(r.supplement_id!);
      if (!s) return [];
      const head = `- ${SLOT_LABEL[r.time_of_day]}: ${s.name}`;
      const meta: string[] = [];
      if (s.dosage) meta.push(`dávkování: ${s.dosage}`);
      if (s.ingredients) meta.push(`složení: ${s.ingredients}`);
      return meta.length ? [`${head}\n  ${meta.join("; ")}`] : [head];
    });

  const logs = await loadLogs(supabase, fromISO);
  const supplementLogs = logs.filter((l) => l.item_kind === "supplement");
  const usageByName = new Map<string, number>();
  for (const l of supplementLogs) {
    const name = l.supplement_id ? supplementName(l.supplement_id) : null;
    if (!name || name === "?") continue;
    usageByName.set(name, (usageByName.get(name) ?? 0) + 1);
  }
  const usageLines = [...usageByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, n]) => `- ${name}: ${n}× za 30 dní`);

  return joinLines([
    "# Žádost o radu se suplementací",
    "",
    profileText,
    "",
    "## Co teď beru",
    supplementLines.length
      ? supplementLines.join("\n")
      : "- (zatím nic v knihovně)",
    "",
    "## Plán (template)",
    routineLines.length
      ? routineLines.join("\n")
      : "- (zatím žádné doplňky v rutině)",
    "",
    "## Skutečné užívání za 30 dní",
    usageLines.length ? usageLines.join("\n") : "- (žádné záznamy)",
    "",
    "## Otázka",
    "Mám smysluplné dávkování? Kombinují se látky dobře? Něco chybí, něco je zbytečné? Vidíš v užívání nějaký vzor (např. nepravidelnost)?",
  ]);
}

async function buildCorrelation(supabase: SupabaseClient): Promise<string> {
  const { text: profileText } = await buildProfileBlock(supabase);
  const fromISO = daysAgo(60);

  const [products, supplements, habits, logs, notes, cycles, tags] =
    await Promise.all([
      loadProducts(supabase),
      loadSupplements(supabase),
      loadHabits(supabase),
      loadLogs(supabase, fromISO),
      loadNotes(supabase, fromISO),
      loadCycles(supabase, fromISO),
      loadDailyTagsWithNames(supabase, fromISO),
    ]);

  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const supplementMap = new Map(supplements.map((s) => [s.id, s.name]));
  const habitMap = new Map(habits.map((h) => [h.id, h.name]));

  const byDate = new Map<
    string,
    { logs: string[]; mood?: number; period?: CycleIntensity; tags: string[] }
  >();
  for (const l of logs) {
    const d = byDate.get(l.log_date) ?? { logs: [], tags: [] };
    let name = "";
    if (l.item_kind === "product" && l.product_id)
      name = productMap.get(l.product_id) ?? "";
    else if (l.item_kind === "supplement" && l.supplement_id)
      name = supplementMap.get(l.supplement_id) ?? "";
    else if (l.item_kind === "habit" && l.habit_id)
      name = habitMap.get(l.habit_id) ?? "";
    if (name) d.logs.push(`${SLOT_LABEL[l.time_of_day]}/${name}`);
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
      if (d.period) parts.push(`perioda=${INTENSITY_LABEL[d.period]}`);
      if (d.tags.length) parts.push(`tagy=[${d.tags.join(", ")}]`);
      if (d.logs.length) parts.push(`použito=[${d.logs.join(", ")}]`);
      return `- ${parts.join(" | ")}`;
    });

  const productCatalog = products
    .map((p) => {
      const parts = [`- ${p.name}`];
      if (p.active_ingredients) parts.push(`složení: ${p.active_ingredients}`);
      return parts.join(" — ");
    })
    .join("\n");

  const supplementCatalog = supplements
    .map((s) => {
      const parts = [`- ${s.name}`];
      const meta: string[] = [];
      if (s.dosage) meta.push(`dávkování: ${s.dosage}`);
      if (s.ingredients) meta.push(`složení: ${s.ingredients}`);
      if (meta.length) parts.push(meta.join("; "));
      return parts.join(" — ");
    })
    .join("\n");

  return joinLines([
    "# Žádost o nalezení vzorů (korelace)",
    "",
    profileText,
    "",
    "## Knihovna — kosmetika",
    productCatalog || "- (žádná)",
    "",
    "## Knihovna — doplňky",
    supplementCatalog || "- (žádné)",
    "",
    "## Data za 60 dní (1=nejlepší nálada, 5=nejhorší)",
    dayLines.length ? dayLines.join("\n") : "- (žádná data)",
    "",
    "## Otázka",
    "Najdi prosím vzory: které dny mám horší náladu, jestli to koreluje s cyklem, použitím konkrétních produktů (viz složení v knihovně), doplňků, návyků nebo pozorováními. Vidíš opakující se kombinace, které stojí za pozornost?",
  ]);
}

async function buildWeekly(supabase: SupabaseClient): Promise<string> {
  const { text: profileText } = await buildProfileBlock(supabase);
  const fromISO = daysAgo(7);

  const [products, supplements, habits, routine, logs, notes, cycles, tags] =
    await Promise.all([
      loadProducts(supabase),
      loadSupplements(supabase),
      loadHabits(supabase),
      loadActiveRoutine(supabase),
      loadLogs(supabase, fromISO),
      loadNotes(supabase, fromISO),
      loadCycles(supabase, fromISO),
      loadDailyTagsWithNames(supabase, fromISO),
    ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const supplementById = new Map(supplements.map((s) => [s.id, s]));
  const habitById = new Map(habits.map((h) => [h.id, h]));

  // Plan: distinct routine items currently in template (active) — with composition.
  const planLines = routine
    .map((r) => {
      const slot = SLOT_LABEL[r.time_of_day];
      if (r.item_kind === "product" && r.product_id) {
        const p = productById.get(r.product_id);
        if (!p) return null;
        const head = `- ${slot}/${p.name}`;
        return p.active_ingredients
          ? `${head}\n  složení: ${p.active_ingredients}`
          : head;
      }
      if (r.item_kind === "supplement" && r.supplement_id) {
        const s = supplementById.get(r.supplement_id);
        if (!s) return null;
        const head = `- ${slot}/${s.name}`;
        const meta: string[] = [];
        if (s.dosage) meta.push(`dávkování: ${s.dosage}`);
        if (s.ingredients) meta.push(`složení: ${s.ingredients}`);
        return meta.length ? `${head}\n  ${meta.join("; ")}` : head;
      }
      if (r.item_kind === "habit" && r.habit_id) {
        const h = habitById.get(r.habit_id);
        if (!h) return null;
        return `- ${slot}/${h.name}`;
      }
      return null;
    })
    .filter((s): s is string => Boolean(s));

  // Per-day summary
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
      const parts: string[] = [date, `splněno=${d.logged}`];
      if (d.mood != null) parts.push(`mood=${d.mood}`);
      if (d.period) parts.push(`perioda=${INTENSITY_LABEL[d.period]}`);
      if (d.tags.length) parts.push(`tagy=[${d.tags.join(", ")}]`);
      return `- ${parts.join(" | ")}`;
    });

  return joinLines([
    "# Týdenní reflexe (7 dní)",
    "",
    profileText,
    "",
    `## Naplánovaná rutina (${planLines.length} položek)`,
    planLines.length ? planLines.join("\n") : "- (žádná)",
    "",
    "## Skutečné dny",
    dayLines.length ? dayLines.join("\n") : "- (žádná data za 7 dní)",
    "",
    "## Otázka",
    "Shrň prosím můj týden: kde jsem byla konzistentní, kde jsem vynechávala, co se v náladě nebo pozorováních opakovalo. Jeden konkrétní návrh na příští týden.",
  ]);
}

// ─── public API ─────────────────────────────────────────────────

export async function buildPrompt(
  supabase: SupabaseClient,
  type: PromptType,
): Promise<string> {
  switch (type) {
    case "skincare":
      return buildSkincare(supabase);
    case "supplements":
      return buildSupplements(supabase);
    case "correlation":
      return buildCorrelation(supabase);
    case "weekly":
      return buildWeekly(supabase);
  }
}
