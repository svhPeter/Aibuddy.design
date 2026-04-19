import { ApiError, FinishReason, GoogleGenAI, Type, type Schema } from "@google/genai";

export class GeminiNotConfiguredError extends Error {
  constructor(message = "GEMINI_API_KEY is not set.") {
    super(message);
    this.name = "GeminiNotConfiguredError";
  }
}

/** Stable, non-leaking categories for the API route to map to user copy. */
export type GeminiErrorCode =
  | "SAFETY_BLOCKED"
  | "INVALID_KEY"
  | "QUOTA"
  | "TIMEOUT"
  | "BAD_IMAGE"
  | "BAD_RESPONSE"
  | "UNKNOWN";

export class GeminiImagePromptError extends Error {
  readonly code: GeminiErrorCode;
  constructor(code: GeminiErrorCode, cause?: unknown) {
    super(code);
    this.name = "GeminiImagePromptError";
    this.code = code;
    if (cause !== undefined) this.cause = cause;
  }
}

function classifyThrown(e: unknown): GeminiErrorCode {
  if (e instanceof ApiError) {
    const s = e.status;
    if (s === 401 || s === 403) return "INVALID_KEY";
    if (s === 429) return "QUOTA";
    if (s === 408 || s === 504) return "TIMEOUT";
    if (s === 400) return "BAD_IMAGE";
    return "UNKNOWN";
  }
  const msg = (e instanceof Error ? e.message : String(e ?? "")).toLowerCase();
  if (msg.includes("api key") || msg.includes("api_key")) return "INVALID_KEY";
  if (msg.includes("quota") || msg.includes("resource_exhausted")) return "QUOTA";
  if (msg.includes("deadline") || msg.includes("timeout") || msg.includes("aborted")) return "TIMEOUT";
  if (msg.includes("safety") || msg.includes("blocked") || msg.includes("prohibited")) return "SAFETY_BLOCKED";
  return "UNKNOWN";
}

export type ImagePromptResult = {
  shortPrompt: string;
  detailedUniversalPrompt: string;
  negativePrompt: string | null;
  quickTags: string[];
};

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    shortPrompt: {
      type: Type.STRING,
      description: "Concise, natural prompt for quick use",
    },
    detailedUniversalPrompt: {
      type: Type.STRING,
      description:
        "Richer universal prompt: subject, composition, lighting, style, background, mood, details",
    },
    negativePrompt: {
      type: Type.STRING,
      nullable: true,
      description: "Optional negative prompt, or null if not useful",
    },
    quickTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Short descriptors, e.g. cinematic, soft light",
    },
  },
  required: ["shortPrompt", "detailedUniversalPrompt", "quickTags"],
};

const INSTRUCTION = `You are helping visual creators. Look at the image and produce prompts for AI image generation tools.

Quality rules:
- Describe what you see in natural human language; avoid robotic templates.
- shortPrompt: tight, paste-ready, one idea the user can run with immediately.
- detailedUniversalPrompt: ONE single paragraph of flowing prose, 60 to 90 words. No bullet points, no lists, no line breaks, no headings, no labels like "Subject:" or "Lighting:". Cover subject, composition, lens/depth feel if relevant, lighting, color, style/aesthetic, background/environment, mood, and meaningful details — all woven into the same paragraph. Suitable for common image generators.
- negativePrompt: include only when it genuinely helps avoid common artifacts; otherwise use null. Keep it short.
- quickTags: 4–8 short tags (single words or two-word phrases) like cinematic, portrait, soft light, editorial.

Avoid long essays, excessive punctuation, and generic filler. Stay practical.`;

/** Current default. Override with GEMINI_MODEL to pin a specific version. */
function defaultModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
}

export async function generateImagePromptFromImage(
  imageBytes: Uint8Array,
  mimeType: string,
): Promise<ImagePromptResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiNotConfiguredError();
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64 = Buffer.from(imageBytes).toString("base64");

  let text: string;
  try {
    const response = await ai.models.generateContent({
      model: defaultModel(),
      contents: [
        {
          role: "user",
          parts: [
            { text: INSTRUCTION },
            { inlineData: { mimeType, data: base64 } },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    const promptBlock = response.promptFeedback?.blockReason;
    if (promptBlock) {
      throw new GeminiImagePromptError("SAFETY_BLOCKED", { promptBlock });
    }

    const finish = response.candidates?.[0]?.finishReason;
    const safetyFinishes: FinishReason[] = [
      FinishReason.SAFETY,
      FinishReason.PROHIBITED_CONTENT,
      FinishReason.BLOCKLIST,
      FinishReason.SPII,
      FinishReason.RECITATION,
    ];
    if (finish && safetyFinishes.includes(finish)) {
      throw new GeminiImagePromptError("SAFETY_BLOCKED", { finish });
    }

    const raw = response.text;
    if (typeof raw !== "string" || !raw.trim()) {
      throw new GeminiImagePromptError("BAD_RESPONSE", { reason: "empty" });
    }
    text = raw;
  } catch (e) {
    if (e instanceof GeminiImagePromptError) throw e;
    throw new GeminiImagePromptError(classifyThrown(e), e);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch (e) {
    throw new GeminiImagePromptError("BAD_RESPONSE", e);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new GeminiImagePromptError("BAD_RESPONSE", { reason: "shape" });
  }

  const o = parsed as Record<string, unknown>;
  const shortPrompt = typeof o.shortPrompt === "string" ? o.shortPrompt.trim() : "";
  const detailedUniversalPrompt =
    typeof o.detailedUniversalPrompt === "string"
      ? o.detailedUniversalPrompt.trim()
      : "";
  const negativeRaw = o.negativePrompt;
  const negativePrompt =
    negativeRaw === null || negativeRaw === undefined
      ? null
      : typeof negativeRaw === "string"
        ? negativeRaw.trim() || null
        : null;
  const tagsRaw = o.quickTags;
  const quickTags = Array.isArray(tagsRaw)
    ? tagsRaw
        .filter((t): t is string => typeof t === "string")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  if (!shortPrompt || !detailedUniversalPrompt) {
    throw new GeminiImagePromptError("BAD_RESPONSE", { reason: "incomplete" });
  }

  return {
    shortPrompt,
    detailedUniversalPrompt,
    negativePrompt,
    quickTags,
  };
}
