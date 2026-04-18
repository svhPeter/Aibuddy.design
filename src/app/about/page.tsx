import type { Metadata } from "next";

import { PrimaryCta } from "@/components/conversion/primary-cta";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Sami runs AIBuddy as a solo practice — direct collaboration, honest scoping, and production-minded delivery.",
};

export default function AboutPage() {
  const whatsappHref = getWhatsAppContactHref();
  const founder = siteConfig.founder.name;

  return (
    <PageShell>
      <PageHeading
        eyebrow="About"
        title={`${founder} — solo founder, hands-on delivery`}
        description="AIBuddy is intentionally small. You work with the same person from first conversation through implementation — no rotating cast of account managers."
      />

      <div className="space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
        <p className="max-w-2xl">
          I started this studio to do focused AI product work without the noise of
          oversized pitches or vague “innovation” roadmaps. My background is in
          shipping software that has to work in the real world: clear UX, dependable
          APIs, and agent workflows that do not fall over when traffic shows up.
        </p>
        <p className="max-w-2xl">
          That means honest timelines, explicit trade-offs, and documentation you
          can hand to your team. If something is not a fit, I will say so — a bad
          engagement helps no one.
        </p>
      </div>

      <MarketingSection spacing="tight">
        <div className="rounded-lg border-2 border-border bg-card p-8 sm:p-10">
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            How we collaborate
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            <li className="flex gap-3">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>
                <strong className="font-medium text-foreground">Direct access.</strong>{" "}
                You message or email the person doing the work — useful when decisions
                need to move quickly.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>
                <strong className="font-medium text-foreground">Written scope.</strong>{" "}
                Deliverables and pricing are agreed in plain language before build
                work starts.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" aria-hidden />
              <span>
                <strong className="font-medium text-foreground">Production bias.</strong>{" "}
                Design and implementation choices favor maintainability and measurable
                outcomes — not slide decks.
              </span>
            </li>
          </ul>
        </div>
      </MarketingSection>

      <MarketingSection>
        <PrimaryCta
          heading="Tell me what you are trying to ship"
          body="A short WhatsApp thread or email is enough to see if there is a fit — no pitch deck required."
          href={whatsappHref ?? "/contact"}
          label={whatsappHref ? "Message on WhatsApp" : "Go to contact"}
          primaryVariant={whatsappHref ? "whatsapp" : "default"}
          secondary={
            whatsappHref
              ? { href: "/contact#message-form", label: "Use the contact form" }
              : undefined
          }
        />
      </MarketingSection>
    </PageShell>
  );
}
