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
      <footer className="border-t border-zinc-200 px-6 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-sm space-y-4 text-sm">
          <p className="leading-relaxed text-zinc-600 dark:text-zinc-400">
            {t.openSource.body}
          </p>
          <a
            href="https://github.com/LenkaSilna/continuity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-4 w-4 fill-current"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            {t.openSource.github}
          </a>
        </div>
      </footer>
    </>
  );
}
