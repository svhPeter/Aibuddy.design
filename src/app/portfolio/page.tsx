import type { Metadata } from "next";

import { StitchPortfolioTile } from "@/components/agency/stitch-portfolio-tile";
import { PrimaryCta } from "@/components/conversion/primary-cta";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { portfolioStory, portfolioTiles } from "@/config/portfolio";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: portfolioStory.pageDocumentTitle,
  description: portfolioStory.pageMetadataDescription,
};

export default function PortfolioPage() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <PageShell>
      <PageHeading
        eyebrow={portfolioStory.pageEyebrow}
        title={portfolioStory.pageTitle}
        description={portfolioStory.pageIntro}
      />

      <div className="grid grid-cols-1 gap-px md:grid-cols-12">
        {portfolioTiles.map((tile) => (
          <StitchPortfolioTile key={tile.id} {...tile} />
        ))}
      </div>

      <MarketingSection className="mt-14 md:mt-20">
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Custom engagements are scoped privately. If you need something similar for
          your product, start with a short message — we can discuss fit and timeline
          without a lengthy RFP.
        </p>
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-14">
        <PrimaryCta
          heading="Discuss a build or demo"
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
    </PageShell>
  );
}
