import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function SimplePage({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="min-h-screen bg-white pt-16">
      <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12">
        <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
          {eyebrow}
        </span>
        <h1 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
          {title}
        </h1>
        <p className="font-inter text-sm md:text-base text-[#1a1a1a]/70 max-w-2xl mt-4 leading-relaxed">
          {body}
        </p>
      </div>

      <div className="px-6 md:px-12 lg:px-16 py-10">
        <Link to="/" className="btn-brutal btn-brutal-black inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          BACK TO STUDIO
        </Link>
      </div>
    </div>
  );
}

