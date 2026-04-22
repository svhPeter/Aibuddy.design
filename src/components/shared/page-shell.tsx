import type { ReactNode } from "react";

import { GuestIdSync } from "@/components/access/guest-id-sync";
import { CookieNotice } from "@/components/shared/cookie-notice";
import { SiteFooter } from "@/components/shared/site-footer";
import { SiteHeader, type HeaderAuth } from "@/components/shared/site-header";
import { prisma } from "@/lib/prisma";
import { ensureProfileSafe } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
  /** Full-bleed main (e.g. Stitch homepage); sections control their own width/padding. */
  fullBleed?: boolean;
};

function isDynamicUsageError(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "digest" in e &&
    typeof (e as { digest?: unknown }).digest === "string" &&
    (e as { digest: string }).digest === "DYNAMIC_SERVER_USAGE"
  );
}

async function readHeaderAuth(): Promise<HeaderAuth | null> {
  let user;
  try {
    const supabase = await createSupabaseServerClient();
    const session = await supabase.auth.getUser();
    user = session.data.user;
  } catch (e) {
    if (isDynamicUsageError(e)) throw e; // Let Next fall back to dynamic rendering.
    console.error("[page-shell] supabase getUser failed:", e);
    return null;
  }
  if (!user) return null;

  const fallback: HeaderAuth = {
    email: user.email ?? "",
    creditsBalance: null,
  };

  // Read-only attempt first — fast path for returning users.
  const existing = await prisma.profile
    .findUnique({
      where: { id: user.id },
      select: { creditsBalance: true },
    })
    .catch((e) => {
      console.error("[page-shell] profile lookup failed:", e);
      return null;
    });

  if (existing) {
    return { ...fallback, creditsBalance: existing.creditsBalance };
  }

  // Bootstrap on first hit after sign-in. Idempotent and grants the welcome
  // credits if needed. If this fails we still render a valid header.
  const created = await ensureProfileSafe(user);
  if (created) {
    return { ...fallback, creditsBalance: created.creditsBalance };
  }
  return fallback;
}

export async function PageShell({
  children,
  className,
  fullBleed,
}: PageShellProps) {
  const auth = await readHeaderAuth();

  return (
    <div className="flex min-h-full min-w-0 flex-1 flex-col">
      <GuestIdSync />
      <SiteHeader auth={auth} />
      <main
        className={cn(
          "relative w-full min-w-0 flex-1",
          fullBleed
            ? "overflow-x-hidden pb-[env(safe-area-inset-bottom,0px)]"
            : "mx-auto w-full max-w-6xl min-w-0 px-4 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-32 md:pb-14 md:pt-32",
          !fullBleed &&
            "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(ellipse_85%_50%_at_50%_-10%,oklch(0.85_0.2_120/0.06),transparent_55%)]",
          className,
        )}
      >
        {children}
      </main>
      <CookieNotice />
      <SiteFooter />
    </div>
  );
}
