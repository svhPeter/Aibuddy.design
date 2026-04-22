import { NextResponse } from "next/server";

import {
  BytezApiError,
  BytezNotConfiguredError,
  bytezInvokeLlm,
} from "@/lib/ai/providers/bytez";
import { getAuthAndGuestKey } from "@/lib/access/request-context";
import {
  consumeToolUse,
  httpStatusForDenied,
  refundToolUse,
} from "@/lib/access/usage";
import { checkRateLimit, getClientKey } from "@/lib/rate-limiter";
import {
  buildProductDescriptionPrompts,
  parseProductDescriptionBody,
  parseProductDescriptionJson,
} from "@/lib/tools/product-description-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const LIMIT_PER_DAY = 25;

const TOOL_ID = "product-description-generator" as const;

export async function POST(request: Request) {
  const clientKey = getClientKey(request.headers);
  const limited = checkRateLimit(
    `product-desc:${clientKey}`,
    LIMIT_PER_DAY,
    DAY_MS,
  );
  if (!limited.ok) {
    const retryAfterSec = Math.max(1, Math.ceil(limited.retryAfterMs / 1000));
    return NextResponse.json(
      {
        ok: false,
        error: `Rate limit: up to ${LIMIT_PER_DAY} generations per day per connection. Try again later.`,
        code: "RATE_LIMIT",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Expected JSON body.", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const parsed = parseProductDescriptionBody(json);
  if (!parsed.ok) {
    return NextResponse.json(
      { ok: false, error: parsed.error, code: "INVALID_INPUT" },
      { status: 400 },
    );
  }

  const { user, guestKey } = await getAuthAndGuestKey(request);
  const gate = await consumeToolUse({
    toolId: TOOL_ID,
    user,
    guestKey,
  });
  if (!gate.ok) {
    return NextResponse.json(
      { ok: false, error: gate.message, code: gate.code },
      { status: httpStatusForDenied(gate.code) },
    );
  }
  const snapshot = gate.snapshot;

  const { system, user: userPrompt } = buildProductDescriptionPrompts(
    parsed.body,
  );

  try {
    const { text } = await bytezInvokeLlm({ system, user: userPrompt });
    const result = parseProductDescriptionJson(text);
    if (!result.ok) {
      await refundToolUse({
        toolId: TOOL_ID,
        user,
        guestKey,
        snapshot,
      });
      return NextResponse.json(
        { ok: false, error: result.error, code: "BAD_RESPONSE" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, result: result.result });
  } catch (e) {
    await refundToolUse({
      toolId: TOOL_ID,
      user,
      guestKey,
      snapshot,
    });
    if (e instanceof BytezNotConfiguredError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This tool is temporarily unavailable. Please try again later.",
          code: "NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }
    if (e instanceof BytezApiError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      const errorMessage =
        status === 429
          ? "We're getting a lot of requests right now. Please try again in a moment."
          : status === 402
            ? "This tool is temporarily unavailable. Please try again later."
            : status === 504
              ? "That took longer than expected. Please try once more."
              : "We couldn't generate a result this time. Please try again.";
      return NextResponse.json(
        { ok: false, error: errorMessage, code: "UPSTREAM_ERROR" },
        {
          status:
            status === 429 ? 429 : status === 402 ? 402 : status === 504 ? 504 : 502,
        },
      );
    }
    console.error("[product-description-generator]", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}
