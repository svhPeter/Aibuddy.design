import { siteConfig } from "@/config/site";

/**
 * Default Open Graph / Twitter card image — file under `public/` (e.g. `og.png`).
 * Recommended: 1200×630, JPG or PNG, under 1 MB.
 *
 * Set to `null` to omit `og:image` / `twitter:image` until the asset exists
 * (avoids broken previews).
 */
export const OPEN_GRAPH_IMAGE_PATH: string | null = "/og.png";

const OG_DIMS = { width: 1200, height: 630 } as const;

/** Spread into root `metadata.openGraph` when `OPEN_GRAPH_IMAGE_PATH` is set. */
export function openGraphImageFields() {
  if (!OPEN_GRAPH_IMAGE_PATH) return {};
  return {
    images: [
      {
        url: OPEN_GRAPH_IMAGE_PATH,
        ...OG_DIMS,
        alt: siteConfig.name,
      },
    ],
  };
}

/** Spread into root `metadata.twitter` when `OPEN_GRAPH_IMAGE_PATH` is set. */
export function twitterImageFields() {
  if (!OPEN_GRAPH_IMAGE_PATH) return {};
  return { images: [OPEN_GRAPH_IMAGE_PATH] };
}
