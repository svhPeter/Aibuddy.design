import type { Metadata } from "next";

import { ImageToPromptForm } from "@/components/tools/image-to-prompt-form";
import { ToolCrossLinks } from "@/components/tools/tool-cross-links";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { ensureProfileSafe } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Image to Prompt",
  description:
    "Turn any reference image into ready-to-use prompts for AI image tools — a short prompt, a detailed prompt, optional negatives, and tags.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function readToolAuth(): Promise<{
  isAuthenticated: boolean;
  creditsBalance: number;
}> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { isAuthenticated: false, creditsBalance: 0 };

    const existing = await prisma.profile
      .findUnique({
        where: { id: user.id },
        select: { creditsBalance: true },
      })
      .catch((e) => {
        console.error("[image-to-prompt page] profile lookup failed:", e);
        return null;
      });
    if (existing) {
      return {
        isAuthenticated: true,
        creditsBalance: existing.creditsBalance,
      };
    }

    // First-time visit after sign-in: bootstrap so the user gets their
    // welcome credits before clicking generate.
    const created = await ensureProfileSafe(user);
    return {
      isAuthenticated: true,
      creditsBalance: created?.creditsBalance ?? 0,
    };
  } catch (e) {
    console.error("[image-to-prompt page] readToolAuth failed:", e);
    return { isAuthenticated: false, creditsBalance: 0 };
  }
}

export default async function ImageToPromptPage() {
  const whatsappHref = getWhatsAppContactHref();
  const { isAuthenticated, creditsBalance } = await readToolAuth();

  return (
    <PageShell>
      <PageHeading
        eyebrow="Tool · Account"
        title="Image to Prompt"
        description="Drop in a reference image. Get a short prompt, a detailed prompt, optional negatives, and tags you can paste straight into your favourite image generator."
      />

      <MarketingSection>
        <ImageToPromptForm
          whatsappHref={whatsappHref}
          contactEmail={siteConfig.links.email}
          isAuthenticated={isAuthenticated}
          creditsBalance={creditsBalance}
        />
      </MarketingSection>

      <MarketingSection className="mt-10 md:mt-12">
        <ToolCrossLinks currentHref="/tools/image-to-prompt" />
      </MarketingSection>
    </PageShell>
  );
}
