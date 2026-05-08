import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { siteConfig } from "@/config/site";

export default function Privacy() {
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
            How {siteConfig.name} handles information when you use {siteConfig.domain}.
            Last updated: May 7, 2026.
          </p>
        </div>
      </div>

      <div className="max-w-3xl px-6 md:px-12 lg:px-16 py-10 space-y-8 font-inter text-sm text-[#1a1a1a]/85 leading-relaxed">
        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Summary
          </h2>
          <p>
            This site is mostly static. Free tools and image utilities run in your
            browser where possible — your files typically stay on your device. When
            you contact us, you choose your channel (email, WhatsApp, or your own
            mail client); we do not operate a server-side &quot;contact database&quot;
            on this marketing site for routine messages.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Information you choose to send
          </h2>
          <p>
            If you use the inquiry form, contact page, or similar, the details you
            enter are included in a brief you send via your email client or WhatsApp
            (or copy to clipboard). We only receive what you actually send through
            those channels.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Hosting and technical logs
          </h2>
          <p>
            The site is hosted on a commercial platform (for example, Vercel).
            Like most websites, infrastructure may keep short-lived technical logs
            (such as IP address, user agent, request path, and timestamp) for
            security and reliability. We do not use those logs to build advertising
            profiles.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Cookies and local storage
          </h2>
          <p>
            The site may use minimal browser storage or cookies required for basic
            functionality (for example, preferences or chat widgets if enabled).
            You can clear site data from your browser settings at any time.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Third-party services
          </h2>
          <p>
            If you follow outbound links (GitHub, demo apps, social networks, etc.),
            those services have their own privacy policies. AI-powered tools on this
            site may call external APIs only when you explicitly use them and submit
            input; check each tool&apos;s description for what leaves the browser.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Children
          </h2>
          <p>
            This site is not directed at children under 13, and we do not knowingly
            collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="font-oswald text-lg font-bold uppercase tracking-tight mb-2">
            Changes
          </h2>
          <p>
            We may update this page occasionally. The &quot;Last updated&quot; date at
            the top will change when we do.
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

        <p className="text-xs text-[#1a1a1a]/50 border-t-[3px] border-black pt-6">
          This policy is provided for transparency and is not legal advice. For
          regulated industries or complex data use cases, consult qualified counsel.
        </p>
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
