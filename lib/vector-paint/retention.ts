import { and, inArray, isNotNull, lt, or, sql } from "drizzle-orm";
import { db, vectorPaintOrders } from "@/lib/db";
import { removeOrderFiles } from "./render";
import { PAID_STATUSES, UNPAID_STATUSES } from "./orderState";

const DAY = 24 * 60 * 60 * 1000;
export const UNPAID_RETENTION_DAYS = 30;
export const PAID_RETENTION_DAYS = 365;
const BATCH = 200;

export async function purgeOldOrders(): Promise<{
  purged: number;
  failed: number;
}> {
  const now = Date.now();
  const unpaidCutoff = new Date(now - UNPAID_RETENTION_DAYS * DAY);
  const paidCutoff = new Date(now - PAID_RETENTION_DAYS * DAY);

  const rows = await db
    .select({ id: vectorPaintOrders.id })
    .from(vectorPaintOrders)
    .where(
      and(
        or(
          isNotNull(vectorPaintOrders.printPath),
          isNotNull(vectorPaintOrders.email),
        ),
        or(
          and(
            inArray(vectorPaintOrders.status, [...UNPAID_STATUSES]),
            lt(vectorPaintOrders.createdAt, unpaidCutoff),
          ),
          and(
            inArray(vectorPaintOrders.status, [...PAID_STATUSES]),
            lt(
              sql`coalesce(${vectorPaintOrders.paidAt}, ${vectorPaintOrders.createdAt})`,
              paidCutoff,
            ),
          ),
        ),
      ),
    )
    .limit(BATCH);

  let purged = 0;
  let failed = 0;
  for (const { id } of rows) {
    try {
      await removeOrderFiles(id);
      await db
        .update(vectorPaintOrders)
        .set({
          printPath: null,
          previewPath: null,
          email: null,
          updatedAt: new Date(),
        })
        .where(sql`${vectorPaintOrders.id} = ${id}`);
      purged++;
    } catch (err) {
      failed++;
      console.error(`[vector paint] retention purge failed for ${id}`, err);
    }
  }
  return { purged, failed };
}
