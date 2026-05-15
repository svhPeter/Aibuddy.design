const tiers = [
  {
    title: "Landing Page",
    startingAt: "From $499",
    turnaround: "3–7 days",
    ideal_for: "Marketing campaigns, product launches",
    popular: false,
    includes: [
      "Custom design (no templates)",
      "Mobile-first responsive",
      "SEO + analytics setup",
      "Up to 2 revision rounds",
      "Deployed to your domain",
    ],
  },
  {
    title: "MVP / Web App",
    startingAt: "From $1,499",
    turnaround: "2–4 weeks",
    ideal_for: "Founders validating an idea, agencies",
    popular: true,
    includes: [
      "Full-stack architecture",
      "Auth + database setup",
      "Core feature implementation",
      "Deployment + 2 weeks bug-fix support",
      "Full source code + documentation",
    ],
  },
  {
    title: "SaaS / Custom Build",
    startingAt: "Custom quote",
    turnaround: "Project-dependent",
    ideal_for:
      "Multi-tenant SaaS, complex products, integrations",
    popular: false,
    includes: [
      "Discovery + architecture design",
      "Sprint-based delivery",
      "Weekly demos + transparent progress",
      "Production-grade testing + security",
      "Long-term partnership available",
    ],
  },
] as const;

export function Pricing() {
  return (
    <section
      id="pricing"
      className="border-b-[3px] border-black bg-white"
    >
      <div className="px-6 md:px-12 lg:px-16 pt-16 md:pt-24 pb-8">
        <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
          Pricing
        </span>
        <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
          Starting at
        </h2>
        <p className="font-inter text-sm text-[#1a1a1a]/70 mt-4 max-w-xl">
          Transparent ranges. Final price after scoping call.
        </p>
      </div>

      <div className="px-6 md:px-12 lg:px-16 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-[3px] border-black bg-white">
          {tiers.map((tier) => (
            <div
              key={tier.title}
              className="border-b-[3px] md:border-b-0 md:border-r-[3px] border-black last:border-b-0 md:last:border-r-0 flex flex-col relative min-h-[1px]"
            >
              {tier.popular ? (
                <div className="absolute top-4 right-4 bg-[#F9FF00] border-[3px] border-black px-3 py-1 font-oswald text-[10px] font-bold uppercase tracking-wider z-10">
                  Most popular
                </div>
              ) : null}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <h3 className="font-oswald text-xl md:text-2xl font-bold uppercase tracking-tight mb-2">
                  {tier.title}
                </h3>
                <p className="font-oswald text-2xl md:text-4xl font-bold mb-1 leading-tight [overflow-wrap:anywhere]">
                  {tier.startingAt}
                </p>
                <p className="font-inter text-xs text-[#1a1a1a]/60 uppercase tracking-wider mb-4">
                  {tier.turnaround}
                </p>
                <p className="font-inter text-sm leading-relaxed text-[#1a1a1a]/80 mb-6">
                  {tier.ideal_for}
                </p>
                <ul className="space-y-2 mt-auto border-t-[3px] border-black pt-4">
                  {tier.includes.map((item) => (
                    <li
                      key={item}
                      className="font-inter text-xs leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-[#FF0004]"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
