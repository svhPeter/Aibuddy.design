export const siteConfig = {
  /** Primary product / site brand (UI, metadata titles). */
  name: "AIBuddy",
  /** Public domain — footer, email context, screen-reader disambiguation. */
  domain: "aibuddy.design",
  description:
    "AIBuddy is an independent AI studio — strategy, design, and implementation. Direct execution, honest scoping, production-minded delivery.",
  /** Canonical site URL — set NEXT_PUBLIC_SITE_URL in production. */
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://aibuddy.design",
  locale: "en_US",
  founder: {
    /** Real operator name — used where biography is appropriate; not a fictional persona. */
    name: "Sami",
  },
  links: {
    /** Direct inbox — no third-party transactional email; contact uses mailto + WhatsApp. */
    email: "svhdavid.vh@gmail.com",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/**
 * Full WhatsApp chat URL (e.g. https://wa.me/15551234567).
 * Set NEXT_PUBLIC_WHATSAPP_URL in the environment. When unset, UI falls back to email/contact.
 */
export function getWhatsAppContactHref(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}
