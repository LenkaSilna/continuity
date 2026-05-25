import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase/browser";
import { applyAppearance } from "@/lib/appearance";
import type { Accent, ThemeMode } from "@/lib/types";

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      navigate({ to: "/", search: { error: "missing_code" } });
      return;
    }

    supabase.auth
      .exchangeCodeForSession(code)
      .then(async ({ data, error }) => {
        if (error || !data.user) {
          navigate({ to: "/", search: { error: "exchange_failed" } });
          return;
        }

        // Seed appearance from profile so CSS vars match DB immediately
        const { data: profile } = await supabase
          .from("profile")
          .select("theme, accent")
          .maybeSingle<{ theme: ThemeMode; accent: Accent }>();

        if (profile) applyAppearance({ theme: profile.theme, accent: profile.accent });

        navigate({ to: "/dashboard" });
      });
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
    </div>
  );
}
