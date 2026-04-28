"use client"

import { useEffect, useRef, useState } from "react"
import { X, Minus, Plus } from "lucide-react"
import { getProduct, type VectorPaintProductId } from "@/lib/vector-paint/products"

const SHIPPING_MINOR = 499
const MAX_QUANTITY = 10

interface OrderPanelProps {
  drawing: { name: string; data: string } | null
  productId: VectorPaintProductId
  onClose: () => void
  parentalGatePassed: boolean
  onParentalGatePassed: () => void
}

function formatGbp(minor: number): string {
  return `£${(minor / 100).toFixed(2)}`
}

function generateProblem() {
  const a = 6 + Math.floor(Math.random() * 7)
  const b = 6 + Math.floor(Math.random() * 7)
  return { a, b, answer: a * b }
}

export default function OrderPanel({
  drawing,
  productId,
  onClose,
  parentalGatePassed,
  onParentalGatePassed,
}: OrderPanelProps) {
  const product = getProduct(productId)
  const [quantity, setQuantity] = useState(1)
  const [problem, setProblem] = useState(() => generateProblem())
  const [gateInput, setGateInput] = useState("")
  const [gateError, setGateError] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const gateInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!parentalGatePassed) gateInputRef.current?.focus()
  }, [parentalGatePassed])

  const itemTotal = product.sellPriceMinor * quantity
  const total = itemTotal + SHIPPING_MINOR

  const incrementQty = () => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))
  const decrementQty = () => setQuantity((q) => Math.max(1, q - 1))

  const checkGate = () => {
    if (parseInt(gateInput, 10) === problem.answer) {
      onParentalGatePassed()
      setGateError(false)
      setGateInput("")
    } else {
      setGateError(true)
      setGateInput("")
      setProblem(generateProblem())
    }
  }

  const handlePrint = async () => {
    if (!drawing || !parentalGatePassed) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/vector-paint/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          svg: drawing.data,
          productId,
          quantity,
        }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Checkout failed" }))
        throw new Error(msg || "Checkout failed")
      }
      const { url } = await res.json()
      if (!url) throw new Error("No checkout URL returned")
      window.location.href = url
    } catch (err: any) {
      setError(err.message ?? "Something went wrong")
      setSubmitting(false)
    }
  }

  return (
    <aside
      role="dialog"
      aria-label="Order print"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(380px, 100vw)",
        background: "#ffffff",
        borderLeft: "1px solid rgba(0,0,0,0.06)",
        boxShadow: "-12px 0 32px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        zIndex: 60,
        fontFamily: "var(--font-inter)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(0,0,0,0.85)",
            letterSpacing: "-0.01em",
          }}
        >
          Order print
        </h2>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(0,0,0,0.4)",
            cursor: "pointer",
            padding: 4,
            display: "flex",
          }}
        >
          <X size={16} />
        </button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
        {drawing && (
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                position: "relative",
                aspectRatio: `${product.aspect.w} / ${product.aspect.h}`,
                maxHeight: 380,
                margin: "0 auto",
                background: "#fdfcfa",
                borderRadius: 3,
                // Layered shadow: tight contact shadow + soft cast shadow,
                // suggests a real sheet of paper resting on a surface.
                boxShadow:
                  "0 1px 1px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.06), 0 18px 36px rgba(0,0,0,0.10)",
                padding: "6%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(drawing.data)}`}
                alt={drawing.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
            <p
              style={{
                margin: "12px 0 0 0",
                textAlign: "center",
                fontSize: 11,
                color: "rgba(0,0,0,0.45)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {product.shortLabel} · {Math.round((product.widthPx / product.dpi) * 25.4)} × {Math.round((product.heightPx / product.dpi) * 25.4)} mm
            </p>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(0,0,0,0.85)",
              marginBottom: 4,
            }}
          >
            {product.label}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "rgba(0,0,0,0.55)",
              lineHeight: 1.5,
            }}
          >
            {product.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            background: "#f8f8f7",
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(0,0,0,0.7)" }}>Quantity</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={decrementQty}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#ffffff",
                color: "rgba(0,0,0,0.7)",
                cursor: quantity <= 1 ? "not-allowed" : "pointer",
                opacity: quantity <= 1 ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Minus size={12} />
            </button>
            <span
              aria-live="polite"
              style={{ fontSize: 13, fontWeight: 600, minWidth: 18, textAlign: "center" }}
            >
              {quantity}
            </span>
            <button
              onClick={incrementQty}
              disabled={quantity >= MAX_QUANTITY}
              aria-label="Increase quantity"
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#ffffff",
                color: "rgba(0,0,0,0.7)",
                cursor: quantity >= MAX_QUANTITY ? "not-allowed" : "pointer",
                opacity: quantity >= MAX_QUANTITY ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={12} />
            </button>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.06)",
            paddingTop: 12,
            marginBottom: 16,
            fontSize: 12,
            color: "rgba(0,0,0,0.7)",
          }}
        >
          <Row
            label={`${product.label} × ${quantity}`}
            value={formatGbp(itemTotal)}
          />
          <Row label="Shipping (UK standard)" value={formatGbp(SHIPPING_MINOR)} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              paddingTop: 10,
              borderTop: "1px solid rgba(0,0,0,0.06)",
              fontSize: 13,
              fontWeight: 600,
              color: "rgba(0,0,0,0.9)",
            }}
          >
            <span>Total</span>
            <span>{formatGbp(total)}</span>
          </div>
        </div>

        {!parentalGatePassed && (
          <div
            style={{
              background: "#fff8ec",
              border: "1px solid rgba(180,120,20,0.18)",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(120,75,15,0.9)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 6,
              }}
            >
              Grown-up check
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(0,0,0,0.7)", marginBottom: 8 }}>
              What is {problem.a} × {problem.b}?
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                ref={gateInputRef}
                type="number"
                inputMode="numeric"
                value={gateInput}
                onChange={(e) => {
                  setGateInput(e.target.value)
                  setGateError(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") checkGate()
                }}
                aria-label="Answer"
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  fontSize: 13,
                  fontFamily: "inherit",
                  border: gateError
                    ? "1px solid rgba(200,40,40,0.5)"
                    : "1px solid rgba(0,0,0,0.12)",
                  borderRadius: 8,
                  background: "#ffffff",
                  outline: "none",
                }}
              />
              <button
                onClick={checkGate}
                disabled={!gateInput.trim()}
                style={{
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  border: "none",
                  borderRadius: 8,
                  background: "rgba(0,0,0,0.85)",
                  color: "#ffffff",
                  cursor: gateInput.trim() ? "pointer" : "not-allowed",
                  opacity: gateInput.trim() ? 1 : 0.5,
                }}
              >
                Confirm
              </button>
            </div>
            {gateError && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  marginTop: 8,
                  fontSize: 11,
                  color: "rgba(180,40,40,0.9)",
                }}
              >
                Not quite. Try another one.
              </p>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              fontSize: 12,
              color: "rgba(180,40,40,0.9)",
              background: "rgba(220,60,60,0.06)",
              border: "1px solid rgba(220,60,60,0.15)",
              borderRadius: 8,
              padding: "8px 10px",
              marginBottom: 12,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <footer
        style={{
          padding: 18,
          borderTop: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <button
          onClick={handlePrint}
          disabled={!parentalGatePassed || submitting || !drawing}
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            border: "none",
            borderRadius: 10,
            background: "rgba(0,0,0,0.9)",
            color: "#ffffff",
            cursor:
              !parentalGatePassed || submitting || !drawing ? "not-allowed" : "pointer",
            opacity: !parentalGatePassed || submitting || !drawing ? 0.45 : 1,
            transition: "opacity 0.15s",
          }}
        >
          {submitting ? "Connecting to checkout…" : "Print with Gelato"}
        </button>
        <p
          style={{
            margin: "10px 0 0 0",
            fontSize: 11,
            color: "rgba(0,0,0,0.45)",
            textAlign: "center",
          }}
        >
          You will pay {formatGbp(total)} on the next screen.
        </p>
      </footer>
    </aside>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 6,
      }}
    >
      <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </span>
      <span>{value}</span>
    </div>
  )
}
