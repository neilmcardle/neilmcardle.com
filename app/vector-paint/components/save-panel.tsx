"use client"

import { useEffect, useRef, useState } from "react"
import { Trash2, Download, ArchiveRestoreIcon as WindowRestore, X, ShoppingBag, Pencil } from "lucide-react"

interface SavePanelProps {
  savedDrawings: Array<{ name: string; data: string }>
  loadSavedDrawing: (index: number) => void
  deleteSavedDrawing: (index: number) => void
  exportDrawing: (index: number) => void
  renameSavedDrawing: (index: number, name: string) => void
  onClose: () => void
}

async function startPrintCheckout(svg: string) {
  const res = await fetch("/api/vector-paint/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ svg, productId: "a4_print" }),
  })
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: "Checkout failed" }))
    throw new Error(error || "Checkout failed")
  }
  const { url } = await res.json()
  if (!url) throw new Error("No checkout URL returned")
  window.location.href = url
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
  renameSavedDrawing,
  onClose,
}: SavePanelProps) {
  const [printingIndex, setPrintingIndex] = useState<number | null>(null)
  const [printError, setPrintError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const editInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [editingIndex])

  const startRename = (index: number) => {
    setEditingIndex(index)
    setEditingValue(savedDrawings[index].name)
  }

  const commitRename = () => {
    if (editingIndex === null) return
    renameSavedDrawing(editingIndex, editingValue)
    setEditingIndex(null)
  }

  const cancelRename = () => setEditingIndex(null)

  const handleOrderPrint = async (index: number) => {
    setPrintError(null)
    setPrintingIndex(index)
    try {
      await startPrintCheckout(savedDrawings[index].data)
    } catch (err: any) {
      setPrintError(err.message ?? "Something went wrong")
      setPrintingIndex(null)
    }
  }

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

      {printError && (
        <div
          role="alert"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 12,
            color: "rgba(180,40,40,0.9)",
            background: "rgba(220,60,60,0.06)",
            border: "1px solid rgba(220,60,60,0.15)",
            borderRadius: 8,
            padding: "8px 10px",
            marginBottom: 12,
          }}
        >
          {printError}
        </div>
      )}

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
                {editingIndex === index ? (
                  <input
                    ref={editInputRef}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename()
                      if (e.key === "Escape") cancelRename()
                    }}
                    aria-label={`Rename ${drawing.name}`}
                    style={{
                      width: "100%",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      color: "rgba(0,0,0,0.85)",
                      background: "rgba(0,0,0,0.04)",
                      border: "1px solid rgba(0,0,0,0.1)",
                      borderRadius: 6,
                      padding: "2px 6px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <button
                    onClick={() => startRename(index)}
                    title="Click to rename"
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      textAlign: "left",
                      fontFamily: "inherit",
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      color: "inherit",
                      background: "transparent",
                      border: "none",
                      padding: 0,
                      cursor: "text",
                    }}
                  >
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                    >
                      {drawing.name}
                    </span>
                    <Pencil
                      size={10}
                      style={{ color: "rgba(0,0,0,0.35)", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                  </button>
                )}
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
                    onClick={() => handleOrderPrint(index)}
                    disabled={printingIndex !== null}
                    style={{
                      ...rowButtonStyle,
                      opacity: printingIndex === index ? 0.5 : 1,
                      cursor: printingIndex !== null ? "wait" : "pointer",
                    }}
                    aria-label={`Order A4 print of: ${drawing.name}`}
                    title="Order A4 print (£14.99)"
                  >
                    <ShoppingBag size={14} />
                  </button>
                  <span style={rowLabelStyle}>
                    {printingIndex === index ? "..." : "Print"}
                  </span>
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
