import type { User } from "@supabase/supabase-js";
import { Prisma } from "@prisma/client";

import { getRegistryEntryById } from "@/config/tool-registry";
import { prisma } from "@/lib/prisma";
import { getClientKey } from "@/lib/rate-limiter";

import {
  currentYearMonthUtc,
  FREE_AI_MONTHLY,
  FREE_UTILITY_MONTHLY,
  GUEST_MONTHLY_TOTAL,
  defaultProAiMonthlyCap,
} from "./quotas";

export type UsageLimitCode =
  | "AUTH_REQUIRED"
  | "GUEST_LIMIT"
  | "FREE_UTILITY_LIMIT"
  | "FREE_AI_LIMIT"
  | "PRO_AI_LIMIT"
  | "UNKNOWN_TOOL";

export type UsageTier = "guest" | "free" | "pro";

export type UsageSnapshot = {
  yearMonth: string;
  tier: UsageTier;
  guestTotal?: number;
  utilityUses?: number;
  aiUses?: number;
  proAiCap?: number;
};

export type ConsumeDenied = {
  ok: false;
  code: UsageLimitCode;
  message: string;
};

export type ConsumeOk = {
  ok: true;
  snapshot: UsageSnapshot;
};

export type ConsumeResult = ConsumeOk | ConsumeDenied;

function guestMessages(code: Exclude<UsageLimitCode, "UNKNOWN_TOOL">): string {
  switch (code) {
    case "GUEST_LIMIT":
      return "You've reached the free guest limit. Sign in free for more monthly usage.";
    case "FREE_UTILITY_LIMIT":
    case "FREE_AI_LIMIT":
      return "You've used your monthly allowance. Upgrade to Pro coming soon.";
    case "PRO_AI_LIMIT":
      return "You've reached your Pro AI quota for this month.";
    case "AUTH_REQUIRED":
      return "Please sign in to use this tool.";
    default:
      return "Usage limit reached.";
  }
}

/**
 * Stable guest key: prefer cookie UUID; otherwise IP-based fallback.
 */
export function resolveGuestKey(
  guestCookie: string | null | undefined,
  headers: Headers,
): string {
  const trimmed = guestCookie?.trim();
  if (trimmed && trimmed.length >= 8) return trimmed;
  return `ip:${getClientKey(headers)}`;
}

async function consumeGuest(args: {
  guestKey: string;
  ym: string;
}): Promise<ConsumeOk | ConsumeDenied> {
  const rows = await prisma.$queryRaw<Array<{ total_uses: number }>>(
    Prisma.sql`
      INSERT INTO guest_monthly_usage (guest_id, year_month, total_uses)
      VALUES (${args.guestKey}, ${args.ym}, 1)
      ON CONFLICT (guest_id, year_month)
      DO UPDATE SET total_uses = guest_monthly_usage.total_uses + 1
      WHERE guest_monthly_usage.total_uses < ${GUEST_MONTHLY_TOTAL}
      RETURNING total_uses
    `,
  );
  if (rows.length === 0) {
    return {
      ok: false,
      code: "GUEST_LIMIT",
      message: guestMessages("GUEST_LIMIT"),
    };
  }
  const total = Number(rows[0].total_uses);
  return {
    ok: true,
    snapshot: {
      yearMonth: args.ym,
      tier: "guest",
      guestTotal: total,
    },
  };
}

async function consumeFreeUtility(args: {
  profileId: string;
  ym: string;
}): Promise<ConsumeOk | ConsumeDenied> {
  const rows = await prisma.$queryRaw<
    Array<{ utility_uses: number; ai_uses: number }>
  >(
    Prisma.sql`
      INSERT INTO user_monthly_usage (profile_id, year_month, utility_uses, ai_uses)
      VALUES (${args.profileId}::uuid, ${args.ym}, 1, 0)
      ON CONFLICT (profile_id, year_month)
      DO UPDATE SET utility_uses = user_monthly_usage.utility_uses + 1
      WHERE user_monthly_usage.utility_uses < ${FREE_UTILITY_MONTHLY}
      RETURNING utility_uses, ai_uses
    `,
  );
  if (rows.length === 0) {
    return {
      ok: false,
      code: "FREE_UTILITY_LIMIT",
      message: guestMessages("FREE_UTILITY_LIMIT"),
    };
  }
  const r = rows[0];
  return {
    ok: true,
    snapshot: {
      yearMonth: args.ym,
      tier: "free",
      utilityUses: Number(r.utility_uses),
      aiUses: Number(r.ai_uses),
    },
  };
}

async function consumeFreeAi(args: {
  profileId: string;
  ym: string;
}): Promise<ConsumeOk | ConsumeDenied> {
  const rows = await prisma.$queryRaw<
    Array<{ utility_uses: number; ai_uses: number }>
  >(
    Prisma.sql`
      INSERT INTO user_monthly_usage (profile_id, year_month, utility_uses, ai_uses)
      VALUES (${args.profileId}::uuid, ${args.ym}, 0, 1)
      ON CONFLICT (profile_id, year_month)
      DO UPDATE SET ai_uses = user_monthly_usage.ai_uses + 1
      WHERE user_monthly_usage.ai_uses < ${FREE_AI_MONTHLY}
      RETURNING utility_uses, ai_uses
    `,
  );
  if (rows.length === 0) {
    return {
      ok: false,
      code: "FREE_AI_LIMIT",
      message: guestMessages("FREE_AI_LIMIT"),
    };
  }
  const r = rows[0];
  return {
    ok: true,
    snapshot: {
      yearMonth: args.ym,
      tier: "free",
      utilityUses: Number(r.utility_uses),
      aiUses: Number(r.ai_uses),
    },
  };
}

async function consumeProAi(args: {
  profileId: string;
  ym: string;
  cap: number;
}): Promise<ConsumeOk | ConsumeDenied> {
  const rows = await prisma.$queryRaw<
    Array<{ utility_uses: number; ai_uses: number }>
  >(
    Prisma.sql`
      INSERT INTO user_monthly_usage (profile_id, year_month, utility_uses, ai_uses)
      VALUES (${args.profileId}::uuid, ${args.ym}, 0, 1)
      ON CONFLICT (profile_id, year_month)
      DO UPDATE SET ai_uses = user_monthly_usage.ai_uses + 1
      WHERE user_monthly_usage.ai_uses < ${args.cap}
      RETURNING utility_uses, ai_uses
    `,
  );
  if (rows.length === 0) {
    return {
      ok: false,
      code: "PRO_AI_LIMIT",
      message: guestMessages("PRO_AI_LIMIT"),
    };
  }
  const r = rows[0];
  return {
    ok: true,
    snapshot: {
      yearMonth: args.ym,
      tier: "pro",
      utilityUses: Number(r.utility_uses),
      aiUses: Number(r.ai_uses),
      proAiCap: args.cap,
    },
  };
}

/**
 * Attempt to consume one use for a tool. Call before expensive work.
 */
export async function consumeToolUse(args: {
  toolId: string;
  user: User | null;
  guestKey: string;
}): Promise<ConsumeResult> {
  const entry = getRegistryEntryById(args.toolId);
  if (!entry) {
    return {
      ok: false,
      code: "UNKNOWN_TOOL",
      message: "Unknown tool.",
    };
  }

  if (entry.access === "account" && !args.user) {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: guestMessages("AUTH_REQUIRED"),
    };
  }

  const ym = currentYearMonthUtc();

  if (!args.user) {
    return consumeGuest({ guestKey: args.guestKey, ym });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: args.user.id },
    select: { plan: true, proAiQuotaMonthly: true },
  });
  if (!profile) {
    return {
      ok: false,
      code: "AUTH_REQUIRED",
      message: "Profile not found. Try signing in again.",
    };
  }

  const isPro = profile.plan === "pro";
  const aiCap = Math.max(
    1,
    profile.proAiQuotaMonthly ?? defaultProAiMonthlyCap(),
  );

  if (entry.kind === "utility") {
    if (isPro) {
      return {
        ok: true,
        snapshot: {
          yearMonth: ym,
          tier: "pro",
        },
      };
    }
    return consumeFreeUtility({ profileId: args.user.id, ym });
  }

  if (entry.kind === "ai") {
    if (isPro) {
      return consumeProAi({
        profileId: args.user.id,
        ym,
        cap: aiCap,
      });
    }
    return consumeFreeAi({ profileId: args.user.id, ym });
  }

  return {
    ok: false,
    code: "UNKNOWN_TOOL",
    message: "Unsupported tool kind.",
  };
}

export async function refundToolUse(args: {
  toolId: string;
  user: User | null;
  guestKey: string;
  snapshot: UsageSnapshot;
}): Promise<void> {
  const entry = getRegistryEntryById(args.toolId);
  if (!entry) return;
  const ym = args.snapshot.yearMonth;

  try {
    if (!args.user) {
      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE guest_monthly_usage
          SET total_uses = total_uses - 1
          WHERE guest_id = ${args.guestKey}
            AND year_month = ${ym}
            AND total_uses > 0
        `,
      );
      return;
    }

    if (entry.kind === "utility") {
      if (args.snapshot.tier === "pro") return;
      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE user_monthly_usage
          SET utility_uses = utility_uses - 1
          WHERE profile_id = ${args.user.id}::uuid
            AND year_month = ${ym}
            AND utility_uses > 0
        `,
      );
      return;
    }

    if (entry.kind === "ai") {
      await prisma.$executeRaw(
        Prisma.sql`
          UPDATE user_monthly_usage
          SET ai_uses = ai_uses - 1
          WHERE profile_id = ${args.user.id}::uuid
            AND year_month = ${ym}
            AND ai_uses > 0
        `,
      );
    }
  } catch (e) {
    console.error("[usage] refund failed", e);
  }
}

export function httpStatusForDenied(code: UsageLimitCode): number {
  if (code === "AUTH_REQUIRED") return 401;
  if (code === "UNKNOWN_TOOL") return 400;
  return 402;
}

export type UsageStatusPayload =
  | {
      tier: "guest";
      yearMonth: string;
      guest: { used: number; limit: number };
    }
  | {
      tier: "free";
      yearMonth: string;
      utility: { used: number; limit: number };
      ai: { used: number; limit: number };
    }
  | {
      tier: "pro";
      yearMonth: string;
      utility: { limit: null };
      ai: { used: number; limit: number };
    };

export async function getUsageStatus(args: {
  user: User | null;
  guestKey: string;
}): Promise<UsageStatusPayload> {
  const ym = currentYearMonthUtc();

  if (!args.user) {
    const row = await prisma.guestMonthlyUsage.findUnique({
      where: {
        guestId_yearMonth: { guestId: args.guestKey, yearMonth: ym },
      },
      select: { totalUses: true },
    });
    return {
      tier: "guest",
      yearMonth: ym,
      guest: {
        used: row?.totalUses ?? 0,
        limit: GUEST_MONTHLY_TOTAL,
      },
    };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: args.user.id },
    select: { plan: true, proAiQuotaMonthly: true },
  });
  const cap = Math.max(
    1,
    profile?.proAiQuotaMonthly ?? defaultProAiMonthlyCap(),
  );

  const row = await prisma.userMonthlyUsage.findUnique({
    where: {
      profileId_yearMonth: { profileId: args.user.id, yearMonth: ym },
    },
    select: { utilityUses: true, aiUses: true },
  });

  if (profile?.plan === "pro") {
    return {
      tier: "pro",
      yearMonth: ym,
      utility: { limit: null },
      ai: { used: row?.aiUses ?? 0, limit: cap },
    };
  }

  return {
    tier: "free",
    yearMonth: ym,
    utility: {
      used: row?.utilityUses ?? 0,
      limit: FREE_UTILITY_MONTHLY,
    },
    ai: {
      used: row?.aiUses ?? 0,
      limit: FREE_AI_MONTHLY,
    },
  };
}
