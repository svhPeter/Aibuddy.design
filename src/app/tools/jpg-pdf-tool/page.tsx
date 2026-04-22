import type { Metadata } from "next";

import { JpgPdfToolForm } from "@/components/tools/jpg-pdf-tool-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { ToolFaq } from "@/components/shared/tool-faq";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";
import { siteConfig } from "@/config/site";

const description =
  "Convert images to PDF instantly in your browser — merge and reorder JPG/PNG/WebP, or export PDF pages to JPG in a zip. Private local processing.";

export const metadata: Metadata = {
  title: "JPG ↔ PDF",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/jpg-pdf-tool`,
  },
  openGraph: {
    title: "JPG ↔ PDF · AIBuddy",
    description,
    url: "/tools/jpg-pdf-tool",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "JPG ↔ PDF · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function JpgPdfToolPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free · Browser"
        title="JPG ↔ PDF"
        description="Convert images to PDF instantly — merge multiple images in order, or extract every page of a PDF to high-quality JPG files packaged in a zip. Nothing is uploaded to our servers."
      />

      <MarketingSection>
        <JpgPdfToolForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolFaq
          items={[
            {
              q: "How are PDF pages created from images?",
              a: "Each image becomes one page sized to match that image’s pixel dimensions. Very large images produce large PDF pages.",
            },
            {
              q: "PDF → JPG quality?",
              a: "Pages render at 2× scale for sharper text and line art; output is JPEG at high quality. Huge PDFs may take longer in the browser.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/jpg-pdf-tool" />
      </MarketingSection>
    </PageShell>
  );
}
