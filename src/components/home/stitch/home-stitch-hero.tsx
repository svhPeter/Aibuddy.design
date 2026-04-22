import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { studioIdentity } from "@/config/studio";
import { cn } from "@/lib/utils";

/** Local geometric asset — not a stock portrait or fake client scene. */
const HERO_VISUAL_SRC = "/home/hero-visual.svg";

const whatsappPrimaryClass =
  "bg-[#25D366] text-white shadow-[0_0_0_1px_rgba(202,253,0,0.45)] ring-2 ring-[#cafd00]/35 ring-offset-2 ring-offset-[#0e0e0e] hover:bg-[#20BD5A] hover:shadow-[0_0_0_1px_rgba(202,253,0,0.65)] focus-visible:ring-[#25D366]/35";

type HomeStitchHeroProps = {
  primaryHref: string;
  primaryLabel: string;
  isExternalPrimary: boolean;
  primaryVisual: "lime" | "whatsapp";
};

export function HomeStitchHero({
  primaryHref,
  primaryLabel,
  isExternalPrimary,
  primaryVisual,
}: HomeStitchHeroProps) {
  return (
    <header className="relative flex min-h-[min(100dvh,960px)] items-start px-4 pt-28 pb-16 editorial-grid sm:px-6 sm:pt-32 sm:pb-20 md:min-h-screen md:items-center md:px-10 md:pt-36 md:pb-28">
      <div className="mx-auto grid w-full min-w-0 max-w-7xl grid-cols-1 items-start gap-8 sm:gap-10 md:grid-cols-12 md:items-center md:gap-x-16 md:gap-y-12">
        <div className="z-10 min-w-0 md:col-span-7">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-[#cafd00]">
            {siteConfig.name} · {studioIdentity.descriptor}
          </p>
          <h1 className="font-stitch-display text-balance text-[clamp(1.875rem,calc(0.35rem+8vw),8.5rem)] font-bold uppercase leading-[0.92] text-white">
            Architecting <br />
            <span className="text-[#cafd00]">intelligence</span>
          </h1>
          <p className="mt-6 max-w-lg text-base font-normal leading-relaxed text-white/75 sm:mt-9 sm:text-lg md:text-xl">
            Strategy, design, and implementation for websites, chatbots, and
            automation — honest scoping, shipped work, no inflated claims.
          </p>
          <div className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:mt-12 sm:flex-row sm:flex-wrap sm:gap-6">
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "w-full justify-center rounded-none px-6 py-5 font-heading text-sm font-bold uppercase tracking-widest hover:opacity-95 sm:w-auto sm:min-w-[12rem] sm:px-10 sm:py-6",
                primaryVisual === "whatsapp"
                  ? whatsappPrimaryClass
                  : "bg-[#cafd00] text-[#516700] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-[#f3ffca]",
              )}
              {...(isExternalPrimary
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {primaryLabel}
            </Link>
            <Link
              href="/about"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full justify-center rounded-none border-2 border-[#777575] bg-transparent px-6 py-5 font-heading text-sm font-bold uppercase tracking-widest text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] hover:border-[#adaaaa] hover:bg-[#201f1f] sm:w-auto sm:min-w-[12rem] sm:px-10 sm:py-6",
              )}
            >
              Studio &amp; approach
            </Link>
          </div>
        </div>
        <div className="relative aspect-square min-w-0 md:col-span-5">
          <div
            aria-hidden
            className="absolute inset-0 bg-[#cafd00]/[0.08]"
          />
          <div className="relative h-full w-full ring-1 ring-white/10">
            <Image
              src={HERO_VISUAL_SRC}
              alt=""
              width={800}
              height={800}
              className="h-full w-full border-none object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
              priority
            />
          </div>
          <div className="absolute -bottom-6 -left-6 hidden bg-[#131313] p-7 shadow-[8px_8px_0_0_#cafd00] lg:block xl:-bottom-8 xl:-left-8 xl:p-8">
            <span className="font-heading block text-3xl font-bold text-[#cafd00] xl:text-4xl">
              Written scope
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-stitch-muted">
              Clear deliverables
            </span>
          </div>
        </div>
      </div>
      <span className="sr-only">{siteConfig.name}</span>
    </header>
  );
}
