/**
 * Server-only: Bytez prompts + JSON parsing for Prompt Enhancer.
 */

export type PromptStyleTarget =
  | "Midjourney"
  | "Flux"
  | "SDXL"
  | "Realistic Photo"
  | "Cinematic"
  | "Ecommerce Product";

export type PromptCreativity = "conservative" | "balanced" | "bold";

export type PromptEnhancerRequestBody = {
  rawPrompt: string;
  styleTarget: PromptStyleTarget;
  creativity: PromptCreativity;
};

export type PromptEnhancerResult = {
  prompt: string;
  negativePrompt: string;
  tags: string[];
};

const STYLE_SET = new Set<string>([
  "Midjourney",
  "Flux",
  "SDXL",
  "Realistic Photo",
  "Cinematic",
  "Ecommerce Product",
]);

const CREATIVITY_SET = new Set<string>([
  "conservative",
  "balanced",
  "bold",
]);

export function parsePromptEnhancerBody(
  data: unknown,
): { ok: true; body: PromptEnhancerRequestBody } | { ok: false; error: string } {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = data as Record<string, unknown>;
  const rawPrompt = typeof o.rawPrompt === "string" ? o.rawPrompt.trim() : "";
  if (rawPrompt.length < 10 || rawPrompt.length > 8000) {
    return {
      ok: false,
      error: "Prompt must be between 10 and 8000 characters.",
    };
  }
  const styleTarget =
    typeof o.styleTarget === "string" ? o.styleTarget.trim() : "";
  if (!STYLE_SET.has(styleTarget)) {
    return { ok: false, error: "Invalid style target." };
  }
  const creativity =
    typeof o.creativity === "string" ? o.creativity.trim() : "";
  if (!CREATIVITY_SET.has(creativity)) {
    return { ok: false, error: "Invalid creativity level." };
  }

  return {
    ok: true,
    body: {
      rawPrompt,
      styleTarget: styleTarget as PromptStyleTarget,
      creativity: creativity as PromptCreativity,
    },
  };
}

export function buildPromptEnhancerPrompts(body: PromptEnhancerRequestBody): {
  system: string;
  user: string;
} {
  const creativityHint =
    body.creativity === "conservative"
      ? "Stay close to the user's wording; refine clarity and structure only."
      : body.creativity === "balanced"
        ? "Balance fidelity to the idea with stronger descriptive language."
        : "Be more creative and expansive while staying on-brief.";

  const system = `You are an expert prompt engineer for generative image models. Reply with ONLY valid JSON (no markdown) matching:
{"prompt":"improved single-block prompt text","negativePrompt":"comma-separated negatives or empty string if not useful","tags":["tag1","tag2","tag3","tag4","tag5"]}
Rules:
- "prompt": one polished prompt optimized for the style target (no JSON inside the string).
- "negativePrompt": concise negatives for the style when applicable; use "" if not needed.
- "tags": 5–12 short keywords or comma-style tokens without #.
- Language: English unless the user's prompt is clearly in another language (then mirror).`;

  const user = `Style target: ${body.styleTarget}
Creativity: ${body.creativity} — ${creativityHint}

Raw prompt:
${body.rawPrompt}

Return the JSON object now.`;

  return { system, user };
}

export function parsePromptEnhancerJson(
  raw: string,
): { ok: true; result: PromptEnhancerResult } | { ok: false; error: string } {
  const trimmed = raw.trim();
  let jsonStr = trimmed;
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence?.[1]) jsonStr = fence[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return { ok: false, error: "Could not parse AI response as JSON." };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "Invalid AI response shape." };
  }
  const o = parsed as Record<string, unknown>;
  const prompt = typeof o.prompt === "string" ? o.prompt.trim() : "";
  const negativePrompt =
    typeof o.negativePrompt === "string" ? o.negativePrompt.trim() : "";
  const tags = o.tags;

  if (!prompt) {
    return { ok: false, error: "Missing improved prompt from model." };
  }
  if (!Array.isArray(tags) || tags.length < 3) {
    return { ok: false, error: "Expected tags array from model." };
  }
  const tagStrings = tags
    .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
    .slice(0, 16)
    .map((t) => t.replace(/^#+/, "").trim());

  if (tagStrings.length < 3) {
    return { ok: false, error: "Could not normalize tags." };
  }

  return {
    ok: true,
    result: {
      prompt,
      negativePrompt,
      tags: tagStrings,
    },
  };
}
