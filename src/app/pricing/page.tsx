import type { Metadata } from "next";

import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { MarketingSection } from "@/components/shared/marketing-section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    `${siteConfig.name} tool access: Free, Pro, and Studio — plans and checkout coming soon.`,
};

const plans = [
  {
    name: "Free",
    price: "$0",
    blurb: "Utility tools and a monthly AI allowance for signed-in accounts.",
    features: [
      "25 utility uses / month",
      "5 AI uses / month",
      "Browser tools + Bytez AI tools",
    ],
  },
  {
    name: "Pro",
    price: "$5",
    blurb: "Unlimited utility processing; higher AI quota (configurable).",
    features: [
      "Unlimited utility tools",
      "Configurable monthly AI cap",
      "Same privacy-first browser tools",
    ],
    highlight: true,
  },
  {
    name: "Studio",
    price: "$9",
    blurb: "For teams and heavier workflows — details when billing goes live.",
    features: [
      "Everything in Pro",
      "Priority support (planned)",
      "Custom integrations (planned)",
    ],
  },
] as const;

export default function PricingPage() {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Pricing"
        title="Plans"
        description="Freemium access for tools is live. Paid upgrades are placeholders until checkout is connected — no subscriptions are charged yet."
      />

      <MarketingSection>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex min-h-full flex-col rounded-lg border-2 p-6 shadow-sm sm:p-8 ${
                "highlight" in p && p.highlight
                  ? "border-[#cafd00]/50 bg-card"
                  : "border-border bg-card/80"
              }`}
            >
              <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
                {p.name}
              </h2>
              <p className="mt-2 font-heading text-3xl font-bold text-[#cafd00]">
                {p.price}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / mo
                </span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.blurb}
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-2 text-sm text-foreground/90">
                {p.features.map((f) => (
                  <li key={f} className="border-b border-border/60 pb-2 last:border-0">
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                disabled
                className="mt-8 w-full rounded-none bg-[#cafd00]/50 font-heading text-xs font-bold uppercase tracking-widest text-[#516700]/70"
              >
                Coming soon
              </Button>
            </div>
          ))}
        </div>
      </MarketingSection>
    </PageShell>
  );
}
