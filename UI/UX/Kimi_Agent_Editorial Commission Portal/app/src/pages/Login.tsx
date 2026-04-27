import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function Login() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="border-b-[3px] border-black px-6 md:px-12 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 font-oswald text-sm uppercase tracking-wider hover:text-[#FF0004] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to {siteConfig.name}
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="border-[3px] border-black">
            {/* Header */}
            <div className="border-b-[3px] border-black bg-[#1a1a1a] text-white px-8 py-6">
              <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] block mb-3">
                {siteConfig.name} Portal
              </span>
              <h1 className="font-oswald text-3xl font-bold uppercase tracking-[-0.02em]">
                NO LOGIN REQUIRED
              </h1>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed mb-8">
                AIBuddy tools and services are available without authentication.
                Use the Tools page or contact us to discuss your project.
              </p>

              <Link
                to="/tools"
                className="w-full btn-brutal btn-brutal-yellow flex items-center justify-center gap-3 py-4 text-base"
              >
                VIEW TOOLS
              </Link>

              <div className="mt-6 pt-6 border-t border-black/10 text-center">
                <p className="font-inter text-xs text-[#1a1a1a]/50">
                  Need help?{" "}
                  <Link
                    to="/contact"
                    className="underline font-medium hover:text-[#FF0004] transition-colors"
                  >
                    Contact us
                  </Link>{" "}
                  any time.
                </p>
              </div>
            </div>
          </div>

          {/* Decorative blocks */}
          <div className="grid grid-cols-3 gap-0 mt-4">
            <div className="h-4 bg-[#F9FF00] border-[3px] border-black" />
            <div className="h-4 bg-[#FF0004] border-[3px] border-black" />
            <div className="h-4 bg-[#1a1a1a] border-[3px] border-black" />
          </div>
        </div>
      </div>
    </div>
  );
}
