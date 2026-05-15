import { useEffect } from "react";

type PageMeta = {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
};

const SITE_NAME = "AIBuddy";
const DEFAULT_OG_IMAGE = "https://aibuddy.design/og-image.png";

/**
 * Lightweight per-page metadata hook — no external dependencies.
 * Sets document.title and updates / creates <meta> tags.
 */
export function usePageMeta({ title, description, canonical, ogImage }: PageMeta) {
  useEffect(() => {
    // Title
    document.title = title.includes(SITE_NAME) ? title : `${title} — ${SITE_NAME}`;

    // Helper to upsert <meta> tags
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", description);

    // Open Graph
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:image", ogImage ?? DEFAULT_OG_IMAGE);
    if (canonical) {
      setMeta("property", "og:url", canonical);
    }

    // Twitter Card
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", ogImage ?? DEFAULT_OG_IMAGE);

    // Canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }
  }, [title, description, canonical, ogImage]);
}
