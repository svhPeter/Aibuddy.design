import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    id: 1,
    title: "DE STIJL ISSUE",
    client: "LUXURY MAGAZINE",
    category: "Editorial",
    image: "/portfolio-1.jpg",
    size: "tall",
  },
  {
    id: 2,
    title: "DECONSTRUCT FLUX",
    client: "EXPERIMENTAL FORM",
    category: "Brand Identity",
    image: "/portfolio-2.jpg",
    size: "tall",
  },
  {
    id: 3,
    title: "STRUCTURAL ELEGANCE",
    client: "VOGUE ITALIA",
    category: "Fashion Illustration",
    image: "/portfolio-3.jpg",
    size: "tall",
  },
  {
    id: 4,
    title: "GRID & FORM",
    client: "SWISS DESIGN WEEK",
    category: "Packaging",
    image: "/portfolio-4.jpg",
    size: "wide",
  },
  {
    id: 5,
    title: "IMPACT MOTION",
    client: "KINETIC STUDIOS",
    category: "Motion Design",
    image: "/portfolio-5.jpg",
    size: "tall",
  },
  {
    id: 6,
    title: "PRISM WILD",
    client: "NATURE PRESS",
    category: "Publishing",
    image: "/portfolio-6.jpg",
    size: "tall",
  },
];

export function Portfolio() {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section id="portfolio" className="py-16 md:py-24 border-b-[3px] border-black">
      <div className="px-6 md:px-12 lg:px-16 mb-12">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
              Selected Work
            </span>
            <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
              PORTFOLIO
            </h2>
          </div>
          <span className="hidden md:block font-oswald text-sm uppercase tracking-widest">
            01—06
          </span>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-[3px] border-black">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`relative border-[3px] border-black cursor-pointer overflow-hidden group ${
                project.size === "wide" ? "md:col-span-2" : ""
              }`}
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div
                className={`relative overflow-hidden ${
                  project.size === "wide"
                    ? "aspect-[2/1]"
                    : "aspect-[3/4]"
                }`}
              >
                <img
                  src={project.image}
                  alt={project.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    hoveredId === project.id
                      ? "scale-105 saturate-0"
                      : "scale-100 saturate-100"
                  }`}
                />
                {/* Overlay */}
                <div
                  className={`absolute inset-0 transition-all duration-300 ${
                    hoveredId === project.id
                      ? "bg-[#FF0004]/90"
                      : "bg-transparent"
                  }`}
                />
                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                  <div
                    className={`transition-all duration-300 ${
                      hoveredId === project.id
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-oswald text-xl md:text-2xl font-bold uppercase text-white leading-tight">
                          {project.title}
                        </h3>
                        <p className="font-inter text-xs text-white/80 mt-1 uppercase tracking-wider">
                          {project.client}
                        </p>
                      </div>
                      <ArrowUpRight className="text-white flex-shrink-0" size={24} />
                    </div>
                  </div>
                </div>
                {/* Border indicator on hover */}
                {hoveredId === project.id && (
                  <div className="absolute inset-0 border-[6px] border-[#FF0004] pointer-events-none" />
                )}
              </div>
              {/* Label bar */}
              <div className="border-t-[3px] border-black bg-white px-3 py-2 flex items-center justify-between">
                <span className="font-oswald text-xs font-bold uppercase tracking-wider">
                  {project.category}
                </span>
                <span className="font-inter text-[10px] uppercase text-[#1a1a1a]/50">
                  {String(project.id).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
