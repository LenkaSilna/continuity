import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/messages";

export function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-zinc-300 p-0.5 text-xs dark:border-zinc-700">
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          disabled={locale === l}
          onClick={() => setLocale(l as Locale)}
          className={`min-h-[32px] min-w-[32px] rounded px-2 font-medium uppercase transition ${
            locale === l
              ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-100 dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
