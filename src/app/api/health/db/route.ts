import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getLastEnsureProfileError } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Production DB diagnostic. Returns whether the app's Prisma client can
 * actually reach the configured Postgres, plus a sample of structural facts.
 *
 * Token-gated: requires `?token=…` to match `process.env.DEBUG_TOKEN`. If
 * `DEBUG_TOKEN` is unset, the endpoint is disabled (returns 404). This keeps
 * raw error text and table counts off the public internet while still being
 * trivially callable from a terminal during incident response.
 *
 * Usage:
 *   curl "https://<your-domain>/api/health/db?token=$DEBUG_TOKEN"
 */
export async function GET(request: Request) {
  const expected = process.env.DEBUG_TOKEN;
  if (!expected) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("token") !== expected) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const env = {
    DATABASE_URL: process.env.DATABASE_URL ? "set" : "missing",
    DIRECT_URL: process.env.DIRECT_URL ? "set" : "missing",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "set"
      : "missing",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "set"
      : "missing",
    NODE_ENV: process.env.NODE_ENV ?? "(unset)",
    VERCEL_ENV: process.env.VERCEL_ENV ?? "(unset)",
    VERCEL_REGION: process.env.VERCEL_REGION ?? "(unset)",
  };

  // #region agent log — Parse DATABASE_URL shape so we can diagnose H1/H2/H3
  // without ever returning the password. Only structural facts.
  const rawUrl = process.env.DATABASE_URL ?? "";
  const urlShape = (() => {
    const leadingQuote = rawUrl.startsWith('"') || rawUrl.startsWith("'");
    const trailingQuote = rawUrl.endsWith('"') || rawUrl.endsWith("'");
    const hasBrackets = rawUrl.includes("[") || rawUrl.includes("]");
    const hasWhitespace = /\s/.test(rawUrl);
    try {
      const u = new URL(rawUrl);
      return {
        parseOk: true,
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        params: Array.from(u.searchParams.keys()),
        passwordEncoded:
          u.password !== decodeURIComponent(u.password).replace(/[^\s]/g, (c) =>
            c,
          ),
        usernameHasAt: u.username.includes("@"),
        leadingQuote,
        trailingQuote,
        hasBrackets,
        hasWhitespace,
        length: rawUrl.length,
      };
    } catch (e) {
      return {
        parseOk: false,
        error: e instanceof Error ? e.message : String(e),
        leadingQuote,
        trailingQuote,
        hasBrackets,
        hasWhitespace,
        length: rawUrl.length,
      };
    }
  })();
  // #endregion

  // Round-trip a trivial query to prove the connection works at all.
  let db: Record<string, unknown>;
  try {
    const ping = await prisma.$queryRawUnsafe<Array<{ now: Date }>>(
      "select now()",
    );
    db = { status: "ok", now: ping?.[0]?.now ?? null };
  } catch (e) {
    db = { status: "error", error: errorShape(e) };
  }

  // Probe each app table individually so a missing-table error is obvious.
  const counts: Record<string, number | string> = {};
  const probes: Array<[string, () => Promise<number>]> = [
    ["profiles", () => prisma.profile.count()],
    ["usage_logs", () => prisma.usageLog.count()],
    ["credit_transactions", () => prisma.creditTransaction.count()],
  ];
  for (const [label, fn] of probes) {
    try {
      counts[label] = await fn();
    } catch (e) {
      counts[label] = `error: ${errorShape(e).message}`;
    }
  }

  const schema = {
    status:
      typeof counts.profiles === "number" ? "ok" : "missing_or_unreadable",
  };

  const allOk =
    (db as { status: string }).status === "ok" && schema.status === "ok";

  return NextResponse.json(
    {
      ok: allOk,
      env,
      urlShape,
      db,
      schema,
      counts,
      lastEnsureProfileError: getLastEnsureProfileError(),
    },
    { status: allOk ? 200 : 500 },
  );
}

function errorShape(e: unknown): {
  name: string;
  message: string;
  code?: string;
  meta?: unknown;
} {
  if (e instanceof Error) {
    const maybeCode = (e as unknown as { code?: unknown }).code;
    const maybeMeta = (e as unknown as { meta?: unknown }).meta;
    const code = typeof maybeCode === "string" ? maybeCode : undefined;
    return { name: e.name, message: e.message, code, meta: maybeMeta };
  }
  return { name: "Unknown", message: String(e) };
}
