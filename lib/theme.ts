import type { Accent, ThemeMode } from "./types";

export const ACCENTS: readonly Accent[] = ["rose", "lavender", "mint"] as const;
export const THEMES: readonly ThemeMode[] = ["light", "dark"] as const;

// tokens.css keys its accent colours off data-theme="lila|pink|mint", while
// the app's own naming (DB schema, settings labels) stayed rose/lavender/mint.
// This is the only place that bridges the two — "lavender" already reads as
// "Lila" in the settings UI, so the mapping matches what users already see.
export type DataTheme = "lila" | "pink" | "mint";

const ACCENT_DATA_THEME: Record<Accent, DataTheme> = {
  rose: "pink",
  lavender: "lila",
  mint: "mint",
};

// Same hue/chroma tokens.css uses for --accent-h/--accent-c, so this swatch
// colour matches the real accent exactly instead of drifting from it.
const ACCENT_HUE_CHROMA: Record<Accent, { h: number; c: number }> = {
  rose: { h: 356, c: 0.135 },
  lavender: { h: 286, c: 0.155 },
  mint: { h: 166, c: 0.11 },
};

export function dataThemeFor(accent: Accent): DataTheme {
  return ACCENT_DATA_THEME[accent];
}

export function accentHex(accent: Accent): string {
  const { h, c } = ACCENT_HUE_CHROMA[accent];
  return `oklch(0.605 ${c} ${h})`;
}

export function isAccent(v: string | null | undefined): v is Accent {
  return v === "rose" || v === "lavender" || v === "mint";
}

export function isTheme(v: string | null | undefined): v is ThemeMode {
  return v === "light" || v === "dark";
}
