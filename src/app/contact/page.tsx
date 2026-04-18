import type { Metadata } from "next";

import { ContactChannels } from "@/components/conversion/contact-channels";
import { ContactForm } from "@/components/conversion/contact-form";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact AIBuddy on WhatsApp (when configured) or email svhdavid.vh@gmail.com — solo studio, direct replies.",
};

export default function ContactPage() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <PageShell>
      <PageHeading
        eyebrow="Contact"
        title="Let’s find the right next step"
        description="Choose WhatsApp, direct email, or draft a message in your own mail app — no middle inbox."
      />

      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        <aside className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-lg border-2 border-border bg-card p-8 shadow-sm sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-12 top-0 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.72_0.18_195/0.1),transparent_70%)]"
            />
            <div className="relative">
              <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                Direct contact
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                For quick alignment or sharing links and screenshots, WhatsApp is
                usually fastest. Email or the draft form work well for longer briefs.
              </p>
              <div className="mt-8">
                <ContactChannels />
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-7">
          <ContactForm
            whatsappHref={whatsappHref}
            studioEmail={siteConfig.links.email}
          />
        </div>
      </div>
    </PageShell>
  );
}
