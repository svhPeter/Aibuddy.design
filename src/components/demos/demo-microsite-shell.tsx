import type { ReactNode } from "react";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type DemoMicrositeShellProps = {
  children: ReactNode;
  /** Fictional organization name shown in the top bar */
  orgName: string;
  /** Short line under the name, e.g. “Primary care · Demonstration” */
  orgDescriptor: string;
  className?: string;
};

export function DemoMicrositeShell({
  children,
  orgName,
  orgDescriptor,
  className,
}: DemoMicrositeShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-full flex-1 flex-col bg-background",
        className,
      )}
    >
      <header className="sticky top-0 z-40 border-b-2 border-border bg-background/90 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
              {orgName}
            </p>
            <p className="text-xs text-muted-foreground sm:text-sm">{orgDescriptor}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
              Demonstration
            </span>
            <Link
              href="/"
              className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
            >
              {siteConfig.name}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 sm:py-12 md:py-14">
        {children}
      </main>
    </div>
  );
}
