/**
 * Introductory pricing framing — qualitative, scope-first.
 * Replace with concrete figures in one place when you publish public rates.
 */
export const pricingIntro = {
  headline: "How pricing works",
  body: "Every engagement is quoted against a written scope. You approve the plan before work starts — no surprise invoices.",
  tiers: [
    {
      serviceId: "strategy" as const,
      title: "Discovery & strategy",
      hint: "Fixed-scope sprint — fee agreed after a short alignment call.",
    },
    {
      serviceId: "build" as const,
      title: "Product implementation",
      hint: "Milestone billing tied to agreed deliverables and dates.",
    },
    {
      serviceId: "conversion" as const,
      title: "Conversion & instrumentation",
      hint: "Packaged improvements or a light ongoing cadence — matched to funnel complexity.",
    },
  ],
} as const;
