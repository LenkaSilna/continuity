import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/messages";

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-0.5 rounded-(--cui-radius-full) bg-(--surface-3) p-0.5 text-xs">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          aria-selected={locale === l}
          disabled={locale === l}
          onClick={() => setLocale(l as Locale)}
          className={`min-h-[32px] min-w-[32px] rounded-(--cui-radius-full) px-2 font-medium uppercase transition-colors ${
            locale === l
              ? "bg-(--surface) text-(--text) shadow-(--cui-shadow-sm)"
              : "text-(--text-muted) hover:text-(--text)"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
