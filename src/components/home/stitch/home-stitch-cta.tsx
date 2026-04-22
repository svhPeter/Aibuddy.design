import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeStitchCtaProps = {
  primaryHref: string;
  primaryLabel: string;
  isExternalPrimary: boolean;
  primaryVisual: "lime" | "whatsapp";
};

/**
 * Lime-band CTA matches Stitch (black pill on neon field). WhatsApp keeps the
 * same destination but uses the black treatment + green icon so the section
 * stays visually coherent with the export.
 */
export function HomeStitchCta({
  primaryHref,
  primaryLabel,
  isExternalPrimary,
  primaryVisual,
}: HomeStitchCtaProps) {
  return (
    <section className="relative overflow-x-hidden bg-[#cafd00] px-4 py-20 sm:px-6 md:py-32 lg:py-40">
      <div className="relative z-10 mx-auto max-w-7xl min-w-0 px-1 text-center sm:px-4">
        <h2 className="font-stitch-display mb-8 text-balance text-[clamp(2rem,min(12vw,4.5rem),9rem)] font-bold uppercase leading-[0.95] text-[#516700] sm:mb-10 md:mb-12">
          Ready to
          <br />
          accelerate?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-sm font-bold uppercase leading-snug tracking-widest text-[#516700] sm:mb-12 sm:text-base md:mb-16 md:text-lg">
          Share timeline and constraints — get a direct, practical response.
        </p>
        <Link
          href={primaryHref}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "inline-flex w-full max-w-md items-center justify-center gap-3 rounded-none border-2 border-[#0e0e0e] bg-[#0e0e0e] px-6 py-5 font-heading text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[6px_6px_0_0_rgba(81,103,0,0.35)] hover:bg-[#201f1f] hover:shadow-[4px_4px_0_0_rgba(81,103,0,0.45)] sm:w-auto sm:max-w-none sm:px-14 sm:py-6 sm:text-sm sm:tracking-[0.28em]",
            primaryVisual === "whatsapp" && "gap-3 sm:pl-12 sm:pr-14",
          )}
          {...(isExternalPrimary
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {primaryVisual === "whatsapp" ? (
            <MessageCircle
              className="size-5 shrink-0 text-[#25D366]"
              strokeWidth={2}
              aria-hidden
            />
          ) : null}
          {primaryLabel}
        </Link>
        {primaryVisual === "whatsapp" ? (
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-[#516700]/85">
            Opens WhatsApp in a new tab
          </p>
        ) : null}
        <p className="mt-6 px-1 md:mt-10">
          <Link
            href="/contact#message-form"
            className="text-balance text-xs font-bold uppercase tracking-widest text-[#516700] underline-offset-4 hover:underline sm:text-sm"
          >
            Or draft a message on the contact page
          </Link>
        </p>
      </div>
      <div
        className="pointer-events-none absolute -right-20 -bottom-20 size-96 rotate-45 border-none bg-[#516700]/10"
        aria-hidden
      />
    </section>
  );
}
