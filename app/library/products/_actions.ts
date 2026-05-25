import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/browser";
import type { ActionState } from "@/lib/types";

export type { ActionState } from "@/lib/types";

// ─── product types ───────────────────────────────────────────────

export async function addProductType(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const { count } = await supabase
    .from("product_types")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase
    .from("product_types")
    .insert({ name, position: count ?? 0 });

  if (error) {
    if (error.code === "23505") return { errorCode: "type_exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  return { ok: true };
}

export async function deleteProductType(id: string): Promise<ActionState> {
  const { error } = await supabase.from("product_types").delete().eq("id", id);
  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

// ─── product brands ──────────────────────────────────────────────

export async function addProductBrand(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const { error } = await supabase.from("product_brands").insert({ name });

  if (error) {
    if (error.code === "23505") return { errorCode: "brand_exists" };
    return { errorCode: "generic", errorDetail: error.message };
  }
  return { ok: true };
}

export async function deleteProductBrand(id: string): Promise<ActionState> {
  const { error } = await supabase.from("product_brands").delete().eq("id", id);
  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

async function resolveProductBrandId(
  client: SupabaseClient,
  rawName: string,
): Promise<string | null> {
  const name = rawName.trim();
  if (!name) return null;

  const { data: existing } = await client
    .from("product_brands")
    .select("id")
    .eq("name", name)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: inserted, error } = await client
    .from("product_brands")
    .insert({ name })
    .select("id")
    .single();
  if (error || !inserted) return null;
  return inserted.id as string;
}

// ─── products ────────────────────────────────────────────────────

export async function addProduct(formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const typeIdRaw = String(formData.get("type_id") ?? "").trim();
  const brandName = String(formData.get("brand") ?? "");
  const brand_id = await resolveProductBrandId(supabase, brandName);

  const { error } = await supabase.from("products").insert({
    name,
    brand_id,
    type_id: typeIdRaw || null,
    active_ingredients: String(formData.get("active_ingredients") ?? "").trim() || null,
    inci: String(formData.get("inci") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function updateProduct(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const typeIdRaw = String(formData.get("type_id") ?? "").trim();
  const brandName = String(formData.get("brand") ?? "");
  const brand_id = await resolveProductBrandId(supabase, brandName);

  const { error } = await supabase
    .from("products")
    .update({
      name,
      brand_id,
      type_id: typeIdRaw || null,
      active_ingredients: String(formData.get("active_ingredients") ?? "").trim() || null,
      inci: String(formData.get("inci") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionState> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { errorCode: "generic", errorDetail: error.message };
  return { ok: true };
}
