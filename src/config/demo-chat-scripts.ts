/** Scripted chat turns for demo UIs only — no backend, no medical or financial advice. */

export type ChatTurn = {
  id: string;
  /** Short chip label in the UI */
  promptLabel: string;
  userMessage: string;
  botReply: string;
};

export const clinicChatScript: readonly ChatTurn[] = [
  {
    id: "hours",
    promptLabel: "Office hours",
    userMessage: "What are your office hours?",
    botReply:
      "We’re open Monday–Friday 8:00–17:00, and Saturday 9:00–13:00. Holiday hours may vary — this is a scripted demo, not live scheduling.",
  },
  {
    id: "new-patients",
    promptLabel: "New patients",
    userMessage: "Are you accepting new patients?",
    botReply:
      "Yes — we’re welcoming new patients. In a live product, the next step would be intake or scheduling through your EHR or front desk. (Demo reply.)",
  },
  {
    id: "records",
    promptLabel: "Medical records",
    userMessage: "How do I request a copy of my records?",
    botReply:
      "You can submit a records request through our front desk or the form on this site. Allow several business days for processing — this demo does not transmit real data.",
  },
  {
    id: "urgent",
    promptLabel: "Urgent concern",
    userMessage: "I have chest pain — what should I do?",
    botReply:
      "If you believe you’re having a medical emergency, call 911 or go to the nearest emergency department. This assistant is a demonstration only and cannot triage real symptoms.",
  },
] as const;

export const realEstateChatScript: readonly ChatTurn[] = [
  {
    id: "showing",
    promptLabel: "Schedule a tour",
    userMessage: "Can I tour a home this weekend?",
    botReply:
      "Weekend showings are often available with advance notice. In production, this would check an agent calendar and send a confirmation — here it’s a scripted demo.",
  },
  {
    id: "areas",
    promptLabel: "Areas you serve",
    userMessage: "Which neighborhoods do you focus on?",
    botReply:
      "This demo brokerage highlights urban infill and nearby suburbs. Coverage depends on your market — the important part is routing the lead to the right agent inbox.",
  },
  {
    id: "offer",
    promptLabel: "Making an offer",
    userMessage: "I’m pre-approved — how do I make an offer?",
    botReply:
      "Your agent will help structure price, contingencies, and timelines. Nothing here is legal or financial advice — this is a UI demonstration only.",
  },
  {
    id: "fees",
    promptLabel: "Buyer fees",
    userMessage: "What fees should I expect as a buyer?",
    botReply:
      "Costs vary by market and loan type. A live assistant would connect you to your agent or lender for specifics — not provided in this demo.",
  },
] as const;

export const genericDemoFallbackReply =
  "Thanks for your message. In a live deployment, this would route to your team’s inbox or CRM. This page is a scripted demonstration only.";
