export const SKIN_TYPES = [
  "dry",
  "oily",
  "combination",
  "normal",
  "sensitive",
  "dehydrated",
  "mature",
  "acne-prone",
] as const;

export type SkinType = (typeof SKIN_TYPES)[number];

export const GENDERS = ["female", "male", "prefer-not-to-say"] as const;
