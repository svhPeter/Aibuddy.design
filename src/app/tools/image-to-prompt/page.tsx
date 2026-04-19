import type { Metadata } from "next";

import { ImageToPromptForm } from "@/components/tools/image-to-prompt-form";
import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Image to Prompt",
  description:
    "Turn any reference image into ready-to-use prompts for AI image tools — a short prompt, a detailed prompt, optional negatives, and tags.",
};

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
    const profile = await prisma.profile
      .findUnique({
        where: { id: user.id },
        select: { creditsBalance: true },
      })
      .catch(() => null);
    return {
      isAuthenticated: true,
      creditsBalance: profile?.creditsBalance ?? 0,
    };
  } catch {
    return { isAuthenticated: false, creditsBalance: 0 };
  }
}

export default async function ImageToPromptPage() {
  const whatsappHref = getWhatsAppContactHref();
  const { isAuthenticated, creditsBalance } = await readToolAuth();

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
          isAuthenticated={isAuthenticated}
          creditsBalance={creditsBalance}
        />
      </MarketingSection>
    </PageShell>
  );
}
