import type { User } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";

/** Free credits granted to each new user, exactly once. */
export const WELCOME_CREDITS = 5;

export type ProfileRow = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  creditsBalance: number;
  welcomeGrantedAt: Date | null;
};

function deriveProfileFields(user: User) {
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
  return { email, fullName, avatarUrl };
}

/**
 * Idempotently ensures a Profile exists for the given Supabase auth user, and
 * grants the one-time welcome credits if they have not been granted yet.
 *
 * Safe to call on every request: the welcome grant is gated by
 * `welcomeGrantedAt: null` inside an atomic updateMany + create, so concurrent
 * calls cannot double-grant. Throws on DB error so callers can decide whether
 * to surface the error or fall back to a read-only path.
 */
export async function ensureProfile(user: User): Promise<ProfileRow> {
  const { email, fullName, avatarUrl } = deriveProfileFields(user);

  // Step 1 — create-or-update the row outside any transaction so failures
  // here can't leave the welcome-grant transaction half-applied.
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

  // Step 2 — one-time welcome grant. updateMany with the `welcomeGrantedAt:
  // null` guard is what makes this idempotent: a second concurrent caller
  // sees count === 0 and does nothing.
  await prisma.$transaction(async (tx) => {
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
    }
  });

  return prisma.profile.findUniqueOrThrow({
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
}

/**
 * Same as `ensureProfile`, but never throws. Returns `null` if the bootstrap
 * fails (DB unreachable, schema missing, etc.) so callers can render a
 * friendly fallback instead of a 500.
 */
export async function ensureProfileSafe(
  user: User,
): Promise<ProfileRow | null> {
  try {
    return await ensureProfile(user);
  } catch (e) {
    console.error("[ensureProfile] failed for user", user.id, ":", e);
    return null;
  }
}
