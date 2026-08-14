import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setAccent, setModule, setTheme } from "../_actions";
import { useI18n } from "@/lib/i18n/client";
import { accentHex, ACCENTS, THEMES } from "@/lib/theme";
import type { ModuleFlags, Profile } from "@/lib/types";
import { showError, showSuccess } from "@/lib/toast";
import { Toggle } from "@/app/_components/toggle";
import { Card } from "@/app/_components/card";

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
  const queryClient = useQueryClient();
  const [isApplying, startApply] = useTransition();

  const apply = (fn: () => Promise<{ error?: string }>) => {
    startApply(async () => {
      const result = await fn();
      if (result?.error) {
        showError(t.settings.errors.generic);
      } else {
        showSuccess(t.settings.saved);
        queryClient.invalidateQueries({ queryKey: ["settings-profile"] });
        queryClient.invalidateQueries({ queryKey: ["module-flags"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* ── appearance ─────────────────────────────────────────── */}
      <Card className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
          {t.settings.appearance.title}
        </h2>

        <fieldset className="space-y-2" disabled={isApplying}>
          <legend className="text-xs font-medium">{t.settings.appearance.theme}</legend>
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
                    "min-h-[44px] w-full truncate rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-50",
                    active
                      ? "border-accent bg-accent-soft text-(--accent-text)"
                      : "border-(--border) text-(--text-muted) hover:bg-(--surface-2)",
                  ].join(" ")}
                >
                  {t.settings.appearance.themes[mode]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="space-y-2" disabled={isApplying}>
          <legend className="text-xs font-medium">{t.settings.appearance.accent}</legend>
          <div className="grid grid-cols-3 gap-2">
            {ACCENTS.map((color) => {
              const active = profile.accent === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-pressed={active}
                  onClick={() => apply(() => setAccent(color))}
                  style={active ? { borderColor: accentHex(color) } : undefined}
                  className={[
                    "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border px-2 py-2 text-sm transition-colors disabled:opacity-50",
                    active
                      ? "text-(--text)"
                      : "border-(--border) text-(--text-muted) hover:bg-(--surface-2)",
                  ].join(" ")}
                >
                  <span
                    aria-hidden
                    className="h-4 w-4 rounded-full border border-(--border)"
                    style={{ backgroundColor: accentHex(color) }}
                  />
                  {t.settings.appearance.accents[color]}
                </button>
              );
            })}
          </div>
        </fieldset>
      </Card>

      {/* ── modules (instant-apply) ─────────────────────────────── */}
      <Card className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-(--text-muted)">
            {t.settings.modules.title}
          </h2>
          <p className="text-xs text-(--text-muted)">{t.settings.modules.hint}</p>
        </div>

        <ul className="divide-y divide-(--border)">
          {MODULE_KEYS.map((key) => {
            const enabled = profile[key];
            return (
              <li key={key} className="flex items-start gap-3 py-3">
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm font-medium text-(--text)">{t.settings.modules.labels[key]}</p>
                  <p className="text-xs text-(--text-muted)">{t.settings.modules.descriptions[key]}</p>
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
      </Card>
    </div>
  );
}
