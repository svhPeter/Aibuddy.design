import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Redacts the password and trims params from a Postgres URL so it's safe to
 * log on boot — useful for verifying that production is hitting the URL we
 * expect (right host, right port, right database).
 */
function redactPgUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.username}:***@${u.host}${u.pathname}${
      u.searchParams.has("pgbouncer") ? "?pgbouncer=…" : ""
    }`;
  } catch {
    return "<unparseable DATABASE_URL>";
  }
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Supabase pooled URL to .env or your hosting provider's env settings.",
    );
  }

  // #region agent log
  try {
    const parsed = (() => {
      try {
        const u = new URL(url);
        return {
          protocol: u.protocol,
          hostname: u.hostname,
          port: u.port,
          pathname: u.pathname,
          hasPgbouncer: u.searchParams.has("pgbouncer"),
          leadingQuote: url.startsWith('"') || url.startsWith("'"),
          trailingQuote: url.endsWith('"') || url.endsWith("'"),
          hasBrackets: url.includes("["),
          length: url.length,
        };
      } catch {
        return { parseError: true, length: url.length };
      }
    })();
    fetch(
      "http://127.0.0.1:7597/ingest/0713d568-669d-4c56-8119-14d5e787208a",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "ad1c0a",
        },
        body: JSON.stringify({
          sessionId: "ad1c0a",
          hypothesisId: "H1,H2,H3",
          location: "src/lib/prisma.ts:createPrismaClient",
          message: "DATABASE_URL parse check",
          data: {
            parsed,
            nodeEnv: process.env.NODE_ENV ?? null,
            vercelEnv: process.env.VERCEL_ENV ?? null,
            vercelRegion: process.env.VERCEL_REGION ?? null,
          },
          timestamp: Date.now(),
        }),
      },
    ).catch(() => {});
  } catch {
    /* ignore */
  }
  // #endregion

  // Serverless-friendly pg pool config:
  // - max: 1 — every Vercel function instance gets its own pool, so a single
  //   connection per instance avoids thrashing pgBouncer.
  // - idleTimeoutMillis: 10s — release the connection promptly on cold-start.
  // - connectionTimeoutMillis: 8s — fail fast and surface a real error
  //   instead of hanging the request until Vercel's 10s timeout fires.
  const adapter = new PrismaPg({
    connectionString: url,
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });

  if (process.env.NODE_ENV !== "test") {
    console.log(
      "[prisma] connecting via pg adapter →",
      redactPgUrl(url),
      "node_env=",
      process.env.NODE_ENV ?? "(unset)",
    );
  }

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
