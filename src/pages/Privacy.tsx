import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { siteConfig } from "@/config/site";
import { usePageMeta } from "@/hooks/use-page-meta";

export default function Privacy() {
  usePageMeta({
    title: "Privacy Policy — AIBuddy",
    description: "How AIBuddy handles your data. Browser-based tools keep files on your device. Plain-language privacy notes.",
    canonical: "https://aibuddy.design/privacy",
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-16 border-b-[3px] border-black">
        <div className="px-6 md:px-12 lg:px-16 py-12">
          <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
            Legal
          </span>
          <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
            Privacy policy
          </h1>
          <p className="font-inter text-sm text-[#1a1a1a]/70 max-w-2xl mt-4 leading-relaxed">
            Plain-language privacy notes for {siteConfig.domain}. Last updated: May 9,
            2026.
          </p>
        </div>
      </div>

      <div className="max-w-3xl px-6 md:px-12 lg:px-16 py-10 space-y-8 font-inter text-sm text-[#1a1a1a]/85 leading-relaxed">
        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            What we do (and don’t) collect
          </h2>
          <p>
            This site is mostly static. Many tools run directly in your browser, so
            your files stay on your device. We don’t sell personal data and we’re
            not trying to build ad profiles.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            If you contact us
          </h2>
          <p>
            If you use the inquiry form or contact page, you choose how to send your
            message (email, WhatsApp, or copying text). We receive only what you send
            through those channels, and we use it to respond and scope work.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Tools: what stays in your browser
          </h2>
          <p>
            Image utilities (compress, convert, resize, watermark) are
            designed to process files locally in your tab. If you close the tab, the
            data is gone.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            AI features
          </h2>
          <p>
            If you use AI tools or chat features, your prompt/input is sent to our
            backend to generate a response. We only use that data to provide the
            feature you requested.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Cookies and local storage
          </h2>
          <p>
            We keep this minimal. Your browser may store small pieces of data for
            basic UX (for example, UI state) and for session features used by the AI
            backend. You can clear site data at any time in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Hosting logs
          </h2>
          <p>
            Like most websites, our hosting provider may keep short-lived technical
            logs (IP address, user agent, request path, timestamp) for reliability
            and security. We don’t use these for targeted advertising.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Third‑party links
          </h2>
          <p>
            If you click external links (GitHub, live demos, social networks), those
            sites have their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Contact
          </h2>
          <p>
            Questions about privacy:{" "}
            <a
              href={`mailto:${siteConfig.links.email}`}
              className="underline font-medium text-[#1a1a1a]"
            >
              {siteConfig.links.email}
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Updates
          </h2>
          <p>
            If we change how the site works (for example, adding analytics or new
            third-party services), we’ll update this page and the “Last updated”
            date.
          </p>
        </section>
      </div>

      <div className="px-6 md:px-12 lg:px-16 pb-12 flex flex-wrap gap-3">
        <Link to="/contact" className="btn-brutal btn-brutal-yellow text-sm py-2 px-4">
          Contact
        </Link>
        <Link to="/" className="btn-brutal btn-brutal-black text-sm py-2 px-4">
          <ArrowLeft size={14} className="inline mr-1" />
          Home
        </Link>
      </div>
    </div>
  );
}
