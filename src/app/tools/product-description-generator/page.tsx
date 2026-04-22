import type { Metadata } from "next";

import { ProductDescriptionForm } from "@/components/tools/product-description-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { ToolFaq } from "@/components/shared/tool-faq";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";
import { siteConfig } from "@/config/site";

const description =
  "Generate high-converting product copy fast — short and long descriptions, five feature bullets, and a CTA from name, category, tone, and keywords.";

export const metadata: Metadata = {
  title: "Product Description Generator",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/product-description-generator`,
  },
  openGraph: {
    title: "Product Description Generator · AIBuddy",
    description,
    url: "/tools/product-description-generator",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Product Description Generator · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function ProductDescriptionGeneratorPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · AI · Free"
        title="Product Description Generator"
        description="Generate high-converting product copy fast. Describe your product and category, choose a tone, add optional keywords and audience — get a short blurb, long sales copy, five bullets, and a CTA line with copy buttons."
      />

      <MarketingSection>
        <ProductDescriptionForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolFaq
          items={[
            {
              q: "Do I need an API key?",
              a: "No. The tool runs via AIBuddy’s server and is included with the product — you don’t need to configure anything.",
            },
            {
              q: "Can I use this copy verbatim?",
              a: "Treat output as a draft. Check facts, claims, and compliance for your market before publishing.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/product-description-generator" />
      </MarketingSection>
    </PageShell>
  );
}
