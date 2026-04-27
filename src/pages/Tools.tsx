import { Link } from "react-router";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { toolsCatalog } from "@/config/tools";

export default function Tools() {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12">
        <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
          Utilities + AI
        </span>
        <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
          TOOLS
        </h1>
        <p className="font-inter text-sm md:text-base text-[#1a1a1a]/70 max-w-2xl mt-4 leading-relaxed">
          All free in the browser — no login. Pick a utility and ship output in minutes.
        </p>
      </div>

      <div className="px-6 md:px-12 lg:px-16 py-10 border-b-[3px] border-black">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-0">
          {toolsCatalog.map((tool) => (
            <Link
              key={tool.id}
              to={tool.href}
              className="border-[3px] border-black p-8 m-[-1.5px] hover:bg-[#F9FF00] transition-colors group"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-oswald text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a]/70">
                    {tool.badge}
                  </div>
                  <div className="font-oswald text-2xl font-bold uppercase tracking-tight mt-3">
                    {tool.name}
                  </div>
                </div>
                <ArrowUpRight className="mt-1 opacity-60 group-hover:opacity-100" />
              </div>
              <p className="font-inter text-sm text-[#1a1a1a]/70 mt-4 leading-relaxed max-w-md">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 py-10">
        <Link to="/" className="btn-brutal btn-brutal-black inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          BACK TO STUDIO
        </Link>
      </div>
    </div>
  );
}

