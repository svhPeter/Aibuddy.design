import type { LucideIcon } from "lucide-react";

import type { ServiceItem } from "@/config/services";
import { cn } from "@/lib/utils";

type ServiceCardProps = {
  service: ServiceItem;
  className?: string;
  icon?: LucideIcon;
  /** When true, shows scan-friendly value bullets (services page). */
  showValuePoints?: boolean;
};

export function ServiceCard({
  service,
  className,
  icon: Icon,
  showValuePoints = false,
}: ServiceCardProps) {
  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-lg border-2 border-border bg-card p-6 sm:p-8",
        "shadow-sm transition-all duration-300 ease-out",
        "motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-primary/45 motion-safe:hover:shadow-md motion-safe:hover:shadow-primary/5",
        className,
      )}
    >
      {Icon ? (
        <div
          className="mb-5 inline-flex size-10 items-center justify-center rounded-md border border-primary/35 bg-primary/8 text-primary shadow-none"
          aria-hidden
        >
          <Icon className="size-4" strokeWidth={1.5} />
        </div>
      ) : null}
      <h2 className="font-heading text-base font-semibold tracking-tight text-card-foreground sm:text-lg">
        {service.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {service.summary}
      </p>
      {showValuePoints ? (
        <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
          {service.valuePoints.map((point) => (
            <li
              key={point}
              className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
            >
              <span
                className="mt-2 size-1 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
