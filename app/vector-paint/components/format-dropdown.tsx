"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown, Check } from "lucide-react"
import {
  DEFAULT_PRODUCT_ID,
  VECTOR_PAINT_PRODUCTS,
  findProductByTierAndOrientation,
  type VectorPaintProductId,
  type VectorPaintSizeTier,
} from "@/lib/vector-paint/products"

const FORMAT_STORAGE_KEY = "vp_currentFormat"
const FORMAT_CHANGE_EVENT = "vp-format-changed"

const TIER_ORDER: VectorPaintSizeTier[] = ["small", "medium", "large"]

export default function FormatDropdown() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<VectorPaintProductId>(DEFAULT_PRODUCT_ID)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(FORMAT_STORAGE_KEY) as VectorPaintProductId | null
    if (stored && VECTOR_PAINT_PRODUCTS[stored]?.status === "active") {
      setCurrent(stored)
    }
    const onFormatChange = (e: Event) => {
      const id = (e as CustomEvent<VectorPaintProductId>).detail
      if (id && VECTOR_PAINT_PRODUCTS[id]) setCurrent(id)
    }
    window.addEventListener(FORMAT_CHANGE_EVENT, onFormatChange)
    return () => window.removeEventListener(FORMAT_CHANGE_EVENT, onFormatChange)
  }, [])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const selectTier = (tier: VectorPaintSizeTier) => {
    // Keep the user's current orientation when changing size tier.
    const currentOrientation = VECTOR_PAINT_PRODUCTS[current].orientation
    const next = findProductByTierAndOrientation(tier, currentOrientation)
    setCurrent(next.id)
    localStorage.setItem(FORMAT_STORAGE_KEY, next.id)
    window.dispatchEvent(new CustomEvent(FORMAT_CHANGE_EVENT, { detail: next.id }))
    setOpen(false)
  }

  const currentProduct = VECTOR_PAINT_PRODUCTS[current]

  return (
    <div ref={wrapperRef} style={{ position: "relative", marginLeft: 8 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "transparent",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 999,
          padding: "4px 10px 4px 12px",
          fontFamily: "var(--font-inter)",
          fontSize: 12,
          fontWeight: 500,
          color: "rgba(0,0,0,0.7)",
          letterSpacing: "-0.005em",
          cursor: "pointer",
        }}
      >
        <span style={{ fontWeight: 600 }}>{currentProduct.tierLabel}</span>
        <span style={{ color: "rgba(0,0,0,0.4)" }}>· {currentProduct.shortLabel}</span>
        <ChevronDown
          size={12}
          style={{
            color: "rgba(0,0,0,0.4)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            minWidth: 260,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.10)",
            padding: 6,
            zIndex: 60,
            fontFamily: "var(--font-inter)",
          }}
        >
          {TIER_ORDER.map((tier) => {
            const currentOrientation = currentProduct.orientation
            const product = findProductByTierAndOrientation(tier, currentOrientation)
            const isActive = product.status === "active"
            const isSelected = product.tier === currentProduct.tier
            return (
              <button
                key={tier}
                role="menuitem"
                onClick={() => isActive && selectTier(tier)}
                disabled={!isActive}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  border: "none",
                  borderRadius: 8,
                  background: isSelected ? "rgba(0,0,0,0.04)" : "transparent",
                  cursor: isActive ? "pointer" : "not-allowed",
                  textAlign: "left",
                  fontFamily: "inherit",
                  opacity: isActive ? 1 : 0.55,
                }}
                onMouseEnter={(e) => {
                  if (isActive && !isSelected)
                    e.currentTarget.style.background = "rgba(0,0,0,0.03)"
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent"
                }}
              >
                <span
                  style={{
                    width: 14,
                    flexShrink: 0,
                    color: "rgba(0,0,0,0.7)",
                    display: "inline-flex",
                    justifyContent: "center",
                  }}
                >
                  {isSelected && <Check size={12} />}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "rgba(0,0,0,0.85)",
                      letterSpacing: "-0.005em",
                    }}
                  >
                    {product.tierLabel}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 11,
                      color: "rgba(0,0,0,0.5)",
                      marginTop: 1,
                    }}
                  >
                    {product.shortLabel}
                    {!isActive && " · Coming soon"}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
