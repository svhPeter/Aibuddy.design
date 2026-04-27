import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const scrollToInquiry = () => {
    const el = document.getElementById("inquiry");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 border-b-[3px] border-black pt-16">
      {/* Left Column - Text */}
      <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 py-12 md:py-0 border-r-[3px] border-black">
        <div className="max-w-xl">
          <div className="mb-6">
            <span className="inline-block bg-[#F9FF00] px-3 py-1 font-oswald text-xs font-bold uppercase tracking-widest border-[3px] border-black">
              Independent AI Studio
            </span>
          </div>
          <h1 className="font-oswald text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase leading-[0.95] tracking-[-0.03em] mb-8 text-[#1a1a1a]">
            STRATEGY, DESIGN, AND IMPLEMENTATION FOR SHIPPED AI PRODUCTS
          </h1>
          <p className="font-inter text-sm md:text-base leading-relaxed mb-8 text-[#1a1a1a]/80 max-w-md">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={scrollToInquiry}
              className="btn-brutal btn-brutal-yellow flex items-center gap-2 group"
            >
              START A PROJECT
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("portfolio");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-brutal btn-brutal-black flex items-center gap-2"
            >
              VIEW WORK
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-0 mt-12 border-[3px] border-black">
            <div className="border-r-[3px] border-black px-4 py-4 text-center">
              <div className="font-oswald text-2xl md:text-3xl font-bold">150+</div>
              <div className="font-inter text-[10px] uppercase tracking-widest mt-1">Projects</div>
            </div>
            <div className="border-r-[3px] border-black px-4 py-4 text-center">
              <div className="font-oswald text-2xl md:text-3xl font-bold">48h</div>
              <div className="font-inter text-[10px] uppercase tracking-widest mt-1">First Reply</div>
            </div>
            <div className="px-4 py-4 text-center">
              <div className="font-oswald text-2xl md:text-3xl font-bold">12</div>
              <div className="font-inter text-[10px] uppercase tracking-widest mt-1">Tools</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Video */}
      <div className="relative min-h-[50vh] md:min-h-[calc(100vh-64px)] bg-[#1a1a1a] overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero-video.mp4"
          muted
          loop
          playsInline
          autoPlay
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/60 to-transparent" />
        <div className="absolute bottom-8 left-8 right-8">
          <div className="bg-[#F9FF00] border-[3px] border-black p-4 inline-block">
            <span className="font-oswald text-sm font-bold uppercase tracking-widest">
              NOW TAKING PROJECTS — 2026
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
