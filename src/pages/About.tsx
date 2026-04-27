import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { siteConfig } from "@/config/site";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-16 border-b-[3px] border-black">
        <div className="px-6 md:px-12 lg:px-16 py-12">
          <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
            About
          </span>
          <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
            {siteConfig.name}
          </h1>
          <p className="font-inter text-sm md:text-base text-[#1a1a1a]/70 max-w-2xl mt-4 leading-relaxed">
            {siteConfig.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 border-b-[3px] border-black">
        <div className="lg:col-span-6 border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-black px-6 md:px-10 lg:px-12 py-10">
          <h2 className="font-oswald text-sm font-bold uppercase tracking-widest mb-3 text-[#1a1a1a]/50">
            How we work
          </h2>
          <p className="font-inter text-sm text-[#1a1a1a]/80 leading-relaxed">
            Small-team energy: we talk to you directly, document scope in plain
            language, and ship. No layers of account managers — strategy, design,
            and implementation stay connected so the product you launch matches
            what you agreed to build.
          </p>
        </div>
        <div className="lg:col-span-6 px-6 md:px-10 lg:px-12 py-10 bg-[#fafafa]">
          <h2 className="font-oswald text-sm font-bold uppercase tracking-widest mb-3 text-[#1a1a1a]/50">
            Good fit
          </h2>
          <ul className="font-inter text-sm text-[#1a1a1a]/80 space-y-2 leading-relaxed list-disc pl-4">
            <li>Web products, internal tools, and AI-assisted workflows</li>
            <li>Brutally honest scoping and timelines you can plan around</li>
            <li>Teams that value craft and shipping over slide decks</li>
          </ul>
        </div>
      </div>

      <div className="px-6 md:px-12 lg:px-16 py-10 flex flex-wrap gap-3">
        <Link to="/contact" className="btn-brutal btn-brutal-yellow text-sm py-2 px-4">
          Get in touch
        </Link>
        <Link to="/tools" className="btn-brutal btn-brutal-black text-sm py-2 px-4">
          Free tools
        </Link>
        <Link to="/" className="btn-brutal border-[3px] border-black bg-white text-sm py-2 px-4">
          <ArrowLeft size={14} className="inline mr-1" />
          Home
        </Link>
      </div>
    </div>
  );
}
