import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { availableSince, grantState, type GrantKind } from "./grantRules";

const COLUMN = {
  brief: users.aiBriefUsedAt,
  question: users.aiQuestionUsedAt,
} as const;

const FIELD = { brief: "aiBriefUsedAt", question: "aiQuestionUsedAt" } as const;

export type Claim =
  | { status: "claimed"; claimedAt: Date }
  | { status: "spent" }
  | { status: "error" };

export async function claimGrant(
  kind: GrantKind,
  userId: string,
): Promise<Claim> {
  const now = new Date();
  const column = COLUMN[kind];
  const since = availableSince(kind, now);
  try {
    const claimed = await db
      .update(users)
      .set({ [FIELD[kind]]: now, updatedAt: now })
      .where(
        and(
          eq(users.id, userId),
          since ? or(isNull(column), lt(column, since)) : isNull(column),
        ),
      )
      .returning({ id: users.id });
    return claimed.length > 0
      ? { status: "claimed", claimedAt: now }
      : { status: "spent" };
  } catch (err) {
    console.error(`[grants] ${kind} claim failed`, err);
    return { status: "error" };
  }
}

export async function refundGrant(
  kind: GrantKind,
  userId: string,
  claimedAt: Date,
): Promise<void> {
  try {
    await db
      .update(users)
      .set({ [FIELD[kind]]: null, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(COLUMN[kind], claimedAt)));
  } catch (err) {
    console.error(`[grants] ${kind} refund failed`, err);
  }
}

export async function readGrant(kind: GrantKind, userId: string) {
  const [row] = await db
    .select({ usedAt: COLUMN[kind] })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return grantState(kind, row?.usedAt ?? null);
}
