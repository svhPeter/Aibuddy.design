import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { SignInCard } from "./sign-in-card";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to AIBuddy to use tools and track your credits.",
};

type SignInPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

function errorCopy(code: string): string {
  switch (code) {
    case "missing_code":
      return "Sign-in link is missing a code. Please start again.";
    case "auth_callback_failed":
    case "exchange":
      return "We couldn't finish signing you in. Please try again.";
    case "access_denied":
      return "Sign-in was cancelled. You can try again any time.";
    default:
      return "Sign-in didn't complete. Please try again.";
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") ? params.next : "/account";

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next);

  return (
    <PageShell>
      <PageHeading
        eyebrow="Account"
        title="Sign in"
        description="Use your Google account. We only use your email and name to personalise your account."
      />
      <MarketingSection>
        <SignInCard next={next} />
        {params.error ? (
          <p className="mt-6 text-center text-sm text-destructive">
            {errorCopy(params.error)}
          </p>
        ) : null}
      </MarketingSection>
    </PageShell>
  );
}
