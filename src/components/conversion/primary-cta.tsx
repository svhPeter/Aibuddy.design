import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const whatsappPrimaryClass =
  "border-0 bg-[#25D366] text-white shadow-sm hover:bg-[#20BD5A] focus-visible:ring-[#25D366]/35";

type SecondaryAction = {
  href: string;
  label: string;
};

type PrimaryCtaProps = {
  heading: string;
  body: string;
  href: string;
  label: string;
  className?: string;
  /** Use WhatsApp-forward styling for the primary action (still a normal link). */
  primaryVariant?: "default" | "whatsapp";
  secondary?: SecondaryAction;
};

export function PrimaryCta({
  heading,
  body,
  href,
  label,
  className,
  primaryVariant = "default",
  secondary,
}: PrimaryCtaProps) {
  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-lg border border-border border-l-4 border-l-primary bg-card p-8 shadow-md sm:p-10",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,oklch(0.72_0.18_195/0.12),transparent_65%)]"
      />
      <div className="relative">
        <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-[1.65rem]">
          {heading}
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {body}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href={href}
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              primaryVariant === "whatsapp" && whatsappPrimaryClass,
              "justify-center sm:w-auto",
            )}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "justify-center border-primary/35 bg-background/50 backdrop-blur-sm hover:border-primary/55 hover:bg-primary/5 sm:w-auto",
              )}
              {...(secondary.href.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
