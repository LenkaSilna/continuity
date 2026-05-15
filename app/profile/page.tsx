import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Profile } from "@/lib/types";
import { TopNav } from "../_components/top-nav";
import { ProfileForm } from "./_components/profile-form";

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile } = await supabase
    .from("profile")
    .select("*")
    .maybeSingle();

  const t = await getMessages();

  return (
    <>
      <TopNav />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 sm:px-6 sm:py-12">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.profile.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.profile.subtitle}
          </p>
        </header>
        <ProfileForm profile={(profile ?? null) as Profile | null} />
      </main>
    </>
  );
}
