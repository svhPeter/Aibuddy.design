import type { Metadata } from "next";

import { ImageToPromptForm } from "@/components/tools/image-to-prompt-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import type { UsageStatusPayload } from "@/lib/access/usage";
import { getUsageStatus } from "@/lib/access/usage";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Image to Prompt",
  description:
    "Turn any reference image into ready-to-use prompts for AI image tools — a short prompt, a detailed prompt, optional negatives, and tags.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function readUsageForPage(): Promise<{
  isAuthenticated: boolean;
  usage: UsageStatusPayload | null;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isAuthenticated: false, usage: null };

    const usage = await getUsageStatus({
      user,
      guestKey: "",
    });
    return { isAuthenticated: true, usage };
  } catch (e) {
    console.error("[image-to-prompt page] readUsageForPage failed:", e);
    return { isAuthenticated: false, usage: null };
  }
}

export default async function ImageToPromptPage() {
  const whatsappHref = getWhatsAppContactHref();
  const { isAuthenticated, usage } = await readUsageForPage();

  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · AI · Sign in required"
        title="Image to Prompt"
        description="Drop in a reference image. Get a short prompt, a detailed prompt, optional negatives, and tags you can paste straight into your favourite image generator."
      />

      <MarketingSection>
        <ImageToPromptForm
          whatsappHref={whatsappHref}
          contactEmail={siteConfig.links.email}
          isAuthenticated={isAuthenticated}
          usage={usage}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/image-to-prompt" />
      </MarketingSection>
    </PageShell>
  );
}
