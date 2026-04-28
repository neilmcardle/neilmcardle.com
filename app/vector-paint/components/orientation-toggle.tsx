"use client"

import { useEffect, useState } from "react"
import { RectangleVertical, RectangleHorizontal } from "lucide-react"
import {
  DEFAULT_PRODUCT_ID,
  VECTOR_PAINT_PRODUCTS,
  findProductByTierAndOrientation,
  type VectorPaintOrientation,
  type VectorPaintProductId,
} from "@/lib/vector-paint/products"

const FORMAT_STORAGE_KEY = "vp_currentFormat"
const FORMAT_CHANGE_EVENT = "vp-format-changed"

export default function OrientationToggle() {
  const [current, setCurrent] = useState<VectorPaintProductId>(DEFAULT_PRODUCT_ID)

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

  const selectOrientation = (orientation: VectorPaintOrientation) => {
    const tier = VECTOR_PAINT_PRODUCTS[current].tier
    const next = findProductByTierAndOrientation(tier, orientation)
    setCurrent(next.id)
    localStorage.setItem(FORMAT_STORAGE_KEY, next.id)
    window.dispatchEvent(new CustomEvent(FORMAT_CHANGE_EVENT, { detail: next.id }))
  }

  const currentOrientation = VECTOR_PAINT_PRODUCTS[current].orientation

  const baseStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 26,
    width: 30,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "rgba(0,0,0,0.5)",
    transition: "background 0.15s, color 0.15s",
  }

  const activeStyle = {
    background: "#ffffff",
    color: "rgba(0,0,0,0.85)",
    boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
  }

  return (
    <div
      role="group"
      aria-label="Orientation"
      style={{
        marginLeft: 8,
        display: "inline-flex",
        padding: 2,
        background: "rgba(0,0,0,0.04)",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 999,
      }}
    >
      <button
        onClick={() => selectOrientation("portrait")}
        aria-pressed={currentOrientation === "portrait"}
        aria-label="Portrait"
        title="Portrait"
        style={{
          ...baseStyle,
          borderRadius: 999,
          ...(currentOrientation === "portrait" ? activeStyle : {}),
        }}
      >
        <RectangleVertical size={14} strokeWidth={1.8} />
      </button>
      <button
        onClick={() => selectOrientation("landscape")}
        aria-pressed={currentOrientation === "landscape"}
        aria-label="Landscape"
        title="Landscape"
        style={{
          ...baseStyle,
          borderRadius: 999,
          ...(currentOrientation === "landscape" ? activeStyle : {}),
        }}
      >
        <RectangleHorizontal size={14} strokeWidth={1.8} />
      </button>
    </div>
  )
}
