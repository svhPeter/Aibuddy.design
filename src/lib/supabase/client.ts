import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for client components. Uses the public anon key; all
 * privileged access must still go through server routes.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.",
    );
  }
  return createBrowserClient(url, key);
}
