"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"

// Ordered roughly by hue then black/grey. White is omitted because the
// canvas is white.
const SWATCHES = [
  "#ef4444", // red
  "#f97316", // orange
  "#fcd34d", // yellow
  "#4ade80", // green
  "#38bdf8", // sky
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#92400e", // brown
  "#6b7280", // grey
  "#111111", // black
]

interface ColorPaletteProps {
  drawColor: string
  setDrawColor: (color: string) => void
  onClose: () => void
  savedHuePosition: { x: number; y: number } | null
  savedSquarePosition: { x: number; y: number } | null
  setSavedHuePosition: (position: { x: number; y: number } | null) => void
  setSavedSquarePosition: (position: { x: number; y: number } | null) => void
}

// Helper function to convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }

    h /= 6
  }

  return [h, s, l]
}

// Helper function to convert HSL to RGB
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r, g, b

  if (s === 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

// Helper function to get position on color wheel from hue
function getPositionFromHue(hue: number, radius: number): { x: number; y: number } {
  const angle = hue * 2 * Math.PI
  return {
    x: radius + radius * Math.cos(angle),
    y: radius + radius * Math.sin(angle),
  }
}

// Helper function to get position in square from saturation and lightness
function getPositionInSquare(s: number, l: number, width: number, height: number): { x: number; y: number } {
  // Adjust for the way our gradient is set up
  // In our implementation, x = saturation (0 to 1 from left to right)
  // y = lightness (1 to 0 from top to bottom, inverted for UI)
  return {
    x: s * width,
    y: (1 - l) * height,
  }
}

// Helper function to get saturation and lightness from position in square
function getSaturationLightnessFromPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): { s: number; l: number } {
  // Convert position to saturation and lightness
  const s = Math.max(0, Math.min(1, x / width))
  const l = Math.max(0, Math.min(1, 1 - y / height))
  return { s, l }
}

export default function ColorPalette({
  drawColor,
  setDrawColor,
  onClose,
  savedHuePosition,
  savedSquarePosition,
  setSavedHuePosition,
  setSavedSquarePosition,
}: ColorPaletteProps) {
  const colorPickerCanvasRef = useRef<HTMLCanvasElement>(null)
  const innerColorSquareRef = useRef<HTMLDivElement>(null)
  const innerSquareCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [huePosition, setHuePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [squarePosition, setSquarePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [hsl, setHsl] = useState<[number, number, number]>([0, 0, 0])
  const [pureHueColor, setPureHueColor] = useState<string>("#ff0000")
  const [currentColor, setCurrentColor] = useState<string>(drawColor)
  const [initialized, setInitialized] = useState(false)

  // Store saturation and lightness separately
  const [saturation, setSaturation] = useState<number>(1)
  const [lightness, setLightness] = useState<number>(0.5)

  useEffect(() => {
    drawColorPicker()

    // Setup initial positions
    if (!initialized) {
      setInitialized(true)

      if (savedHuePosition && savedSquarePosition) {
        // Restore saved positions
        setHuePosition(savedHuePosition)
        setSquarePosition(savedSquarePosition)

        // We need to wait for the canvas to be ready
        setTimeout(() => {
          if (colorPickerCanvasRef.current) {
            const ctx = colorPickerCanvasRef.current.getContext("2d")
            if (ctx) {
              // Get the hue color at the saved position
              const pixel = ctx.getImageData(savedHuePosition.x, savedHuePosition.y, 1, 1).data
              const newHueColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
              setPureHueColor(newHueColor)

              // Draw inner square with this hue color
              drawInnerColorSquare(newHueColor)
            }
          }
        }, 50)
      } else {
        // Set default positions: purple on the wheel and black in the square
        if (colorPickerCanvasRef.current) {
          const radius = colorPickerCanvasRef.current.width / 2

          // Purple is around 0.75 in hue (270° / 360°)
          const purpleHue = 0.75
          const purplePosition = getPositionFromHue(purpleHue, radius)
          setHuePosition(purplePosition)

          // Set the pure hue color to purple
          const [r, g, b] = hslToRgb(purpleHue, 1, 0.5)
          const purpleColor = `rgb(${r}, ${g}, ${b})`
          setPureHueColor(purpleColor)

          // For black: s=1, l=0 (bottom right of square)
          if (innerColorSquareRef.current) {
            const width = 150
            const height = 150
            const blackPosition = { x: width, y: height }
            setSquarePosition(blackPosition)

            // Draw the inner square
            drawInnerColorSquare(purpleColor)
          }
        }
      }
    }
  }, [initialized, savedHuePosition, savedSquarePosition])

  // Save positions when component unmounts
  useEffect(() => {
    return () => {
      setSavedHuePosition(huePosition)
      setSavedSquarePosition(squarePosition)
    }
  }, [huePosition, squarePosition, setSavedHuePosition, setSavedSquarePosition])

  // Get the color at a specific position in the inner square
  const getColorAtPosition = (x: number, y: number): string => {
    if (!innerSquareCanvasRef.current) return "#000000"

    const ctx = innerSquareCanvasRef.current.getContext("2d")
    if (!ctx) return "#000000"

    // Get the pixel data at the position
    const pixel = ctx.getImageData(x, y, 1, 1).data
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
  }

  const drawColorPicker = () => {
    const canvas = colorPickerCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const radius = canvas.width / 2
    const gradientOuter = ctx.createConicGradient(0, radius, radius)

    gradientOuter.addColorStop(0, "red")
    gradientOuter.addColorStop(0.16, "yellow")
    gradientOuter.addColorStop(0.33, "green")
    gradientOuter.addColorStop(0.5, "cyan")
    gradientOuter.addColorStop(0.66, "blue")
    gradientOuter.addColorStop(0.83, "magenta")
    gradientOuter.addColorStop(1, "red")

    ctx.fillStyle = gradientOuter
    ctx.beginPath()
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawInnerColorSquare = (color = pureHueColor, syncFromPosition = true) => {
    const innerSquare = innerColorSquareRef.current
    if (!innerSquare) return

    // Create a canvas and store a reference to it
    const canvas = document.createElement("canvas")
    innerSquareCanvasRef.current = canvas

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = 150
    const height = 150
    canvas.width = width
    canvas.height = height

    // Horizontal gradient from white to pure hue color
    const gradientHorizontal = ctx.createLinearGradient(0, 0, width, 0)
    gradientHorizontal.addColorStop(0, "white")
    gradientHorizontal.addColorStop(1, color)
    ctx.fillStyle = gradientHorizontal
    ctx.fillRect(0, 0, width, height)

    // Vertical gradient from transparent to black
    const gradientVertical = ctx.createLinearGradient(0, 0, 0, height)
    gradientVertical.addColorStop(0, "rgba(0, 0, 0, 0)")
    gradientVertical.addColorStop(1, "black")
    ctx.fillStyle = gradientVertical
    ctx.fillRect(0, 0, width, height)

    innerSquare.style.backgroundImage = `url(${canvas.toDataURL()})`

    // Skipped when the caller has already set the colour explicitly
    // (e.g. swatch click), otherwise we'd overwrite their pick using
    // the previous square indicator position.
    if (syncFromPosition && (squarePosition.x > 0 || squarePosition.y > 0)) {
      const newColor = getColorAtPosition(squarePosition.x, squarePosition.y)
      setCurrentColor(newColor)
      setDrawColor(newColor)
    }
  }

  const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ]

  // Picking a swatch also moves the wheel and saturation/lightness
  // indicators so the custom picker reflects the chosen colour. For
  // greys/black the hue is meaningless, so the wheel only syncs when
  // saturation is non-trivial.
  const applySwatch = (hex: string) => {
    const [r, g, b] = hexToRgb(hex)
    const [h, s, l] = rgbToHsl(r, g, b)

    const newSquarePosition = getPositionInSquare(s, l, 150, 150)
    setSquarePosition(newSquarePosition)
    setSaturation(s)
    setLightness(l)

    let pure = pureHueColor
    if (s > 0.05 && colorPickerCanvasRef.current) {
      const radius = colorPickerCanvasRef.current.width / 2
      setHuePosition(getPositionFromHue(h, radius))
      const [pr, pg, pb] = hslToRgb(h, 1, 0.5)
      pure = `rgb(${pr}, ${pg}, ${pb})`
      setPureHueColor(pure)
    }

    setCurrentColor(hex)
    setDrawColor(hex)
    drawInnerColorSquare(pure, false)
  }

  const handleColorPickerClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = colorPickerCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate position relative to center
    const x = e.clientX - rect.left - centerX
    const y = e.clientY - rect.top - centerY

    // Calculate angle and radius
    const angle = Math.atan2(y, x)
    const radius = canvas.width / 2

    // Position exactly on the circumference
    const newX = centerX + radius * Math.cos(angle)
    const newY = centerY + radius * Math.sin(angle)

    // Update the hue indicator position
    setHuePosition({ x: newX, y: newY })

    // Get color at this position
    const pixel = ctx.getImageData(newX, newY, 1, 1).data

    if (pixel[3] !== 0) {
      // Check for alpha to ensure a color is selected
      const newHueColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`
      setPureHueColor(newHueColor) // Store the pure hue color

      // Redraw the inner square with the new hue
      drawInnerColorSquare(newHueColor)
    }
  }

  const handleInnerSquareClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const innerSquare = innerColorSquareRef.current
    if (!innerSquare) return

    const rect = innerSquare.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Update the square indicator position
    setSquarePosition({ x, y })

    // Get the color at this position directly from the canvas
    const newColor = getColorAtPosition(x, y)
    setCurrentColor(newColor)
    setDrawColor(newColor)

    // Get saturation and lightness from position for future calculations
    const { s, l } = getSaturationLightnessFromPosition(x, y, rect.width, rect.height)
    setSaturation(s)
    setLightness(l)

    // Update HSL with new saturation and lightness
    const newHsl = [...hsl] as [number, number, number]
    newHsl[1] = s
    newHsl[2] = l
    setHsl(newHsl)
  }

  // Custom handler for the close button
  const handleClose = () => {
    // Save positions before closing
    setSavedHuePosition(huePosition)
    setSavedSquarePosition(squarePosition)
    onClose()
  }

  return (
    <div
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        padding: 20,
      }}
    >
      <div className="flex justify-between items-center" style={{ marginBottom: 12 }}>
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
          Colour
        </h3>
        <button
          onClick={handleClose}
          aria-label="Close colour picker"
          style={{
            color: "rgba(0,0,0,0.4)",
            background: "transparent",
            border: "none",
            padding: 4,
            cursor: "pointer",
            display: "flex",
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {SWATCHES.map((color) => {
          const isSelected = currentColor.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              onClick={() => applySwatch(color)}
              aria-label={`Pick colour ${color}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: color,
                border: isSelected ? "2px solid #111111" : "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer",
                padding: 0,
                boxShadow: isSelected ? "0 0 0 2px #ffffff inset" : "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />
          )
        })}
      </div>

      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 11,
          fontWeight: 500,
          color: "rgba(0,0,0,0.4)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Custom
      </div>

      <div className="relative w-[280px] h-[280px] rounded-full cursor-pointer">
        <canvas
          ref={colorPickerCanvasRef}
          width={280}
          height={280}
          className="w-full h-full rounded-full"
          onClick={handleColorPickerClick}
        />

        {/* Hue indicator on the color wheel - dial style */}
        <div
          className="absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${huePosition.x}px`,
            top: `${huePosition.y}px`,
            backgroundColor: pureHueColor,
            border: "2px solid white",
            boxShadow: "0 0 3px rgba(0,0,0,0.5)",
          }}
        />

        <div
          ref={innerColorSquareRef}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-xl cursor-crosshair"
          onClick={handleInnerSquareClick}
        >
          {/* Square indicator - circular style with selected color */}
          <div
            className="absolute w-5 h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${squarePosition.x}px`,
              top: `${squarePosition.y}px`,
              backgroundColor: currentColor,
              border: "2px solid white",
              boxShadow: "0 0 2px rgba(0,0,0,0.8)",
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: currentColor,
          }}
        />
      </div>
    </div>
  )
}
