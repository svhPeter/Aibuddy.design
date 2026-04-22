import type { Metadata } from "next";

import { ImageConverterForm } from "@/components/tools/image-converter-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { ToolFaq } from "@/components/shared/tool-faq";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";
import { siteConfig } from "@/config/site";

const description =
  "Fast private image conversion in your browser — JPG, PNG, or WebP with optional quality. Same dimensions, no upload to our servers.";

export const metadata: Metadata = {
  title: "Image Converter",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/image-converter`,
  },
  openGraph: {
    title: "Image Converter · AIBuddy",
    description,
    url: "/tools/image-converter",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Converter · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function ImageConverterPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free · Browser"
        title="Image Converter"
        description="Fast private image conversion in your browser. Pick JPG, PNG, or WebP output, keep pixel dimensions, and download instantly — no account and no server upload."
      />

      <MarketingSection>
        <ImageConverterForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolFaq
          items={[
            {
              q: "Are my images uploaded to AIBuddy?",
              a: "No. Conversion runs entirely in your browser using the Canvas API. Files never leave your device.",
            },
            {
              q: "Why warn when converting PNG to JPG?",
              a: "JPG does not support transparency. Transparent areas are composited on white before export.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/image-converter" />
      </MarketingSection>
    </PageShell>
  );
}
