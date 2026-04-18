import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getWhatsAppContactHref, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const whatsappClass =
  "border-0 bg-[#25D366] text-white shadow-sm hover:bg-[#20BD5A] focus-visible:ring-[#25D366]/35";

export function DemoCtaStrip() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-muted/40 via-card to-muted/25 p-8 shadow-sm ring-1 ring-border/35 ring-inset sm:p-10 dark:from-muted/15 dark:via-card dark:to-muted/10"
      aria-labelledby="demo-cta-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.93_0.03_250/0.35),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,oklch(0.35_0.06_250/0.2),transparent_70%)]"
      />
      <div className="relative">
        <h2
          id="demo-cta-heading"
          className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          Talk to AIBuddy about a live version
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          This page is a front-end demonstration. If you want something like this
          for your own brand, reach out — WhatsApp is fastest when it is configured.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                whatsappClass,
                "inline-flex justify-center gap-2",
              )}
            >
              <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden />
              Message on WhatsApp
            </a>
          ) : null}
          <Link
            href="/contact#message-form"
            className={cn(
              buttonVariants({
                variant: whatsappHref ? "outline" : "default",
                size: "lg",
              }),
              "justify-center border-border/80 bg-background/80 backdrop-blur-sm",
            )}
          >
            Contact form
          </Link>
          <a
            href={`mailto:${siteConfig.links.email}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "justify-center text-muted-foreground hover:text-foreground",
            )}
          >
            {siteConfig.links.email}
          </a>
        </div>
      </div>
    </section>
  );
}
