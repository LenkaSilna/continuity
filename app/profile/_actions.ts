"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GENDERS, SKIN_TYPES, type SkinType } from "@/lib/skin-types";
import type { Gender } from "@/lib/types";

export type ProfileFormState = {
  error?: string;
  ok?: boolean;
};

export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const name = String(formData.get("name") ?? "").trim() || null;
  const dob = String(formData.get("date_of_birth") ?? "").trim() || null;

  const genderRaw = String(formData.get("gender") ?? "").trim();
  const gender = (GENDERS as readonly string[]).includes(genderRaw)
    ? (genderRaw as Gender)
    : null;

  const skinTypes = formData
    .getAll("skin_types")
    .map(String)
    .filter((s): s is SkinType =>
      (SKIN_TYPES as readonly string[]).includes(s),
    );

  const { error } = await supabase.from("profile").upsert({
    user_id: user.id,
    name,
    date_of_birth: dob,
    gender,
    skin_types: skinTypes,
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true };
}
