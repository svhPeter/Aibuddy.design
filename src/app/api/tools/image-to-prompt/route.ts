import { NextResponse } from "next/server";

import {
  GeminiImagePromptError,
  GeminiNotConfiguredError,
  generateImagePromptFromImage,
} from "@/lib/gemini-image-prompt";
import { checkRateLimit, getClientKey } from "@/lib/rate-limiter";
import { validateImagePromptFile } from "@/lib/validate-image-prompt-file";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY_MS = 24 * 60 * 60 * 1000;
/** Conservative daily cap per client IP (in-memory). */
const LIMIT_PER_DAY = 15;

export async function POST(request: Request) {
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
        error: `Daily limit reached (${LIMIT_PER_DAY} generations per day). Try again later.`,
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
      { ok: false, error: "Expected multipart/form-data.", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not parse form data.", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing image file.", code: "MISSING_FILE" },
      { status: 400 },
    );
  }

  const validation = validateImagePromptFile(file);
  if (!validation.ok) {
    return NextResponse.json(
      { ok: false, error: validation.error, code: "INVALID_FILE" },
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

  try {
    const result = await generateImagePromptFromImage(
      new Uint8Array(buffer),
      file.type.toLowerCase(),
    );
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    if (error instanceof GeminiNotConfiguredError) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Image to Prompt is not configured (missing GEMINI_API_KEY on the server).",
          code: "NOT_CONFIGURED",
        },
        { status: 503 },
      );
    }
    if (error instanceof GeminiImagePromptError) {
      return NextResponse.json(
        { ok: false, error: error.message, code: "GEMINI_ERROR" },
        { status: 422 },
      );
    }
    throw error;
  }
}
