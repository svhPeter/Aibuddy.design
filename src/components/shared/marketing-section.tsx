import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MarketingSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** First section after page heading often uses default top margin */
  spacing?: "default" | "tight";
};

export function MarketingSection({
  children,
  className,
  id,
  spacing = "default",
}: MarketingSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        spacing === "default" && "mt-16 md:mt-20",
        spacing === "tight" && "mt-12 md:mt-16",
        className,
      )}
    >
      {children}
    </section>
  );
}
