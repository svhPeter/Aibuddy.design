import { ClipboardList, HeartPulse, Stethoscope } from "lucide-react";

import { DemoCtaStrip } from "@/components/demos/demo-cta-strip";
import { DemoLeadForm } from "@/components/demos/demo-lead-form";
import { DemoMicrositeShell } from "@/components/demos/demo-microsite-shell";
import { DemoPoweredBy } from "@/components/demos/demo-powered-by";
import { ScriptedChatPanel } from "@/components/demos/scripted-chat-panel";
import { SectionLabel } from "@/components/shared/section-label";
import { clinicChatScript } from "@/config/demo-chat-scripts";
import { cn } from "@/lib/utils";

const highlights = [
  {
    id: "primary",
    title: "Primary & preventive care",
    body: "Annual physicals, chronic-condition follow-ups, and evidence-based screenings — framed for a calm, modern front door.",
    icon: Stethoscope,
  },
  {
    id: "coordination",
    title: "Care coordination",
    body: "Referrals and records requests routed with clear expectations — this demo shows tone and structure, not live PHI.",
    icon: ClipboardList,
  },
  {
    id: "access",
    title: "Patient-friendly access",
    body: "Front-desk hours, messaging, and FAQs that reduce repetitive calls without overpromising instant clinical answers.",
    icon: HeartPulse,
  },
] as const;

export function ClinicDemoPageContent() {
  return (
    <DemoMicrositeShell
      orgName="Meridian Family Care"
      orgDescriptor="Primary care · Demonstration experience"
    >
      <div className="flex flex-col gap-14 md:gap-20">
        <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-gradient-to-br from-emerald-950/[0.06] via-background to-sky-950/[0.05] p-8 shadow-sm sm:rounded-3xl sm:p-12 md:p-14 dark:from-emerald-950/20 dark:via-background dark:to-sky-950/15">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,oklch(0.75_0.12_180/0.18),transparent_55%)]"
          />
          <div className="relative max-w-3xl">
            <SectionLabel className="mb-4 text-emerald-900/80 dark:text-emerald-200/90">
              Same-day callbacks · Coordinated care
            </SectionLabel>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl md:leading-[1.08]">
              Care that respects your calendar — and your questions
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              A demonstration primary-care microsite: appointment requests, service
              highlights, and a scripted assistant for common front-desk questions.
              Not a real clinic; not medical advice.
            </p>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-600/80 dark:bg-emerald-400/80" />
                Adult & family visits
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-600/80 dark:bg-emerald-400/80" />
                Lab orders & referrals
              </li>
              <li className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-600/80 dark:bg-emerald-400/80" />
                Same-week scheduling (demo)
              </li>
            </ul>
          </div>
        </section>

        <DemoLeadForm
          id="appointment"
          title="Request an appointment"
          description="Share how we can help and when you prefer to be seen. In production, this would connect to scheduling or your EHR — here it stays on the device."
          fields={[
            {
              id: "name",
              label: "Full name",
              type: "text",
              autoComplete: "name",
              placeholder: "Alex Morgan",
            },
            {
              id: "phone",
              label: "Phone",
              type: "tel",
              autoComplete: "tel",
              placeholder: "(555) 000-0000",
            },
            {
              id: "reason",
              label: "Reason for visit",
              type: "textarea",
              placeholder: "Annual exam, follow-up, referral question…",
            },
            {
              id: "preferred",
              label: "Preferred days / times (optional)",
              type: "text",
              required: false,
              placeholder: "Weekday mornings, etc.",
            },
          ]}
          submitLabel="Submit request"
          successMessage="Thanks — in this demo, nothing is transmitted. In production, your team would receive this request in the scheduling queue."
        />

        <section aria-labelledby="clinic-highlights-heading">
          <SectionLabel className="mb-3">Why patients choose us</SectionLabel>
          <h2
            id="clinic-highlights-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Service highlights
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Scannable proof points for outreach — written to feel credible without
            inventing outcomes or awards.
          </p>
          <ul className="mt-10 grid gap-5 md:grid-cols-3 md:gap-6">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className={cn(
                    "rounded-2xl border border-border/75 bg-gradient-to-b from-card to-muted/15 p-6 shadow-sm dark:to-muted/10",
                    "transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-md",
                  )}
                >
                  <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg border border-border/70 bg-muted/40 text-foreground">
                    <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <ScriptedChatPanel
          title="Front-desk assistant (demo)"
          assistantName="Meridian Assistant"
          script={clinicChatScript}
          disclaimer="Demonstration only. Not for emergencies or clinical decisions. Not HIPAA-covered on this static demo."
        />

        <DemoCtaStrip />
        <DemoPoweredBy />
      </div>
    </DemoMicrositeShell>
  );
}
