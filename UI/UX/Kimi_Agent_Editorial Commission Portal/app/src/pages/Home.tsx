import { Navigation } from "@/components/Navigation";
import { Hero } from "@/sections/Hero";
import { Portfolio } from "@/sections/Portfolio";
import { Process } from "@/sections/Process";
import { Services } from "@/sections/Services";
import { InquiryForm } from "@/sections/InquiryForm";
import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Portfolio />
      <Process />
      <Services />
      <InquiryForm />

      {/* Footer */}
      <footer className="border-t-[3px] border-black bg-[#1a1a1a] text-white">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 border-r-[3px] border-white/10 px-6 md:px-10 py-10">
            <h3 className="font-oswald text-2xl font-bold uppercase tracking-tight mb-4">
              {siteConfig.name}
            </h3>
            <p className="font-inter text-xs text-white/60 leading-relaxed max-w-sm">
              {siteConfig.description} {siteConfig.locationLabel}
            </p>
          </div>
          <div className="md:col-span-3 border-r-[3px] border-white/10 px-6 md:px-10 py-10">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-4">
              Navigate
            </h4>
            <div className="space-y-2">
              {["Work", "Process", "Services", "Inquiry", "Tools"].map(
                (item) => (
                  <a
                    key={item}
                    href={
                      item === "Tools"
                        ? "/tools"
                        : `#${item.toLowerCase()}`
                    }
                    className="block font-inter text-sm text-white/70 hover:text-[#F9FF00] transition-colors"
                  >
                    {item}
                  </a>
                )
              )}
            </div>
          </div>
          <div className="md:col-span-3 border-r-[3px] border-white/10 px-6 md:px-10 py-10">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-4">
              Services
            </h4>
            <div className="space-y-2">
              {[
                "Web Development",
                "Mobile Apps",
                "AI Integration",
                "Automation",
                "UI/UX Design",
              ].map((item) => (
                <span
                  key={item}
                  className="block font-inter text-sm text-white/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 px-6 md:px-10 py-10">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-4">
              Social
            </h4>
            <div className="space-y-2">
              {["Instagram", "Behance", "Dribbble", "LinkedIn"].map(
                (item) => (
                  <span
                    key={item}
                    className="block font-inter text-sm text-white/70 hover:text-[#F9FF00] transition-colors cursor-pointer"
                  >
                    {item}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="font-inter text-[10px] text-white/40">
            &copy; 2026 {siteConfig.name}. ALL RIGHTS RESERVED.
          </span>
          <span className="font-inter text-[10px] text-white/40">
            {siteConfig.domain.toUpperCase()}
          </span>
        </div>
      </footer>
    </div>
  );
}
