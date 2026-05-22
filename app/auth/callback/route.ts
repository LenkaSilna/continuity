import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/auth-allowlist";
import {
  ACCENT_COOKIE,
  THEME_COOKIE,
  appearanceCookieOpts,
  parseAccentCookie,
  parseThemeCookie,
} from "@/lib/appearance";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/?error=exchange_failed`);
  }

  if (!isEmailAllowed(data.user?.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?error=not_allowed`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  // Seed appearance cookies so the layout never needs a DB query.
  const { data: profile } = await supabase
    .from("profile")
    .select("theme, accent")
    .maybeSingle<{ theme: string; accent: string }>();

  const cookieOpts = appearanceCookieOpts();
  response.cookies.set(THEME_COOKIE, parseThemeCookie(profile?.theme), cookieOpts);
  response.cookies.set(ACCENT_COOKIE, parseAccentCookie(profile?.accent), cookieOpts);

  return response;
}
