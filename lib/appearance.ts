import { isAccent, isTheme, accentVars } from "./theme";
import type { Accent, ThemeMode } from "./types";

export const THEME_KEY = "app_theme";
export const ACCENT_KEY = "app_accent";

export function parseThemeCookie(value: string | undefined): ThemeMode {
  return isTheme(value) ? value : "light";
}

export function parseAccentCookie(value: string | undefined): Accent {
  return isAccent(value) ? value : "lavender";
}

export function loadAppearance(): { theme: ThemeMode; accent: Accent } {
  const theme = parseThemeCookie(localStorage.getItem(THEME_KEY) ?? undefined);
  const accent = parseAccentCookie(localStorage.getItem(ACCENT_KEY) ?? undefined);
  return { theme, accent };
}

export function applyAppearance(patch: { theme?: ThemeMode; accent?: Accent }): void {
  const current = loadAppearance();
  const theme = patch.theme ?? current.theme;
  const accent = patch.accent ?? current.accent;

  if (patch.theme) localStorage.setItem(THEME_KEY, theme);
  if (patch.accent) localStorage.setItem(ACCENT_KEY, accent);

  const vars = accentVars(accent, theme);
  const el = document.documentElement;
  el.classList.toggle("dark", theme === "dark");
  el.style.setProperty("--background", vars.background);
  el.style.setProperty("--accent", vars.accent);
  el.style.setProperty("--accent-soft", vars.accentSoft);
}
