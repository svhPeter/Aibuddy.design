import { Navigation } from "@/components/Navigation";
import { Hero } from "@/sections/Hero";
import { Portfolio } from "@/sections/Portfolio";
import { Process } from "@/sections/Process";
import { Pricing } from "@/sections/Pricing";
import { Roster } from "@/sections/Roster";
import { InquiryForm } from "@/sections/InquiryForm";
import { siteConfig } from "@/config/site";
import { usePageMeta } from "@/hooks/use-page-meta";

const footerNavItems: { label: string; href: string }[] = [
  { label: "Work", href: "#portfolio" },
  { label: "Process", href: "#process" },
  { label: "Pricing", href: "#pricing" },
  { label: "Services", href: "#services" },
  { label: "Inquiry", href: "#inquiry" },
  { label: "Tools", href: "/tools" },
];

export default function Home() {
  usePageMeta({
    title: "AIBuddy — AI Engineering Studio",
    description: "Web, mobile, SaaS, AI, 3D — production-grade code, fast turnaround, no-surprise pricing. Building from Karachi for clients worldwide.",
    canonical: "https://aibuddy.design/",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <Portfolio />
      <Process />
      <Pricing />
      <Roster />
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
              {footerNavItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block font-inter text-sm text-white/70 hover:text-[#F9FF00] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 border-r-[3px] border-white/10 px-6 md:px-10 py-10">
            <h4 className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#F9FF00] mb-4">
              Services
            </h4>
            <div className="space-y-2">
              {[
                "Full-stack web apps",
                "Mobile apps (Flutter)",
                "SaaS products",
                "AI integration",
                "3D & interactive web",
                "Landing pages & MVPs",
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
              {[
                { label: "Instagram", href: "https://instagram.com/aibuddy.design" },
                { label: "LinkedIn", href: "https://linkedin.com/company/aibuddy-design" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block font-inter text-sm text-white/70 hover:text-[#F9FF00] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="font-inter text-[10px] text-white/40">
            &copy; 2026 {siteConfig.name}. ALL RIGHTS RESERVED.{" "}
            <a href="/privacy" className="underline hover:text-[#F9FF00]">
              Privacy
            </a>
          </span>
          <span className="font-inter text-[10px] text-white/40">
            {siteConfig.domain.toUpperCase()}
          </span>
        </div>
      </footer>
    </div>
  );
}
