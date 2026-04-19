import { NextResponse } from "next/server";

import { ensureProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * OAuth callback. Supabase redirects here with `?code=...` after Google
 * sign-in. We exchange the code for a session, ensure a Profile row exists,
 * and redirect back to the page the user came from (`?next=...`) or /account.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const rawNext = url.searchParams.get("next");
  const next = rawNext && rawNext.startsWith("/") ? rawNext : "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchange failed:", error);
    return NextResponse.redirect(new URL("/sign-in?error=exchange", url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    try {
      await ensureProfile(user);
    } catch (e) {
      console.error("[auth/callback] ensureProfile failed:", e);
    }
  }

  return NextResponse.redirect(new URL(next, url));
}
