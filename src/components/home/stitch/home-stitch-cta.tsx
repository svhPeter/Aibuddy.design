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
    <section className="relative overflow-hidden bg-[#cafd00] px-6 py-28 md:py-40">
      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <h2 className="font-stitch-display mb-10 text-[clamp(2.75rem,10vw,9rem)] font-bold uppercase text-[#516700] md:mb-12">
          Ready to
          <br />
          accelerate?
        </h2>
        <p className="mb-12 max-w-2xl mx-auto text-base font-bold uppercase tracking-widest text-[#516700] sm:text-lg md:mb-16">
          Share timeline and constraints — get a direct, practical response.
        </p>
        <Link
          href={primaryHref}
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "inline-flex items-center justify-center gap-3 rounded-none border-2 border-[#0e0e0e] bg-[#0e0e0e] px-14 py-6 font-heading text-sm font-bold uppercase tracking-[0.28em] text-white shadow-[6px_6px_0_0_rgba(81,103,0,0.35)] hover:bg-[#201f1f] hover:shadow-[4px_4px_0_0_rgba(81,103,0,0.45)]",
            primaryVisual === "whatsapp" && "gap-3 pl-12 pr-14",
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
        <p className="mt-8 md:mt-10">
          <Link
            href="/contact#message-form"
            className="text-sm font-bold uppercase tracking-widest text-[#516700] underline-offset-4 hover:underline"
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
