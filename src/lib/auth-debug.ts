/**
 * Captures the last failure inside the OAuth callback route so
 * /api/health/db can surface it to a token-gated caller during incident
 * response. Kept in module state — per-instance, lost on cold start, which
 * is exactly what we want (no persistence, no secrets, fresh on redeploy).
 *
 * Only safe-to-expose fields are stored: no cookies, no tokens, no code.
 */

export type CallbackErrorShape = {
  at: string;
  stage: "provider" | "missing_code" | "exchange" | "ensure_profile";
  name?: string;
  message: string;
  code?: string;
  status?: number;
};

let lastCallbackError: CallbackErrorShape | null = null;

export function getLastCallbackError(): CallbackErrorShape | null {
  return lastCallbackError;
}

export function setLastCallbackError(
  stage: CallbackErrorShape["stage"],
  error: unknown,
  extras?: { message?: string; code?: string; status?: number },
): void {
  const base: CallbackErrorShape = {
    at: new Date().toISOString(),
    stage,
    message: extras?.message ?? "unknown",
  };

  if (error instanceof Error) {
    base.name = error.name;
    base.message = error.message || base.message;
    const maybeCode = (error as unknown as { code?: unknown }).code;
    if (typeof maybeCode === "string") base.code = maybeCode;
    const maybeStatus = (error as unknown as { status?: unknown }).status;
    if (typeof maybeStatus === "number") base.status = maybeStatus;
  } else if (error != null) {
    base.message = extras?.message ?? String(error);
  }

  if (extras?.code) base.code = extras.code;
  if (extras?.status !== undefined) base.status = extras.status;

  lastCallbackError = base;
}
