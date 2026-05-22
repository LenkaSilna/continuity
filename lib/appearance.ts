import { isAccent, isTheme } from "./theme";
import type { Accent, ThemeMode } from "./types";

export const THEME_COOKIE = "app_theme";
export const ACCENT_COOKIE = "app_accent";
export const APPEARANCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function parseThemeCookie(value: string | undefined): ThemeMode {
  return isTheme(value) ? value : "light";
}

export function parseAccentCookie(value: string | undefined): Accent {
  return isAccent(value) ? value : "lavender";
}

export function appearanceCookieOpts() {
  return {
    path: "/",
    sameSite: "lax" as const,
    maxAge: APPEARANCE_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
}
