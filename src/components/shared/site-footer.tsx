import Link from "next/link";
import { Building2, Grid3x3, Terminal } from "lucide-react";

import { siteConfig } from "@/config/site";

const links = [
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="flex w-full min-w-0 flex-col items-center justify-between gap-10 border-t border-[#262626] bg-black px-4 py-12 sm:px-6 sm:py-16 md:px-10 md:py-20 md:flex-row md:items-start md:gap-8 supports-[padding:max(0px)]:pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="flex flex-col items-center gap-4 md:items-start">
        <div className="font-heading text-xl font-bold text-white">
          {siteConfig.name}
        </div>
        <p className="text-xs uppercase tracking-widest text-[#777575]">
          © {year} {siteConfig.name} · {siteConfig.domain} · v{siteConfig.version}.
          Architecting intelligence.
        </p>
      </div>
      <div className="flex max-w-md flex-wrap justify-center gap-x-10 gap-y-4 md:max-w-none md:justify-end md:gap-x-12">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-xs uppercase tracking-widest text-[#777575] opacity-80 transition-colors hover:text-[#cafd00] hover:opacity-100"
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="flex gap-6 text-white" aria-hidden="true">
        <Grid3x3 className="size-5 cursor-default hover:text-[#cafd00]" />
        <Terminal className="size-5 cursor-default hover:text-[#cafd00]" />
        <Building2 className="size-5 cursor-default hover:text-[#cafd00]" />
      </div>
    </footer>
  );
}
