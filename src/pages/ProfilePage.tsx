import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/browser";
import { useI18n } from "@/lib/i18n/client";
import { TopNav } from "@/app/_components/top-nav";
import { BackToDashboard } from "@/app/_components/back-to-dashboard";
import { ProfileForm } from "@/app/profile/_components/profile-form";
import type { Profile } from "@/lib/types";

export function ProfilePage() {
  const { t } = useI18n();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.from("profile").select("*").maybeSingle<Profile>();
      return data as Profile | null;
    },
  });

  const isFirstFill = !isLoading && profile === null;

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <header className="mb-6 space-y-1">
          {!isFirstFill && <BackToDashboard />}
          <h1 className="text-2xl font-semibold tracking-tight">{t.profile.title}</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.profile.subtitle}</p>
        </header>
        {!isLoading && <ProfileForm profile={profile ?? null} />}
      </main>
    </>
  );
}
