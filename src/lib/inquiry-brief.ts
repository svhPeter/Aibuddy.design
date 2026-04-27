/** Build the plain-text brief for email, WhatsApp, and clipboard. */

export type InquiryBriefInput = {
  title: string;
  projectTypeLabel: string;
  description: string;
  deliverables: string[];
  deadline: string;
  budgetLabel: string;
  rightsLabel: string;
  visualReferences: string[];
};

export function buildInquiryBody(input: InquiryBriefInput): string {
  const {
    title,
    projectTypeLabel,
    description,
    deliverables,
    deadline,
    budgetLabel,
    rightsLabel,
    visualReferences,
  } = input;
  const lines: string[] = [
    "AIBUDDY — project inquiry",
    "—".repeat(28),
    `Title: ${title}`,
    `Type: ${projectTypeLabel}`,
    "",
    "Description:",
    description.trim() || "—",
    "",
    "Deliverables:",
    deliverables.length > 0 ? deliverables.join(", ") : "—",
    "",
    `Target deadline: ${deadline || "—"}`,
    `Budget: ${budgetLabel || "—"}`,
    `Engagement / terms: ${rightsLabel || "—"}`,
    "",
    "Links & references:",
    visualReferences.length > 0
      ? visualReferences.map((u) => `• ${u}`).join("\n")
      : "—",
    "",
    "—",
    "Sent from aibuddy.design/inquiry",
  ];
  return lines.join("\n");
}

/** Reads a public WhatsApp deep link (https://wa.me/… or custom chat link). */
export function getWhatsappBaseUrl(): string | undefined {
  const raw = (
    import.meta.env.VITE_WHATSAPP_URL?.trim() ||
    import.meta.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    ""
  ).replace(/\s/g, "");
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^wa\.me\//i.test(raw) || /^api\.whatsapp\.com\//i.test(raw)) {
    return `https://${raw.replace(/^https?:\/\//i, "")}`;
  }
  return undefined;
}

/**
 * Appends a `text` query to any WhatsApp / send URL.
 * e.g. https://wa.me/123 → …?text=…
 */
export function appendTextToWhatsappUrl(base: string, text: string): string {
  const b = base.trim();
  const sep = b.includes("?") ? "&" : "?";
  return `${b}${sep}text=${encodeURIComponent(text)}`;
}

export function buildInquiryMailto(
  to: string,
  subject: string,
  body: string
): string {
  return `mailto:${to}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}
