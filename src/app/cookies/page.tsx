import type { Metadata } from "next";
import Link from "next/link";

import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";

export const metadata: Metadata = {
  title: "Cookies",
  description: "How AIBuddy uses cookies.",
};

export default function CookiesPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Legal"
        title="Cookies"
        description="AIBuddy uses a small set of cookies to run the site and enforce usage limits."
      />

      <MarketingSection>
        <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p>
            We don&apos;t run a big consent platform. We do use cookies that are
            necessary for core site functionality.
          </p>

          <h2>Necessary cookies</h2>
          <ul>
            <li>
              <strong>Guest usage cookie</strong> (<code>aibuddy_guest_id</code>)
              : helps enforce monthly guest limits and reduce abuse. It does not
              contain personal details.
            </li>
            <li>
              <strong>Authentication cookies</strong>: if you sign in, cookies
              are used to keep you signed in and to protect the sign-in flow.
            </li>
          </ul>

          <h2>How to control cookies</h2>
          <p>
            You can clear cookies in your browser settings. If you clear the
            guest cookie, the site may fall back to an IP-based identifier to
            help enforce usage limits. If you clear auth cookies, you&apos;ll be
            signed out.
          </p>

          <h2>Related pages</h2>
          <ul>
            <li>
              <Link href="/privacy" className="text-[#cafd00] hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-[#cafd00] hover:underline">
                Terms of Service
              </Link>
            </li>
          </ul>

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toISOString().slice(0, 10)}
          </p>
        </div>
      </MarketingSection>
    </PageShell>
  );
}

