import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, messages, type Locale, type Messages } from "./messages";

export const LOCALE_COOKIE = "locale";

export const getLocale: () => Promise<Locale> = cache(async () => {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (LOCALES as readonly string[]).includes(value ?? "")
    ? (value as Locale)
    : DEFAULT_LOCALE;
});

export async function getMessages(): Promise<Messages> {
  const locale = await getLocale();
  return messages[locale];
}
