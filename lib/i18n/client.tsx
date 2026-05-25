import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, LOCALES, messages, type Locale, type Messages } from "./messages";

export const LOCALE_KEY = "locale";

function readLocaleFromStorage(): Locale {
  const v = localStorage.getItem(LOCALE_KEY);
  return (LOCALES as readonly string[]).includes(v ?? "") ? (v as Locale) : DEFAULT_LOCALE;
}

type Ctx = {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocaleFromStorage);

  const setLocale = (l: Locale) => {
    if (!(LOCALES as readonly string[]).includes(l)) return;
    localStorage.setItem(LOCALE_KEY, l);
    setLocaleState(l);
  };

  const t = useMemo(() => messages[locale], [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
