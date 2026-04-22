/** UTC calendar month key `YYYY-MM`. */
export function currentYearMonthUtc(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  return `${y}-${String(m).padStart(2, "0")}`;
}

export const GUEST_COOKIE_NAME = "aibuddy_guest_id";

/** Guest: combined uses per month (utility + AI) across eligible tools. */
export const GUEST_MONTHLY_TOTAL = 3;

/** Free account: utility uses (browser tools) per month. */
export const FREE_UTILITY_MONTHLY = 25;

/** Free account: AI uses (Bytez + Gemini tools) per month. */
export const FREE_AI_MONTHLY = 5;

/** Default Pro monthly AI cap (effectively unlimited; override per profile or env). */
export function defaultProAiMonthlyCap(): number {
  const raw = process.env.PRO_AI_MONTHLY_QUOTA?.trim();
  if (raw && /^\d+$/.test(raw)) return Math.max(1, parseInt(raw, 10));
  return 50_000;
}
