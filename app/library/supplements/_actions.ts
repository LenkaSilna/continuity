import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/browser";

export type ActionState = {
  errorCode?: "name_required" | "type_exists" | "brand_exists" | "generic";
  errorDetail?: string;
  ok?: boolean;
};

// ─── supplement types ────────────────────────────────────────────

export async function addSupplementType(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const { count } = await supabase
    .from("supplement_types")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase
    .from("supplement_types")
    .insert({ name, position: count ?? 0 });

  if (error) {
    if (error.code === "23505") return { errorCode: "type_exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  return { ok: true };
}

export async function deleteSupplementType(id: string): Promise<void> {
  await supabase.from("supplement_types").delete().eq("id", id);
}

// ─── supplement brands ───────────────────────────────────────────

export async function addSupplementBrand(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const { error } = await supabase.from("supplement_brands").insert({ name });

  if (error) {
    if (error.code === "23505") return { errorCode: "brand_exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  return { ok: true };
}

export async function deleteSupplementBrand(id: string): Promise<void> {
  await supabase.from("supplement_brands").delete().eq("id", id);
}

async function resolveSupplementBrandId(
  client: SupabaseClient,
  rawName: string,
): Promise<string | null> {
  const name = rawName.trim();
  if (!name) return null;

  const { data: existing } = await client
    .from("supplement_brands")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: inserted, error } = await client
    .from("supplement_brands")
    .insert({ name })
    .select("id")
    .single();
  if (error || !inserted) return null;
  return inserted.id as string;
}

// ─── supplements ─────────────────────────────────────────────────

export async function addSupplement(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const typeIdRaw = String(formData.get("type_id") ?? "").trim();
  const brandName = String(formData.get("brand") ?? "");
  const brand_id = await resolveSupplementBrandId(supabase, brandName);

  const { error } = await supabase.from("supplements").insert({
    name,
    brand_id,
    type_id: typeIdRaw || null,
    dosage: String(formData.get("dosage") ?? "").trim() || null,
    purpose: String(formData.get("purpose") ?? "").trim() || null,
    ingredients: String(formData.get("ingredients") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function updateSupplement(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const typeIdRaw = String(formData.get("type_id") ?? "").trim();
  const brandName = String(formData.get("brand") ?? "");
  const brand_id = await resolveSupplementBrandId(supabase, brandName);

  const { error } = await supabase
    .from("supplements")
    .update({
      name,
      brand_id,
      type_id: typeIdRaw || null,
      dosage: String(formData.get("dosage") ?? "").trim() || null,
      purpose: String(formData.get("purpose") ?? "").trim() || null,
      ingredients: String(formData.get("ingredients") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function deleteSupplement(id: string): Promise<void> {
  await supabase.from("supplements").delete().eq("id", id);
}
