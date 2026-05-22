"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth-allowlist";

export type LoginErrorCode =
  | "missing_email"
  | "not_allowed"
  | "supabase_error";

export type LoginState = {
  errorCode?: LoginErrorCode;
  errorDetail?: string;
  awaitingCode?: boolean;
  emailSent?: string;
  rateLimited?: boolean;
};

export type VerifyErrorCode =
  | "missing_code"
  | "invalid_code"
  | "generic";

export type VerifyState = {
  errorCode?: VerifyErrorCode;
  errorDetail?: string;
};

export async function requestMagicLink(
  prev: LoginState,
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
    console.error("[requestMagicLink] status:", error.status, "message:", error.message);
    const msg = error.message?.toLowerCase() ?? "";
    const isRateLimit =
      error.status === 429 ||
      msg.includes("rate limit") ||
      msg.includes("security purposes") ||
      msg.includes("seconds");
    return {
      errorCode: "supabase_error",
      errorDetail: error.message,
      // keep code-entry screen visible if resending failed (e.g. rate limit)
      awaitingCode: prev.awaitingCode,
      emailSent: prev.emailSent,
      rateLimited: isRateLimit,
    };
  }

  return { awaitingCode: true, emailSent: email };
}

export async function verifyOtpCode(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const token = String(formData.get("token") ?? "").trim();

  if (!token) return { errorCode: "missing_code" };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("[verifyOtp] status:", error.status, "message:", error.message, "code:", error.code);
    const msg = error.message?.toLowerCase() ?? "";
    if (
      error.status === 422 ||
      msg.includes("invalid") ||
      msg.includes("expired") ||
      msg.includes("otp")
    ) {
      return { errorCode: "invalid_code" };
    }
    return { errorCode: "generic", errorDetail: error.message };
  }

  redirect("/dashboard");
}
