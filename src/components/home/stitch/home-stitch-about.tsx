import Link from "next/link";

import { StudioIdentityVisual } from "@/components/home/stitch/studio-identity-visual";
import { siteConfig } from "@/config/site";
import { studioIdentity } from "@/config/studio";

export function HomeStitchAbout() {
  return (
    <section className="bg-black px-6 py-28 sm:px-10 md:py-36">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-16">
        <div className="order-2 md:order-1 md:col-span-5">
          <div className="relative">
            <StudioIdentityVisual />
            <div className="absolute top-12 -right-12 hidden bg-[#cafd00] p-10 xl:block">
              <div className="space-y-8">
                {studioIdentity.pillars.map((pillar) => (
                  <div key={pillar.title}>
                    <span className="font-heading block text-2xl font-bold text-[#516700]">
                      {pillar.title}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#516700]/80">
                      {pillar.subtitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="order-1 md:order-2 md:col-span-7">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[#cafd00]">
            {studioIdentity.attribution}
          </p>
          <h2 className="font-stitch-display mb-10 text-5xl font-bold uppercase text-white md:mb-12 md:text-7xl">
            Independent
            <br />
            <span className="text-[#cafd00]">AI studio</span>
          </h2>
          <div className="max-w-xl space-y-7 text-base leading-relaxed text-stitch-muted sm:text-lg">
            <p>
              <span className="text-white/90">{siteConfig.name}</span> is an
              independent practice focused on strategy, design, and implementation
              for AI products and automation — small studio footprint, direct
              execution.
            </p>
            <p>
              Engagements are scoped in plain language. Demos and the Image to Prompt
              tool on this site are real routes you can open today — not theatrical
              case studies or invented performance metrics.
            </p>
            <p>
              {studioIdentity.descriptor}: structured discovery, shipped software,
              and conversion-minded instrumentation when it matters.
            </p>
            <div className="border-t border-[#494847] pt-8">
              <span className="font-heading mb-2 block text-lg font-bold uppercase tracking-tight text-white">
                {siteConfig.name} · {studioIdentity.operator}
              </span>
              <Link
                href="/about"
                className="text-xs font-bold uppercase tracking-widest text-[#cafd00] hover:underline"
              >
                Studio &amp; approach
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
