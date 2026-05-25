import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { buildPrompt, isPromptType } from "@/lib/ai-prompts";
import { TopNav } from "@/app/_components/top-nav";
import { PromptEditor } from "@/app/ai/_components/prompt-editor";

export function AiTypePage() {
  const { type } = useParams({ from: "/_protected/ai/$type" });
  const { t, locale } = useI18n();
  const queryClient = useQueryClient();

  const isValid = isPromptType(type);

  const { data, isLoading } = useQuery({
    queryKey: ["ai-prompt", type],
    enabled: isValid,
    queryFn: async () => {
      const [generatedText, overrideRes] = await Promise.all([
        buildPrompt(supabase, type as Parameters<typeof buildPrompt>[1], locale),
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
        <p className="text-zinc-500">Not found</p>
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
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.ai.title}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.ai.types[type as keyof typeof t.ai.types]?.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.ai.types[type as keyof typeof t.ai.types]?.desc}
          </p>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
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
