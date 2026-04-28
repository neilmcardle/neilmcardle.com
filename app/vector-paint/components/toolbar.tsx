"use client"

import { PaintbrushIcon, Eraser, BarChart2, Save, Archive, RotateCcw, Undo, Redo } from "lucide-react"
import type { CSSProperties } from "react"

interface ToolbarProps {
  isDrawActive: boolean
  isEraseActive: boolean
  showSizeOpacity: boolean
  showColorPalette: boolean
  showSavePanel: boolean
  toggleDrawActive: () => void
  toggleEraseActive: () => void
  toggleSizeOpacity: () => void
  toggleColorPalette: () => void
  toggleSavePanel: () => void
  resetCanvas: () => void
  saveDrawing: () => void
  drawColor: string
  undoDrawing: () => void
  redoDrawing: () => void
  canUndo: boolean
  canRedo: boolean
}

const labelStyle: CSSProperties = {
  fontFamily: "var(--font-inter)",
  fontSize: 10,
  fontWeight: 500,
  color: "rgba(0,0,0,0.55)",
  marginTop: 6,
  letterSpacing: "0.02em",
}

const buttonBase: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background 0.15s, color 0.15s, border-color 0.15s, opacity 0.15s",
  border: "1px solid rgba(0,0,0,0.08)",
  background: "#ffffff",
  color: "rgba(0,0,0,0.75)",
}

function buttonStyle(active: boolean, disabled = false): CSSProperties {
  if (disabled) {
    return {
      ...buttonBase,
      opacity: 0.35,
      cursor: "not-allowed",
    }
  }
  if (active) {
    return {
      ...buttonBase,
      background: "#111111",
      color: "#ffffff",
      borderColor: "#111111",
    }
  }
  return buttonBase
}

export default function Toolbar({
  isDrawActive,
  isEraseActive,
  showSizeOpacity,
  showColorPalette,
  showSavePanel,
  toggleDrawActive,
  toggleEraseActive,
  toggleSizeOpacity,
  toggleColorPalette,
  toggleSavePanel,
  resetCanvas,
  saveDrawing,
  drawColor,
  undoDrawing,
  redoDrawing,
  canUndo,
  canRedo,
}: ToolbarProps) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-30"
      style={{
        bottom: 24,
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)",
        padding: "12px 16px",
        display: "flex",
        gap: 10,
      }}
    >
      <div className="flex flex-col items-center">
        <button style={buttonStyle(isDrawActive)} onClick={toggleDrawActive} aria-label="Brush">
          <PaintbrushIcon size={18} />
        </button>
        <span style={labelStyle}>Brush</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(isEraseActive)} onClick={toggleEraseActive} aria-label="Eraser">
          <Eraser size={18} />
        </button>
        <span style={labelStyle}>Erase</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(showSizeOpacity)} onClick={toggleSizeOpacity} aria-label="Brush settings">
          <BarChart2 size={18} />
        </button>
        <span style={labelStyle}>Settings</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={toggleColorPalette}
          aria-label="Colour"
          style={{
            ...buttonBase,
            padding: 6,
            borderColor: showColorPalette ? "#111111" : "rgba(0,0,0,0.08)",
            background: "#ffffff",
          }}
        >
          <span
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 6,
              background: drawColor,
              display: "block",
            }}
          />
        </button>
        <span style={labelStyle}>Colour</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(false, !canUndo)} onClick={undoDrawing} disabled={!canUndo} aria-label="Undo">
          <Undo size={18} />
        </button>
        <span style={labelStyle}>Undo</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(false, !canRedo)} onClick={redoDrawing} disabled={!canRedo} aria-label="Redo">
          <Redo size={18} />
        </button>
        <span style={labelStyle}>Redo</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(false)} onClick={saveDrawing} aria-label="Save">
          <Save size={18} />
        </button>
        <span style={labelStyle}>Save</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(showSavePanel)} onClick={toggleSavePanel} aria-label="Load">
          <Archive size={18} />
        </button>
        <span style={labelStyle}>Load</span>
      </div>

      <div className="flex flex-col items-center">
        <button style={buttonStyle(false)} onClick={resetCanvas} aria-label="Reset">
          <RotateCcw size={18} />
        </button>
        <span style={labelStyle}>Reset</span>
      </div>
    </div>
  )
}
