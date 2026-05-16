import { useState } from "react";
import { Link } from "react-router";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { labsCatalog, type LabCategory } from "@/config/labs";
import { Navigation } from "@/components/Navigation";
import { usePageMeta } from "@/hooks/use-page-meta";

const CATEGORIES: LabCategory[] = ["All", "AI", "Image", "Video", "Experimental"];

export default function Labs() {
  const [activeCategory, setActiveCategory] = useState<LabCategory>("All");

  usePageMeta({
    title: "AIBuddy Labs — Browser-Based Tools & Engineering Experiments",
    description: "A collection of fast, privacy-friendly tools and interaction systems designed to explore real-world workflows, creative tooling, and software experiences.",
    canonical: "https://aibuddy.design/labs",
  });

  const filteredLabs = labsCatalog.filter((lab) =>
    activeCategory === "All" ? true : lab.category.includes(activeCategory)
  );

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        {/* HERO SECTION */}
        <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12 bg-[#1a1a1a] text-white">
          <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] block mb-2">
            Engineering & Prototypes
          </span>
          <h1 className="font-oswald text-5xl md:text-7xl font-bold uppercase tracking-[-0.03em]">
            AIBuddy Labs
          </h1>
          <p className="font-oswald text-lg md:text-xl uppercase tracking-wide text-white/90 mt-6 max-w-3xl">
            Browser-based utilities, AI workflows, and engineering experiments built by AIBuddy.
          </p>
          <p className="font-inter text-sm md:text-base text-white/70 max-w-2xl mt-4 leading-relaxed">
            A collection of fast, privacy-friendly tools and interaction systems designed to explore real-world workflows, creative tooling, and software experiences.
          </p>
          <p className="font-inter text-xs text-[#F9FF00] mt-6 bg-[#F9FF00]/10 inline-block px-3 py-1 border border-[#F9FF00]/20">
            Built as experiments, prototypes, and production-grade frontend systems.
          </p>
        </div>

        {/* FILTERS */}
        <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-4 bg-[#f5f5f5] overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-oswald text-xs font-bold uppercase tracking-widest px-4 py-2 border-[3px] transition-colors ${
                  activeCategory === cat
                    ? "border-black bg-[#F9FF00] text-[#1a1a1a]"
                    : "border-transparent bg-transparent text-[#1a1a1a]/60 hover:text-[#1a1a1a] hover:border-black/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* LABS GRID */}
        <div className="px-6 md:px-12 lg:px-16 py-10 border-b-[3px] border-black bg-[#e0e0e0]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredLabs.map((lab) => (
              <div
                key={lab.id}
                className="border-[3px] border-black bg-white flex flex-col group hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 relative"
              >
                <div className="p-6 md:p-8 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="font-oswald text-[10px] font-bold uppercase tracking-[0.2em] bg-[#1a1a1a] text-white px-2 py-1">
                      {lab.category.filter(c => c !== "All")[0] || "Utility"}
                    </span>
                    <span className={`font-oswald text-[10px] font-bold uppercase tracking-[0.2em] px-2 py-1 border-[2px] ${
                      lab.badge === "Production" ? "border-green-500 text-green-700 bg-green-50" :
                      lab.badge === "Beta" ? "border-blue-500 text-blue-700 bg-blue-50" :
                      "border-[#F9FF00] text-[#1a1a1a] bg-[#F9FF00]/20"
                    }`}>
                      {lab.badge}
                    </span>
                  </div>
                  
                  <h2 className="font-oswald text-3xl font-bold uppercase tracking-tight text-[#1a1a1a] mb-3">
                    {lab.name}
                  </h2>
                  <p className="font-inter text-sm text-[#1a1a1a]/80 leading-relaxed mb-6 max-w-md">
                    {lab.description}
                  </p>
                  
                  {lab.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {lab.stack.map(tech => (
                        <span key={tech} className="font-inter text-[10px] text-[#1a1a1a]/60 bg-[#f0f0f0] px-2 py-0.5 rounded-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <Link
                  to={lab.href}
                  className="border-t-[3px] border-black p-4 flex items-center justify-between bg-[#fcfcfc] group-hover:bg-[#F9FF00] transition-colors"
                >
                  <span className="font-oswald text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Open lab environment
                  </span>
                  <ArrowUpRight className="text-[#1a1a1a]" size={20} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="px-6 md:px-12 lg:px-16 py-20 bg-[#1a1a1a] text-white text-center">
          <h2 className="font-oswald text-3xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Need custom software like this?
          </h2>
          <p className="font-inter text-sm md:text-base text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            AIBuddy builds production-grade tools, workflows, SaaS systems, and AI products for startups and businesses.
          </p>
          <Link
            to="/contact"
            className="btn-brutal btn-brutal-yellow inline-flex items-center gap-2 text-base px-8 py-4"
          >
            START A PROJECT
            <ArrowUpRight size={18} />
          </Link>
        </div>

        {/* BACK BUTTON */}
        <div className="px-6 md:px-12 lg:px-16 py-10">
          <Link to="/" className="btn-brutal btn-brutal-black inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
