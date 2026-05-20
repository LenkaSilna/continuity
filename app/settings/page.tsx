import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Profile } from "@/lib/types";
import { TopNav } from "../_components/top-nav";
import { BackToDashboard } from "../_components/back-to-dashboard";
import { SettingsForm } from "./_components/settings-form";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profile")
    .select(
      "theme, accent, module_products, module_supplements, module_habits, module_routine, module_observations, module_cycle, module_journal, module_ai",
    )
    .maybeSingle<
      Pick<
        Profile,
        | "theme"
        | "accent"
        | "module_products"
        | "module_supplements"
        | "module_habits"
        | "module_routine"
        | "module_observations"
        | "module_cycle"
        | "module_journal"
        | "module_ai"
      >
    >();

  if (!profile) redirect("/profile");

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.settings.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {t.settings.subtitle}
          </p>
        </header>

        <SettingsForm profile={profile} />
      </main>
    </>
  );
}
