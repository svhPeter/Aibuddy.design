import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MarketingSection } from "@/components/shared/marketing-section";
import { PageHeading } from "@/components/shared/page-heading";
import { PageShell } from "@/components/shared/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  ensureProfileSafe,
  getLastEnsureProfileError,
  type ProfileRow,
} from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Account",
  description: "Your AIBuddy account, credits, and recent activity.",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TOOL_LABELS: Record<string, string> = {
  "image-to-prompt": "Image to Prompt",
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

type UsageRow = {
  id: string;
  tool: string;
  status: string;
  creditsSpent: number;
  createdAt: Date;
};

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/account");

  // Bootstrap or fetch the profile. Never throws — so /account never 500s on
  // a transient DB hiccup or a half-set-up environment.
  const profile = await ensureProfileSafe(user);

  if (!profile) {
    const lastError = getLastEnsureProfileError();
    const showDebug = Boolean(process.env.DEBUG_TOKEN) && lastError;
    return (
      <PageShell>
        <PageHeading
          eyebrow="Account"
          title={user.email ?? "Your account"}
          description="We're setting things up."
        />
        <MarketingSection>
          <div className="rounded-lg border-2 border-destructive/40 bg-destructive/5 p-6 shadow-sm">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-destructive">
              Couldn&apos;t load your account
            </h2>
            <p className="mt-3 text-sm text-foreground/90">
              You&apos;re signed in, but we couldn&apos;t reach the database to
              load your credits. This is usually temporary — refresh in a
              moment, or sign out and back in.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/account"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-none bg-[#cafd00] font-heading text-xs font-bold uppercase tracking-widest text-[#516700] hover:bg-[#f3ffca]",
                )}
              >
                Refresh
              </Link>
              <form action="/auth/sign-out" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                >
                  Sign out
                </Button>
              </form>
            </div>
            {showDebug && lastError ? (
              <pre className="mt-5 overflow-x-auto rounded-md bg-black/40 p-4 text-xs text-foreground/80">
                {`[DEBUG — visible because DEBUG_TOKEN is set]
at:      ${lastError.at}
code:    ${lastError.code ?? "(none)"}
message: ${lastError.message}`}
              </pre>
            ) : null}
          </div>
        </MarketingSection>
      </PageShell>
    );
  }

  const usage: UsageRow[] = await prisma.usageLog
    .findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        tool: true,
        status: true,
        creditsSpent: true,
        createdAt: true,
      },
    })
    .catch((e) => {
      console.error("[account] usage lookup failed:", e);
      return [];
    });

  return <AccountView profile={profile} usage={usage} />;
}

function AccountView({
  profile,
  usage,
}: {
  profile: ProfileRow;
  usage: UsageRow[];
}) {
  return (
    <PageShell>
      <PageHeading
        eyebrow="Account"
        title={profile.fullName || profile.email}
        description={profile.email}
      />

      <MarketingSection>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-2 border-border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
              Credits
            </h2>
            <p className="mt-4 font-heading text-4xl font-bold tracking-tight text-foreground">
              {profile.creditsBalance}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              1 credit per successful generation. Credits are only deducted on
              success — failed runs never cost you anything.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                type="button"
                size="sm"
                disabled
                className="rounded-none bg-[#cafd00]/40 font-heading text-xs font-bold uppercase tracking-widest text-[#516700]/60"
              >
                Buy credits (coming soon)
              </Button>
              <Link
                href="/tools/image-to-prompt"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "rounded-none",
                )}
              >
                Go to tool
              </Link>
            </div>
          </div>

          <div className="rounded-lg border-2 border-border bg-card p-6 shadow-sm">
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
              Session
            </h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate text-foreground">{profile.email}</dd>
              </div>
              {profile.fullName ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Name</dt>
                  <dd className="truncate text-foreground">
                    {profile.fullName}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="text-foreground">
                  {profile.welcomeGrantedAt
                    ? formatDate(profile.welcomeGrantedAt)
                    : "—"}
                </dd>
              </div>
            </dl>
            <form action="/auth/sign-out" method="post" className="mt-5">
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="rounded-none"
              >
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </MarketingSection>

      <MarketingSection spacing="tight">
        <div className="rounded-lg border-2 border-border bg-card p-6 shadow-sm">
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-[#cafd00]">
            Recent activity
          </h2>
          {usage.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No generations yet. Try the{" "}
              <Link
                href="/tools/image-to-prompt"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Image to Prompt
              </Link>{" "}
              tool.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {usage.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {TOOL_LABELS[row.tool] ?? row.tool}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      {row.status}
                    </p>
                    <p className="text-xs text-foreground">
                      −{row.creditsSpent} credit
                      {row.creditsSpent === 1 ? "" : "s"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </MarketingSection>
    </PageShell>
  );
}
