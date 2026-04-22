import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  getToolCrossLinks,
  toolRuntimeSubtitle,
  type ToolCatalogEntry,
} from "@/config/tools";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type ToolCrossLinksProps = {
  currentHref: ToolCatalogEntry["href"];
  className?: string;
};

export function ToolCrossLinks({ currentHref, className }: ToolCrossLinksProps) {
  const links = getToolCrossLinks(currentHref);
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Other tools"
      className={cn(
        "min-w-0 rounded-lg border-2 border-border bg-card/60 p-4 shadow-sm sm:p-6",
        className,
      )}
    >
      <h2 className="font-heading text-xs font-bold uppercase tracking-[0.2em] text-[#cafd00]">
        Other tools
      </h2>
      <ul className="mt-4 list-none space-y-3 p-0">
        {links.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="group flex min-w-0 items-start justify-between gap-3 rounded-md border border-transparent px-1 py-2 transition-colors hover:border-border hover:bg-background/50 sm:py-1.5"
            >
              <span className="min-w-0 flex-1">
                <span className="font-heading text-sm font-semibold text-foreground group-hover:text-[#cafd00]">
                  {t.name}
                </span>
                <span className="mt-0.5 block text-pretty text-xs text-muted-foreground">
                  {t.badge} · {toolRuntimeSubtitle(t)}
                </span>
              </span>
              <ArrowUpRight
                className="mt-0.5 size-4 shrink-0 text-muted-foreground group-hover:text-[#cafd00]"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-5 border-t border-border pt-4">
        <Link
          href="/tools"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex w-full justify-center rounded-none sm:w-auto",
          )}
        >
          All tools
        </Link>
      </div>
    </nav>
  );
}
