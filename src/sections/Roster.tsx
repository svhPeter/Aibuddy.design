import { useState } from "react";
import { CheckCircle2, Clock, Circle } from "lucide-react";

const services = [
  {
    id: 1,
    name: "WEB DEVELOPMENT",
    discipline: "Next.js / React / TypeScript",
    status: "Available",
    availability: "Now",
    specialties: ["Dashboards", "Landing Pages", "APIs"],
  },
  {
    id: 2,
    name: "BACKEND & DATABASES",
    discipline: "Node.js / Postgres / Drizzle",
    status: "Booked",
    availability: "Limited",
    specialties: ["Auth", "Payments", "Data Modeling"],
  },
  {
    id: 3,
    name: "MOBILE APPS",
    discipline: "React Native / iOS / Android",
    status: "Available",
    availability: "Now",
    specialties: ["Push", "Offline", "Performance"],
  },
  {
    id: 4,
    name: "AI INTEGRATION",
    discipline: "LLMs / RAG / Vision",
    status: "Limited",
    availability: "1–2 weeks",
    specialties: ["Chatbots", "Agents", "Automations"],
  },
  {
    id: 5,
    name: "UI/UX DESIGN",
    discipline: "Product UI / Design Systems",
    status: "Available",
    availability: "Now",
    specialties: ["Wireframes", "Design Tokens", "Prototypes"],
  },
  {
    id: 6,
    name: "MAINTENANCE & SUPPORT",
    discipline: "Monitoring / Fixes / Iteration",
    status: "Booked",
    availability: "By schedule",
    specialties: ["Bugfixes", "SEO", "Upgrades"],
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
              Stack / Focus
            </div>
            <div className="col-span-2 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              Status
            </div>
            <div className="col-span-2 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              Start
            </div>
            <div className="col-span-2 px-4 py-3 font-oswald text-xs font-bold uppercase tracking-widest border-l-[3px] border-white/20">
              Common Work
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
                    className="font-inter text-[10px] uppercase tracking-wider border border-black px-2 py-0.5 bg-white"
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
