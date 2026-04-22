import type { Metadata } from "next";

import { ImageEnlargerForm } from "@/components/tools/image-enlarger-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";

export const metadata: Metadata = {
  title: "Image Enlarger",
  description:
    "Enlarge JPG, PNG, or WebP in your browser — clean resampling, larger dimensions for web, social, and exports. Private, fast, not AI restoration.",
};

export default function ImageEnlargerPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free · Private"
        title="Image Enlarger"
        description="Increase image dimensions with clean in-browser processing — useful for larger exports and resized assets. Your files stay on your device."
      />

      <MarketingSection>
        <ImageEnlargerForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/image-enlarger" />
      </MarketingSection>
    </PageShell>
  );
}
