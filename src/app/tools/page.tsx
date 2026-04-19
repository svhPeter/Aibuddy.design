import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PrimaryCta } from "@/components/conversion/primary-cta";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Public AIBuddy utilities — Image to Prompt turns a reference image into prompts for AI image generators.",
};

export default function ToolsPage() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <PageShell>
      <PageHeading
        title="Tools"
        description="One public utility for now — built for creators who work with AI image tools. Custom builds and integrations are available through the studio."
      />

      <MarketingSection>
        <ul className="grid list-none gap-6 p-0 sm:grid-cols-1">
          <li>
            <Link
              href="/tools/image-to-prompt"
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-lg border-2 border-border bg-card p-8 shadow-sm transition-all duration-300",
                "hover:border-primary/35 hover:shadow-md hover:shadow-primary/5",
              )}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#cafd00]">
                Live
              </span>
              <span className="mt-3 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Image to Prompt
              </span>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                Upload JPG, PNG, or WebP. Get a short prompt, a detailed prompt,
                optional negatives, and tags — ready to paste into your favourite
                image generator.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#cafd00] group-hover:underline">
                Open tool
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </Link>
          </li>
        </ul>
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-14">
        <PrimaryCta
          heading="Discuss a build"
          body="Share what you are exploring — whether it is a net-new product or a focused AI layer on an existing flow."
          href={whatsappHref ?? "/contact"}
          label={whatsappHref ? "Message on WhatsApp" : "Contact"}
          primaryVariant={whatsappHref ? "whatsapp" : "default"}
          secondary={
            whatsappHref
              ? { href: "/contact#message-form", label: "Write via the form" }
              : {
                  href: `mailto:${siteConfig.links.email}`,
                  label: "Email AIBuddy",
                }
          }
        />
      </MarketingSection>

      <MarketingSection className="mt-8">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          Back to home
        </Link>
      </MarketingSection>
    </PageShell>
  );
}
