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
  buildPromptEnhancerPrompts,
  parsePromptEnhancerBody,
  parsePromptEnhancerJson,
} from "@/lib/tools/prompt-enhancer-server";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
const LIMIT_PER_DAY = 25;

const TOOL_ID = "prompt-enhancer" as const;

export async function POST(request: Request) {
  const clientKey = getClientKey(request.headers);
  const limited = checkRateLimit(
    `prompt-enhancer:${clientKey}`,
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

  const parsed = parsePromptEnhancerBody(json);
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

  const { system, user: userPrompt } = buildPromptEnhancerPrompts(parsed.body);

  try {
    const { text } = await bytezInvokeLlm({ system, user: userPrompt });
    const result = parsePromptEnhancerJson(text);
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
            "Prompt enhancement is not configured on this server. Please check back later.",
          code: "NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }
    if (e instanceof BytezApiError) {
      const status = e.status >= 400 && e.status < 600 ? e.status : 502;
      const errorMessage =
        status === 429
          ? "The AI service is busy. Please try again shortly."
          : status === 402
            ? "AI credits are insufficient. Add credits in your Bytez dashboard and try again."
            : status === 504
              ? "The AI service took too long to respond. Try again."
              : "Generation failed. Please try again.";
      return NextResponse.json(
        { ok: false, error: errorMessage, code: "UPSTREAM_ERROR" },
        {
          status:
            status === 429 ? 429 : status === 402 ? 402 : status === 504 ? 504 : 502,
        },
      );
    }
    console.error("[prompt-enhancer]", e);
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again.", code: "UNKNOWN" },
      { status: 500 },
    );
  }
}
