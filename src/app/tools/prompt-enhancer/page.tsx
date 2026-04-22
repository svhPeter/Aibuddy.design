import type { Metadata } from "next";

import { PromptEnhancerForm } from "@/components/tools/prompt-enhancer-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { ToolFaq } from "@/components/shared/tool-faq";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";
import { siteConfig } from "@/config/site";

const description =
  "Turn simple prompts into polished AI-ready prompts — style targets for Midjourney, Flux, SDXL, and more, plus negatives and tags.";

export const metadata: Metadata = {
  title: "Prompt Enhancer",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/prompt-enhancer`,
  },
  openGraph: {
    title: "Prompt Enhancer · AIBuddy",
    description,
    url: "/tools/prompt-enhancer",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt Enhancer · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function PromptEnhancerPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · AI · Free"
        title="Prompt Enhancer"
        description="Turn simple prompts into polished AI-ready prompts. Pick a style target and creativity level — get an improved prompt, optional negatives, and tags with copy and regenerate actions."
      />

      <MarketingSection>
        <PromptEnhancerForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolFaq
          items={[
            {
              q: "Which generators does this work with?",
              a: "The style presets are labels to steer wording. You can paste results into Midjourney, Flux, SDXL, or other tools — always follow your model’s syntax and limits.",
            },
            {
              q: "Why is my negative prompt empty sometimes?",
              a: "For some subjects negatives add noise; the model may return an empty negative — you can still add your own.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/prompt-enhancer" />
      </MarketingSection>
    </PageShell>
  );
}
