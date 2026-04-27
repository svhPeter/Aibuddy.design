export type ToolEntry = {
  id: string;
  href: `/tools/${string}`;
  name: string;
  description: string;
  badge: string;
};

export const toolsCatalog: readonly ToolEntry[] = [
  {
    id: "image-compressor",
    href: "/tools/image-compressor",
    name: "Image Compressor",
    description:
      "Shrink JPG, PNG, or WebP in your browser — quality slider, before/after size, instant download.",
    badge: "Free",
  },
  {
    id: "image-enlarger",
    href: "/tools/image-enlarger",
    name: "Image Enlarger",
    description:
      "Increase image dimensions with clean in-browser processing — fast and private.",
    badge: "Free",
  },
  {
    id: "image-converter",
    href: "/tools/image-converter",
    name: "Image Converter",
    description:
      "Convert JPG, PNG, or WebP in your browser — pick format, optional quality, instant download.",
    badge: "Free",
  },
  {
    id: "social-resize",
    href: "/tools/social-resize",
    name: "Social Media Resize",
    description:
      "Resize images for social presets — fit modes, clean exports, instant download.",
    badge: "Free",
  },
  {
    id: "watermark-tool",
    href: "/tools/watermark-tool",
    name: "Watermark Tool",
    description:
      "Add text or logo watermarks with opacity and placement controls — preview and export.",
    badge: "Free",
  },
  {
    id: "jpg-pdf-tool",
    href: "/tools/jpg-pdf-tool",
    name: "JPG ↔ PDF",
    description: "Merge images into one PDF or export PDF pages to JPG — local and private.",
    badge: "Free",
  },
  {
    id: "ai-caption-generator",
    href: "/tools/ai-caption-generator",
    name: "AI Caption Generator",
    description:
      "Generate caption options, CTA, and hashtags for Instagram, TikTok, LinkedIn, or X.",
    badge: "AI",
  },
  {
    id: "product-description-generator",
    href: "/tools/product-description-generator",
    name: "Product Description Generator",
    description:
      "Generate short + long product copy, feature bullets, and a CTA from a few inputs.",
    badge: "AI",
  },
  {
    id: "prompt-enhancer",
    href: "/tools/prompt-enhancer",
    name: "Prompt Enhancer",
    description:
      "Turn rough prompts into polished, model-ready text with negatives and tags.",
    badge: "AI",
  },
  {
    id: "currency-converter",
    href: "/tools/currency-converter",
    name: "Currency Converter",
    description:
      "Convert amounts with live ECB-based rates — public API, no account, good for search and travel math.",
    badge: "Free · SEO",
  },
] as const;

export function getToolById(id: string): ToolEntry | undefined {
  return toolsCatalog.find((t) => t.id === id);
}

