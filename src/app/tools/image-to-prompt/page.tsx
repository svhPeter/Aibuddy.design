import type { Metadata } from "next";

import { ImageToPromptForm } from "@/components/tools/image-to-prompt-form";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Image to Prompt",
  description:
    "Turn any reference image into ready-to-use prompts for AI image tools — a short prompt, a detailed prompt, optional negatives, and tags.",
};

export default function ImageToPromptPage() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool"
        title="Image to Prompt"
        description="Drop in a reference image. Get a short prompt, a detailed prompt, optional negatives, and tags you can paste straight into your favourite image generator."
      />

      <MarketingSection>
        <ImageToPromptForm
          whatsappHref={whatsappHref}
          contactEmail={siteConfig.links.email}
        />
      </MarketingSection>
    </PageShell>
  );
}
