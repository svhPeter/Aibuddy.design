import { Link, Navigate, useParams } from "react-router";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { getLabById } from "@/config/labs";
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
import { VideoCompressorTool } from "@/components/tools/VideoCompressorTool";
import { usePageMeta } from "@/hooks/use-page-meta";
import type { ReactNode } from "react";

const LAB_PANELS: Record<string, ReactNode> = {
  "video-compressor": <VideoCompressorTool />,
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

export default function LabDetail() {
  const params = useParams();
  const toolId = params.toolId ?? "";

  if (toolId === "image-to-prompt") {
    return <Navigate to="/labs/currency-converter" replace />;
  }

  const lab = getLabById(toolId);

  usePageMeta({
    title: lab ? `${lab.name} — AIBuddy Labs` : "Lab Not Found — AIBuddy",
    description: lab?.description ?? "This experiment was not found in the AIBuddy Labs catalog.",
    canonical: lab ? `https://aibuddy.design/labs/${lab.id}` : undefined,
  });

  if (!lab) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-16 flex min-h-[55vh] items-center justify-center px-6">
          <div className="text-center max-w-md">
            <h1 className="font-oswald text-3xl font-bold uppercase mb-3">Lab not found</h1>
            <p className="font-inter text-sm text-[#1a1a1a]/60 mb-8">
              That path is not in our labs list yet.
            </p>
            <Link to="/labs" className="btn-brutal btn-brutal-yellow inline-flex items-center gap-2">
              <ArrowLeftIcon size={16} />
              All Labs
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
        <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12 bg-[#1a1a1a] text-white">
          <Link
            to="/labs"
            className="inline-flex items-center gap-2 font-oswald text-sm uppercase tracking-wider text-white/70 hover:text-[#F9FF00] active:text-white transition-colors mb-6"
          >
            <ArrowLeftIcon size={16} />
            Back to Labs
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 bg-[#F9FF00] text-[#1a1a1a] px-3 py-1 font-oswald text-xs font-bold uppercase tracking-widest border-[3px] border-[#F9FF00]">
              {lab.badge}
            </span>
            {lab.category.filter(c => c !== "All").map(c => (
              <span key={c} className="font-oswald text-[10px] font-bold uppercase tracking-widest text-white/50 border border-white/20 px-2 py-1">
                {c}
              </span>
            ))}
          </div>

          <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em] mt-6">
            {lab.name}
          </h1>
          <p className="font-inter text-sm md:text-base text-white/70 max-w-2xl mt-4 leading-relaxed">
            {lab.description}
          </p>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {lab.stack.map(tech => (
              <span key={tech} className="font-inter text-[10px] text-white/80 bg-white/10 px-2 py-1 rounded-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-8 border-r-[3px] border-black px-6 md:px-12 lg:px-16 py-10 bg-[#e0e0e0]">
            <div className="border-[3px] border-black p-6 md:p-8 bg-white shadow-xl">
              {LAB_PANELS[lab.id] ?? (
                <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
                  This lab environment is not connected yet. Try another from the labs list, or
                  contact us to request it.
                </p>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 px-6 md:px-10 py-10 bg-[#fafafa]">
            <h3 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#1a1a1a] mb-3">
              Lab Options
            </h3>
            <div className="space-y-3">
              <Link
                to="/labs"
                className="btn-brutal btn-brutal-white w-full block text-center"
              >
                BACK TO LABS
              </Link>
              <Link
                to="/contact"
                className="btn-brutal btn-brutal-yellow w-full block text-center"
              >
                REQUEST CUSTOM BUILD
              </Link>
              <p className="font-inter text-xs text-[#1a1a1a]/50 text-center mt-4">
                AIBuddy builds production-grade tools, workflows, SaaS systems, and AI products for startups and businesses.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
