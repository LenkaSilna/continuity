import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { PROMPT_TYPES } from "@/lib/ai-prompts";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { AiTabs } from "@/app/ai/_components/ai-tabs";
import type { CustomPrompt } from "@/lib/types";

export function AiPage() {
  const { t } = useI18n();

  const { data: customPrompts = [] } = useQuery({
    queryKey: ["custom-prompts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("custom_prompts")
        .select("id, name, question")
        .order("created_at", { ascending: false })
        .returns<Pick<CustomPrompt, "id" | "name" | "question">[]>();
      return (data ?? []) as Pick<CustomPrompt, "id" | "name" | "question">[];
    },
  });

  const predefined = PROMPT_TYPES.map((type) => ({
    type,
    title: t.ai.types[type].title,
    desc: t.ai.types[type].desc,
  }));

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">{t.ai.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.ai.subtitle}</p>
        </header>

        <AiTabs
          predefined={predefined}
          custom={customPrompts}
          labels={{
            predefinedTab: t.ai.predefined,
            myTab: t.ai.custom.myPrompts,
            addNew: t.ai.custom.addNew,
            noCustom: t.ai.custom.noCustom,
          }}
        />
      </main>
    </>
  );
}
