export const siteConfig = {
  name: "AIBuddy",
  domain: "aibuddy.design",
  description:
    "AIBuddy is an independent AI studio — strategy, design, and implementation. Direct execution, honest scoping, production-minded delivery.",
  links: {
    email: "sami.vh@yahoo.com",
    url: "https://aibuddy.design",
  },
  locationLabel: "Founder-led. Based in the US. Working globally.",
} as const;

export type SiteConfig = typeof siteConfig;
