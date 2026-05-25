import { useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n/client";
import { createCustomPrompt } from "@/app/ai/custom/_actions";
import { CustomPromptForm } from "@/app/ai/custom/_components/custom-prompt-form";
import { TopNav } from "@/app/_components/top-nav";

export function AiCustomNewPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
            {t.ai.custom.newTitle}
          </h1>
        </header>
        <CustomPromptForm
          onSubmit={createCustomPrompt}
          onSuccess={(state) => {
            if (state.createdId) {
              queryClient.invalidateQueries({ queryKey: ["custom-prompts"] });
              navigate({ to: "/ai/custom/$id", params: { id: state.createdId } });
            }
          }}
        />
      </main>
    </>
  );
}
