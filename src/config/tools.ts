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
      "Shrink an image in your browser. Preview the result, then download.",
    badge: "Free",
  },
  {
    id: "image-enlarger",
    href: "/tools/image-enlarger",
    name: "Image Enlarger",
    description:
      "Scale an image up in your browser. Preview, then download a PNG.",
    badge: "Free",
  },
  {
    id: "image-converter",
    href: "/tools/image-converter",
    name: "Image Converter",
    description:
      "Convert JPG/PNG/WebP in your browser. Preview output before download.",
    badge: "Free",
  },
  {
    id: "social-resize",
    href: "/tools/social-resize",
    name: "Social Media Resize",
    description:
      "Resize for common social sizes (cover or contain). Preview, then download.",
    badge: "Free",
  },
  {
    id: "watermark-tool",
    href: "/tools/watermark-tool",
    name: "Watermark Tool",
    description:
      "Add a text watermark with position and opacity. Preview, then export PNG.",
    badge: "Free",
  },
  {
    id: "jpg-pdf-tool",
    href: "/tools/jpg-pdf-tool",
    name: "Images → PDF",
    description:
      "Merge images into an A4 PDF with a preview (optional cover + footer).",
    badge: "Free",
  },
  {
    id: "ai-caption-generator",
    href: "/tools/ai-caption-generator",
    name: "AI Caption Generator",
    description:
      "Generate caption options for Instagram, TikTok, LinkedIn, or X.",
    badge: "AI",
  },
  {
    id: "product-description-generator",
    href: "/tools/product-description-generator",
    name: "Product Description Generator",
    description:
      "Generate product copy: short, long, bullets, and CTA from a few inputs.",
    badge: "AI",
  },
  {
    id: "prompt-enhancer",
    href: "/tools/prompt-enhancer",
    name: "Prompt Enhancer",
    description:
      "Turn a rough idea into a cleaner prompt, negatives, and tags.",
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

