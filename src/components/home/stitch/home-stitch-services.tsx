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
    <section className="bg-[#0e0e0e] px-6 py-28 sm:px-10 md:py-36">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col items-end justify-between gap-8 md:mb-20 md:flex-row">
          <h2 className="font-stitch-display text-5xl font-bold uppercase text-white md:text-7xl">
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
                className="group bg-[#131313] p-10 ring-1 ring-inset ring-white/[0.04] transition-colors duration-500 hover:bg-[#201f1f] md:p-12"
              >
                <span className="font-heading mb-12 block text-4xl font-bold text-stitch-muted transition-colors group-hover:text-[#cafd00]">
                  {indices[i]}
                </span>
                <h3 className="font-heading mb-6 text-3xl font-bold uppercase tracking-tight text-white">
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
