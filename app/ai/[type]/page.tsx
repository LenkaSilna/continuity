import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import { buildPrompt, isPromptType } from "@/lib/ai-prompts";
import { TopNav } from "../../_components/top-nav";
import { PromptEditor } from "../_components/prompt-editor";

export default async function AiTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (!isPromptType(type)) notFound();

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_ai");

  const t = await getMessages();
  const text = await buildPrompt(supabase, type);

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <Link
            href="/ai"
            className="-ml-3 mb-2 inline-flex h-10 items-center gap-1 rounded-md px-3 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
          >
            ← {t.ai.title}
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.ai.types[type].title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.ai.types[type].desc}
          </p>
        </header>

        <PromptEditor key={text} initialText={text} />
      </main>
    </>
  );
}
