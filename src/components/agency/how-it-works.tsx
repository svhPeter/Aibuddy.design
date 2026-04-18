import { SectionLabel } from "@/components/shared/section-label";
import { howItWorksSteps } from "@/config/how-it-works";

export function HowItWorks() {
  return (
    <div>
      <SectionLabel className="mb-3">Process</SectionLabel>
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl md:text-[2rem]">
        How it works
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        A straight line from first message to shipped work — no layers of account
        managers.
      </p>
      <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {howItWorksSteps.map((step, index) => (
          <li
            key={step.id}
            className="relative rounded-lg border-2 border-border bg-card p-6"
          >
            <span
              className="mb-4 flex size-8 items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-xs font-semibold tabular-nums text-primary"
              aria-hidden
            >
              {index + 1}
            </span>
            <h3 className="font-heading text-base font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
