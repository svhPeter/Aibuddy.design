import type { Metadata } from "next";

import { AiCaptionGeneratorForm } from "@/components/tools/ai-caption-generator-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { siteConfig } from "@/config/site";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";

const description =
  "Free AI caption generator for Instagram, TikTok, LinkedIn, and X — five caption options, a CTA line, and hashtags. Choose tone and niche; copy or regenerate instantly.";

export const metadata: Metadata = {
  title: "AI Caption Generator",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/ai-caption-generator`,
  },
  openGraph: {
    title: "AI Caption Generator · AIBuddy",
    description,
    url: "/tools/ai-caption-generator",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Caption Generator · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function AiCaptionGeneratorPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · AI · Free"
        title="AI Caption Generator"
        description="Describe your niche, pick a tone and platform, and get five caption ideas plus a short CTA and hashtags — ready to copy into your scheduler."
      />

      <MarketingSection>
        <AiCaptionGeneratorForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/ai-caption-generator" />
      </MarketingSection>
    </PageShell>
  );
}
