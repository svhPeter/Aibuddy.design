import { useState } from "react";
import { Link } from "react-router";
import { MessageCircle, X, Minimize2, Mail, MessageSquare } from "lucide-react";
import { siteConfig } from "@/config/site";

/**
 * No login — quick links to contact the studio (all tools are free / public).
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#1a1a1a] text-white border-[3px] border-black flex items-center justify-center hover:bg-[#F9FF00] hover:text-black transition-all shadow-lg"
          aria-label="Open contact panel"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white border-[3px] border-black flex flex-col shadow-2xl">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a1a1a] text-white border-b-[3px] border-black">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#F9FF00]" />
              <span className="font-oswald text-sm font-bold uppercase tracking-wider">
                Get in touch
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-[#F9FF00] transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-[#FF0004] transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#fafafa]">
            <p className="font-inter text-sm text-[#1a1a1a]/80 leading-relaxed">
              {siteConfig.name} tools are <strong>free in the browser</strong> — no
              account. For projects or questions, reach us here:
            </p>
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="flex items-center gap-2 border-[3px] border-black p-3 bg-white hover:bg-[#F9FF00] transition-colors font-inter text-sm"
            >
              <Mail size={16} className="shrink-0" />
              {siteConfig.links.email}
            </a>
            <Link
              to="/contact"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center btn-brutal btn-brutal-black text-sm py-3"
            >
              Contact page
            </Link>
            <Link
              to="/#inquiry"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center btn-brutal btn-brutal-yellow text-sm py-3"
            >
              Project inquiry
            </Link>
            <Link
              to="/tools"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center font-oswald text-xs font-bold uppercase tracking-widest underline"
            >
              All tools
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
