"use client"

import { X } from "lucide-react"
import { useEffect, useRef } from "react"

interface SizeOpacityPanelProps {
  lineWidth: number
  opacity: number
  setLineWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  onClose: () => void
}

export default function SizeOpacityPanel({
  lineWidth,
  opacity,
  setLineWidth,
  setOpacity,
  onClose,
}: SizeOpacityPanelProps) {
  const lineWidthInputRef = useRef<HTMLInputElement>(null)
  const opacityInputRef = useRef<HTMLInputElement>(null)

  // Firefox iOS doesn't fire change events on range inputs from touch.
  // Translate touchstart/touchmove into the same value updates so the
  // sliders work there. See https://bugzilla.mozilla.org/show_bug.cgi?id=1576996
  useEffect(() => {
    const isFirefoxiOS =
      navigator.userAgent.includes("FxiOS") ||
      (navigator.userAgent.includes("Firefox") && navigator.userAgent.includes("iPhone"))

    if (isFirefoxiOS) {
      const handleLineWidthTouch = (e: TouchEvent) => {
        if (!lineWidthInputRef.current) return
        const input = lineWidthInputRef.current
        const rect = input.getBoundingClientRect()
        const touch = e.touches[0]
        const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
        const min = Number(input.min) || 1
        const max = Number(input.max) || 50
        const newValue = min + percentage * (max - min)
        setLineWidth(Math.round(newValue))
      }

      const handleOpacityTouch = (e: TouchEvent) => {
        if (!opacityInputRef.current) return
        const input = opacityInputRef.current
        const rect = input.getBoundingClientRect()
        const touch = e.touches[0]
        const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
        const min = Number(input.min) || 0.1
        const max = Number(input.max) || 1
        const newValue = min + percentage * (max - min)
        setOpacity(Number.parseFloat(newValue.toFixed(1)))
      }

      if (lineWidthInputRef.current) {
        lineWidthInputRef.current.addEventListener("touchstart", handleLineWidthTouch)
        lineWidthInputRef.current.addEventListener("touchmove", handleLineWidthTouch)
      }

      if (opacityInputRef.current) {
        opacityInputRef.current.addEventListener("touchstart", handleOpacityTouch)
        opacityInputRef.current.addEventListener("touchmove", handleOpacityTouch)
      }

      return () => {
        if (lineWidthInputRef.current) {
          lineWidthInputRef.current.removeEventListener("touchstart", handleLineWidthTouch)
          lineWidthInputRef.current.removeEventListener("touchmove", handleLineWidthTouch)
        }

        if (opacityInputRef.current) {
          opacityInputRef.current.removeEventListener("touchstart", handleOpacityTouch)
          opacityInputRef.current.removeEventListener("touchmove", handleOpacityTouch)
        }
      }
    }
  }, [setLineWidth, setOpacity])

  const opacityPercentage = Math.round(opacity * 100)
  const lineWidthPercentage = ((lineWidth - 1) / 49) * 100

  const labelStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(0,0,0,0.7)",
    marginBottom: 6,
    display: "block" as const,
  }

  const valueStyle = {
    fontFamily: "var(--font-inter)",
    fontSize: 12,
    color: "rgba(0,0,0,0.4)",
    fontVariantNumeric: "tabular-nums" as const,
  }

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        padding: 20,
        width: 280,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 13,
            fontWeight: 600,
            color: "rgba(0,0,0,0.85)",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          Brush Settings
        </h3>
        <button
          onClick={onClose}
          aria-label="Close panel"
          style={{
            color: "rgba(0,0,0,0.4)",
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
            display: "flex",
            transition: "color 0.15s",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={labelStyle}>Brush Size</span>
        <span style={valueStyle}>{lineWidth}</span>
      </div>
      <div className="relative h-6 flex items-center" style={{ marginBottom: 16 }}>
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            background: "rgba(0,0,0,0.08)",
            width: "calc(100% - 12px)",
            left: 6,
            right: 6,
          }}
        />
        <div
          className="absolute h-1.5 rounded-l-full"
          style={{
            background: "#111111",
            width: `calc(${lineWidthPercentage}% - 12px)`,
            left: 6,
            maxWidth: "calc(100% - 24px)",
          }}
        />
        <input
          ref={lineWidthInputRef}
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number.parseInt(e.target.value))}
          className="absolute inset-0 w-full appearance-none bg-transparent touch-manipulation"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={labelStyle}>Opacity</span>
        <span style={valueStyle}>{opacityPercentage}%</span>
      </div>
      <div className="relative h-6 flex items-center">
        <div
          className="absolute h-1.5 rounded-full"
          style={{
            background: "rgba(0,0,0,0.08)",
            width: "calc(100% - 12px)",
            left: 6,
            right: 6,
          }}
        />
        <div
          className="absolute h-1.5 rounded-l-full"
          style={{
            background: "#111111",
            width: `calc(${opacityPercentage}% - 12px)`,
            left: 6,
            maxWidth: "calc(100% - 24px)",
          }}
        />
        <input
          ref={opacityInputRef}
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={opacity}
          onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
          className="absolute inset-0 w-full appearance-none bg-transparent touch-manipulation"
        />
      </div>
    </div>
  )
}
