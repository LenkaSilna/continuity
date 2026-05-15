"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ActionState = {
  errorCode?: "name_required" | "type_exists" | "generic";
  errorDetail?: string;
  ok?: boolean;
};

// ─── product types ───────────────────────────────────────────────

export async function addProductType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const supabase = await createServerSupabaseClient();
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
  revalidatePath("/library/products");
  return { ok: true };
}

export async function deleteProductType(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.from("product_types").delete().eq("id", id);
  revalidatePath("/library/products");
}

// ─── products ────────────────────────────────────────────────────

export async function addProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const typeIdRaw = String(formData.get("type_id") ?? "").trim();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("products").insert({
    name,
    brand: String(formData.get("brand") ?? "").trim() || null,
    type_id: typeIdRaw || null,
    active_ingredients:
      String(formData.get("active_ingredients") ?? "").trim() || null,
    inci: String(formData.get("inci") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { errorCode: "generic", errorDetail: error.message };
  revalidatePath("/library/products");
  return { ok: true };
}

export async function updateProduct(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { errorCode: "name_required" };

  const typeIdRaw = String(formData.get("type_id") ?? "").trim();
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("products")
    .update({
      name,
      brand: String(formData.get("brand") ?? "").trim() || null,
      type_id: typeIdRaw || null,
      active_ingredients:
        String(formData.get("active_ingredients") ?? "").trim() || null,
      inci: String(formData.get("inci") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) return { errorCode: "generic", errorDetail: error.message };
  revalidatePath("/library/products");
  revalidatePath(`/library/products/${id}`);
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/library/products");
}
