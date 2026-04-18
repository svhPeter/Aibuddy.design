import type { Metadata } from "next";

import { ImageToPromptForm } from "@/components/tools/image-to-prompt-form";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Image to Prompt",
  description:
    "Upload an image and get short and detailed prompts for AI image tools — powered by Gemini on the server.",
};

export default function ImageToPromptPage() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool"
        title="Image to Prompt"
        description="Upload a reference image. We return a concise prompt, a richer universal prompt, optional negatives, and quick tags — tuned for typical image generators."
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
