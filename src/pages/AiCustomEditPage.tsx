import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { updateCustomPrompt, deleteCustomPrompt } from "@/app/ai/custom/_actions";
import { CustomPromptForm } from "@/app/ai/custom/_components/custom-prompt-form";
import { TopNav } from "@/app/_components/top-nav";
import type { CustomPrompt } from "@/lib/types";

export function AiCustomEditPage() {
  const { id } = useParams({ from: "/_protected/ai/custom/$id/edit" });
  const { t } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["custom-prompt", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("custom_prompts")
        .select("*")
        .eq("id", id)
        .maybeSingle<CustomPrompt>();
      return data as CustomPrompt | null;
    },
  });

  if (!isLoading && !data) {
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
            to="/ai/custom/$id"
            params={{ id }}
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {data?.name ?? "…"}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.ai.custom.editTitle}
          </h1>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          </div>
        )}

        {data && (
          <CustomPromptForm
            onSubmit={(formData) => updateCustomPrompt(id, formData)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["custom-prompt", id] });
              queryClient.invalidateQueries({ queryKey: ["custom-prompts"] });
              navigate({ to: "/ai/custom/$id", params: { id } });
            }}
            initialName={data.name}
            initialQuestion={data.question ?? ""}
            initialBlocks={data.data_blocks}
            onDelete={async () => {
              await deleteCustomPrompt(id);
              queryClient.invalidateQueries({ queryKey: ["custom-prompts"] });
              navigate({ to: "/ai" });
            }}
          />
        )}
      </main>
    </>
  );
}
