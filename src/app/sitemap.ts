import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

const paths = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/services", changeFrequency: "monthly" as const, priority: 0.85 },
  { path: "/portfolio", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/about", changeFrequency: "monthly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.9 },
  { path: "/tools", changeFrequency: "monthly" as const, priority: 0.65 },
  { path: "/tools/image-compressor", changeFrequency: "monthly" as const, priority: 0.72 },
  { path: "/tools/image-enlarger", changeFrequency: "monthly" as const, priority: 0.72 },
  { path: "/tools/image-to-prompt", changeFrequency: "monthly" as const, priority: 0.7 },
  { path: "/demo/clinic", changeFrequency: "yearly" as const, priority: 0.5 },
  { path: "/demo/real-estate", changeFrequency: "yearly" as const, priority: 0.5 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  return paths.map(({ path, changeFrequency, priority }) => ({
    url: path === "/" ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
