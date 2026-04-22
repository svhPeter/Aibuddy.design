import type { Metadata } from "next";
import Link from "next/link";

import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AIBuddy collects and uses information.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Legal"
        title="Privacy Policy"
        description="Plain-language, realistic privacy information for how AIBuddy works today."
      />

      <MarketingSection>
        <div className="prose prose-invert max-w-none prose-p:text-muted-foreground prose-li:text-muted-foreground">
          <p>
            AIBuddy is a small, founder-run product. This policy explains what
            information is used when you browse the site, use the tools, and (if
            you choose) sign in.
          </p>

          <h2>What we collect</h2>
          <ul>
            <li>
              <strong>Guest usage cookie</strong>: we set a cookie named{" "}
              <code>aibuddy_guest_id</code> to help enforce monthly guest limits
              and reduce abuse. It does not contain your name or email.
            </li>
            <li>
              <strong>Account details (if you sign in)</strong>: sign-in uses
              Google OAuth. We receive your basic account details (such as your
              email and name/avatar if provided) so we can create and maintain
              your AIBuddy account.
            </li>
            <li>
              <strong>Tool usage counters</strong>: we store monthly usage
              counts (utility and AI uses) to enforce the freemium quotas.
            </li>
            <li>
              <strong>Network information</strong>: like most sites, requests
              include IP-related headers. We may use this as a fallback
              identifier when a guest cookie is missing, and for rate limiting.
            </li>
          </ul>

          <h2>How tool data is handled</h2>
          <ul>
            <li>
              <strong>Utility tools</strong> (compress/convert/resize/watermark,
              etc.) run in your browser. Your image data stays on your device,
              except for normal web requests to load the site.
            </li>
            <li>
              <strong>AI tools</strong> send text (and for Image to Prompt, an
              uploaded image) to third-party AI providers to generate results.
              Those providers process the request to return the output. AIBuddy
              does not sell your uploads.
            </li>
          </ul>

          <h2>Usage, pricing, and “Pro”</h2>
          <p>
            AIBuddy currently offers Guest, Free Account, and a placeholder Pro
            tier. Paid upgrades may be introduced later, but there is no payment
            checkout on the site today.
          </p>

          <h2>Cookies</h2>
          <p>
            We use cookies that are necessary for the site to function, such as
            the guest usage cookie and authentication cookies when you sign in.
            See{" "}
            <Link href="/cookies" className="text-[#cafd00] hover:underline">
              Cookies
            </Link>{" "}
            for details.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Email{" "}
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

