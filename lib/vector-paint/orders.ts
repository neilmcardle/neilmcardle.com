import type Stripe from "stripe";
import { Resend } from "resend";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, vectorPaintOrders, type VectorPaintOrder } from "@/lib/db";
import { createGelatoOrder } from "./gelato";
import { isProductId, VECTOR_PAINT_PRODUCTS } from "./products";
import { signedUrl } from "./render";

const PRINT_URL_TTL_SECONDS = 60 * 60 * 24 * 14;

async function alertOps(orderId: string, sessionId: string, message: string) {
  const to = process.env.VECTOR_PAINT_OPS_EMAIL;
  const from = process.env.MAKEEBOOK_EMAIL_FROM;
  const key = process.env.RESEND_API_KEY;
  if (!to || !from || !key) {
    console.error(
      `[vector paint] no ops alert configured; order ${orderId} failed: ${message}`,
    );
    return;
  }
  try {
    await new Resend(key).emails.send({
      from,
      to,
      subject: `Vector Paint order ${orderId.slice(0, 8).toUpperCase()} did not reach Gelato`,
      text: `The customer has paid but the order failed to submit.\n\nOrder: ${orderId}\nStripe session: ${sessionId}\nError: ${message}\n\nStripe retries the webhook automatically. If it keeps failing, submit by hand or refund.`,
    });
  } catch (err) {
    console.error("[vector paint] ops alert failed to send", err);
  }
}

export async function createPendingOrder(values: {
  productId: string;
  quantity: number;
  unitPriceMinor: number;
  currency: string;
}): Promise<VectorPaintOrder> {
  const [order] = await db.insert(vectorPaintOrders).values(values).returning();
  return order;
}

export async function updateOrder(
  id: string,
  values: Partial<typeof vectorPaintOrders.$inferInsert>,
) {
  await db
    .update(vectorPaintOrders)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(vectorPaintOrders.id, id));
}

export async function getOrderBySession(
  sessionId: string,
): Promise<VectorPaintOrder | null> {
  const [order] = await db
    .select()
    .from(vectorPaintOrders)
    .where(eq(vectorPaintOrders.stripeSessionId, sessionId))
    .limit(1);
  return order ?? null;
}

export async function fulfilPaidSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (!orderId)
    throw new Error(`Vector Paint session ${session.id} has no order_id`);
  if (session.payment_status !== "paid") {
    console.warn(
      `Vector Paint session ${session.id} completed but payment_status is ${session.payment_status}`,
    );
    return;
  }

  const [claimed] = await db
    .update(vectorPaintOrders)
    .set({
      status: "paid",
      stripeSessionId: session.id,
      email: session.customer_details?.email ?? null,
      paidAt: sql`coalesce(${vectorPaintOrders.paidAt}, now())`,
      error: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(vectorPaintOrders.id, orderId),
        inArray(vectorPaintOrders.status, ["pending", "failed", "expired"]),
      ),
    )
    .returning();

  if (!claimed) {
    console.log(
      `Vector Paint order ${orderId} already handled, skipping duplicate event`,
    );
    return;
  }

  try {
    if (!isProductId(claimed.productId))
      throw new Error(`Unknown product ${claimed.productId}`);
    if (!claimed.printPath) throw new Error("Order has no print file");
    const product = VECTOR_PAINT_PRODUCTS[claimed.productId];
    const printFileUrl = await signedUrl(
      claimed.printPath,
      PRINT_URL_TTL_SECONDS,
    );
    const gelato = await createGelatoOrder({
      orderId: claimed.id,
      session,
      product,
      quantity: claimed.quantity,
      printFileUrl,
    });
    await updateOrder(claimed.id, {
      status: gelato.dryRun ? "dry_run" : "submitted",
      gelatoOrderId: gelato.id,
      submittedAt: new Date(),
    });
    console.log(
      `Vector Paint order ${claimed.id} sent to Gelato as ${gelato.id} (${gelato.fulfillmentStatus})`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await updateOrder(claimed.id, {
      status: "failed",
      error: message.slice(0, 1000),
    });
    await alertOps(claimed.id, session.id, message);
    throw err;
  }
}

export async function expireSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;
  await db
    .update(vectorPaintOrders)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        eq(vectorPaintOrders.id, orderId),
        eq(vectorPaintOrders.status, "pending"),
      ),
    );
}
