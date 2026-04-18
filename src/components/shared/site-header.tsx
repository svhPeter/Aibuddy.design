"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Primary nav — labels match destination pages. */
const navItems = [
  { href: "/services", label: "Strategy" },
  { href: "/tools", label: "Tools" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/about", label: "About" },
] as const;

const linkBase =
  "font-heading border-b-2 pb-1 text-sm font-bold uppercase tracking-tighter transition-colors duration-300";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 z-50 flex w-full items-center justify-between border-b border-[#262626]/80 bg-[#0e0e0e]/95 px-6 py-5 backdrop-blur-xl backdrop-saturate-150 sm:px-10 supports-[padding:max(0px)]:pt-[max(1.1rem,env(safe-area-inset-top))]">
      <Link
        href="/"
        className="font-heading text-lg font-bold tracking-tighter text-[#cafd00] sm:text-2xl"
      >
        {siteConfig.name}
      </Link>

      <nav
        className="hidden items-center gap-12 md:flex"
        aria-label="Primary"
      >
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                linkBase,
                active
                  ? "border-[#cafd00] text-[#cafd00]"
                  : "border-transparent text-stitch-muted hover:text-[#f3ffca]",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/contact"
        className={cn(
          buttonVariants({ variant: "default", size: "sm" }),
          "hidden rounded-none border-0 bg-[#cafd00] px-6 py-2 font-heading text-xs font-bold uppercase tracking-tighter text-[#516700] hover:bg-[#f3ffca] md:inline-flex",
        )}
      >
        Get started
      </Link>

      <div className="flex items-center gap-2 md:hidden">
        <Link
          href="/contact"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "rounded-none border-0 bg-[#cafd00] px-4 py-2 font-heading text-xs font-bold uppercase tracking-tighter text-[#516700]",
          )}
        >
          Start
        </Link>
        <details className="group relative">
          <summary
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "list-none rounded-none border-2 border-[#777575] bg-transparent text-white [&::-webkit-details-marker]:hidden",
            )}
            aria-label="Open menu"
          >
            <Menu className="size-4" strokeWidth={1.75} aria-hidden />
          </summary>
          <nav
            className="absolute right-0 z-50 mt-2 max-h-[min(70vh,24rem)] w-[min(100vw-2rem,18rem)] overflow-y-auto overflow-x-hidden border-2 border-[#262626] bg-[#131313] py-2 shadow-2xl"
            aria-label="Mobile primary"
          >
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="min-h-12 px-4 py-3.5 font-heading text-sm font-bold uppercase tracking-tighter text-white hover:bg-[#201f1f] active:bg-[#262626]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="min-h-12 px-4 py-3.5 font-heading text-sm font-bold uppercase tracking-tighter text-[#cafd00] hover:bg-[#201f1f]"
              >
                Contact
              </Link>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
