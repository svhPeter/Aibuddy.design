import { useState } from "react";
import { CheckCircle2, Clock, Circle } from "lucide-react";

const services = [
  {
    id: 1,
    name: "Full-Stack Web Apps",
    discipline: "Modern web apps with auth, dashboards, and APIs.",
    status: "Available",
    availability: "2–4 weeks",
    specialties: ["SaaS founders", "Agencies", "Growing businesses"],
  },
  {
    id: 2,
    name: "Mobile Apps (Flutter)",
    discipline: "iOS and Android from a single codebase.",
    status: "Available",
    availability: "2–3 weeks",
    specialties: ["Startups validating on mobile-first markets"],
  },
  {
    id: 3,
    name: "SaaS Products",
    discipline: "Multi-tenant systems with billing, RBAC, and scale.",
    status: "Available",
    availability: "3–6 weeks",
    specialties: ["Founders launching subscription products"],
  },
  {
    id: 4,
    name: "AI Integration",
    discipline:
      "LLM features, agents, and automation in your product.",
    status: "Available",
    availability: "1–2 weeks",
    specialties: ["Teams adding intelligence to existing products"],
  },
  {
    id: 5,
    name: "3D & Interactive Web",
    discipline: "Three.js, custom shaders, immersive experiences.",
    status: "Available",
    availability: "Scoped per project",
    specialties: ["Brands that need to stand out visually"],
  },
  {
    id: 6,
    name: "Landing Pages & MVPs",
    discipline:
      "Conversion-focused pages and minimum viable products.",
    status: "Available",
    availability: "3–7 days",
    specialties: ["Validating ideas", "Launching campaigns"],
  },
];

export function Roster() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Available":
        return <CheckCircle2 size={16} className="text-green-600" />;
      case "Booked":
        return <Circle size={16} className="text-[#FF0004]" />;
      case "Limited":
        return <Clock size={16} className="text-[#F9FF00]" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-50";
      case "Booked":
        return "bg-red-50";
      case "Limited":
        return "bg-yellow-50";
      default:
        return "";
    }
  };

  return (
    <section id="services" className="py-16 md:py-24 border-b-[3px] border-black">
      <div className="px-6 md:px-12 lg:px-16 mb-12">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
              Core Offerings
            </span>
            <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
              SERVICES
            </h2>
            <p className="font-inter text-sm text-[#1a1a1a]/70 mt-3 max-w-2xl">
              These are common service lines, not strict limits. If your IT/software
              requirement is different, share it and we can scope it together.
            </p>
          </div>
          <span className="hidden md:block font-oswald text-sm uppercase tracking-widest">
            6 AREAS
          </span>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 overflow-x-auto">
        <div className="border-[3px] border-black min-w-[800px]">
          {/* Table Header */}
          <div className="grid grid-cols-12 border-b-[3px] border-black bg-[#1a1a1a] text-white">
            <div className="col-span-3 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest">
              Service
            </div>
            <div className="col-span-3 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              What it is
            </div>
            <div className="col-span-2 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              Status
            </div>
            <div className="col-span-2 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              Turnaround
            </div>
            <div className="col-span-2 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              Best for
            </div>
          </div>

          {/* Table Rows */}
          {services.map((service, i) => (
            <div
              key={service.id}
              className={`grid grid-cols-12 border-b-[3px] border-black last:border-b-0 transition-colors cursor-pointer ${
                hoveredRow === service.id
                  ? "bg-[#F9FF00]"
                  : i % 2 === 0
                  ? "bg-white"
                  : "bg-[#fafafa]"
              }`}
              onMouseEnter={() => setHoveredRow(service.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <div className="col-span-3 px-4 py-4 flex items-center gap-3">
                <span className="font-oswald text-lg font-bold uppercase tracking-tight">
                  {service.name}
                </span>
              </div>
              <div className="col-span-3 px-4 py-4 border-l-[3px] border-black flex items-center">
                <span className="font-inter text-sm">{service.discipline}</span>
              </div>
              <div className="col-span-2 px-4 py-4 border-l-[3px] border-black flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span className="font-inter text-sm font-medium">
                  {service.status}
                </span>
              </div>
              <div className="col-span-2 px-4 py-4 border-l-[3px] border-black flex items-center">
                <span
                  className={`font-inter text-sm px-2 py-1 ${getStatusBg(
                    service.status
                  )}`}
                >
                  {service.availability}
                </span>
              </div>
              <div className="col-span-2 px-4 py-4 border-l-[3px] border-black flex items-center flex-wrap gap-1">
                {service.specialties.map((s, j) => (
                  <span
                    key={j}
                    className="font-inter text-[10px] uppercase tracking-wider border border-black px-2 py-0.5 bg-white inline-block mr-1 mb-1"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
