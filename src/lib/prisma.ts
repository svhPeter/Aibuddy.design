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
