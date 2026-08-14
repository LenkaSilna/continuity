import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { isEmailAllowed } from "@/lib/auth-allowlist";
import { useI18n } from "@/lib/i18n/client";
import { LocaleSwitcher } from "@/app/_components/locale-switcher";
import { Button } from "@/app/_components/button";

export function LoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [emailSent, setEmailSent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const urlError = new URLSearchParams(window.location.search).get("error");

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim().toLowerCase();
    setIsLoading(true);
    setLoginError(null);

    if (!isEmailAllowed(email)) {
      setLoginError(t.login.errors.notAllowed);
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      const isRateLimit =
        error.status === 429 ||
        msg.includes("security purposes") ||
        msg.includes("rate limit");
      setLoginError(isRateLimit ? t.login.errors.rateLimited : t.login.errors.generic);
    } else {
      setEmailSent(email);
      setStep("otp");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = String(new FormData(e.currentTarget).get("token") ?? "").trim();
    if (!token) {
      setVerifyError(t.login.errors.missingCode);
      return;
    }
    setIsLoading(true);
    setVerifyError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: emailSent,
      token,
      type: "email",
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (error.status === 422 || msg.includes("invalid") || msg.includes("expired") || msg.includes("otp")) {
        setVerifyError(t.login.errors.invalidCode);
      } else {
        setVerifyError(t.login.errors.generic);
      }
    } else {
      navigate({ to: "/dashboard" });
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    setLoginError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: emailSent,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      const isRateLimit = error.status === 429 || msg.includes("security purposes");
      setLoginError(isRateLimit ? t.login.errors.rateLimited : t.login.errors.generic);
    }
    setIsLoading(false);
  };

  const urlErrorMessage =
    !loginError && !step && urlError
      ? (t.login.urlErrors[urlError as keyof typeof t.login.urlErrors] ?? urlError)
      : null;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="safe-top flex justify-end px-4 py-2">
        <LocaleSwitcher />
      </div>
      <main className="flex flex-1 items-center justify-center px-6 pb-8">
        <div className="w-full max-w-sm space-y-6">
          <header className="space-y-2">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-(--text)">
              {t.common.appName}
            </h1>
            <p className="text-base text-(--text-muted)">{t.login.subtitle}</p>
          </header>

          {step === "otp" ? (
            <div className="space-y-4">
              <p className="text-sm text-(--text-muted)">
                {t.login.awaitingCode}{" "}
                <strong className="text-(--text)">{emailSent}</strong>
                <br />
                <span className="text-xs">{t.login.awaitingCodeHint}</span>
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium">{t.login.codeLabel}</span>
                  <input
                    name="token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6,8}"
                    maxLength={8}
                    autoComplete="one-time-code"
                    autoFocus
                    className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2.5 text-center text-2xl font-mono tracking-widest text-(--text) shadow-(--cui-shadow-sm) focus:border-accent focus:outline-none"
                    placeholder={t.login.codePlaceholder}
                  />
                </label>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? t.login.verifying : t.login.verify}
                </Button>
                {verifyError && (
                  <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    {verifyError}
                  </p>
                )}
              </form>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResend}
                className="w-full text-center text-sm text-(--text-muted) underline-offset-2 hover:underline disabled:opacity-50"
              >
                {isLoading ? t.login.sending : t.login.resend}
              </button>
              {loginError && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {loginError}
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">{t.login.emailLabel}</span>
                <input
                  name="email"
                  type="email"
                  required
                  inputMode="email"
                  autoComplete="email"
                  className="w-full rounded-md border border-(--border) bg-(--surface) px-3 py-2.5 text-(--text) shadow-(--cui-shadow-sm) focus:border-accent focus:outline-none"
                  placeholder={t.login.emailPlaceholder}
                />
              </label>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? t.login.sending : t.login.send}
              </Button>
              {(loginError || urlErrorMessage) && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                  {loginError ?? urlErrorMessage}
                </p>
              )}
            </form>
          )}
        </div>
      </main>
      <footer className="border-t border-(--border) px-6 py-8">
        <div className="mx-auto max-w-sm space-y-4 text-sm">
          <p className="leading-relaxed text-(--text-muted)">{t.openSource.body}</p>
          <a
            href="https://github.com/LenkaSilna/continuity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-(--text) transition-colors hover:text-(--text-muted)"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            {t.openSource.github}
          </a>
        </div>
      </footer>
    </div>
  );
}
