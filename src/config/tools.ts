export type ToolEntry = {
  id: string;
  href: `/tools/${string}`;
  name: string;
  description: string;
  badge: string;
  access: "public" | "account";
};

export const toolsCatalog: readonly ToolEntry[] = [
  {
    id: "image-compressor",
    href: "/tools/image-compressor",
    name: "Image Compressor",
    description:
      "Shrink JPG, PNG, or WebP in your browser — quality slider, before/after size, instant download.",
    badge: "Free",
    access: "public",
  },
  {
    id: "image-enlarger",
    href: "/tools/image-enlarger",
    name: "Image Enlarger",
    description:
      "Increase image dimensions with clean in-browser processing — fast and private.",
    badge: "Free",
    access: "public",
  },
  {
    id: "image-converter",
    href: "/tools/image-converter",
    name: "Image Converter",
    description:
      "Convert JPG, PNG, or WebP in your browser — pick format, optional quality, instant download.",
    badge: "Free",
    access: "public",
  },
  {
    id: "social-resize",
    href: "/tools/social-resize",
    name: "Social Media Resize",
    description:
      "Resize images for social presets — fit modes, clean exports, instant download.",
    badge: "Free",
    access: "public",
  },
  {
    id: "watermark-tool",
    href: "/tools/watermark-tool",
    name: "Watermark Tool",
    description:
      "Add text or logo watermarks with opacity and placement controls — preview and export.",
    badge: "Free",
    access: "public",
  },
  {
    id: "jpg-pdf-tool",
    href: "/tools/jpg-pdf-tool",
    name: "JPG ↔ PDF",
    description: "Merge images into one PDF or export PDF pages to JPG — local and private.",
    badge: "Free",
    access: "public",
  },
  {
    id: "ai-caption-generator",
    href: "/tools/ai-caption-generator",
    name: "AI Caption Generator",
    description:
      "Generate caption options, CTA, and hashtags for Instagram, TikTok, LinkedIn, or X.",
    badge: "AI",
    access: "public",
  },
  {
    id: "product-description-generator",
    href: "/tools/product-description-generator",
    name: "Product Description Generator",
    description:
      "Generate short + long product copy, feature bullets, and a CTA from a few inputs.",
    badge: "AI",
    access: "public",
  },
  {
    id: "prompt-enhancer",
    href: "/tools/prompt-enhancer",
    name: "Prompt Enhancer",
    description:
      "Turn rough prompts into polished, model-ready text with negatives and tags.",
    badge: "AI",
    access: "public",
  },
  {
    id: "image-to-prompt",
    href: "/tools/image-to-prompt",
    name: "Image to Prompt",
    description:
      "Turn a reference image into prompts for AI generators — short, detailed, negatives, and tags.",
    badge: "Sign in required",
    access: "account",
  },
] as const;

export function getToolById(id: string): ToolEntry | undefined {
  return toolsCatalog.find((t) => t.id === id);
}

