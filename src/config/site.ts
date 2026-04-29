export const siteConfig = {
  name: "AIBuddy",
  domain: "aibuddy.design",
  description:
    "Web, mobile, SaaS, AI, 3D — production-grade code, fast turnaround, no-surprise pricing. Building from Karachi for clients worldwide.",
  links: {
    email: "sami.vh@yahoo.com",
    url: "https://aibuddy.design",
  },
  locationLabel: "Building from Karachi for clients worldwide. UTC+5.",
} as const;

export type SiteConfig = typeof siteConfig;
