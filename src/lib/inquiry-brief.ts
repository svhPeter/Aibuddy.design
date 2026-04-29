/** Build the plain-text brief for email, WhatsApp, and clipboard. */

export type InquiryBriefInput = {
  name: string;
  email: string;
  company: string;
  projectTypeLabel: string;
  timelineLabel: string;
  budgetLabel: string;
  goal: string;
  extras: string;
};

export function buildInquiryBody(input: InquiryBriefInput): string {
  const {
    name,
    email,
    company,
    projectTypeLabel,
    timelineLabel,
    budgetLabel,
    goal,
    extras,
  } = input;

  const lines: string[] = [
    "AIBUDDY — project inquiry",
    "—".repeat(28),
    `Name: ${name}`,
    `Email: ${email}`,
    `Company / role: ${company.trim() || "—"}`,
    `Project type: ${projectTypeLabel}`,
    `Timeline: ${timelineLabel}`,
    `Budget: ${budgetLabel}`,
    "",
    "Project goal:",
    goal.trim() || "—",
    "",
    "Anything else:",
    extras.trim() || "—",
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
