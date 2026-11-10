import type Stripe from "stripe";
import { Resend } from "resend";
import { and, eq, inArray, lt, sql, type SQL } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { db, vectorPaintOrders, type VectorPaintOrder } from "@/lib/db";
import {
  cancelGelatoOrder,
  createGelatoOrder,
  GelatoUnconfirmedError,
} from "./gelato";
import { isProductId, VECTOR_PAINT_PRODUCTS } from "./products";
import { signedUrl } from "./render";
import { ORDER_TRANSITIONS, type OrderEvent } from "./orderState";

const PRINT_URL_TTL_SECONDS = 60 * 60 * 24 * 14;
const STALE_CLAIM_MINUTES = 10;

async function sendOps(subject: string, text: string) {
  const to = process.env.VECTOR_PAINT_OPS_EMAIL;
  const from = process.env.MAKEEBOOK_EMAIL_FROM;
  const key = process.env.RESEND_API_KEY;
  if (!to || !from || !key) {
    console.error(`[vector paint] no ops email configured: ${subject}`);
    return;
  }
  try {
    await new Resend(key).emails.send({ from, to, subject, text });
  } catch (err) {
    console.error("[vector paint] ops email failed to send", err);
  }
}

async function alertOps(
  orderId: string,
  sessionId: string,
  message: string,
  unconfirmed = false,
) {
  const ref = orderId.slice(0, 8).toUpperCase();
  await sendOps(
    unconfirmed
      ? `Vector Paint order ${ref} may or may not be at Gelato`
      : `Vector Paint order ${ref} did not reach Gelato`,
    unconfirmed
      ? `The customer has paid, but Gelato did not confirm the order. It will not be retried automatically, so it cannot print twice.\n\nOrder: ${orderId}\nStripe session: ${sessionId}\nError: ${message}\n\nSearch Gelato for order reference ${orderId}. If it is there, set the order to submitted. If not, submit by hand or refund.`
      : `The customer has paid but the order failed to submit.\n\nOrder: ${orderId}\nStripe session: ${sessionId}\nError: ${message}\n\nStripe retries the webhook automatically. If it keeps failing, submit by hand or refund.`,
  );
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

type OrderValues = Omit<
  PgUpdateSetSource<typeof vectorPaintOrders>,
  "status" | "id"
>;

export async function transitionOrder(
  id: string,
  event: OrderEvent,
  values: OrderValues = {},
  extra?: SQL,
): Promise<VectorPaintOrder | null> {
  const { from, to } = ORDER_TRANSITIONS[event];
  const [row] = await db
    .update(vectorPaintOrders)
    .set({ ...values, status: to, updatedAt: new Date() })
    .where(
      and(
        eq(vectorPaintOrders.id, id),
        inArray(vectorPaintOrders.status, [...from]),
        extra,
      ),
    )
    .returning();
  return row ?? null;
}

export async function updateOrder(id: string, values: OrderValues) {
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

  const claimValues: OrderValues = {
    stripeSessionId: session.id,
    email: session.customer_details?.email ?? null,
    paidAt: sql`coalesce(${vectorPaintOrders.paidAt}, now())`,
    error: null,
  };
  const claimed =
    (await transitionOrder(orderId, "pay", claimValues)) ??
    (await transitionOrder(
      orderId,
      "reclaim",
      claimValues,
      lt(
        vectorPaintOrders.updatedAt,
        new Date(Date.now() - STALE_CLAIM_MINUTES * 60 * 1000),
      ),
    ));

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
    const sent = await transitionOrder(
      claimed.id,
      gelato.dryRun ? "dry_run" : "submit",
      { gelatoOrderId: gelato.id, submittedAt: new Date() },
    );
    if (!sent) {
      await cancelAfterRefund(claimed.id, gelato.dryRun ? null : gelato.id);
      return;
    }
    console.log(
      `Vector Paint order ${claimed.id} sent to Gelato as ${gelato.id} (${gelato.fulfillmentStatus})`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const unconfirmed = err instanceof GelatoUnconfirmedError;
    const moved = await transitionOrder(
      claimed.id,
      unconfirmed ? "unconfirm" : "fail",
      { error: message.slice(0, 1000) },
    );
    if (!moved) {
      await sendOps(
        `Vector Paint order ${claimed.id.slice(0, 8).toUpperCase()} was refunded while sending`,
        `Order ${claimed.id} was refunded while it was being sent, and sending then failed: ${message}\n\nSearch Gelato for order reference ${claimed.id} and cancel it if it is there.`,
      );
      return;
    }
    await alertOps(claimed.id, session.id, message, unconfirmed);
    if (!unconfirmed) throw err;
  }
}

async function cancelAfterRefund(
  orderId: string,
  gelatoOrderId: string | null,
) {
  const ref = orderId.slice(0, 8).toUpperCase();
  if (!gelatoOrderId) {
    await sendOps(
      `Vector Paint order ${ref} was refunded while sending`,
      `Order ${orderId} was refunded while it was being sent. It was a dry run, so nothing was printed.`,
    );
    return;
  }
  let note: string;
  try {
    await cancelGelatoOrder(gelatoOrderId);
    note = `The Gelato order ${gelatoOrderId} was cancelled.`;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    note = `Cancelling Gelato order ${gelatoOrderId} failed: ${message}. Cancel it by hand if it has not shipped.`;
  }
  await updateOrder(orderId, { gelatoOrderId, error: note.slice(0, 1000) });
  await sendOps(
    `Vector Paint order ${ref} was refunded while sending`,
    `Order ${orderId} was refunded while it was being sent to Gelato.\n\n${note}`,
  );
}

export async function handleRefund(
  charge: Stripe.Charge,
  stripe: Stripe,
): Promise<void> {
  const paymentIntent =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;
  if (!paymentIntent) return;

  const sessions = await stripe.checkout.sessions.list({
    payment_intent: paymentIntent,
    limit: 1,
  });
  const orderId = sessions.data[0]?.metadata?.order_id;
  if (!orderId) return;

  const [order] = await db
    .select()
    .from(vectorPaintOrders)
    .where(eq(vectorPaintOrders.id, orderId))
    .limit(1);
  if (!order || order.status === "refunded") return;

  const ref = order.id.slice(0, 8).toUpperCase();

  if (!charge.refunded) {
    await sendOps(
      `Vector Paint order ${ref} was partly refunded`,
      `Order ${order.id} was partly refunded. The print has not been cancelled. Check whether it should be.`,
    );
    return;
  }

  let printNote: string;
  if (order.gelatoOrderId && order.status === "submitted") {
    try {
      await cancelGelatoOrder(order.gelatoOrderId);
      printNote = `The Gelato order ${order.gelatoOrderId} was cancelled.`;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      printNote = `Cancelling Gelato order ${order.gelatoOrderId} failed: ${message}. Cancel it by hand if it has not shipped.`;
    }
  } else if (order.status === "unconfirmed") {
    printNote = `Gelato never confirmed this order. Search Gelato for order reference ${order.id} and cancel it if it is there.`;
  } else if (order.status === "paid") {
    printNote =
      "The print was being sent when the refund arrived. If it reaches Gelato it will be cancelled automatically, and you will get a second email.";
  } else {
    printNote = "No print had been sent to Gelato.";
  }

  const refunded = await transitionOrder(order.id, "refund", {
    error: printNote.slice(0, 1000),
  });
  if (!refunded) return;
  await sendOps(
    `Vector Paint order ${ref} was refunded`,
    `Order ${order.id} was refunded in full.\n\n${printNote}`,
  );
}

export async function expireSession(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;
  await transitionOrder(orderId, "expire");
}
