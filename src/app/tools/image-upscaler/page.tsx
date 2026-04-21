import type { Metadata } from "next";

import { ImageUpscalerForm } from "@/components/tools/image-upscaler-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";

export const metadata: Metadata = {
  title: "Image Upscaler",
  description:
    "Upscale JPG, PNG, or WebP with high-quality resampling (1.5×, 2×, 3×) in your browser. Not generative AI — honest pixel enlargement with download.",
};

export default function ImageUpscalerPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free"
        title="Image Upscaler"
        description="Enlarge width and height using high-quality resampling — useful for exports and layouts. This is not magic detail recovery; it does not invent new texture the way a generative model would."
      />

      <MarketingSection>
        <ImageUpscalerForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/image-upscaler" />
      </MarketingSection>
    </PageShell>
  );
}
