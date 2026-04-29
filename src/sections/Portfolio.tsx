import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

/* TODO: Add /public/work/shoppos.png (and verify cosmicweb, doctor-booking assets). */
const projects = [
  {
    id: 1,
    name: "ShopPOS",
    typeBadge: "SaaS · Available for licensing",
    description:
      "Multi-tenant POS & shop management SaaS for cafes and retail.",
    highlights: [
      "Multi-tenant architecture: deploy once, serve unlimited shops",
      "Realtime updates via SSE, RBAC, audit logs, accounting integrations",
      "Production-ready — currently licensed to early customers",
    ],
    stack: ["Next.js", "TypeScript", "Postgres", "Prisma", "SSE"],
    image: "/work/shoppos.png",
    primaryLink: {
      url: "https://shop-pos-sand.vercel.app/",
      label: "Live demo",
    },
    secondaryLink: {
      url: "https://github.com/svhPeter/shop-pos-showcase",
      label: "Showcase",
    },
  },
  {
    id: 2,
    name: "Cosmicweb",
    typeBadge: "Personal · Open Source",
    description:
      "Interactive 3D solar system & space learning platform.",
    highlights: [
      "Real-time motion simulations with custom shaders",
      "Mobile-optimized 3D rendering — performant on low-end devices",
      "Built because I love astronomy and wanted to make space tangible",
    ],
    stack: ["Next.js", "Three.js", "TypeScript", "Custom Shaders"],
    image: "/work/cosmicweb.png",
    primaryLink: {
      url: "https://cosmicweb-nine.vercel.app",
      label: "Live demo",
    },
    secondaryLink: {
      url: "https://github.com/svhPeter/cosmicweb",
      label: "Source",
    },
  },
  {
    id: 3,
    name: "Doctor Booking",
    typeBadge: "Mobile · MVP",
    description: "Cross-platform appointment booking app.",
    highlights: [
      "Single Flutter codebase shipping to iOS and Android",
      "Booking flow, scheduling, doctor profiles",
    ],
    stack: ["Flutter", "Dart"],
    image: "/work/doctor-booking.png",
    primaryLink: {
      url: "https://github.com/svhPeter/doctor-booking-mvp",
      label: "Source",
    },
    secondaryLink: null,
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
              Featured work
            </h2>
          </div>
          <span className="hidden md:block font-oswald text-sm uppercase tracking-widest">
            01—03
          </span>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 border-[3px] border-black">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative border-[3px] border-black cursor-pointer overflow-hidden group"
              onMouseEnter={() => setHoveredId(project.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative overflow-hidden aspect-[3/4]">
                <img
                  src={project.image}
                  alt={project.name}
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
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-oswald text-xl md:text-2xl font-bold uppercase text-white leading-tight">
                          {project.name}
                        </h3>
                        <p className="font-inter text-xs text-white/90 mt-1 leading-snug">
                          {project.description}
                        </p>
                        <p className="font-inter text-[10px] text-white/80 mt-2">
                          {project.stack.join(" · ")}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <a
                            href={project.primaryLink.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-oswald text-xs font-bold uppercase text-white underline underline-offset-2 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {project.primaryLink.label}
                          </a>
                          {project.secondaryLink ? (
                            <a
                              href={project.secondaryLink.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-oswald text-xs font-bold uppercase text-white underline underline-offset-2 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {project.secondaryLink.label}
                            </a>
                          ) : null}
                        </div>
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
              <div className="border-t-[3px] border-black bg-white px-3 py-2">
                <p className="font-oswald text-xs font-bold uppercase tracking-wider">
                  {project.typeBadge}
                </p>
                <ul className="mt-2 space-y-1">
                  {project.highlights.map((line) => (
                    <li
                      key={line}
                      className="font-inter text-[10px] text-[#1a1a1a]/80 leading-snug border-l-[2px] border-[#FF0004] pl-2"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
