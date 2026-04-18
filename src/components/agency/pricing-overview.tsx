import { SectionLabel } from "@/components/shared/section-label";
import { pricingIntro } from "@/config/pricing";

export function PricingOverview() {
  return (
    <div className="relative overflow-hidden rounded-lg border-2 border-border bg-card p-8 shadow-sm sm:p-10">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.72_0.18_195/0.1),transparent_70%)]"
      />
      <div className="relative">
        <SectionLabel className="mb-3">Pricing</SectionLabel>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
          {pricingIntro.headline}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {pricingIntro.body}
        </p>
        <ul className="mt-8 space-y-4">
          {pricingIntro.tiers.map((tier) => (
            <li
              key={tier.serviceId}
              className="flex flex-col gap-1 border-b border-border/50 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
            >
              <span className="text-sm font-medium text-foreground">{tier.title}</span>
              <span className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {tier.hint}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
