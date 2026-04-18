import Link from "next/link";

import { siteConfig } from "@/config/site";

export function DemoPoweredBy() {
  return (
    <p className="border-t border-border/50 pt-8 text-center text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-muted-foreground">
      Powered by{" "}
      <Link
        href="/"
        className="text-foreground/90 underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        AIBuddy
      </Link>
      <span className="sr-only"> ({siteConfig.domain})</span>
    </p>
  );
}
