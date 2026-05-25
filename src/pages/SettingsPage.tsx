import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { SettingsForm } from "@/app/settings/_components/settings-form";
import type { Profile } from "@/lib/types";

export function SettingsPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  type SettingsProfile = Pick<
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
  >;

  const { data: profile, isLoading } = useQuery({
    queryKey: ["settings-profile"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profile")
        .select(
          "theme, accent, module_products, module_supplements, module_habits, module_routine, module_observations, module_cycle, module_journal, module_ai",
        )
        .maybeSingle<SettingsProfile>();
      return data as SettingsProfile | null;
    },
  });

  if (!isLoading && !profile) {
    navigate({ to: "/profile" });
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
      </main>
    );
  }

  return (
    <>
      <TopNav />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-6 sm:px-6 sm:py-10">
        <header>
          <BackToDashboard />
          <h1 className="text-2xl font-semibold tracking-tight">{t.settings.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t.settings.subtitle}</p>
        </header>

        {profile && <SettingsForm profile={profile} />}
      </main>
    </>
  );
}
