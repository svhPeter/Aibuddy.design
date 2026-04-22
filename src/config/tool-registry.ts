/**
 * Single source of truth for AIBuddy tools: execution layer, auth, and AI routing.
 *
 * - browser: client-side only — never send through server AI providers.
 * - bytez: server-side Bytez `POST /models/v2/{modelId}` (e.g. AI Caption Generator).
 * - gemini: premium / heavier Google Gemini routes (@/lib/ai/providers/gemini).
 *
 * Browser tools MUST NOT be wired through `src/lib/ai/*` — keeps cost at zero
 * and preserves privacy for local image processing.
 */

export type ToolExecutionLayer = "browser" | "bytez" | "gemini";

/** `utility` = deterministic / local processing; `ai` = model inference. */
export type ToolKind = "utility" | "ai";

export type ToolAccess = "public" | "account";

export type AiProviderId = "gemini" | "bytez";

/**
 * Reserved for future plan gating (not enforced yet — do not use for payments
 * until billing exists).
 */
export type ToolPlanRequirement = "free" | "starter" | "pro";

export type ToolRegistryEntry = {
  /** Stable id for code, credits, and logs */
  id: string;
  href: `/tools/${string}`;
  name: string;
  description: string;
  layer: ToolExecutionLayer;
  kind: ToolKind;
  access: ToolAccess;
  badge: string;
  /** Include on /tools grid and cross-links */
  listedInCatalog: boolean;
  /**
   * `spendCredit` / UsageLog tool string — only for account-gated tools that
   * deduct credits on success.
   */
  creditToolKey?: string;
  /** Set when layer is `bytez` or `gemini` */
  aiProvider?: AiProviderId;
  /** Future Stripe/plan gates */
  planRequirement?: ToolPlanRequirement;
};

const ENTRIES: readonly ToolRegistryEntry[] = [
  {
    id: "image-compressor",
    href: "/tools/image-compressor",
    name: "Image Compressor",
    description:
      "Shrink JPG, PNG, or WebP in your browser — quality slider, before/after size, instant download.",
    layer: "browser",
    kind: "utility",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
  },
  {
    id: "image-enlarger",
    href: "/tools/image-enlarger",
    name: "Image Enlarger",
    description:
      "Increase image dimensions with clean in-browser processing — great for larger exports and resized assets. Fast and private.",
    layer: "browser",
    kind: "utility",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
  },
  {
    id: "image-converter",
    href: "/tools/image-converter",
    name: "Image Converter",
    description:
      "Convert JPG, PNG, or WebP in your browser — pick output format, optional quality, same dimensions. Fast and private.",
    layer: "browser",
    kind: "utility",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
  },
  {
    id: "social-resize",
    href: "/tools/social-resize",
    name: "Social Media Resize",
    description:
      "Resize images for Instagram, TikTok, YouTube, LinkedIn, Facebook, and more — presets, fit modes, instant export.",
    layer: "browser",
    kind: "utility",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
  },
  {
    id: "watermark-tool",
    href: "/tools/watermark-tool",
    name: "Watermark Tool",
    description:
      "Add text or logo watermarks with position, opacity, and padding controls — preview and download in your browser.",
    layer: "browser",
    kind: "utility",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
  },
  {
    id: "jpg-pdf-tool",
    href: "/tools/jpg-pdf-tool",
    name: "JPG ↔ PDF",
    description:
      "Merge images into one PDF or export PDF pages to JPG — runs locally in your browser.",
    layer: "browser",
    kind: "utility",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
  },
  {
    id: "ai-caption-generator",
    href: "/tools/ai-caption-generator",
    name: "AI Caption Generator",
    description:
      "Generate five caption options, a CTA line, and hashtags for Instagram, TikTok, LinkedIn, or X — tone and niche in one pass.",
    layer: "bytez",
    kind: "ai",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
    aiProvider: "bytez",
  },
  {
    id: "product-description-generator",
    href: "/tools/product-description-generator",
    name: "Product Description Generator",
    description:
      "Generate short and long product copy, five feature bullets, and a CTA from name, category, tone, and keywords.",
    layer: "bytez",
    kind: "ai",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
    aiProvider: "bytez",
  },
  {
    id: "prompt-enhancer",
    href: "/tools/prompt-enhancer",
    name: "Prompt Enhancer",
    description:
      "Turn rough prompts into polished, model-ready text with negatives and tags — Midjourney, Flux, SDXL, and more.",
    layer: "bytez",
    kind: "ai",
    access: "public",
    badge: "Free",
    listedInCatalog: true,
    aiProvider: "bytez",
  },
  {
    id: "image-to-prompt",
    href: "/tools/image-to-prompt",
    name: "Image to Prompt",
    description:
      "Turn a reference image into prompts for AI generators — short, detailed, negatives, and tags.",
    layer: "gemini",
    kind: "ai",
    access: "account",
    badge: "Account",
    listedInCatalog: true,
    creditToolKey: "image-to-prompt",
    aiProvider: "gemini",
  },
] as const;

export function getToolRegistry(): readonly ToolRegistryEntry[] {
  return ENTRIES;
}

export function getRegistryEntryById(
  id: string,
): ToolRegistryEntry | undefined {
  return ENTRIES.find((e) => e.id === id);
}

export function getRegistryEntryByHref(
  href: string,
): ToolRegistryEntry | undefined {
  return ENTRIES.find((e) => e.href === href);
}

/**
 * Marketing / UI slice — tools shown on `/tools` and cross-link nav.
 * Extends each entry with runtime hints for labels (browser vs AI provider).
 */
export type ToolCatalogEntry = {
  href: ToolRegistryEntry["href"];
  name: string;
  description: string;
  access: ToolAccess;
  badge: string;
  layer: ToolExecutionLayer;
  kind: ToolKind;
  aiProvider?: AiProviderId;
};

export function listCatalogTools(): readonly ToolCatalogEntry[] {
  return ENTRIES.filter((e) => e.listedInCatalog).map((e) => ({
    href: e.href,
    name: e.name,
    description: e.description,
    access: e.access,
    badge: e.badge,
    layer: e.layer,
    kind: e.kind,
    aiProvider: e.aiProvider,
  }));
}

export function getToolCrossLinks(
  currentHref: ToolRegistryEntry["href"],
): readonly ToolCatalogEntry[] {
  return listCatalogTools().filter((t) => t.href !== currentHref);
}

/** Short line for “badge · runtime” in tool nav (browser vs AI provider). */
export function toolRuntimeSubtitle(t: ToolCatalogEntry): string {
  if (t.access === "public") {
    if (t.layer === "browser") return "Browser";
    if (t.layer === "bytez") return "Bytez";
    return "Public";
  }
  if (t.aiProvider === "gemini") return "Gemini";
  if (t.aiProvider === "bytez") return "Bytez";
  return "Sign-in";
}
