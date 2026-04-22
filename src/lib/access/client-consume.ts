export type ConsumeClientResult =
  | { ok: true }
  | { ok: false; code?: string; message: string };

/**
 * Records one server-side use for a tool (browser or pre-check). Requires
 * same-origin cookies (guest or session).
 */
export async function postUsageConsume(
  toolId: string,
): Promise<ConsumeClientResult> {
  const res = await fetch("/api/usage/consume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ toolId }),
    credentials: "include",
  });
  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    error?: string;
    code?: string;
  } | null;
  if (res.ok && data?.ok) return { ok: true };
  return {
    ok: false,
    code: typeof data?.code === "string" ? data.code : undefined,
    message:
      typeof data?.error === "string"
        ? data.error
        : "Usage limit reached.",
  };
}
