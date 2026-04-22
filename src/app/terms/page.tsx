import type { Metadata } from "next";
import Link from "next/link";

import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using AIBuddy tools and site.",
};

export default function TermsPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Legal"
        title="Terms of Service"
        description="Simple terms for using AIBuddy. No surprises, no fake promises."
      />

      <MarketingSection>
        <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p>
            By using AIBuddy, you agree to these terms. If you don&apos;t agree,
            please don&apos;t use the site.
          </p>

          <h2>Service overview</h2>
          <ul>
            <li>
              AIBuddy provides browser-based utility tools and AI-powered tools.
            </li>
            <li>
              Some tools require signing in. We may enforce monthly usage limits
              for guests and accounts.
            </li>
            <li>
              AIBuddy is provided “as is” — no warranties. We&apos;ll do our
              best to keep things stable, but outages can happen.
            </li>
          </ul>

          <h2>Acceptable use</h2>
          <ul>
            <li>
              Don&apos;t abuse the service (e.g. bypassing usage limits, probing
              for vulnerabilities, or attempting to overload the system).
            </li>
            <li>
              Don&apos;t upload content you don&apos;t have the rights to use.
            </li>
            <li>
              For AI tools, you are responsible for how you use the generated
              output.
            </li>
          </ul>

          <h2>AI outputs</h2>
          <p>
            AI outputs can be incorrect, incomplete, or inappropriate. Always
            review results before using them publicly or commercially.
          </p>

          <h2>Accounts and sign-in</h2>
          <p>
            If you sign in, you&apos;re responsible for maintaining the security
            of your account access. Authentication uses Google OAuth.
          </p>

          <h2>Pricing and upgrades</h2>
          <p>
            We may introduce paid plans later (see{" "}
            <Link href="/pricing" className="text-[#cafd00] hover:underline">
              Pricing
            </Link>
            ). If/when checkout is added, billing terms will be shown clearly at
            purchase time.
          </p>

          <h2>Contact</h2>
          <p>
            For support or questions, email{" "}
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="text-[#cafd00] hover:underline"
            >
              {siteConfig.links.email}
            </a>
            .
          </p>

          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toISOString().slice(0, 10)}
          </p>
        </div>
      </MarketingSection>
    </PageShell>
  );
}

