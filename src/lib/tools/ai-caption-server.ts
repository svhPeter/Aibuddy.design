/**
 * Server-only: prompt + JSON parsing for AI Caption Generator (Bytez).
 */

export type CaptionTone =
  | "professional"
  | "viral"
  | "luxury"
  | "funny"
  | "minimal";

export type CaptionPlatform =
  | "Instagram"
  | "TikTok"
  | "LinkedIn"
  | "X";

export type CaptionRequestBody = {
  niche: string;
  tone: CaptionTone;
  platform: CaptionPlatform;
  keywords?: string;
};

export type CaptionResultPayload = {
  captions: string[];
  cta: string;
  hashtags: string[];
};

const TONE_SET = new Set<string>([
  "professional",
  "viral",
  "luxury",
  "funny",
  "minimal",
]);

const PLATFORM_SET = new Set<string>([
  "Instagram",
  "TikTok",
  "LinkedIn",
  "X",
]);

export function parseCaptionRequestBody(
  data: unknown,
): { ok: true; body: CaptionRequestBody } | { ok: false; error: string } {
  if (!data || typeof data !== "object") {
    return { ok: false, error: "Invalid JSON body." };
  }
  const o = data as Record<string, unknown>;
  const niche = typeof o.niche === "string" ? o.niche.trim() : "";
  if (niche.length < 2 || niche.length > 500) {
    return {
      ok: false,
      error: "Topic / niche is required (2–500 characters).",
    };
  }
  const tone = typeof o.tone === "string" ? o.tone.trim() : "";
  if (!TONE_SET.has(tone)) {
    return { ok: false, error: "Invalid tone." };
  }
  const platform = typeof o.platform === "string" ? o.platform.trim() : "";
  if (!PLATFORM_SET.has(platform)) {
    return { ok: false, error: "Invalid platform." };
  }
  const keywords =
    typeof o.keywords === "string" && o.keywords.trim()
      ? o.keywords.trim().slice(0, 500)
      : undefined;

  return {
    ok: true,
    body: {
      niche,
      tone: tone as CaptionTone,
      platform: platform as CaptionPlatform,
      keywords,
    },
  };
}

export function buildCaptionPrompts(body: CaptionRequestBody): {
  system: string;
  user: string;
} {
  const kw = body.keywords
    ? ` Optional keyword hints from the user: ${body.keywords}`
    : "";

  const system = `You are a social copy assistant. Reply with ONLY valid JSON (no markdown, no prose outside JSON) matching this shape:
{"captions":["caption1","caption2","caption3","caption4","caption5"],"cta":"one short call-to-action line","hashtags":["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"]}
Rules:
- Exactly 5 distinct caption options in "captions", each suitable for the platform and tone.
- "cta": one concise CTA line (not a full caption).
- "hashtags": 5–10 hashtags without # in the JSON strings (add relevance; platform-appropriate).
- Keep each caption under ~280 characters where possible except TikTok can be slightly longer if needed.`;

  const user = `Niche / topic: ${body.niche}
Tone: ${body.tone}
Platform: ${body.platform}${kw}
Generate the JSON object now.`;

  return { system, user };
}

export function parseCaptionModelJson(
  raw: string,
): { ok: true; result: CaptionResultPayload } | { ok: false; error: string } {
  const trimmed = raw.trim();
  let jsonStr = trimmed;
  const fence = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/m);
  if (fence?.[1]) {
    jsonStr = fence[1].trim();
  }
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
  const captions = o.captions;
  const cta = o.cta;
  const hashtags = o.hashtags;

  if (!Array.isArray(captions) || captions.length !== 5) {
    return { ok: false, error: "Expected exactly 5 captions from the model." };
  }
  const capStrings: string[] = [];
  for (const c of captions) {
    if (typeof c !== "string" || !c.trim()) {
      return { ok: false, error: "Each caption must be a non-empty string." };
    }
    capStrings.push(c.trim());
  }
  if (capStrings.length !== 5) {
    return { ok: false, error: "Expected exactly 5 captions from the model." };
  }

  if (typeof cta !== "string" || !cta.trim()) {
    return { ok: false, error: "Missing CTA line from the model." };
  }

  if (!Array.isArray(hashtags) || hashtags.length < 5) {
    return { ok: false, error: "Missing or short hashtag list from the model." };
  }
  const hashStrings = hashtags
    .filter((h): h is string => typeof h === "string" && h.trim().length > 0)
    .slice(0, 12)
    .map((h) => h.replace(/^#+/, "").trim());

  if (hashStrings.length < 5) {
    return { ok: false, error: "Could not normalize hashtags." };
  }

  return {
    ok: true,
    result: {
      captions: capStrings,
      cta: cta.trim(),
      hashtags: hashStrings,
    },
  };
}
