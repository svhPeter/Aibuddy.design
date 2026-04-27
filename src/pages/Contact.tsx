import { useState, useMemo } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail, MessageCircle, Wrench, FileText, Send } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { siteConfig } from "@/config/site";
import { getWhatsappBaseUrl } from "@/lib/inquiry-brief";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const wa = useMemo(() => getWhatsappBaseUrl(), []);

  const sendMailto = (e: React.FormEvent) => {
    e.preventDefault();
    const body = [
      name.trim() && `Name: ${name.trim()}`,
      email.trim() && `Reply email: ${email.trim()}`,
      "",
      message.trim() || "(no message text)",
    ]
      .filter(Boolean)
      .join("\n");
    const subj = `Message from aibuddy.design/contact`;
    window.location.href = `mailto:${
      siteConfig.links.email
    }?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-16 border-b-[3px] border-black">
        <div className="px-6 md:px-12 lg:px-16 py-12">
          <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
            Contact
          </span>
          <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
            Let&apos;s talk
          </h1>
          <p className="font-inter text-sm md:text-base text-[#1a1a1a]/70 max-w-2xl mt-4 leading-relaxed">
            Tell us about your product, timeline, and constraints. We answer in
            plain English, scope first — no hard sell. Working hours are US-based;
            we still reply to every serious note.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black px-6 md:px-10 lg:px-12 py-10 bg-[#fafafa]">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-4">
            What happens next
          </h2>
          <ul className="font-inter text-sm text-[#1a1a1a]/80 space-y-3 leading-relaxed">
            <li className="border-l-[3px] border-[#F9FF00] pl-3">
              You share goals, budget band (even rough), and any links (Figma, repo,
              deck).
            </li>
            <li className="border-l-[3px] border-black pl-3">
              We reply with fit, clarifying questions, and a no-BS read on
              whether we are the right studio.
            </li>
            <li className="border-l-[3px] border-[#FF0004] pl-3">
              If it is a match, we propose a short next step: call, written
              estimate, or a small paid discovery when scope needs it.
            </li>
          </ul>
          <p className="font-inter text-xs text-[#1a1a1a]/55 mt-8 leading-relaxed">
            {siteConfig.locationLabel} Free tools stay in your browser; project work
            is agreed in writing like adults.
          </p>
        </div>

        <div className="lg:col-span-7 px-6 md:px-10 lg:px-12 py-10">
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-6">
            Direct lines
          </h2>
          <div className="space-y-0 border-[3px] border-black mb-10">
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="block p-4 border-b-[3px] border-black hover:bg-[#F9FF00] transition-colors group"
            >
              <div className="flex items-start gap-3">
                <Mail className="shrink-0 mt-0.5 text-[#1a1a1a] group-hover:scale-105 transition-transform" size={20} />
                <div>
                  <div className="font-oswald text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/50">
                    Email
                  </div>
                  <div className="font-inter text-sm font-medium mt-0.5 break-all">
                    {siteConfig.links.email}
                  </div>
                </div>
              </div>
            </a>
            <a
              href={siteConfig.links.url}
              className="block p-4 border-b-[3px] border-black hover:bg-[#fafafa] transition-colors"
            >
              <div className="font-oswald text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/50">
                Website
              </div>
              <div className="font-inter text-sm font-medium mt-0.5">{siteConfig.domain}</div>
            </a>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3 p-4 hover:bg-[#F9FF00] transition-colors"
              >
                <MessageCircle size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-oswald text-xs font-bold uppercase tracking-widest text-[#1a1a1a]/50">
                    WhatsApp
                  </div>
                  <div className="font-inter text-sm mt-0.5">
                    Open chat (same number we use for project inquiries).
                  </div>
                </div>
              </a>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link
              to="/#inquiry"
              className="inline-flex items-center gap-2 btn-brutal btn-brutal-black text-sm py-3 px-4"
            >
              <FileText size={16} />
              Project inquiry
            </Link>
            <Link
              to="/tools"
              className="inline-flex items-center gap-2 btn-brutal border-[3px] border-black bg-white text-sm py-3 px-4"
            >
              <Wrench size={16} />
              Free tools
            </Link>
          </div>

          <div className="border-[3px] border-black p-6">
            <h3 className="font-oswald text-sm font-bold uppercase tracking-widest mb-1">
              Send a message
            </h3>
            <p className="font-inter text-xs text-[#1a1a1a]/60 mb-4">
              Fills your mail app — nothing is stored on our servers.
            </p>
            <form onSubmit={sendMailto} className="space-y-4">
              <div>
                <label
                  className="font-oswald text-[10px] font-bold uppercase block mb-1"
                  htmlFor="c-name"
                >
                  Your name
                </label>
                <input
                  id="c-name"
                  className="input-brutal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  className="font-oswald text-[10px] font-bold uppercase block mb-1"
                  htmlFor="c-email"
                >
                  Your email
                </label>
                <input
                  id="c-email"
                  type="email"
                  className="input-brutal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="so we can reply"
                  autoComplete="email"
                />
              </div>
              <div>
                <label
                  className="font-oswald text-[10px] font-bold uppercase block mb-1"
                  htmlFor="c-msg"
                >
                  Message
                </label>
                <textarea
                  id="c-msg"
                  className="input-brutal min-h-[120px] resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Project type, ideal timeline, links…"
                />
              </div>
              <button type="submit" className="btn-brutal btn-brutal-yellow w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6">
                <Send size={16} />
                Open in email
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t-[3px] border-black px-6 md:px-12 lg:px-16 py-10">
        <Link to="/" className="btn-brutal btn-brutal-black inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
