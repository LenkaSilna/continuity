import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { buildPrompt, isPromptType, DEFAULT_PERIOD_DAYS, type PeriodDays } from "@/lib/ai-prompts";
import { TopNav } from "@/app/_components/top-nav";
import { PromptEditor } from "@/app/ai/_components/prompt-editor";
import { PeriodSelect } from "@/app/_components/period-select";

function defaultPeriodFor(type: string): PeriodDays {
  return isPromptType(type) ? DEFAULT_PERIOD_DAYS[type] : 30;
}

export function AiTypePage() {
  const { type } = useParams({ from: "/_protected/ai/$type" });
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();

  const isValid = isPromptType(type);

  const [periodDays, setPeriodDays] = useState<PeriodDays>(() => defaultPeriodFor(type));
  const [syncedType, setSyncedType] = useState(type);
  if (type !== syncedType) {
    setSyncedType(type);
    setPeriodDays(defaultPeriodFor(type));
  }

  const { data, isLoading } = useQuery({
    queryKey: ["ai-prompt", type, periodDays],
    enabled: isValid,
    queryFn: async () => {
      const [generatedText, overrideRes] = await Promise.all([
        buildPrompt(supabase, type as Parameters<typeof buildPrompt>[1], locale, periodDays),
        supabase
          .from("prompt_overrides")
          .select("saved_text")
          .eq("prompt_type", type)
          .maybeSingle<{ saved_text: string }>(),
      ]);
      return {
        generatedText,
        override: overrideRes.data ?? null,
        displayText: overrideRes.data?.saved_text ?? generatedText,
      };
    },
  });

  if (!isValid) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-(--text-muted)">Not found</p>
      </main>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            to="/ai"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
          >
            ← {t.ai.title}
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text)">
            {t.ai.types[type as keyof typeof t.ai.types]?.title}
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            {t.ai.types[type as keyof typeof t.ai.types]?.desc}
          </p>
        </header>

        <PeriodSelect value={periodDays} onChange={setPeriodDays} />

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--border) border-t-accent" />
          </div>
        )}

        {data && (
          <PromptEditor
            key={data.displayText}
            initialText={data.displayText}
            promptType={type}
            hasOverride={data.override != null}
            generatedText={data.generatedText}
            onRegenerate={() =>
              queryClient.invalidateQueries({ queryKey: ["ai-prompt", type] })
            }
          />
        )}
      </main>
    </>
  );
}
