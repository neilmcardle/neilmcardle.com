export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
  formatCm,
  isProductId,
  ORDERS_ENABLED,
  marginMinor,
  MARGIN_FLOOR_MINOR,
  VECTOR_PAINT_PRODUCTS,
} from "@/lib/vector-paint/products";
import { parseDrawingPayload } from "@/lib/vector-paint/drawing";
import { storeOrderFiles } from "@/lib/vector-paint/render";
import { createPendingOrder, updateOrder } from "@/lib/vector-paint/orders";
import { checkOrigin } from "@/lib/auth/checkOrigin";

const MAX_QUANTITY = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function withinRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipBuckets.get(ip);
  if (!entry || now >= entry.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function fail(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  const originError = checkOrigin(req);
  if (originError) return originError;

  if (!ORDERS_ENABLED) return fail("Canvas orders are not open yet.", 503);
  if (!process.env.STRIPE_SECRET_KEY)
    return fail("Ordering is not set up yet.", 500);
  if (!withinRateLimit(clientIp(req)))
    return fail("Too many tries. Wait a minute and try again.", 429);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("That request could not be read.", 400);
  }

  const drawing = parseDrawingPayload(body.drawing);
  if (!drawing)
    return fail(
      "That drawing could not be read. Try saving it and ordering again.",
      400,
    );

  if (!isProductId(body.productId)) return fail("Choose a canvas size.", 400);
  const product = VECTOR_PAINT_PRODUCTS[body.productId];
  if (product.orientation !== drawing.orientation)
    return fail("The canvas shape does not match the drawing.", 400);
  if (marginMinor(product) < MARGIN_FLOOR_MINOR) {
    console.error(
      `Vector Paint ${product.id} is below the margin floor; refusing checkout`,
    );
    return fail("This size is not available right now.", 400);
  }

  const rawQuantity = typeof body.quantity === "number" ? body.quantity : 1;
  const quantity = Math.max(1, Math.min(MAX_QUANTITY, Math.floor(rawQuantity)));

  const origin = process.env.NEXT_PUBLIC_VECTOR_PAINT_URL || req.nextUrl.origin;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });

  let orderId: string | null = null;
  try {
    const order = await createPendingOrder({
      productId: product.id,
      quantity,
      unitPriceMinor: product.sellPriceMinor,
      currency: product.currency,
    });
    orderId = order.id;

    const files = await storeOrderFiles(order.id, drawing, product);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity,
          price_data: {
            currency: product.currency,
            unit_amount: product.sellPriceMinor,
            product_data: {
              name: `Canvas print, ${product.sizeLabel.toLowerCase()} · ${formatCm(product)}`,
              description:
                "Your child's drawing on canvas, stretched over a 4 cm wooden frame. Printed and sent by our print partner.",
              images: [files.previewUrl],
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ["GB"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: product.currency },
            display_name: "Free UK delivery",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 5 },
              maximum: { unit: "business_day", value: 9 },
            },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      success_url: `${origin}/vector-paint/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/vector-paint?checkout=canceled`,
      metadata: {
        purchase_type: "vector_paint_print",
        order_id: order.id,
      },
      payment_intent_data: {
        metadata: { purchase_type: "vector_paint_print", order_id: order.id },
      },
    });

    await updateOrder(order.id, {
      stripeSessionId: session.id,
      printPath: files.printPath,
      previewPath: files.previewPath,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Vector Paint checkout failed:", message);
    if (orderId)
      await updateOrder(orderId, {
        status: "failed",
        error: message.slice(0, 1000),
      }).catch(() => {});
    return fail(
      "Checkout could not start. Nothing has been charged. Please try again.",
      500,
    );
  }
}
