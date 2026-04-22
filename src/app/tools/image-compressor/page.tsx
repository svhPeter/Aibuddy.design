import type { Metadata } from "next";

import { ImageCompressorForm } from "@/components/tools/image-compressor-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";

export const metadata: Metadata = {
  title: "Image Compressor",
  description:
    "Compress JPG, PNG, or WebP in the browser — quality control, before/after file size, and download. No upload to our servers.",
};

export default function ImageCompressorPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free · Private"
        title="Image Compressor"
        description="Resize the file footprint while keeping the same pixel dimensions. Everything runs in your browser — no sign-in and no paid API keys."
      />

      <MarketingSection>
        <ImageCompressorForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/image-compressor" />
      </MarketingSection>
    </PageShell>
  );
}
