import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type StitchPortfolioTileProps = {
  href: string;
  eyebrow: string;
  title: string;
  imageSrc: string;
  span: "sm" | "lg" | "full";
  description?: string;
  external?: boolean;
};

/**
 * Bold image tile — same treatment as the homepage Stitch portfolio section.
 */
export function StitchPortfolioTile({
  href,
  eyebrow,
  title,
  span,
  imageSrc,
  description,
  external,
}: StitchPortfolioTileProps) {
  const className = cn(
    /* Block-level box so height applies and next/image fill has a non-zero parent */
    "group relative block w-full overflow-hidden",
    "h-[min(420px,70vh)] min-h-[min(420px,70vh)] md:h-[500px] md:min-h-[500px]",
    "ring-1 ring-inset ring-white/[0.06]",
    span === "lg" && "md:col-span-8",
    span === "sm" && "md:col-span-4",
    /* Full-width row in a 12-col parent grid; use w-full when nested inside a full-span li. */
    span === "full" && "w-full min-w-0 md:col-span-12",
  );

  const sizes =
    span === "full"
      ? "(max-width:768px) 100vw, 100vw"
      : span === "lg"
        ? "(max-width:768px) 100vw, 66vw"
        : "33vw";

  const inner = (
    <>
      <Image
        src={imageSrc}
        alt=""
        fill
        unoptimized
        sizes={sizes}
        className="object-cover object-center grayscale brightness-[0.55] transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-[0.3] group-hover:brightness-[0.5]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        <span className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-[#cafd00] md:mb-4">
          {eyebrow}
        </span>
        <span className="font-heading text-3xl font-bold uppercase leading-[0.95] text-white md:text-4xl">
          {title}
        </span>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-white/70">
            {description}
          </p>
        ) : null}
      </div>
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        <span className="sr-only">Opens in a new tab</span>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
