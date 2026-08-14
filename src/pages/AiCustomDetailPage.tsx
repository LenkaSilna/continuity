import { useTransition } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { buildCustomPrompt } from "@/lib/ai-prompts";
import { deleteCustomPrompt } from "@/app/ai/custom/_actions";
import { confirmToast } from "@/lib/confirm-toast";
import { withDelete } from "@/lib/with-delete";
import { TopNav } from "@/app/_components/top-nav";
import { ErrorState } from "@/app/_components/error-state";
import { PromptEditor } from "@/app/ai/_components/prompt-editor";
import { PencilIcon, TrashIcon } from "@/app/_components/icons";
import type { CustomPrompt } from "@/lib/types";

export function AiCustomDetailPage() {
  const { id } = useParams({ from: "/_protected/ai/custom/$id" });
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isDeleting, startDelete] = useTransition();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["custom-prompt", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_prompts")
        .select("*")
        .eq("id", id)
        .maybeSingle<CustomPrompt>();
      if (error) throw error;
      if (!data) return null;
      const text = await buildCustomPrompt(supabase, data, locale);
      return { prompt: data, text };
    },
  });

  if (isError) {
    return <ErrorState message={t.common.errorGeneric} />;
  }

  if (!isLoading && !data) {
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
          <div className="flex items-center justify-between">
            <Link
              to="/ai"
              className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
            >
              ← {t.ai.title}
            </Link>
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() =>
                  confirmToast({
                    message: t.ai.custom.confirmDelete,
                    detail: data?.prompt.name,
                    confirmLabel: t.common.delete,
                    cancelLabel: t.common.cancel,
                    onConfirm: () =>
                      withDelete({
                        action: () => deleteCustomPrompt(id),
                        start: startDelete,
                        queryClient,
                        invalidateKeys: [["custom-prompts"]],
                        navigate: () => navigate({ to: "/ai" }),
                        errorMessage: t.common.errorGeneric,
                        successMessage: t.common.deleted,
                      }),
                  })
                }
                className="inline-flex h-10 min-w-[44px] items-center gap-1.5 rounded-md border border-red-200 px-3 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
              >
                <TrashIcon />
                <span className="hidden sm:inline">
                  {isDeleting ? t.common.deleting : t.ai.custom.delete}
                </span>
              </button>
              <Link
                to="/ai/custom/$id/edit"
                params={{ id }}
                className="inline-flex h-10 min-w-[44px] items-center gap-1.5 rounded-md border border-(--border) px-3 text-sm text-(--text-muted) transition-colors hover:bg-(--surface-2) hover:text-(--text)"
              >
                <PencilIcon />
                <span className="hidden sm:inline">{t.ai.custom.editPrompt}</span>
              </Link>
            </div>
          </div>
          {data && (
            <h1 className="font-display text-2xl font-semibold tracking-tight text-(--text)">
              {data.prompt.name}
            </h1>
          )}
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-(--border) border-t-accent" />
          </div>
        )}

        {data && (
          <PromptEditor key={id} initialText={data.text} />
        )}
      </main>
    </>
  );
}
