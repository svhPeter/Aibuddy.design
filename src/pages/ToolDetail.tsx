import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { getToolById } from "@/config/tools";
import { CurrencyConverter } from "@/components/tools/CurrencyConverter";
import { PromptEnhancerTool } from "@/components/tools/PromptEnhancerTool";
import { AiCaptionTool } from "@/components/tools/AiCaptionTool";
import { ProductDescriptionTool } from "@/components/tools/ProductDescriptionTool";
import { ImageCompressorTool } from "@/components/tools/ImageCompressorTool";
import { ImageEnlargerTool } from "@/components/tools/ImageEnlargerTool";
import { ImageConverterTool } from "@/components/tools/ImageConverterTool";
import { SocialResizeTool } from "@/components/tools/SocialResizeTool";
import { WatermarkTool } from "@/components/tools/WatermarkTool";
import { JpgPdfTool } from "@/components/tools/JpgPdfTool";
import type { ReactNode } from "react";

const TOOL_PANELS: Record<string, ReactNode> = {
  "currency-converter": <CurrencyConverter />,
  "prompt-enhancer": <PromptEnhancerTool />,
  "ai-caption-generator": <AiCaptionTool />,
  "product-description-generator": <ProductDescriptionTool />,
  "image-compressor": <ImageCompressorTool />,
  "image-enlarger": <ImageEnlargerTool />,
  "image-converter": <ImageConverterTool />,
  "social-resize": <SocialResizeTool />,
  "watermark-tool": <WatermarkTool />,
  "jpg-pdf-tool": <JpgPdfTool />,
};

export default function ToolDetail() {
  const params = useParams();
  const toolId = params.toolId ?? "";

  if (toolId === "image-to-prompt") {
    return <Navigate to="/tools/currency-converter" replace />;
  }

  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex min-h-[55vh] items-center justify-center px-6">
          <div className="text-center max-w-md">
            <h1 className="font-oswald text-3xl font-bold uppercase mb-3">Tool not found</h1>
            <p className="font-inter text-sm text-[#1a1a1a]/60 mb-8">
              That path is not in our tools list yet.
            </p>
            <Link to="/tools" className="btn-brutal btn-brutal-yellow inline-flex items-center gap-2">
              <ArrowLeft size={16} />
              All tools
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
      <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 font-oswald text-sm uppercase tracking-wider hover:text-[#FF0004] transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to Tools
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-[#F9FF00] px-3 py-1 font-oswald text-xs font-bold uppercase tracking-widest border-[3px] border-black">
            {tool.badge}
          </span>
        </div>

        <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em] mt-6">
          {tool.name}
        </h1>
        <p className="font-inter text-sm md:text-base text-[#1a1a1a]/70 max-w-2xl mt-4 leading-relaxed">
          {tool.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8 border-r-[3px] border-black px-6 md:px-12 lg:px-16 py-10">
          <div className="border-[3px] border-black p-6 md:p-8">
            {TOOL_PANELS[tool.id] ?? (
              <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
                This tool is not connected yet. Try another from the tools list, or
                contact us to request it.
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 px-6 md:px-10 py-10 bg-[#1a1a1a] text-white">
          <h3 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-3">
            Quick actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/tools"
              className="btn-brutal btn-brutal-yellow w-full block text-center"
            >
              ALL TOOLS
            </Link>
            <Link
              to="/contact"
              className="btn-brutal btn-brutal-black w-full block text-center"
            >
              CONTACT
            </Link>
            <Link
              to="/#inquiry"
              className="w-full block text-center font-inter text-sm text-white/80 underline"
            >
              Project inquiry
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
