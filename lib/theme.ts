import type { Accent, ThemeMode } from "./types";

export const ACCENTS: readonly Accent[] = ["rose", "lavender", "mint"] as const;
export const THEMES: readonly ThemeMode[] = ["light", "dark"] as const;

// Dark mode keeps a clean neutral background; accent only colours active
// elements (selected buttons, focus rings, the toggle "soft" highlight).
// Matches --background in globals.css for the .dark scope.
const DARK_BACKGROUND = "#0a0a0a";

type AccentPalette = {
  hex: string;
  softLight: string;
  softDark: string;
  tintLight: string;
};

const ACCENT_MAP: Record<Accent, AccentPalette> = {
  rose: {
    hex: "#f43f5e",
    softLight: "#ffe4e6",
    softDark: "#4c0519",
    tintLight: "#fff1f2",
  },
  lavender: {
    hex: "#a78bfa",
    softLight: "#ede9fe",
    softDark: "#2e1065",
    tintLight: "#f5f3ff",
  },
  mint: {
    hex: "#10b981",
    softLight: "#d1fae5",
    softDark: "#022c22",
    tintLight: "#ecfdf5",
  },
};

export function accentVars(
  accent: Accent,
  theme: ThemeMode,
): { background: string; accent: string; accentSoft: string } {
  const p = ACCENT_MAP[accent];
  return {
    background: theme === "dark" ? DARK_BACKGROUND : p.tintLight,
    accent: p.hex,
    accentSoft: theme === "dark" ? p.softDark : p.softLight,
  };
}

export function accentHex(accent: Accent): string {
  return ACCENT_MAP[accent].hex;
}

export function isAccent(v: string | null | undefined): v is Accent {
  return v === "rose" || v === "lavender" || v === "mint";
}

export function isTheme(v: string | null | undefined): v is ThemeMode {
  return v === "light" || v === "dark";
}
