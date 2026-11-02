import { and, eq, gte, sql } from "drizzle-orm";
import { db, suggestions } from "@/lib/db";

export const MONTHLY_CAP_PENCE = 50;
export const PER_BUILD_CAP_USD = 0.06;
export const PENCE_PER_USD = 80;

export const pence = (microUsd: number) =>
  (microUsd / 1_000_000) * PENCE_PER_USD;

const PER_BUILD_PENCE = PER_BUILD_CAP_USD * PENCE_PER_USD;

export function monthStart(now = new Date()): Date {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

export async function monthSpend() {
  const since = monthStart();
  const [spent] = await db
    .select({
      micro: sql<number>`coalesce(sum(${suggestions.costMicroUsd}), 0)::int`,
    })
    .from(suggestions)
    .where(gte(suggestions.buildStartedAt, since));
  const [running] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(suggestions)
    .where(
      and(
        eq(suggestions.status, "building"),
        gte(suggestions.buildStartedAt, since),
      ),
    );

  const spentPence = pence(spent?.micro ?? 0);
  const reservedPence = (running?.count ?? 0) * PER_BUILD_PENCE;
  return {
    spentPence,
    reservedPence,
    canBuild: spentPence + reservedPence + PER_BUILD_PENCE <= MONTHLY_CAP_PENCE,
  };
}
