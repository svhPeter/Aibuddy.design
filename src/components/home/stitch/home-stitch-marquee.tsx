const MARQUEE_SEGMENT =
  "AI WEBSITES • AUTOMATION • CHATBOTS • LEAD GEN • STRATEGIC DATA • NEURAL DESIGN • ";

export function HomeStitchMarquee() {
  const block = MARQUEE_SEGMENT.repeat(4);
  return (
    <div className="bg-[#cafd00] py-4 sm:py-5">
      <div className="relative overflow-x-hidden">
        <div className="flex w-max max-w-none animate-stitch-marquee will-change-transform">
          <span className="font-heading inline-flex items-center gap-0 px-3 text-lg font-bold uppercase italic tracking-tighter text-[#516700] sm:text-xl md:text-2xl">
            {block}
          </span>
          <span
            className="font-heading inline-flex items-center gap-0 px-3 text-lg font-bold uppercase italic tracking-tighter text-[#516700] sm:text-xl md:text-2xl"
            aria-hidden
          >
            {block}
          </span>
        </div>
      </div>
    </div>
  );
}
