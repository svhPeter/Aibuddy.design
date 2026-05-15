import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "01",
    title: "Discovery call",
    duration: "15 minutes · free",
    description:
      "We talk through your goals, timeline, and budget. No pitch, no pressure.",
    color: "yellow",
    details: ["Goals, timeline, budget", "No pitch, no pressure"],
  },
  {
    num: "02",
    title: "Scoped proposal",
    duration: "Within 24 hours",
    description:
      "Fixed price. Fixed timeline. Clear deliverables. Sent in writing.",
    color: "red",
    details: ["Fixed scope", "Clear deliverables"],
  },
  {
    num: "03",
    title: "Build phase",
    duration: "Sprint-based",
    description:
      "Weekly demos, transparent progress, zero surprises along the way.",
    color: "yellow",
    details: ["Weekly demos", "Transparent progress"],
  },
  {
    num: "04",
    title: "Ship & handover",
    duration: "On agreed date",
    description:
      "Full code, full docs, deployed. You own everything.",
    color: "red",
    details: ["You own the code", "Deployed and documented"],
  },
];

export function Process() {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-step") || "0");
            setActiveStep(idx);
          }
        });
      },
      { threshold: 0.5 }
    );

    const cards = sectionRef.current?.querySelectorAll("[data-step]");
    cards?.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="process"
      ref={sectionRef}
      className="border-b-[3px] border-black"
    >
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Sticky Left Column */}
        <div className="md:col-span-4 lg:col-span-3 border-r-[3px] border-black md:sticky md:top-0 md:h-screen flex flex-col justify-center px-6 md:px-10 py-12 md:py-0 bg-white">
          <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-4">
            How it works
          </span>
          <h2 className="font-oswald text-4xl md:text-5xl font-bold uppercase tracking-[-0.03em] leading-[0.95] mb-6">
            How working with me looks
          </h2>
          <p className="font-inter text-sm leading-relaxed text-[#1a1a1a]/70 mb-8">
            Transparent. Fast. No surprises.
          </p>
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-3 flex-1 border-[3px] border-black transition-colors ${
                  i === activeStep ? "bg-[#F9FF00]" : "bg-white"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Column - Steps */}
        <div className="md:col-span-8 lg:col-span-9">
          {steps.map((step, i) => (
            <div
              key={i}
              data-step={i}
              className="border-b-[3px] border-black px-6 md:px-12 py-12 md:py-16 min-h-[60vh] flex flex-col justify-center hover:bg-[#F9FF00]/20 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-oswald text-6xl md:text-8xl font-bold text-[#1a1a1a]/10 leading-none">
                      {step.num}
                    </span>
                    <span
                      className={`font-oswald text-xs font-bold uppercase tracking-widest px-3 py-1 border-[3px] border-black ${
                        step.color === "yellow"
                          ? "bg-[#F9FF00]"
                          : "bg-[#FF0004] text-white"
                      }`}
                    >
                      {step.duration}
                    </span>
                  </div>
                  <h3 className="font-oswald text-3xl md:text-4xl font-bold uppercase tracking-[-0.02em] mb-4">
                    {step.title}
                  </h3>
                  <p className="font-inter text-sm leading-relaxed text-[#1a1a1a]/70 max-w-md">
                    {step.description}
                  </p>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="border-[3px] border-black">
                    {step.details.map((detail, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-4 px-4 py-3 border-b-[3px] border-black last:border-b-0 hover:bg-[#F9FF00] hover:text-[#1a1a1a] active:bg-[#1a1a1a] active:text-[#F9FF00] transition-colors group/detail"
                      >
                        <span className="font-oswald text-xs font-bold text-[#FF0004] group-active/detail:text-[#F9FF00]">
                          {step.num}.{j + 1}
                        </span>
                        <span className="font-inter text-sm font-medium uppercase tracking-wide">
                          {detail}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
