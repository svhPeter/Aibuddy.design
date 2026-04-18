export type ServiceItem = {
  id: string;
  title: string;
  summary: string;
  /** Short bullets for scan-friendly value props on marketing pages */
  valuePoints: readonly [string, string, string];
};

/** Curated list for marketing pages — extend as offerings solidify. */
export const services: readonly ServiceItem[] = [
  {
    id: "strategy",
    title: "AI strategy & discovery",
    summary:
      "Clarify outcomes, constraints, and a pragmatic roadmap before writing code.",
    valuePoints: [
      "Align stakeholders on what to build (and what to skip)",
      "Map risks, data, and integration constraints early",
      "Leave with a sequenced plan you can fund and execute",
    ],
  },
  {
    id: "build",
    title: "Product implementation",
    summary:
      "Ship reliable interfaces, APIs, and agent workflows with clear ownership.",
    valuePoints: [
      "Production-minded UX, APIs, and agent workflows",
      "Clear handoffs: you always know what shipped and why",
      "Documentation and ownership that survive the first release",
    ],
  },
  {
    id: "conversion",
    title: "Conversion & instrumentation",
    summary:
      "Measure what matters and iterate on funnels without guesswork.",
    valuePoints: [
      "Funnel visibility: events, experiments, and honest reporting",
      "Iteration loops tied to business outcomes — not vanity charts",
      "Practical instrumentation without analytics theater",
    ],
  },
] as const;
