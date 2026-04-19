"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SignInCardProps = {
  /** Path to return to after sign-in (e.g. "/tools/image-to-prompt"). */
  next: string;
};

export function SignInCard({ next }: SignInCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onGoogle() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) {
        setError("Could not start sign-in. Please try again.");
        setLoading(false);
      }
      // On success the browser is redirected to Google; no further UI needed.
    } catch {
      setError("Could not start sign-in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-lg border-2 border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
        Sign in to AIBuddy
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        New users get 5 free credits. One credit = one generation.
      </p>
      <div className="mt-6">
        <Button
          type="button"
          size="lg"
          disabled={loading}
          onClick={onGoogle}
          className="w-full rounded-none bg-[#cafd00] font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Opening Google…
            </>
          ) : (
            "Continue with Google"
          )}
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border-2 border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
