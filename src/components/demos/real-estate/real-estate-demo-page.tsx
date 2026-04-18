import { Bath, BedDouble, MapPin } from "lucide-react";

import { DemoCtaStrip } from "@/components/demos/demo-cta-strip";
import { DemoLeadForm } from "@/components/demos/demo-lead-form";
import { DemoMicrositeShell } from "@/components/demos/demo-microsite-shell";
import { DemoPoweredBy } from "@/components/demos/demo-powered-by";
import { ScriptedChatPanel } from "@/components/demos/scripted-chat-panel";
import { SectionLabel } from "@/components/shared/section-label";
import { realEstateChatScript } from "@/config/demo-chat-scripts";
import { cn } from "@/lib/utils";

const listings = [
  {
    id: "1",
    title: "Tree-lined rowhouse",
    locale: "River District · Demo market",
    price: "Demo · $718,000",
    beds: 3,
    baths: 2,
    blurb: "Walkable blocks, strong light, updated kitchen — sample listing for outreach.",
  },
  {
    id: "2",
    title: "Corner loft with skyline",
    locale: "Central corridor · Demo market",
    price: "Demo · $925,000",
    beds: 2,
    baths: 2,
    blurb: "High floor, reduced noise glazing — illustrates premium detail pages.",
  },
  {
    id: "3",
    title: "Starter flat near transit",
    locale: "Eastside · Demo market",
    price: "Demo · $410,000",
    beds: 1,
    baths: 1,
    blurb: "Compact floor plan with storage — good for first-time buyer flows.",
  },
] as const;

export function RealEstateDemoPageContent() {
  return (
    <DemoMicrositeShell
      orgName="Harbor & Row Realty"
      orgDescriptor="Residential brokerage · Demonstration experience"
    >
      <div className="flex flex-col gap-14 md:gap-20">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-amber-950/[0.07] via-background to-stone-900/[0.06] p-8 shadow-sm sm:rounded-3xl sm:p-12 md:p-14 dark:from-amber-950/25 dark:via-background dark:to-stone-900/20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_70%_-10%,oklch(0.82_0.08_75/0.2),transparent_55%)]"
          />
          <div className="relative max-w-3xl">
            <SectionLabel className="mb-4 text-amber-950/90 dark:text-amber-200/90">
              Buyer & seller representation
            </SectionLabel>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.08]">
              The right address — with a clear next step
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A demonstration brokerage experience: listings, lead capture, and a
              scripted buyer assistant. Listings are fictional; pricing is labeled as
              demo data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                Private tours
              </span>
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                Offer strategy
              </span>
              <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-sm">
                Local context
              </span>
            </div>
          </div>
        </section>

        <section aria-labelledby="listings-heading">
          <SectionLabel className="mb-3">Featured</SectionLabel>
          <h2
            id="listings-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Sample listings
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Polished cards you can screen-share — clearly marked as demonstration
            content, not live MLS data.
          </p>
          <ul className="mt-10 grid gap-6 md:grid-cols-3">
            {listings.map((listing) => (
              <li
                key={listing.id}
                className={cn(
                  "flex flex-col overflow-hidden rounded-2xl border border-border/75 bg-gradient-to-b from-card to-muted/15 shadow-sm dark:to-muted/10",
                  "transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md",
                )}
              >
                <div className="relative aspect-[4/3] bg-gradient-to-br from-muted/80 to-muted/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MapPin
                      className="size-10 text-muted-foreground/40"
                      strokeWidth={1.25}
                      aria-hidden
                    />
                  </div>
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-foreground shadow-sm backdrop-blur">
                    Demo
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-medium text-muted-foreground">
                    {listing.locale}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
                    {listing.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {listing.blurb}
                  </p>
                  <p className="mt-4 text-base font-semibold text-foreground">
                    {listing.price}
                  </p>
                  <p className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="size-3.5" aria-hidden />
                      {listing.beds} beds
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Bath className="size-3.5" aria-hidden />
                      {listing.baths} baths
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <DemoLeadForm
          id="inquiry"
          title="Inquiry"
          description="Tell us what you are looking for — in production, this would sync to your CRM or inbox. This demo only confirms on screen."
          fields={[
            {
              id: "name",
              label: "Name",
              type: "text",
              autoComplete: "name",
            },
            {
              id: "email",
              label: "Email",
              type: "email",
              autoComplete: "email",
            },
            {
              id: "phone",
              label: "Phone",
              type: "tel",
              autoComplete: "tel",
            },
            {
              id: "goals",
              label: "What are you looking for?",
              type: "textarea",
              placeholder: "Neighborhoods, budget range, timeline…",
            },
          ]}
          submitLabel="Send inquiry"
          successMessage="Received — in this demo, your details are not stored or emailed. Hook this form to your stack when you go live."
        />

        <ScriptedChatPanel
          title="Buyer assistant (demo)"
          assistantName="Harbor Concierge"
          script={realEstateChatScript}
          disclaimer="Demonstration only — not legal, tax, or lending advice. Connect prospects to licensed professionals in production."
        />

        <DemoCtaStrip />
        <DemoPoweredBy />
      </div>
    </DemoMicrositeShell>
  );
}
