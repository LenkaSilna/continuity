import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import type { CustomPrompt } from "@/lib/types";
import { TopNav } from "../../../../_components/top-nav";
import { updateCustomPrompt, deleteCustomPrompt } from "../../_actions";
import { CustomPromptForm } from "../../_components/custom-prompt-form";

export default async function EditCustomPromptPage({
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
  const updateAction = updateCustomPrompt.bind(null, id);
  const deleteAction = deleteCustomPrompt.bind(null, id);

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <a
            href={`/ai/custom/${id}`}
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {data.name}
          </a>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.ai.custom.editTitle}
          </h1>
        </header>
        <CustomPromptForm
          action={updateAction}
          initialName={data.name}
          initialQuestion={data.question}
          initialBlocks={data.data_blocks}
          onDelete={deleteAction}
        />
      </main>
    </>
  );
}
