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
            Sign-in didn&apos;t complete. Please try again.
          </p>
        ) : null}
      </MarketingSection>
    </PageShell>
  );
}
