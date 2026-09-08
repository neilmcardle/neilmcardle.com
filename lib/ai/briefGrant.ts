import { and, eq, isNull, lt, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const GRANT_PERIOD_DAYS = 30;

function cutoffFrom(now: Date): Date {
  return new Date(now.getTime() - GRANT_PERIOD_DAYS * 24 * 60 * 60 * 1000);
}

export interface BriefGrantStatus {
  available: boolean;
  resetsAt: Date | null;
}

export async function claimMonthlyBrief(userId: string): Promise<boolean> {
  const now = new Date();

  const claimed = await db
    .update(users)
    .set({ aiBriefUsedAt: now, updatedAt: now })
    .where(
      and(
        eq(users.id, userId),
        or(
          isNull(users.aiBriefUsedAt),
          lt(users.aiBriefUsedAt, cutoffFrom(now)),
        ),
      ),
    )
    .returning({ id: users.id });

  return claimed.length > 0;
}

export async function refundMonthlyBrief(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ aiBriefUsedAt: null, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

export async function getBriefGrantStatus(
  userId: string,
): Promise<BriefGrantStatus> {
  const now = new Date();

  const rows = await db
    .select({ usedAt: users.aiBriefUsedAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const usedAt = rows[0]?.usedAt ?? null;
  if (!usedAt || usedAt < cutoffFrom(now)) {
    return { available: true, resetsAt: null };
  }

  return {
    available: false,
    resetsAt: new Date(
      usedAt.getTime() + GRANT_PERIOD_DAYS * 24 * 60 * 60 * 1000,
    ),
  };
}
