import type { Metadata } from "next";

import { HomeStitchAbout } from "@/components/home/stitch/home-stitch-about";
import { HomeStitchCta } from "@/components/home/stitch/home-stitch-cta";
import { HomeStitchHero } from "@/components/home/stitch/home-stitch-hero";
import { HomeStitchMarquee } from "@/components/home/stitch/home-stitch-marquee";
import { HomeStitchPortfolio } from "@/components/home/stitch/home-stitch-portfolio";
import { HomeStitchServices } from "@/components/home/stitch/home-stitch-services";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: siteConfig.name },
  description:
    "AIBuddy — solo AI studio for strategy, implementation, and shipped AI products. Founder-led, scope-first, production-minded.",
};

export default function HomePage() {
  const whatsappHref = getWhatsAppContactHref();
  const primaryHref = whatsappHref ?? "/contact";
  const primaryLabelHero = whatsappHref
    ? "Message on WhatsApp"
    : "Start a project";
  const primaryLabelCta = whatsappHref
    ? "Message on WhatsApp"
    : "Get in touch";
  const isExternalPrimary = Boolean(whatsappHref);
  const primaryVisual = whatsappHref ? "whatsapp" : "lime";

  return (
    <PageShell fullBleed>
      <HomeStitchHero
        primaryHref={primaryHref}
        primaryLabel={primaryLabelHero}
        isExternalPrimary={isExternalPrimary}
        primaryVisual={primaryVisual}
      />
      <HomeStitchMarquee />
      <HomeStitchServices />
      <HomeStitchAbout />
      <HomeStitchPortfolio />
      <HomeStitchCta
        primaryHref={primaryHref}
        primaryLabel={primaryLabelCta}
        isExternalPrimary={isExternalPrimary}
        primaryVisual={primaryVisual}
      />
    </PageShell>
  );
}
