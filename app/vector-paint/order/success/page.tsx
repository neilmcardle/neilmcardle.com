import type { Metadata } from "next";
import Link from "next/link";
import Mark from "../../components/mark";
import { getOrderBySession } from "@/lib/vector-paint/orders";
import { signedUrl } from "@/lib/vector-paint/render";
import {
  formatCm,
  isProductId,
  VECTOR_PAINT_PRODUCTS,
} from "@/lib/vector-paint/products";
import styles from "../../vector-paint.module.css";
import receipt from "./receipt.module.css";

export const metadata: Metadata = {
  title: "Your canvas is ordered · vector paint",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function loadOrder(sessionId: string | undefined) {
  if (!sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return null;
  try {
    const order = await getOrderBySession(sessionId);
    if (!order) return null;
    const preview = order.previewPath
      ? await signedUrl(order.previewPath, 60 * 60).catch(() => null)
      : null;
    const product = isProductId(order.productId)
      ? VECTOR_PAINT_PRODUCTS[order.productId]
      : null;
    return { order, preview, product };
  } catch (err) {
    console.error("Vector Paint success page lookup failed:", err);
    return null;
  }
}

export default async function VectorPaintOrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const found = await loadOrder(session_id);
  const sent =
    found?.order.status === "submitted" || found?.order.status === "dry_run";
  const failed = found?.order.status === "failed";

  return (
    <div className={receipt.receipt}>
      <header className={styles.bar}>
        <Link href="/vector-paint" className={styles.brand}>
          <Mark />
          <span className={styles.wordmark}>vector paint</span>
        </Link>
      </header>
      <main className={receipt.receiptBody}>
        <div className={receipt.receiptArt}>
          <div
            className={receipt.receiptCanvas}
            style={
              found?.product?.orientation === "landscape"
                ? { width: "min(460px, 80vw)" }
                : undefined
            }
          >
            {found?.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={found.preview}
                alt="The drawing you ordered on canvas"
              />
            ) : (
              <div className={receipt.receiptPlaceholder}>
                <Mark size={72} />
              </div>
            )}
          </div>
        </div>
        <div>
          <h1 className={`${receipt.receiptTitle} ${styles.display}`}>
            {failed ? "Paid, and we’re on it." : "It’s going on the wall."}
          </h1>
          <p className={receipt.receiptLead}>
            {failed
              ? "Your payment went through, but the print did not reach the printer first time. It is retried automatically, and if it still does not go through we will send it by hand or refund you in full. You do not need to do anything."
              : found?.product
                ? `Thank you. Your ${found.product.sizeLabel.toLowerCase()} canvas, ${formatCm(found.product)}, is on its way to the printer.`
                : "Thank you. Your canvas is on its way to the printer."}
          </p>
          <ol className={receipt.steps}>
            <li>
              <span className={`${receipt.stepNum} ${receipt.stepDone}`}>
                1
              </span>
              <span>
                <b>Paid.</b> Your payment went through securely with Stripe.
              </span>
            </li>
            <li>
              <span
                className={`${receipt.stepNum} ${sent ? receipt.stepDone : ""}`}
              >
                2
              </span>
              <span>
                <b>Printing.</b> Your drawing is printed on canvas and stretched
                over a 4 cm wooden frame.
              </span>
            </li>
            <li>
              <span className={receipt.stepNum}>3</span>
              <span>
                <b>Delivered.</b> Free UK delivery, arriving in about 5 to 9
                working days in total.
              </span>
            </li>
          </ol>
          <Link
            href="/vector-paint"
            className={`${styles.pill} ${styles.primary} ${styles.big}`}
          >
            Back to drawing
          </Link>
          {found && (
            <p className={receipt.receiptRef}>
              Order reference {found.order.id.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
