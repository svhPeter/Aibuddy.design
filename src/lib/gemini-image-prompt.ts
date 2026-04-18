import {
  GoogleGenerativeAI,
  SchemaType,
  type ResponseSchema,
} from "@google/generative-ai";

export class GeminiNotConfiguredError extends Error {
  constructor(message = "GEMINI_API_KEY is not set.") {
    super(message);
    this.name = "GeminiNotConfiguredError";
  }
}

export class GeminiImagePromptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiImagePromptError";
  }
}

export type ImagePromptResult = {
  shortPrompt: string;
  detailedUniversalPrompt: string;
  negativePrompt: string | null;
  quickTags: string[];
};

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    shortPrompt: {
      type: SchemaType.STRING,
      description: "Concise, natural prompt for quick use",
    },
    detailedUniversalPrompt: {
      type: SchemaType.STRING,
      description:
        "Richer universal prompt: subject, composition, lighting, style, background, mood, details",
    },
    negativePrompt: {
      type: SchemaType.STRING,
      nullable: true,
      description: "Optional negative prompt, or null if not useful",
    },
    quickTags: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "Short descriptors, e.g. cinematic, soft light",
    },
  },
  required: ["shortPrompt", "detailedUniversalPrompt", "quickTags"],
};

const INSTRUCTION = `You are helping visual creators. Look at the image and produce prompts for AI image generation tools.

Quality rules:
- Describe what you see in natural human language; avoid robotic templates.
- shortPrompt: tight, paste-ready, one idea the user can run with immediately.
- detailedUniversalPrompt: flowing prose (not bullet lists) covering subject, composition, lens/depth feel if relevant, lighting, color, style/aesthetic, background/environment, mood, and meaningful details. Suitable for common generators (Midjourney-style, SD, Flux, etc.).
- negativePrompt: include only when it genuinely helps avoid common artifacts; otherwise use null. Keep it short.
- quickTags: 4–8 short tags (single words or two-word phrases) like cinematic, portrait, soft light, editorial.

Avoid long essays, excessive punctuation, and generic filler. Stay practical.`;

function defaultModel(): string {
  return process.env.GEMINI_MODEL?.trim() || "gemini-2.0-flash";
}

export async function generateImagePromptFromImage(
  imageBytes: Uint8Array,
  mimeType: string,
): Promise<ImagePromptResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiNotConfiguredError();
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: defaultModel(),
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  const base64 = Buffer.from(imageBytes).toString("base64");

  let text: string;
  try {
    const result = await model.generateContent([
      INSTRUCTION,
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
    ]);
    const response = result.response;
    text = response.text();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gemini request failed.";
    throw new GeminiImagePromptError(msg);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    throw new GeminiImagePromptError("Could not parse model response.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new GeminiImagePromptError("Invalid response shape.");
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
    throw new GeminiImagePromptError("Model returned incomplete fields.");
  }

  return {
    shortPrompt,
    detailedUniversalPrompt,
    negativePrompt,
    quickTags,
  };
}
