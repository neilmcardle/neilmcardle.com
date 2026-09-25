"use client";

import { useEffect, useRef, useState } from "react";
import type { Drawing } from "@/lib/vector-paint/drawing";
import {
  findProduct,
  formatCm,
  formatPrice,
  SIZE_ORDER,
  type VectorPaintSize,
} from "@/lib/vector-paint/products";
import { Thumb } from "./wall";
import { CloseIcon } from "./icons";
import styles from "../vector-paint.module.css";

const ROOM_W_CM = 240;
const ROOM_H_CM = 190;
const FLOOR_CM = 12;
const SOFA_H_CM = 70;
const HANG_GAP_CM = 18;
const MAX_QUANTITY = 5;

function Sofa() {
  return (
    <svg
      className={styles.sofa}
      viewBox="0 0 190 70"
      aria-hidden
      style={{ height: `${(SOFA_H_CM / ROOM_H_CM) * 100}%` }}
      preserveAspectRatio="none"
    >
      <rect
        x="12"
        y="4"
        width="166"
        height="38"
        rx="10"
        fill="currentColor"
        opacity="0.75"
      />
      <rect x="10" y="34" width="170" height="24" rx="6" fill="currentColor" />
      <rect x="0" y="22" width="24" height="38" rx="9" fill="currentColor" />
      <rect x="166" y="22" width="24" height="38" rx="9" fill="currentColor" />
      <rect x="16" y="58" width="5" height="12" rx="1.5" fill="currentColor" />
      <rect x="169" y="58" width="5" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}

function makeSum() {
  const a = 6 + Math.floor(Math.random() * 7);
  const b = 6 + Math.floor(Math.random() * 7);
  return { a, b, answer: a * b };
}

interface OrderSheetProps {
  drawing: Drawing;
  gatePassed: boolean;
  onGatePassed: () => void;
  onClose: () => void;
}

export default function OrderSheet({
  drawing,
  gatePassed,
  onGatePassed,
  onClose,
}: OrderSheetProps) {
  const [size, setSize] = useState<VectorPaintSize>("medium");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sum] = useState(makeSum);
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(0);
  const answerRef = useRef<HTMLInputElement>(null);

  const product = findProduct(size, drawing.orientation);

  useEffect(() => {
    if (!gatePassed) answerRef.current?.focus();
  }, [gatePassed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const checkAnswer = () => {
    if (Number(answer.trim()) === sum.answer) {
      onGatePassed();
    } else {
      setWrong((w) => w + 1);
      setAnswer("");
    }
  };

  const pay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/vector-paint/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          drawing: {
            orientation: drawing.orientation,
            strokes: drawing.strokes,
          },
          productId: product.id,
          quantity,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url)
        throw new Error(
          data.error || "Checkout could not start. Nothing has been charged.",
        );
      window.location.assign(data.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Checkout could not start. Nothing has been charged.",
      );
      setSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vp-order-title"
    >
      <div className={styles.overlayHead}>
        <span />
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Close"
          disabled={submitting}
        >
          <CloseIcon />
        </button>
      </div>

      <div className={styles.sheetBody}>
        {!gatePassed ? (
          <div className={styles.gate}>
            <form
              className={styles.gateInner}
              onSubmit={(e) => {
                e.preventDefault();
                checkAnswer();
              }}
            >
              <h3 id="vp-order-title" className={styles.display}>
                Ask a grown-up.
              </h3>
              <p>
                Ordering a canvas costs money, so a grown-up needs to answer
                this one.
              </p>
              <label
                className={`${styles.sum} ${styles.display}`}
                htmlFor="vp-gate"
              >
                {sum.a} × {sum.b} =
              </label>
              <input
                id="vp-gate"
                key={wrong}
                ref={answerRef}
                autoFocus
                className={`${styles.answer} ${wrong > 0 ? styles.answerWrong : ""}`}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
                aria-describedby="vp-gate-hint"
              />
              <span id="vp-gate-hint" className={styles.hint} role="status">
                {wrong > 0 ? "Not quite. Try again." : ""}
              </span>
              <button
                type="submit"
                className={`${styles.pill} ${styles.primary} ${styles.big}`}
                disabled={!answer}
              >
                Continue
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.orderLayout}>
            <div className={styles.roomCol}>
              <div className={styles.room}>
                <span className={styles.scaleNote}>
                  Shown to scale above a 190 cm sofa
                </span>
                <div
                  className={styles.hung}
                  style={{
                    width: `${(product.widthMm / 10 / ROOM_W_CM) * 100}%`,
                    height: `${(product.heightMm / 10 / ROOM_H_CM) * 100}%`,
                    bottom: `${((FLOOR_CM + SOFA_H_CM + HANG_GAP_CM) / ROOM_H_CM) * 100}%`,
                  }}
                >
                  <Thumb drawing={drawing} />
                </div>
                <Sofa />
              </div>
            </div>

            <div className={styles.panel}>
              <h3
                id="vp-order-title"
                className={`${styles.panelTitle} ${styles.display}`}
              >
                {drawing.name}, on canvas.
              </h3>
              <p className={styles.panelLead}>
                Printed on canvas and stretched over a 4 cm wooden frame, ready
                to hang. The sides stay clean white.
              </p>

              <div
                className={styles.sizes}
                role="radiogroup"
                aria-label="Canvas size"
              >
                {SIZE_ORDER.map((s) => {
                  const p = findProduct(s, drawing.orientation);
                  return (
                    <button
                      key={s}
                      role="radio"
                      aria-checked={size === s}
                      className={`${styles.size} ${size === s ? styles.sizeOn : ""}`}
                      onClick={() => setSize(s)}
                    >
                      <span className={styles.sizeName}>{p.sizeLabel}</span>
                      <span className={styles.sizePrice}>
                        {formatPrice(p.sellPriceMinor)}
                      </span>
                      <span className={styles.sizeMeta}>
                        <span className={styles.mono}>{formatCm(p)}</span> ·
                        good above {p.fitsAbove}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className={styles.row}>
                <span>How many</span>
                <span className={styles.stepper}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="One fewer"
                  >
                    −
                  </button>
                  <span aria-live="polite">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
                    }
                    disabled={quantity >= MAX_QUANTITY}
                    aria-label="One more"
                  >
                    +
                  </button>
                </span>
              </div>

              <div className={styles.row}>
                <span>Delivery</span>
                <span>Free, UK only</span>
              </div>

              <div className={`${styles.row} ${styles.total}`}>
                <span>Total</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  {formatPrice(product.sellPriceMinor * quantity)}
                </span>
              </div>

              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}

              <button
                className={`${styles.pill} ${styles.primary} ${styles.big}`}
                onClick={pay}
                disabled={submitting}
              >
                {submitting ? "Preparing your canvas…" : "Continue to payment"}
              </button>

              <p className={styles.fine}>
                Arrives in about 5 to 9 working days. You pay securely with
                Stripe on the next page. Your drawing is only used to print this
                order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
