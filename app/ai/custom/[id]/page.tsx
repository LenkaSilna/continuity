import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import { buildCustomPrompt } from "@/lib/ai-prompts";
import type { CustomPrompt } from "@/lib/types";
import { TopNav } from "../../../_components/top-nav";
import { PromptEditor } from "../../_components/prompt-editor";
import { PencilIcon } from "../../../_components/icons";

export default async function CustomPromptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_ai");

  const { data } = await supabase
    .from("custom_prompts")
    .select("*")
    .eq("id", id)
    .maybeSingle<CustomPrompt>();

  if (!data) notFound();

  const t = await getMessages();
  const text = await buildCustomPrompt(supabase, data);

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <div className="flex items-center justify-between">
            <Link
              href="/ai"
              className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              ← {t.ai.title}
            </Link>
            <Link
              href={`/ai/custom/${id}/edit`}
              className="mb-2 inline-flex h-10 items-center gap-1.5 rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              <PencilIcon />
              {t.ai.custom.editPrompt}
            </Link>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{data.name}</h1>
        </header>

        <PromptEditor key={id} initialText={text} />
      </main>
    </>
  );
}
