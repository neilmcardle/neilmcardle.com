import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function claimFreeQuestion(userId: string): Promise<boolean> {
  const now = new Date();
  try {
    const claimed = await db
      .update(users)
      .set({ aiQuestionUsedAt: now, updatedAt: now })
      .where(and(eq(users.id, userId), isNull(users.aiQuestionUsedAt)))
      .returning({ id: users.id });
    return claimed.length > 0;
  } catch (err) {
    console.error("[book mind] free question claim failed", err);
    return false;
  }
}

export async function refundFreeQuestion(userId: string): Promise<void> {
  try {
    await db
      .update(users)
      .set({ aiQuestionUsedAt: null, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } catch (err) {
    console.error("[book mind] free question refund failed", err);
  }
}
