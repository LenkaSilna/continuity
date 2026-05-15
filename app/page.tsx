"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { requestMagicLink, type LoginState } from "./_actions/login";
import { useI18n } from "@/lib/i18n/client";
import { LocaleSwitcher } from "./_components/locale-switcher";

const initialState: LoginState = {};

export default function LoginPage() {
  const { t } = useI18n();
  const [state, formAction, isPending] = useActionState(
    requestMagicLink,
    initialState,
  );
  const params = useSearchParams();
  const urlError = params.get("error");
  const hasFormResult = !!(state.errorCode || state.ok);

  const errorMessage = (() => {
    if (state.errorCode === "missing_email") return t.login.errors.missingEmail;
    if (state.errorCode === "not_allowed") return t.login.errors.notAllowed;
    if (state.errorCode === "supabase_error")
      return state.errorDetail ?? t.login.errors.generic;
    if (!hasFormResult && urlError) {
      return (
        t.login.urlErrors[urlError as keyof typeof t.login.urlErrors] ?? urlError
      );
    }
    return null;
  })();

  return (
    <>
      <div className="safe-top flex justify-end px-4 py-2">
        <LocaleSwitcher />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 pb-8">
        <div className="w-full max-w-sm space-y-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {t.common.appName}
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-400">
              {t.login.subtitle}
            </p>
          </header>

          {state.ok ? (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
              {t.login.checkInbox}
              <br />
              <strong>{state.emailSent}</strong>
            </p>
          ) : (
            <form action={formAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">{t.login.emailLabel}</span>
                <input
                  name="email"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 shadow-sm focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
                  placeholder={t.login.emailPlaceholder}
                />
              </label>
              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-md bg-zinc-900 px-3 py-3 text-base font-medium text-zinc-50 transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {isPending ? t.login.sending : t.login.send}
              </button>
              {errorMessage && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {errorMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </main>
    </>
  );
}
