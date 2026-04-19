import { NextResponse } from "next/server";

import { setLastCallbackError } from "@/lib/auth-debug";
import { ensureProfile } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * OAuth callback. Supabase (PKCE flow) redirects here with `?code=...` after
 * the provider completes authentication. We:
 *
 * 1. Exchange the code for a session (server-side; sets HTTP-only cookies).
 * 2. Ensure a Profile row exists for the authenticated user (creates + grants
 *    5 welcome credits idempotently on first sign-in).
 * 3. Redirect to the page the user came from (`?next=...`, same-origin only),
 *    falling back to /account.
 *
 * Any failure sends the user back to /sign-in with a short, non-leaky error
 * code so the UI can explain what went wrong. The real error is stashed in
 * module state (src/lib/auth-debug.ts) and surfaced by /api/health/db.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const errorParam = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description");
  const rawNext = url.searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/account";

  if (errorParam) {
    console.error(
      "[auth/callback] provider error:",
      errorParam,
      errorDescription,
    );
    setLastCallbackError("provider", null, {
      message: errorDescription ?? errorParam,
      code: errorParam,
    });
    return NextResponse.redirect(
      new URL(`/sign-in?error=${encodeURIComponent(errorParam)}`, url),
    );
  }

  if (!code) {
    setLastCallbackError("missing_code", null, {
      message: "No ?code param on callback",
    });
    return NextResponse.redirect(new URL("/sign-in?error=missing_code", url));
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    console.error("[auth/callback] exchange failed:", error);
    setLastCallbackError("exchange", error, {
      message: error?.message ?? "exchangeCodeForSession returned no session",
      status: error?.status,
    });
    return NextResponse.redirect(
      new URL("/sign-in?error=auth_callback_failed", url),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    try {
      await ensureProfile(user);
    } catch (e) {
      // Non-fatal: if the DB write fails we still have a valid session and
      // /account will retry ensureProfile on load.
      console.error("[auth/callback] ensureProfile failed:", e);
      setLastCallbackError("ensure_profile", e);
    }
  }

  return NextResponse.redirect(new URL(next, url));
}
