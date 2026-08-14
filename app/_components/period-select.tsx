import { useI18n } from "@/lib/i18n/client";
import { PERIOD_PRESETS, type PeriodDays } from "@/lib/ai-prompts";
import { ToggleChip } from "./toggle-chip";

export function PeriodSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: PeriodDays) => void;
}) {
  const { t } = useI18n();

  return (
    <fieldset className="space-y-2">
      <legend className="text-xs font-medium">{t.ai.period.label}</legend>
      <div className="flex flex-wrap gap-2">
        {PERIOD_PRESETS.map((days) => (
          <ToggleChip
            key={days}
            label={t.ai.period.days(days)}
            active={value === days}
            onClick={() => onChange(days)}
          />
        ))}
      </div>
    </fieldset>
  );
}
