/**
 * Public marketing index + cross-links for /tools/* routes.
 * `access: "public"` = runs in the browser without sign-in or paid APIs.
 * `access: "account"` = studio tool (sign-in + credits).
 */
export type ToolAccess = "public" | "account";

export type ToolCatalogEntry = {
  href:
    | "/tools/image-compressor"
    | "/tools/image-upscaler"
    | "/tools/image-to-prompt";
  name: string;
  /** One line for cards / nav */
  description: string;
  access: ToolAccess;
  /** Small label on the tools grid */
  badge: string;
};

export const toolsCatalog: readonly ToolCatalogEntry[] = [
  {
    href: "/tools/image-compressor",
    name: "Image Compressor",
    description:
      "Shrink JPG, PNG, or WebP in your browser — quality slider, before/after size, instant download.",
    access: "public",
    badge: "Free",
  },
  {
    href: "/tools/image-upscaler",
    name: "Image Upscaler",
    description:
      "Enlarge images with high-quality resampling (2× and more) — runs locally, no AI hallucination of detail.",
    access: "public",
    badge: "Free",
  },
  {
    href: "/tools/image-to-prompt",
    name: "Image to Prompt",
    description:
      "Turn a reference image into prompts for AI generators — short, detailed, negatives, and tags.",
    access: "account",
    badge: "Account",
  },
] as const;

export function getToolCrossLinks(
  currentHref: ToolCatalogEntry["href"],
): readonly ToolCatalogEntry[] {
  return toolsCatalog.filter((t) => t.href !== currentHref);
}
