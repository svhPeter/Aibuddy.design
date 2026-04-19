import type { User } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";

/** Free credits granted to each new user, exactly once. */
export const WELCOME_CREDITS = 5;

type ProfileRow = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  creditsBalance: number;
  welcomeGrantedAt: Date | null;
};

/**
 * Idempotently ensures a Profile exists for the given Supabase auth user, and
 * grants the one-time welcome credits if they have not been granted yet.
 *
 * Safe to call on every sign-in: the welcome grant is gated by
 * `welcomeGrantedAt: null` inside an atomic updateMany + createMany transaction,
 * so concurrent calls cannot double-grant.
 */
export async function ensureProfile(user: User): Promise<ProfileRow> {
  const email =
    user.email ??
    (user.user_metadata?.email as string | undefined) ??
    `${user.id}@users.local`;
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email,
      fullName,
      avatarUrl,
    },
    update: {
      email,
      fullName,
      avatarUrl,
    },
  });

  // One-time welcome grant. The updateMany guard ensures this row only flips
  // once; the returned count tells us whether to also log a credit transaction.
  const granted = await prisma.$transaction(async (tx) => {
    const updated = await tx.profile.updateMany({
      where: { id: user.id, welcomeGrantedAt: null },
      data: {
        creditsBalance: { increment: WELCOME_CREDITS },
        welcomeGrantedAt: new Date(),
      },
    });
    if (updated.count === 1) {
      const after = await tx.profile.findUniqueOrThrow({
        where: { id: user.id },
        select: { creditsBalance: true },
      });
      await tx.creditTransaction.create({
        data: {
          profileId: user.id,
          delta: WELCOME_CREDITS,
          reason: "welcome_grant",
          balanceAfter: after.creditsBalance,
        },
      });
      return true;
    }
    return false;
  });

  // If we granted, re-read so the caller sees the updated balance.
  const row = await prisma.profile.findUniqueOrThrow({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      creditsBalance: true,
      welcomeGrantedAt: true,
    },
  });
  void granted;
  return row;
}
