import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const CALLBACK_PATH = "/auth/callback";

/**
 * Proxy middleware — two jobs:
 *
 * 1. **Refresh the Supabase session cookies** on every request so server
 *    components and route handlers see an up-to-date auth state.
 *    See https://supabase.com/docs/guides/auth/server-side/nextjs
 *
 * 2. **Rescue the OAuth callback** if Supabase's "Redirect URLs" allowlist is
 *    misconfigured and the provider lands on (for example) `/?code=...`
 *    instead of `/auth/callback?code=...`. We forward the code to the
 *    dedicated callback route so the exchange still completes. The
 *    `?code=xxx` shape is unique to the PKCE flow we use via
 *    `signInWithOAuth`; it's safe to treat any such top-level hit as an
 *    auth callback.
 */
export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  if (
    nextUrl.searchParams.has("code") &&
    nextUrl.pathname !== CALLBACK_PATH &&
    !nextUrl.pathname.startsWith("/api/") &&
    !nextUrl.pathname.startsWith("/_next/")
  ) {
    const forwarded = nextUrl.clone();
    const next = nextUrl.pathname + (nextUrl.search ? "" : "");
    forwarded.pathname = CALLBACK_PATH;
    if (!forwarded.searchParams.has("next") && next && next !== "/") {
      forwarded.searchParams.set("next", next);
    }
    return NextResponse.redirect(forwarded);
  }

  const response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Match everything except Next internals, static assets, and the OAuth
    // callback. `/auth/callback` is excluded because the route handler owns the
    // PKCE cookie exchange via exchangeCodeForSession — running the @supabase/ssr
    // middleware client there first can clobber the code_verifier cookie and
    // break sign-in. See https://supabase.com/docs/guides/auth/server-side/nextjs
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
