/**
 * Studio positioning. AIBuddy is the primary brand; SVH is secondary (about/portfolio).
 */
export const studioIdentity = {
  operator: "SVH",
  /** Secondary identity line — use on about-style sections and portfolio, not the hero. */
  attribution: "Built by SVH",
  /** Neutral studio descriptor (no fake founder story). */
  descriptor: "Independent AI studio",
  /** Capability pillars — positioning, not performance claims. */
  pillars: [
    { title: "Scope-first", subtitle: "Before build" },
    { title: "Production bias", subtitle: "After launch" },
  ] as const,
} as const;

export type StudioIdentity = typeof studioIdentity;
