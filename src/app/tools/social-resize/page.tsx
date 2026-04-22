import type { Metadata } from "next";

import { SocialResizeForm } from "@/components/tools/social-resize-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { ToolFaq } from "@/components/shared/tool-faq";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { openGraphImageFields, twitterImageFields } from "@/config/seo";
import { siteConfig } from "@/config/site";

const description =
  "Resize images perfectly for social platforms — Instagram, TikTok, YouTube, LinkedIn, Facebook presets with contain, cover, or stretch. Private browser processing.";

export const metadata: Metadata = {
  title: "Social Media Resize",
  description,
  alternates: {
    canonical: `${siteConfig.url.replace(/\/$/, "")}/tools/social-resize`,
  },
  openGraph: {
    title: "Social Media Resize · AIBuddy",
    description,
    url: "/tools/social-resize",
    siteName: siteConfig.name,
    type: "website",
    ...openGraphImageFields(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Resize · AIBuddy",
    description,
    ...twitterImageFields(),
  },
};

export default function SocialResizePage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Free · Browser"
        title="Social Media Resize"
        description="Resize images perfectly for social platforms. Choose a preset, pick contain (letterbox), cover (crop), or stretch, then export JPG or PNG — all in your browser."
      />

      <MarketingSection>
        <SocialResizeForm />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolFaq
          items={[
            {
              q: "What’s the difference between contain and cover?",
              a: "Contain fits the whole image inside the preset (with letterboxing). Cover fills the frame and crops excess from the center.",
            },
            {
              q: "Are platform sizes guaranteed by each network?",
              a: "Presets match common export sizes; networks change requirements occasionally — always verify in the app you publish from.",
            },
          ]}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/social-resize" />
      </MarketingSection>
    </PageShell>
  );
}
