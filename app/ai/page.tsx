import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireModule } from "@/lib/modules";
import { getMessages } from "@/lib/i18n/server";
import { PROMPT_TYPES } from "@/lib/ai-prompts";
import { TopNav } from "../_components/top-nav";
import { BackToDashboard } from "../_components/back-to-dashboard";

export default async function AiIndexPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  await requireModule(supabase, "module_ai");

  const t = await getMessages();

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

        <ul className="space-y-3">
          {PROMPT_TYPES.map((type) => (
            <li key={type}>
              <Link
                href={`/ai/${type}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-zinc-200 p-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">{t.ai.types[type].title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {t.ai.types[type].desc}
                  </p>
                </div>
                <span aria-hidden className="shrink-0 text-zinc-400">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
