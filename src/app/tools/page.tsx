import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { PrimaryCta } from "@/components/conversion/primary-cta";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { buttonVariants } from "@/components/ui/button";
import { toolsCatalog } from "@/config/tools";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "AIBuddy tools — private browser utilities plus AI-powered tools with optional sign-in and monthly usage limits.",
};

export default function ToolsPage() {
  const whatsappHref = getWhatsAppContactHref();
  const ordered = [...toolsCatalog].sort((a, b) => {
    if (a.access === b.access) return 0;
    return a.access === "public" ? -1 : 1;
  });

  return (
    <PageShell>
      <PageHeading
        title="Tools"
        description="Private utilities run entirely in your browser. AI-powered tools may require signing in and are subject to monthly usage limits."
      />

      <MarketingSection>
        <ul className="grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
          {ordered.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-lg border-2 border-border bg-card p-8 shadow-sm transition-all duration-300",
                  "hover:border-primary/35 hover:shadow-md hover:shadow-primary/5",
                )}
              >
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#cafd00]">
                  {tool.badge}
                </span>
                <span className="mt-3 font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {tool.name}
                </span>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#cafd00] group-hover:underline">
                  Open tool
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
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
