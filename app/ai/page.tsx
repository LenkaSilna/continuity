import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import { PROMPT_TYPES } from "@/lib/ai-prompts";
import type { CustomPrompt } from "@/lib/types";
import { TopNav } from "../_components/top-nav";
import { BackToDashboard } from "../_components/back-to-dashboard";
import { AiTabs } from "./_components/ai-tabs";

export default async function AiIndexPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_ai");

  const { data: customPrompts } = await supabase
    .from("custom_prompts")
    .select("id, name, question")
    .order("created_at", { ascending: false })
    .returns<Pick<CustomPrompt, "id" | "name" | "question">[]>();

  const t = await getMessages();

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
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.ai.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.ai.subtitle}
          </p>
        </header>

        <AiTabs
          predefined={predefined}
          custom={customPrompts ?? []}
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
