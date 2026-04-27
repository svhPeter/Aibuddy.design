const services = [
  {
    title: "Web Apps",
    items: ["Next.js / React", "Dashboards", "Admin panels", "APIs"],
  },
  {
    title: "Mobile",
    items: ["iOS / Android", "React Native", "Performance", "App store launch"],
  },
  {
    title: "AI Integration",
    items: ["Chat + assistants", "Vision + OCR", "RAG search", "Workflows"],
  },
  {
    title: "Automation",
    items: ["Zapier / Make", "Custom integrations", "Data pipelines", "Ops tooling"],
  },
  {
    title: "UI/UX",
    items: ["Design systems", "Product UI", "Landing pages", "Conversion flows"],
  },
  {
    title: "Shipping",
    items: ["MVP in weeks", "Iterate weekly", "Monitoring", "Maintenance"],
  },
] as const;

export function Services() {
  return (
    <section id="services" className="border-b-[3px] border-black">
      <div className="border-b-[3px] border-black px-6 md:px-12 lg:px-16 py-12">
        <span className="font-oswald text-xs font-bold uppercase tracking-[0.2em] text-[#FF0004] block mb-2">
          What we do
        </span>
        <h2 className="font-oswald text-4xl md:text-6xl font-bold uppercase tracking-[-0.03em]">
          SERVICES
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-4 border-r-[3px] border-black px-6 md:px-12 lg:px-16 py-10 bg-[#fafafa]">
          <h3 className="font-oswald text-xl font-bold uppercase tracking-tight mb-4">
            SOFTWARE, DONE RIGHT
          </h3>
          <p className="font-inter text-sm text-[#1a1a1a]/70 leading-relaxed max-w-sm">
            We’re a software agency: product strategy, design, engineering, and AI
            — shipped with clean scope and clear timelines.
          </p>
        </div>

        <div className="md:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {services.map((s) => (
              <div
                key={s.title}
                className="border-[3px] border-black p-8 m-[-1.5px]"
              >
                <h4 className="font-oswald text-lg font-bold uppercase tracking-tight">
                  {s.title}
                </h4>
                <div className="mt-4 space-y-2">
                  {s.items.map((item) => (
                    <div
                      key={item}
                      className="font-inter text-xs text-[#1a1a1a]/70 border-[3px] border-black inline-block px-3 py-2 mr-2 mb-2 bg-white"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

