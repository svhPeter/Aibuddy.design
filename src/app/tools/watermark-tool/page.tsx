import type { Metadata } from "next";

import { WatermarkToolForm } from "@/components/tools/watermark-tool-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { ToolFaq } from "@/components/shared/tool-faq";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";
import { siteConfig } from "@/config/site";

const description =
  "Protect images with clean custom watermarks — text and optional logo, nine positions, opacity and padding. Preview and download locally.";

export const metadata: Metadata = {
  title: "Watermark Tool",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/watermark-tool`,
  },
  openGraph: {
    title: "Watermark Tool · AIBuddy",
    description,
    url: "/tools/watermark-tool",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Watermark Tool · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function WatermarkToolPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free · Browser"
        title="Watermark Tool"
        description="Protect images with clean custom watermarks. Add text and an optional logo, tune opacity and placement, and download — processing stays on your device."
      />

      <MarketingSection>
        <WatermarkToolForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolFaq
          items={[
            {
              q: "Will this prevent theft of my images?",
              a: "Watermarks deter casual reuse; determined users can still edit images. For high-value assets, combine with legal terms and platform controls.",
            },
            {
              q: "Best logo format?",
              a: "PNG with transparency usually looks cleanest over photos. Keep file size modest for faster processing.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/watermark-tool" />
      </MarketingSection>
    </PageShell>
  );
}
