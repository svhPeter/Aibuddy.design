import type { ReactNode } from "react";

import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader, type HeaderAuth } from "@/components/shared/site-header";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Full-bleed main (e.g. Stitch homepage); sections control their own width/padding. */
  fullBleed?: boolean;
};

async function readHeaderAuth(): Promise<HeaderAuth | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const profile = await prisma.profile
      .findUnique({
        where: { id: user.id },
        select: { creditsBalance: true },
      })
      .catch(() => null);
    return {
      email: user.email ?? "",
      creditsBalance: profile?.creditsBalance ?? 0,
    };
  } catch {
    // Supabase or DB not configured yet — render signed-out header.
    return null;
  }
}

export async function PageShell({
  children,
  className,
  fullBleed,
}: PageShellProps) {
  const auth = await readHeaderAuth();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader auth={auth} />
      <main
        className={cn(
          "relative w-full flex-1",
          fullBleed
            ? "overflow-x-hidden"
            : "mx-auto max-w-6xl px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 md:pb-14 md:pt-32",
          !fullBleed &&
            "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_85%_50%_at_50%_-10%,oklch(0.85_0.2_120/0.06),transparent_55%)]",
          className,
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
