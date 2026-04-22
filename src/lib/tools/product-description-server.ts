/**
 * Server-only: Bytez prompts + JSON parsing for Product Description Generator.
 */

export type ProductTone =
  | "luxury"
  | "persuasive"
  | "clean"
  | "playful"
  | "premium";

export type ProductRequestBody = {
  productName: string;
  category: string;
  tone: ProductTone;
  keywords?: string;
  audience?: string;
};

export type ProductDescriptionResult = {
  shortDescription: string;
  longDescription: string;
  bullets: string[];
  cta: string;
};

const TONE_SET = new Set<string>([
  "luxury",
  "persuasive",
  "clean",
  "playful",
  "premium",
]);

export function parseProductDescriptionBody(
  data: unknown,
): { ok: true; body: ProductRequestBody } | { ok: false; error: string } {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = data as Record<string, unknown>;
  const productName =
    typeof o.productName === "string" ? o.productName.trim() : "";
  if (productName.length < 2 || productName.length > 120) {
    return {
      ok: false,
      error: "Product name is required (2–120 characters).",
    };
  }
  const category = typeof o.category === "string" ? o.category.trim() : "";
  if (category.length < 2 || category.length > 200) {
    return {
      ok: false,
      error: "Category / niche is required (2–200 characters).",
    };
  }
  const tone = typeof o.tone === "string" ? o.tone.trim() : "";
  if (!TONE_SET.has(tone)) {
    return { ok: false, error: "Invalid tone." };
  }
  const keywords =
    typeof o.keywords === "string" && o.keywords.trim()
      ? o.keywords.trim().slice(0, 500)
      : undefined;
  const audience =
    typeof o.audience === "string" && o.audience.trim()
      ? o.audience.trim().slice(0, 300)
      : undefined;

  return {
    ok: true,
    body: {
      productName,
      category,
      tone: tone as ProductTone,
      keywords,
      audience,
    },
  };
}

export function buildProductDescriptionPrompts(body: ProductRequestBody): {
  system: string;
  user: string;
} {
  const extra: string[] = [];
  if (body.keywords) extra.push(`Keywords: ${body.keywords}`);
  if (body.audience) extra.push(`Target audience: ${body.audience}`);

  const system = `You are an ecommerce copywriter. Reply with ONLY valid JSON (no markdown, no text outside JSON) matching:
{"shortDescription":"one tight paragraph under ~400 characters","longDescription":"2–4 paragraphs of persuasive sales copy","bullets":["feat1","feat2","feat3","feat4","feat5"],"cta":"one short call-to-action line"}
Rules:
- "bullets": exactly 5 distinct benefit-focused bullets.
- Match the requested tone throughout.
- No placeholder text like "Lorem".`;

  const user = `Product name: ${body.productName}
Category / niche: ${body.category}
Tone: ${body.tone}
${extra.length ? `${extra.join("\n")}\n` : ""}Generate the JSON now.`;

  return { system, user };
}

export function parseProductDescriptionJson(
  raw: string,
): { ok: true; result: ProductDescriptionResult } | { ok: false; error: string } {
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
  const shortDescription =
    typeof o.shortDescription === "string" ? o.shortDescription.trim() : "";
  const longDescription =
    typeof o.longDescription === "string" ? o.longDescription.trim() : "";
  const cta = typeof o.cta === "string" ? o.cta.trim() : "";
  const bullets = o.bullets;

  if (!shortDescription || !longDescription || !cta) {
    return { ok: false, error: "Missing description or CTA fields." };
  }
  if (!Array.isArray(bullets) || bullets.length !== 5) {
    return { ok: false, error: "Expected exactly 5 bullet strings." };
  }
  const b: string[] = [];
  for (const x of bullets) {
    if (typeof x !== "string" || !x.trim()) {
      return { ok: false, error: "Each bullet must be a non-empty string." };
    }
    b.push(x.trim());
  }

  return {
    ok: true,
    result: {
      shortDescription,
      longDescription,
      bullets: b,
      cta,
    },
  };
}
