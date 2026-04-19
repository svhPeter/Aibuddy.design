import { prisma } from "@/lib/prisma";

export class InsufficientCreditsError extends Error {
  constructor() {
    super("INSUFFICIENT_CREDITS");
    this.name = "InsufficientCreditsError";
  }
}

type SpendResult = {
  creditsBalance: number;
  usageLogId: string;
};

/**
 * Atomically deducts one credit and records a successful UsageLog +
 * CreditTransaction. Throws `InsufficientCreditsError` if the user has no
 * credits. Never returns a negative balance.
 *
 * The guard `{ creditsBalance: { gt: 0 } }` on updateMany is what makes this
 * race-safe: two concurrent calls cannot both succeed when the balance is 1.
 */
export async function spendCredit(
  profileId: string,
  tool: string,
): Promise<SpendResult> {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.profile.updateMany({
      where: { id: profileId, creditsBalance: { gt: 0 } },
      data: { creditsBalance: { decrement: 1 } },
    });
    if (updated.count !== 1) {
      throw new InsufficientCreditsError();
    }
    const after = await tx.profile.findUniqueOrThrow({
      where: { id: profileId },
      select: { creditsBalance: true },
    });
    const [log] = await Promise.all([
      tx.usageLog.create({
        data: {
          profileId,
          tool,
          status: "success",
          creditsSpent: 1,
        },
      }),
      tx.creditTransaction.create({
        data: {
          profileId,
          delta: -1,
          reason: `spend:${tool}`,
          balanceAfter: after.creditsBalance,
        },
      }),
    ]);
    return { creditsBalance: after.creditsBalance, usageLogId: log.id };
  });
}
