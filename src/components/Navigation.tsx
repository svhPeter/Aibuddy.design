import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navItems = [
    { label: "WORK", action: () => scrollToSection("portfolio") },
    { label: "PROCESS", action: () => scrollToSection("process") },
    { label: "PRICING", action: () => scrollToSection("pricing") },
    { label: "SERVICES", action: () => scrollToSection("services") },
    { label: "INQUIRY", action: () => scrollToSection("inquiry") },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white border-b-[3px] border-black"
          : "bg-transparent"
      }`}
    >
      <div className="w-full">
        {/* Desktop Nav */}
        <div className="hidden md:grid grid-cols-12">
          <div className="col-span-3 border-r-[3px] border-black px-6 py-4 flex items-center">
            <Link
              to="/"
              className="font-oswald text-xl font-bold tracking-tight-oswald uppercase flex items-center gap-3"
              aria-label={`${siteConfig.name} home`}
            >
              <img
                src="/logoheader.svg"
                alt=""
                className="h-8 w-auto object-contain object-left shrink-0"
                width={50}
                height={64}
                aria-hidden
              />
              {siteConfig.name}
            </Link>
          </div>
          <div className="col-span-6 flex">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="flex-1 border-r-[3px] border-black px-4 py-4 font-oswald text-sm font-semibold uppercase tracking-wide hover:bg-[#F9FF00] transition-colors text-center"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="col-span-3 flex items-center justify-end px-6 gap-3">
            <Link
              to="/tools"
              className="btn-brutal btn-brutal-black text-xs py-2 px-4"
            >
              TOOLS
            </Link>
            <Link
              to="/contact"
              className="btn-brutal btn-brutal-yellow text-xs py-2 px-4"
            >
              CONTACT
            </Link>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="font-oswald text-lg font-bold tracking-tight-oswald uppercase flex items-center gap-2"
            aria-label={`${siteConfig.name} home`}
          >
            <img
              src="/logoheader.svg"
              alt=""
              className="h-7 w-auto object-contain object-left shrink-0"
              width={44}
              height={56}
              aria-hidden
            />
            <span className="leading-none">{siteConfig.name}</span>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t-[3px] border-black">
            {navItems.map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                className="w-full text-left px-6 py-4 border-b-[3px] border-black font-oswald text-lg font-semibold uppercase hover:bg-[#F9FF00] transition-colors"
              >
                {item.label}
              </button>
            ))}
            <div className="px-6 py-4">
              <div className="flex flex-col gap-3">
                <Link
                  to="/tools"
                  className="btn-brutal btn-brutal-black text-sm py-3 block text-center"
                >
                  TOOLS
                </Link>
                <Link
                  to="/contact"
                  className="btn-brutal btn-brutal-yellow text-sm py-3 block text-center"
                >
                  CONTACT
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
