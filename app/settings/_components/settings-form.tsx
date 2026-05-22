"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setAccent, setModule, setTheme } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { accentHex, ACCENTS, THEMES } from "@/lib/theme";
import type { ModuleFlags, Profile } from "@/lib/types";
import { showError, showSuccess } from "@/lib/toast";
import { Toggle } from "@/app/_components/toggle";

const MODULE_KEYS: (keyof ModuleFlags)[] = [
  "module_products",
  "module_supplements",
  "module_habits",
  "module_routine",
  "module_observations",
  "module_cycle",
  "module_journal",
  "module_ai",
];

export function SettingsForm({
  profile,
}: {
  profile: Pick<
    Profile,
    | "theme"
    | "accent"
    | "module_products"
    | "module_supplements"
    | "module_habits"
    | "module_routine"
    | "module_observations"
    | "module_cycle"
    | "module_journal"
    | "module_ai"
  >;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [isApplying, startApply] = useTransition();

  const apply = (fn: () => Promise<{ error?: string }>) => {
    startApply(async () => {
      const result = await fn();
      if (result?.error) {
        showError(t.settings.errors.generic);
      } else {
        showSuccess(t.settings.saved);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── appearance ─────────────────────────────────────────── */}
      <section className="space-y-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          {t.settings.appearance.title}
        </h2>

        <fieldset className="space-y-2" disabled={isApplying}>
          <legend className="text-xs font-medium">
            {t.settings.appearance.theme}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((mode) => {
              const active = profile.theme === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply(() => setTheme(mode))}
                  className={[
                    "min-h-[44px] w-full truncate rounded-md border px-3 py-2 text-sm transition disabled:opacity-50",
                    active
                      ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  {t.settings.appearance.themes[mode]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2" disabled={isApplying}>
          <legend className="text-xs font-medium">
            {t.settings.appearance.accent}
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {ACCENTS.map((color) => {
              const active = profile.accent === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply(() => setAccent(color))}
                  className={[
                    "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border px-2 py-2 text-sm transition disabled:opacity-50",
                    active
                      ? "border-zinc-900 dark:border-zinc-100"
                      : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700"
                    style={{ backgroundColor: accentHex(color) }}
                  />
                  {t.settings.appearance.accents[color]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </section>

      {/* ── modules (instant-apply) ─────────────────────────────── */}
      <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.settings.modules.title}
          </h2>
          <p className="text-xs text-zinc-500">{t.settings.modules.hint}</p>
        </div>

        <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {MODULE_KEYS.map((key) => {
            const enabled = profile[key];
            return (
              <li key={key} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium">
                    {t.settings.modules.labels[key]}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {t.settings.modules.descriptions[key]}
                  </p>
                </div>
                <Toggle
                  checked={!!enabled}
                  onChange={() => apply(() => setModule(key, !enabled))}
                  disabled={isApplying}
                  ariaLabel={t.settings.modules.labels[key]}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
