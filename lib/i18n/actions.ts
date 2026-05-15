"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALES, type Locale } from "./messages";
import { LOCALE_COOKIE } from "./server";

export async function setLocale(locale: Locale) {
  if (!(LOCALES as readonly string[]).includes(locale)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
  revalidatePath("/", "layout");
}
