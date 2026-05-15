"use server";

import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth-allowlist";

export type LoginErrorCode =
  | "missing_email"
  | "not_allowed"
  | "supabase_error";

export type LoginState = {
  errorCode?: LoginErrorCode;
  errorDetail?: string;
  ok?: boolean;
  emailSent?: string;
};

export async function requestMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { errorCode: "missing_email" };
  if (!isEmailAllowed(email)) return { errorCode: "not_allowed" };

  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { errorCode: "supabase_error", errorDetail: error.message };
  }

  return { ok: true, emailSent: email };
}
