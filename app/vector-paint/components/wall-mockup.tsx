"use client"

import { type VectorPaintProduct } from "@/lib/vector-paint/products"

interface WallMockupProps {
  product: VectorPaintProduct
  drawingData?: string
}

// All units inside the SVG are real-world centimetres — that's the whole
// point. The viewBox represents a 4 m × 2.8 m wall section (typical UK
// living-room scale). Anything we draw at its real cm size will appear
// to the customer at its true relative size against the sofa.
const WALL_W = 400
const WALL_H = 280
const FLOOR_H = 36
const SOFA_W = 200
const SOFA_H = 80
const CANVAS_GAP_FROM_SOFA = 28

export default function WallMockup({ product, drawingData }: WallMockupProps) {
  const canvasW = (product.widthPx / product.dpi) * 2.54
  const canvasH = (product.heightPx / product.dpi) * 2.54

  const sofaX = (WALL_W - SOFA_W) / 2
  const sofaTopY = WALL_H - FLOOR_H - SOFA_H
  const canvasX = (WALL_W - canvasW) / 2
  const canvasY = sofaTopY - CANVAS_GAP_FROM_SOFA - canvasH

  return (
    <div
      style={{
        position: "relative",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox={`0 0 ${WALL_W} ${WALL_H}`}
        width="100%"
        style={{ display: "block" }}
        aria-label={`${product.label} shown to scale above a 200 cm sofa`}
      >
        <defs>
          <linearGradient id="wall-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f7f3ea" />
            <stop offset="100%" stopColor="#efe9dc" />
          </linearGradient>
          <linearGradient id="floor-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8b791" />
            <stop offset="100%" stopColor="#b8a47b" />
          </linearGradient>
          <filter id="canvas-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="0.8" floodOpacity="0.18" />
          </filter>
        </defs>

        <rect x="0" y="0" width={WALL_W} height={WALL_H - FLOOR_H} fill="url(#wall-grad)" />
        <rect x="0" y={WALL_H - FLOOR_H} width={WALL_W} height={FLOOR_H} fill="url(#floor-grad)" />
        <line
          x1="0"
          y1={WALL_H - FLOOR_H}
          x2={WALL_W}
          y2={WALL_H - FLOOR_H}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="0.4"
        />

        <Sofa x={sofaX} y={sofaTopY} />

        <g filter="url(#canvas-shadow)">
          <rect
            x={canvasX}
            y={canvasY}
            width={canvasW}
            height={canvasH}
            fill="#ffffff"
            stroke="rgba(0,0,0,0.35)"
            strokeWidth="0.4"
          />
          {drawingData && (
            <image
              href={`data:image/svg+xml;utf8,${encodeURIComponent(drawingData)}`}
              x={canvasX}
              y={canvasY}
              width={canvasW}
              height={canvasH}
              preserveAspectRatio="xMidYMid meet"
            />
          )}
        </g>
      </svg>
      <p
        style={{
          margin: 0,
          padding: "8px 12px",
          fontFamily: "var(--font-inter)",
          fontSize: 11,
          color: "rgba(0,0,0,0.5)",
          textAlign: "center",
          letterSpacing: "0.02em",
          borderTop: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        Shown to scale above a 200 cm sofa
      </p>
    </div>
  )
}

function Sofa({ x, y }: { x: number; y: number }) {
  // Sofa coordinate system: 0..SOFA_W × 0..SOFA_H, translated by parent.
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="0" y="0" width={SOFA_W} height={SOFA_H * 0.55} rx="5" fill="#b9a781" />
      <rect
        x="3"
        y={SOFA_H * 0.4}
        width={(SOFA_W - 12) / 3}
        height={SOFA_H * 0.45}
        rx="3"
        fill="#cbbb95"
      />
      <rect
        x={3 + (SOFA_W - 12) / 3 + 3}
        y={SOFA_H * 0.4}
        width={(SOFA_W - 12) / 3}
        height={SOFA_H * 0.45}
        rx="3"
        fill="#cbbb95"
      />
      <rect
        x={3 + 2 * ((SOFA_W - 12) / 3 + 3)}
        y={SOFA_H * 0.4}
        width={(SOFA_W - 12) / 3}
        height={SOFA_H * 0.45}
        rx="3"
        fill="#cbbb95"
      />
      <rect x="0" y={SOFA_H * 0.82} width={SOFA_W} height={SOFA_H * 0.14} fill="#9d8a64" />
      <rect x="2" y={SOFA_H * 0.96} width="4" height={SOFA_H * 0.04} fill="#6f5f43" />
      <rect
        x={SOFA_W - 6}
        y={SOFA_H * 0.96}
        width="4"
        height={SOFA_H * 0.04}
        fill="#6f5f43"
      />
    </g>
  )
}
