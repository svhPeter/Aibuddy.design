/**
 * Single source of truth for Stitch portfolio tiles — homepage and /portfolio.
 * Visuals are local abstract PNGs (not screenshots posing as client work).
 */

/** Homepage portfolio heading + /portfolio page — one narrative (copy only; tiles are `portfolioTiles`). */
export const portfolioStory = {
  homeSectionTitle: "Selected works",
  homeSectionSubtitle:
    "Demos, a public tool, and how we work — abstract previews, not client confidentiality claims.",
  pageMetadataDescription:
    "Demos, services, Image to Prompt, and an external personal portfolio — illustrative work, not client case studies.",
  /** Short document title for browser tabs (root template adds · AIBuddy). */
  pageDocumentTitle: "Portfolio",
  pageEyebrow: "Portfolio",
  pageTitle: "Demos & explorations",
  pageIntro:
    "Same work as the homepage portfolio — product-style demos, Image to Prompt, how we work (services), and a personal portfolio link. Illustrative and evaluation-focused, not attributed client engagements.",
} as const;

/** Personal / external portfolio — not client work. */
export const portfolioPersonalSite = {
  id: "svh-portfolio",
  title: "SVH Portfolio",
  eyebrow: "Personal portfolio",
  description:
    "Personal portfolio showcasing design, frontend, and product work.",
  href: "https://sami-portfolio-lime.vercel.app/",
  imageSrc: "/home/portfolio/svh-portfolio.png",
  span: "full" as const,
  external: true,
};

export const portfolioTiles = [
  {
    id: "clinic-demo",
    href: "/demo/clinic",
    eyebrow: "Demonstration",
    title: "AI Clinic Demo",
    imageSrc: "/home/portfolio/clinic-demo.png",
    span: "lg" as const,
  },
  {
    id: "real-estate-demo",
    href: "/demo/real-estate",
    eyebrow: "Demonstration",
    title: "Real Estate Demo",
    imageSrc: "/home/portfolio/real-estate-demo.png",
    span: "sm" as const,
  },
  {
    id: "image-to-prompt",
    href: "/tools/image-to-prompt",
    eyebrow: "Studio utility",
    title: "Image to Prompt",
    imageSrc: "/home/portfolio/image-to-prompt.png",
    span: "sm" as const,
  },
  {
    id: "studio-system",
    href: "/services",
    eyebrow: "How we work",
    title: "AIBuddy Studio System",
    imageSrc: "/home/portfolio/studio-system.png",
    span: "lg" as const,
  },
  {
    ...portfolioPersonalSite,
  },
] as const;

export type PortfolioTile = (typeof portfolioTiles)[number];
