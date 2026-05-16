export type LabCategory = "All" | "AI" | "Image" | "Video" | "Experimental";

export type LabEntry = {
  id: string;
  href: `/labs/${string}`;
  name: string;
  description: string;
  badge: string; // Status badge (e.g. "Production", "Prototype", "Beta")
  category: LabCategory[];
  stack: string[];
};

export const labsCatalog: readonly LabEntry[] = [
  {
    id: "video-compressor",
    href: "/labs/video-compressor",
    name: "Video Compressor",
    description:
      "Experimental browser-based video compression powered by FFmpeg WebAssembly. No server uploads required.",
    badge: "Beta",
    category: ["All", "Video", "Experimental"],
    stack: ["FFmpeg.wasm", "WebAssembly", "SharedArrayBuffer", "Vite"],
  },
  {
    id: "image-compressor",
    href: "/labs/image-compressor",
    name: "Image Compressor",
    description:
      "Fast browser-side image transformations. Resamples and compresses images purely client-side.",
    badge: "Production",
    category: ["All", "Image"],
    stack: ["Canvas API", "Browser-side", "Blob API"],
  },
  {
    id: "image-enlarger",
    href: "/labs/image-enlarger",
    name: "Image Enlarger",
    description:
      "Client-side image scaling implementation. Demonstrates high-quality canvas upsampling.",
    badge: "Production",
    category: ["All", "Image"],
    stack: ["Canvas API", "Browser-side"],
  },
  {
    id: "image-converter",
    href: "/labs/image-converter",
    name: "Image Format Converter",
    description:
      "Browser-based format transcoder supporting JPG, PNG, and WebP generation without a backend.",
    badge: "Production",
    category: ["All", "Image"],
    stack: ["Canvas API", "Browser-side"],
  },
  {
    id: "social-resize",
    href: "/labs/social-resize",
    name: "Social Media Auto-Cropper",
    description:
      "Automated aspect ratio adaptation and cropping system for social media dimensions.",
    badge: "Production",
    category: ["All", "Image"],
    stack: ["Canvas API", "Math"],
  },
  {
    id: "watermark-tool",
    href: "/labs/watermark-tool",
    name: "Canvas Watermarker",
    description:
      "Dynamic text rendering and positioning system using HTML5 Canvas to overlay watermarks.",
    badge: "Production",
    category: ["All", "Image"],
    stack: ["Canvas API", "Browser-side"],
  },
  {
    id: "jpg-pdf-tool",
    href: "/labs/jpg-pdf-tool",
    name: "Image to PDF Compiler",
    description:
      "Client-side PDF generation workflow. Compiles multiple images into a standard A4 document.",
    badge: "Production",
    category: ["All", "Image"],
    stack: ["jsPDF", "Browser-side"],
  },
  {
    id: "ai-caption-generator",
    href: "/labs/ai-caption-generator",
    name: "Social Caption Engine",
    description:
      "LLM-powered workflow generating contextual social media copy optimized for different platforms.",
    badge: "Production",
    category: ["All", "AI"],
    stack: ["LLM API", "Prompt Engineering"],
  },
  {
    id: "product-description-generator",
    href: "/labs/product-description-generator",
    name: "E-Commerce Copy Engine",
    description:
      "Structured data generation pipeline transforming basic inputs into rich product descriptions.",
    badge: "Production",
    category: ["All", "AI"],
    stack: ["LLM API", "Prompt Engineering"],
  },
  {
    id: "prompt-enhancer",
    href: "/labs/prompt-enhancer",
    name: "Prompt Refinement System",
    description:
      "LLM-assisted prompt refinement workflow for creative and technical tasks.",
    badge: "Production",
    category: ["All", "AI"],
    stack: ["LLM API", "Prompt Engineering"],
  },
  {
    id: "currency-converter",
    href: "/labs/currency-converter",
    name: "Live Currency Engine",
    description:
      "Real-time financial API integration demonstrating external data fetching and reactive state.",
    badge: "Production",
    category: ["All", "Experimental"],
    stack: ["Frankfurter API", "React", "Fetch"],
  },
] as const;

export function getLabById(id: string): LabEntry | undefined {
  return labsCatalog.find((t) => t.id === id);
}
