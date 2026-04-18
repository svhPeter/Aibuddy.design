import { Mail, MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig, getWhatsAppContactHref } from "@/config/site";
import { cn } from "@/lib/utils";

const whatsappClass =
  "border-0 bg-[#25D366] text-white shadow-sm hover:bg-[#20BD5A] focus-visible:ring-[#25D366]/35";

export function ContactChannels() {
  const whatsappHref = getWhatsAppContactHref();

  return (
    <div className="flex flex-col gap-3 sm:max-w-md">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        Fastest path
      </p>
      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ size: "lg" }),
            whatsappClass,
            "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
          )}
        >
          <MessageCircle className="size-5" strokeWidth={1.75} aria-hidden />
          Message on WhatsApp
        </a>
      ) : null}
      <a
        href={`mailto:${siteConfig.links.email}`}
        className={cn(
          buttonVariants({ variant: whatsappHref ? "outline" : "default", size: "lg" }),
          "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
          whatsappHref && "border-border/80 bg-background/80 backdrop-blur-sm",
        )}
      >
        <Mail className="size-4" strokeWidth={1.75} aria-hidden />
        Email {siteConfig.links.email}
      </a>
      {whatsappHref ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Prefer async? Use the draft form on this page — opens your email app when
          you continue.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Set{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
            NEXT_PUBLIC_WHATSAPP_URL
          </code>{" "}
          to show WhatsApp here. Until then, email or the draft form on this page
          works great.
        </p>
      )}
      <a
        href="#message-form"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2"
      >
        Skip to message form
      </a>
    </div>
  );
}
