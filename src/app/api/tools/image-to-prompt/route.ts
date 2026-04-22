import { NextResponse } from "next/server";

import { getRegistryEntryById } from "@/config/tool-registry";
import {
  GeminiImagePromptError,
  GeminiNotConfiguredError,
  generateImagePromptFromImage,
} from "@/lib/ai";
import { getAuthAndGuestKey } from "@/lib/access/request-context";
import {
  consumeToolUse,
  httpStatusForDenied,
  refundToolUse,
} from "@/lib/access/usage";
import { checkRateLimit, getClientKey } from "@/lib/rate-limiter";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateImagePromptFile } from "@/lib/validate-image-prompt-file";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Conservative daily cap per client IP.
 *
 * Backed by an in-memory store (see `src/lib/rate-limiter.ts`). This cap is
 * only enforced reliably on single-instance deployments. On serverless /
 * multi-instance hosts each process has its own counter, so the effective
 * cap is LIMIT_PER_DAY × (warm instances). Treat this as cost-protection on
 * a single VM, not as a hard ceiling in production at scale.
 */
const LIMIT_PER_DAY = 15;

const registryEntry = getRegistryEntryById("image-to-prompt");
const TOOL_ID = registryEntry?.id ?? "image-to-prompt";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please sign in to generate prompts.",
        code: "UNAUTHENTICATED",
      },
      { status: 401 },
    );
  }

  const clientKey = getClientKey(request.headers);
  const limited = checkRateLimit(
    `image-prompt:${clientKey}`,
    LIMIT_PER_DAY,
    DAY_MS,
  );
  if (!limited.ok) {
    const retryAfterSec = Math.max(1, Math.ceil(limited.retryAfterMs / 1000));
    return NextResponse.json(
      {
        ok: false,
        error:
          "You've hit today's limit. Come back tomorrow, or get in touch if you need more.",
        code: "RATE_LIMIT",
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      {
        ok: false,
        error: "Expected multipart/form-data.",
        code: "BAD_REQUEST",
      },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not parse form data.",
        code: "BAD_REQUEST",
      },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing image file.",
        code: "MISSING_FILE",
      },
      { status: 400 },
    );
  }

  const validation = validateImagePromptFile(file);
  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: validation.error,
        code: "INVALID_FILE",
      },
      { status: 400 },
    );
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Could not read the file. Try a smaller image.",
        code: "READ_FAILED",
      },
      { status: 400 },
    );
  }

  const { guestKey } = await getAuthAndGuestKey(request);
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

  try {
    const result = await generateImagePromptFromImage(
      new Uint8Array(buffer),
      file.type.toLowerCase(),
    );
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    await refundToolUse({
      toolId: TOOL_ID,
      user,
      guestKey,
      snapshot,
    });
    if (error instanceof GeminiNotConfiguredError) {
      console.error("[image-to-prompt] not configured:", error);
      return NextResponse.json(
        {
          ok: false,
          error: "This tool is temporarily unavailable. Please check back soon.",
          code: "NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }
    if (error instanceof GeminiImagePromptError) {
      console.error(
        `[image-to-prompt] ${error.code}:`,
        error.cause ?? error,
      );
      const mapped = mapGeminiError(error.code);
      return NextResponse.json(
        {
          ok: false,
          error: mapped.message,
          code: error.code,
        },
        { status: mapped.status },
      );
    }
    console.error("[image-to-prompt] unexpected:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Something went wrong. Please try again.",
        code: "UNKNOWN",
      },
      { status: 500 },
    );
  }
}

/** Map internal error codes to user-facing copy. No raw upstream text is exposed. */
function mapGeminiError(code: string): { message: string; status: number } {
  switch (code) {
    case "SAFETY_BLOCKED":
      return {
        message: "This image can't be processed. Try a different one.",
        status: 422,
      };
    case "INVALID_KEY":
      return {
        message: "This tool is temporarily unavailable. Please try again later.",
        status: 503,
      };
    case "QUOTA":
      return {
        message: "The service is busy right now. Please try again in a minute.",
        status: 429,
      };
    case "TIMEOUT":
      return {
        message: "The request took too long. Try a smaller image or try again.",
        status: 504,
      };
    case "BAD_IMAGE":
      return {
        message: "We couldn't read that image. Try a different JPG, PNG, or WebP.",
        status: 422,
      };
    case "BAD_RESPONSE":
      return {
        message: "Something went wrong generating the prompt. Please try again.",
        status: 502,
      };
    default:
      return {
        message: "Something went wrong. Please try again.",
        status: 500,
      };
  }
}
