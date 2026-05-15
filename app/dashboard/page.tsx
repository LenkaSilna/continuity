import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/i18n/server";
import type { Profile } from "@/lib/types";
import { TopNav } from "../_components/top-nav";

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profile")
    .select("*")
    .maybeSingle<Profile>();

  const t = await getMessages();
  const tableMissing = error?.code === "PGRST205" || error?.code === "42P01";

  if (!tableMissing && !error && !profile) {
    redirect("/profile");
  }

  const signOutButton = (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="min-h-[32px] rounded-md border border-zinc-300 px-3 text-xs hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        {t.common.signOut}
      </button>
    </form>
  );

  return (
    <>
      <TopNav rightSlot={signOutButton} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-12">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {t.common.signedInAs} <strong>{user.email}</strong>
          </p>
        </header>

        {tableMissing ? (
          <section className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="font-medium text-amber-900 dark:text-amber-200">
              {t.dbError.notInitialised}
            </p>
            <p className="text-amber-800 dark:text-amber-300">
              {t.dbError.runMigration}{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">
                supabase/migrations/0001_initial_schema.sql
              </code>{" "}
              {t.dbError.andReload}
            </p>
          </section>
        ) : error ? (
          <section className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200">
            {t.dbError.generic} {error.message}
          </section>
        ) : profile ? (
          <>
            <section className="space-y-3 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                  {t.dashboard.aboutMe}
                </h2>
                <Link
                  href="/profile"
                  className="text-xs text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {t.common.edit}
                </Link>
              </div>
              <dl className="grid gap-y-2 text-sm sm:grid-cols-[140px_1fr]">
                <dt className="text-zinc-500">{t.dashboard.fields.name}</dt>
                <dd>
                  {profile.name || (
                    <span className="text-zinc-400">{t.dashboard.empty}</span>
                  )}
                </dd>
                <dt className="text-zinc-500">{t.dashboard.fields.age}</dt>
                <dd>
                  {calcAge(profile.date_of_birth) ?? (
                    <span className="text-zinc-400">{t.dashboard.empty}</span>
                  )}
                </dd>
                <dt className="text-zinc-500">{t.dashboard.fields.gender}</dt>
                <dd>
                  {profile.gender ? (
                    t.genders[profile.gender]
                  ) : (
                    <span className="text-zinc-400">{t.dashboard.empty}</span>
                  )}
                </dd>
                <dt className="text-zinc-500">{t.dashboard.fields.skinTypes}</dt>
                <dd>
                  {profile.skin_types.length > 0 ? (
                    profile.skin_types
                      .map((s) => t.skinTypes[s as keyof typeof t.skinTypes] ?? s)
                      .join(", ")
                  ) : (
                    <span className="text-zinc-400">{t.dashboard.empty}</span>
                  )}
                </dd>
              </dl>
            </section>

            <section className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
                {t.dashboard.roadmap}
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                <li>✓ {t.dashboard.sections.profileDone}</li>
                <li>
                  →{" "}
                  <Link
                    href="/library/products"
                    className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    {t.dashboard.sections.products}
                  </Link>
                </li>
                <li>○ {t.dashboard.sections.supplements}</li>
                <li>○ {t.dashboard.sections.habits}</li>
                <li>○ {t.dashboard.sections.routine}</li>
                <li>○ {t.dashboard.sections.calendar}</li>
                <li>○ {t.dashboard.sections.ai}</li>
              </ul>
            </section>
          </>
        ) : null}
      </main>
    </>
  );
}
