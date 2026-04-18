import { SectionLabel } from "@/components/shared/section-label";
import { cn } from "@/lib/utils";

type PageHeadingProps = {
  /** Optional eyebrow — same treatment as homepage section labels */
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHeading({
  eyebrow,
  title,
  description,
  className,
}: PageHeadingProps) {
  return (
    <header className={cn("mb-10 space-y-4 md:mb-14", className)}>
      {eyebrow ? (
        <SectionLabel className="mb-1 block">{eyebrow}</SectionLabel>
      ) : null}
      <div className="space-y-4 border-l-2 border-primary pl-5 md:pl-6">
        <h1 className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.85rem] md:leading-[1.06]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
