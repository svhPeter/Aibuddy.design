/**
 * In-memory fixed-window rate limiter.
 *
 * ⚠️  DEPLOYMENT CONSTRAINT — READ BEFORE SHIPPING
 *
 * This limiter stores counts in a module-scoped `Map`. It is ONLY reliable when
 * the app runs as a **single long-lived Node process** (VPS, Fly single VM,
 * Railway, Docker on one host, `next start` on one machine, etc.).
 *
 * It is effectively DISABLED on any multi-instance / serverless topology:
 *  - Vercel serverless / edge functions       → each cold start = fresh Map.
 *  - Cloudflare Workers                       → no shared memory at all.
 *  - AWS Lambda / Google Cloud Run (>1 inst.) → per-instance counters only.
 *  - Any autoscaled Kubernetes/ECS deployment → per-pod counters only.
 *
 * Consequence on those hosts: a determined client can exceed the per-IP cap by
 * orders of magnitude, which defeats cost protection on the upstream API.
 *
 * Before launching on a multi-instance host, replace the backing store with a
 * shared one (Upstash Redis is the smallest swap — keep this function signature
 * and change only the `buckets` storage). We deliberately do NOT add Redis yet
 * to keep the launch surface minimal.
 *
 * Additional caveats (true on any topology):
 *  - Keys come from `x-forwarded-for` / `x-real-ip`. Those headers can be
 *    spoofed if the app is not behind a trusted proxy that normalises them.
 *  - IPv6 prefixes are not collapsed; a client with a /64 can rotate addresses.
 *  - No cleanup of expired buckets — memory usage grows with unique IPs until
 *    the process restarts. Fine for modest traffic; revisit if the Map gets
 *    large.
 */

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { ok: true } | { ok: false; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { ok: true };
  }

  return { ok: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
}

/**
 * Best-effort client identifier from request headers.
 *
 * Order: `x-forwarded-for` (first hop) → `x-real-ip` → literal `"unknown"`.
 * Both headers are untrusted unless the app is behind a proxy that sets them
 * from the real connection IP (e.g. Vercel, Cloudflare, nginx with
 * `real_ip_header`). Behind no proxy, every caller collapses to `"unknown"`
 * and shares a single bucket — acceptable as a backstop, not a real defense.
 */
export function getClientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headers.get("x-real-ip") ?? "unknown";
}
