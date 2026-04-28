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

  // Fix for Firefox iOS range inputs
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

        // Calculate position as percentage of width
        const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))

        // Calculate value based on min, max and percentage
        const min = Number(input.min) || 1
        const max = Number(input.max) || 50
        const newValue = min + percentage * (max - min)

        // Update the input value
        setLineWidth(Math.round(newValue))
      }

      const handleOpacityTouch = (e: TouchEvent) => {
        if (!opacityInputRef.current) return

        const input = opacityInputRef.current
        const rect = input.getBoundingClientRect()
        const touch = e.touches[0]

        // Calculate position as percentage of width
        const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))

        // Calculate value based on min, max and percentage
        const min = Number(input.min) || 0.1
        const max = Number(input.max) || 1
        const newValue = min + percentage * (max - min)

        // Update the input value
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

  // Calculate opacity as percentage
  const opacityPercentage = Math.round(opacity * 100)

  // Calculate the percentage for the line width (1-50)
  const lineWidthPercentage = ((lineWidth - 1) / 49) * 100

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 p-4 rounded-xl z-40 flex flex-col w-[280px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-medium">Brush Settings</h3>
        <button onClick={onClose} className="text-white hover:bg-gray-700 rounded-full p-1" aria-label="Close panel">
          <X size={16} />
        </button>
      </div>

      <span className="text-white mb-2">Brush Size: {lineWidth}</span>
      <div className="relative mb-4 h-6 flex items-center">
        <div
          className="absolute h-2 bg-gray-600 rounded-full"
          style={{
            width: "calc(100% - 12px)",
            left: "6px",
            right: "6px",
          }}
        />
        <div
          className="absolute h-2 bg-green-500 rounded-l-full"
          style={{
            width: `calc(${lineWidthPercentage}% - 12px)`,
            left: "6px",
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

      <span className="text-white mb-2">Opacity: {opacityPercentage}%</span>
      <div className="relative mb-2 h-6 flex items-center">
        <div
          className="absolute h-2 bg-gray-600 rounded-full"
          style={{
            width: "calc(100% - 12px)",
            left: "6px",
            right: "6px",
          }}
        />
        <div
          className="absolute h-2 bg-green-500 rounded-l-full"
          style={{
            width: `calc(${opacityPercentage}% - 12px)`,
            left: "6px",
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
