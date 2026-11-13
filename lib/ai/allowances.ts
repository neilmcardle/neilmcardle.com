import { and, eq, isNull, lt, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  availableSince,
  allowanceState,
  type AllowanceKind,
} from "./allowanceRules";

const COLUMN = {
  brief: users.aiBriefUsedAt,
  question: users.aiQuestionUsedAt,
} as const;

const FIELD = { brief: "aiBriefUsedAt", question: "aiQuestionUsedAt" } as const;

export type Claim =
  | { status: "claimed"; claimedAt: Date }
  | { status: "spent" }
  | { status: "error" };

export async function claimAllowance(
  kind: AllowanceKind,
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
    console.error(`[allowances] ${kind} claim failed`, err);
    return { status: "error" };
  }
}

export async function refundAllowance(
  kind: AllowanceKind,
  userId: string,
  claimedAt: Date,
): Promise<void> {
  try {
    await db
      .update(users)
      .set({ [FIELD[kind]]: null, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(COLUMN[kind], claimedAt)));
  } catch (err) {
    console.error(`[allowances] ${kind} refund failed`, err);
  }
}

export async function readAllowance(kind: AllowanceKind, userId: string) {
  const [row] = await db
    .select({ usedAt: COLUMN[kind] })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return allowanceState(kind, row?.usedAt ?? null);
}
