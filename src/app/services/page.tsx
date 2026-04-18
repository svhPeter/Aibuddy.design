import type { Metadata } from "next";
import { Compass, Layers, LineChart } from "lucide-react";

import { HowItWorks } from "@/components/agency/how-it-works";
import { PricingOverview } from "@/components/agency/pricing-overview";
import { ServiceCard } from "@/components/agency/service-card";
import { PrimaryCta } from "@/components/conversion/primary-cta";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { services } from "@/config/services";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

const iconById = {
  strategy: Compass,
  build: Layers,
  conversion: LineChart,
} as const;

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI strategy, product implementation, and conversion instrumentation — fixed-scope engagements with clear deliverables.",
};

export default function ServicesPage() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <PageShell>
      <PageHeading
        eyebrow="Services"
        title="Engagements built for clarity and shipping"
        description="Three core ways to work together — from first principles through to instrumentation. Every phase has a clear outcome and owner."
      />

      <ul className="grid gap-6 md:grid-cols-3 md:gap-6">
        {services.map((service) => {
          const Icon = iconById[service.id as keyof typeof iconById];
          return (
            <li key={service.id} className="min-w-0">
              <ServiceCard
                service={service}
                icon={Icon}
                showValuePoints
              />
            </li>
          );
        })}
      </ul>

      <MarketingSection>
        <PricingOverview />
      </MarketingSection>

      <MarketingSection>
        <HowItWorks />
      </MarketingSection>

      <MarketingSection className="mt-16 md:mt-24">
        <PrimaryCta
          heading="Talk through scope on your terms"
          body="WhatsApp is the fastest way to get alignment; the form or email work just as well if you prefer to write things out."
          href={whatsappHref ?? "/contact"}
          label={whatsappHref ? "Message on WhatsApp" : "Get in touch"}
          primaryVariant={whatsappHref ? "whatsapp" : "default"}
          secondary={
            whatsappHref
              ? { href: "/contact#message-form", label: "Use the form" }
              : {
                  href: `mailto:${siteConfig.links.email}`,
                  label: `Email ${siteConfig.links.email}`,
                }
          }
        />
      </MarketingSection>
    </PageShell>
  );
}
