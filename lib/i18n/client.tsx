import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from "react";
import { DEFAULT_LOCALE, LOCALES, messages, type Locale, type Messages } from "./messages";

const LOCALE_KEY = "locale";

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
    document.documentElement.setAttribute("lang", l);
    setLocaleState(l);
  };

  const t = useMemo(() => messages[locale], [locale]);

  return (
    <I18nContext.Provider value={{ locale, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Context + Provider + hook colocated by design
export function useI18n(): Ctx {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
