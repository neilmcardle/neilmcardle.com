"use client"

import { Trash2, Download, ArchiveRestoreIcon as WindowRestore, X } from "lucide-react"

interface SavePanelProps {
  savedDrawings: Array<{ name: string; data: string }>
  loadSavedDrawing: (index: number) => void
  deleteSavedDrawing: (index: number) => void
  exportDrawing: (index: number) => void
  onClose: () => void
}

const rowButtonStyle = {
  background: "transparent",
  border: "none",
  color: "rgba(0,0,0,0.6)",
  padding: 6,
  borderRadius: 6,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.15s, color 0.15s",
}

const rowLabelStyle = {
  fontFamily: "var(--font-inter)",
  fontSize: 10,
  fontWeight: 500,
  color: "rgba(0,0,0,0.5)",
  marginTop: 2,
  letterSpacing: "0.02em",
}

export default function SavePanel({
  savedDrawings,
  loadSavedDrawing,
  deleteSavedDrawing,
  exportDrawing,
  onClose,
}: SavePanelProps) {
  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 z-30"
      style={{
        top: 80,
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        padding: 20,
        width: "90%",
        maxWidth: 360,
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
          Memory Box
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
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {savedDrawings.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 12,
              color: "rgba(0,0,0,0.4)",
              margin: 0,
              padding: "8px 0",
            }}
          >
            No saved drawings yet.
          </p>
        ) : (
          savedDrawings.map((drawing, index) => (
            <div
              key={index}
              style={{
                background: "#f8f8f7",
                border: "1px solid rgba(0,0,0,0.04)",
                borderRadius: 10,
                padding: "8px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 36,
                  flexShrink: 0,
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 6,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={`data:image/svg+xml;utf8,${encodeURIComponent(drawing.data)}`}
                  alt=""
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    objectFit: "contain",
                    pointerEvents: "none",
                  }}
                />
              </div>

              <span
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.8)",
                  flexGrow: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {drawing.name}
              </span>

              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => loadSavedDrawing(index)}
                    style={rowButtonStyle}
                    aria-label={`Load drawing: ${drawing.name}`}
                    title="Load drawing"
                  >
                    <WindowRestore size={14} />
                  </button>
                  <span style={rowLabelStyle}>Load</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => exportDrawing(index)}
                    style={rowButtonStyle}
                    aria-label={`Export drawing: ${drawing.name}`}
                    title="Export as SVG"
                  >
                    <Download size={14} />
                  </button>
                  <span style={rowLabelStyle}>Export</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <button
                    onClick={() => deleteSavedDrawing(index)}
                    style={rowButtonStyle}
                    aria-label={`Delete drawing: ${drawing.name}`}
                    title="Delete drawing"
                  >
                    <Trash2 size={14} />
                  </button>
                  <span style={rowLabelStyle}>Delete</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
