"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { GENDERS } from "@/lib/skin-types";
import type { Gender, Lifestyle } from "@/lib/types";

const LIFESTYLES: readonly Lifestyle[] = [
  "sedentary",
  "light",
  "active",
  "very_active",
];

export type ProfileFormState = {
  errorCode?: "unauthenticated" | "generic";
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
  if (!user) return { errorCode: "unauthenticated" };

  const name = String(formData.get("name") ?? "").trim() || null;
  const dob = String(formData.get("date_of_birth") ?? "").trim() || null;

  const genderRaw = String(formData.get("gender") ?? "").trim();
  const gender = (GENDERS as readonly string[]).includes(genderRaw)
    ? (genderRaw as Gender)
    : null;

  // Accept presets + user-added custom strings. Trim, dedupe, cap length.
  const skinTypes = Array.from(
    new Set(
      formData
        .getAll("skin_types")
        .map((v) => String(v).trim().slice(0, 40))
        .filter(Boolean),
    ),
  );

  const childrenRaw = Number(formData.get("children_count") ?? 0);
  const childrenCount =
    Number.isFinite(childrenRaw) && childrenRaw >= 0
      ? Math.min(20, Math.floor(childrenRaw))
      : 0;

  const lifestyleRaw = String(formData.get("lifestyle") ?? "");
  const lifestyle: Lifestyle = (LIFESTYLES as readonly string[]).includes(
    lifestyleRaw,
  )
    ? (lifestyleRaw as Lifestyle)
    : "sedentary";

  const { error } = await supabase.from("profile").upsert({
    user_id: user.id,
    name,
    date_of_birth: dob,
    gender,
    skin_types: skinTypes,
    children_count: childrenCount,
    lifestyle,
  });

  if (error) return { errorCode: "generic" };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { ok: true };
}
