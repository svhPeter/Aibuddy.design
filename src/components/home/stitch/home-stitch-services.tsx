import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { services } from "@/config/services";

const indices = ["01", "02", "03"] as const;

const titleLines: Record<
  (typeof services)[number]["id"],
  readonly [string, string]
> = {
  strategy: ["AI strategy &", "discovery"],
  build: ["Product", "implementation"],
  conversion: ["Conversion &", "instrumentation"],
};

export function HomeStitchServices() {
  return (
    <section className="bg-[#0e0e0e] px-4 py-20 sm:px-6 sm:py-28 md:px-10 md:py-36">
      <div className="mx-auto min-w-0 max-w-7xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 sm:mb-16 sm:items-end sm:gap-8 md:mb-20 md:flex-row">
          <h2 className="font-stitch-display text-balance text-4xl font-bold uppercase text-white sm:text-5xl md:text-7xl">
            Core
            <br />
            services
          </h2>
          <div className="mb-2 h-1 w-28 shrink-0 bg-[#cafd00]" aria-hidden />
        </div>
        <div className="grid grid-cols-1 gap-px md:grid-cols-3">
          {services.map((service, i) => {
            const [a, b] = titleLines[service.id];
            return (
              <div
                key={service.id}
                className="group bg-[#131313] p-6 ring-1 ring-inset ring-white/[0.04] transition-colors duration-500 hover:bg-[#201f1f] sm:p-10 md:p-12"
              >
                <span className="font-heading mb-8 block text-3xl font-bold text-stitch-muted transition-colors group-hover:text-[#cafd00] sm:mb-12 sm:text-4xl">
                  {indices[i]}
                </span>
                <h3 className="font-heading mb-4 text-2xl font-bold uppercase tracking-tight text-white sm:mb-6 sm:text-3xl">
                  {a}
                  <br />
                  {b}
                </h3>
                <p className="mb-8 leading-relaxed text-stitch-muted">
                  {service.summary}
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#f3ffca] hover:underline"
                >
                  View services
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
