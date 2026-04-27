import { Link, useParams } from "react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { getToolById } from "@/config/tools";

export default function ToolDetail() {
  const params = useParams();
  const toolId = params.toolId ?? "";
  const tool = getToolById(toolId);

  if (!tool) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-oswald text-3xl font-bold uppercase mb-3">TOOL NOT FOUND</h1>
          <p className="font-inter text-sm text-[#1a1a1a]/60 mb-8">
            That tool route exists, but we don’t have a catalog entry for it yet.
          </p>
          <Link to="/tools" className="btn-brutal btn-brutal-yellow inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            BACK TO TOOLS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16">
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
          {tool.access === "account" && (
            <span className="inline-flex items-center gap-2 bg-white px-3 py-1 font-oswald text-xs font-bold uppercase tracking-widest border-[3px] border-black">
              <Lock size={14} />
              Sign in required
            </span>
          )}
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
          <div className="border-[3px] border-black p-8">
            <h2 className="font-oswald text-xl font-bold uppercase tracking-tight mb-4">
              Tool UI
            </h2>
            <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed">
              This route is ready and wired. Next step is implementing the full tool
              logic (upload/inputs/output) for <strong className="font-inter">{tool.name}</strong>{" "}
              inside this panel, using the same brutal UI components.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 px-6 md:px-10 py-10 bg-[#1a1a1a] text-white">
          <h3 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-3">
            Quick actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/login"
              className="btn-brutal btn-brutal-yellow w-full block text-center"
            >
              SIGN IN
            </Link>
            <Link
              to="/contact"
              className="btn-brutal btn-brutal-black w-full block text-center"
            >
              CONTACT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

