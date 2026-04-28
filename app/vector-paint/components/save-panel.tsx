"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import {
  Trash2,
  ArchiveRestoreIcon as WindowRestore,
  X,
  ShoppingBag,
  Pencil,
} from "lucide-react"
import {
  VECTOR_PAINT_PRODUCTS,
  type VectorPaintProductId,
} from "@/lib/vector-paint/products"

interface SavedDrawing {
  name: string
  data: string
  format?: VectorPaintProductId
}

interface SavePanelProps {
  savedDrawings: Array<SavedDrawing>
  loadSavedDrawing: (index: number) => void
  deleteSavedDrawing: (index: number) => void
  renameSavedDrawing: (index: number, name: string) => void
  onOrderPrint: (index: number) => void
  onClose: () => void
  deleteDisabled?: boolean
}

export default function SavePanel({
  savedDrawings,
  loadSavedDrawing,
  deleteSavedDrawing,
  renameSavedDrawing,
  onOrderPrint,
  onClose,
  deleteDisabled = false,
}: SavePanelProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const editInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus()
      editInputRef.current?.select()
    }
  }, [editingIndex])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && editingIndex === null) onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose, editingIndex])

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

  return (
    <div
      role="dialog"
      aria-label="Memory Box"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,20,0.45)",
        backdropFilter: "blur(2px)",
        WebkitBackdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 60,
        fontFamily: "var(--font-inter)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          maxHeight: "calc(100vh - 48px)",
          background: "#ffffff",
          borderRadius: 18,
          boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 28px 64px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 28px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "rgba(0,0,0,0.85)",
                letterSpacing: "-0.015em",
              }}
            >
              Memory Box
            </h2>
            <p
              style={{
                margin: "2px 0 0 0",
                fontSize: 12,
                color: "rgba(0,0,0,0.45)",
              }}
            >
              {savedDrawings.length === 0
                ? "Saved drawings appear here"
                : `${savedDrawings.length} ${
                    savedDrawings.length === 1 ? "drawing" : "drawings"
                  } saved`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(0,0,0,0.5)",
              padding: 6,
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </header>

        <div style={{ padding: 28, overflowY: "auto" }}>
          {savedDrawings.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "rgba(0,0,0,0.5)",
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: 0, marginBottom: 4, color: "rgba(0,0,0,0.7)" }}>
                Nothing saved yet.
              </p>
              <p style={{ margin: 0 }}>
                Draw something and tap save — your drawings live here, ready to
                print, open again, or download.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 18,
              }}
            >
              {savedDrawings.map((drawing, index) => (
                <DrawingCard
                  key={index}
                  index={index}
                  drawing={drawing}
                  isEditing={editingIndex === index}
                  editingValue={editingValue}
                  editInputRef={editInputRef}
                  onStartRename={() => startRename(index)}
                  onChangeRename={setEditingValue}
                  onCommitRename={commitRename}
                  onCancelRename={cancelRename}
                  onLoad={() => loadSavedDrawing(index)}
                  onPrint={() => onOrderPrint(index)}
                  onDelete={() => deleteSavedDrawing(index)}
                  deleteDisabled={deleteDisabled}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DrawingCardProps {
  index: number
  drawing: SavedDrawing
  isEditing: boolean
  editingValue: string
  editInputRef: React.RefObject<HTMLInputElement | null>
  onStartRename: () => void
  onChangeRename: (v: string) => void
  onCommitRename: () => void
  onCancelRename: () => void
  onLoad: () => void
  onPrint: () => void
  onDelete: () => void
  deleteDisabled: boolean
}

function DrawingCard({
  drawing,
  isEditing,
  editingValue,
  editInputRef,
  onStartRename,
  onChangeRename,
  onCommitRename,
  onCancelRename,
  onLoad,
  onPrint,
  onDelete,
  deleteDisabled,
}: DrawingCardProps) {
  const product = drawing.format ? VECTOR_PAINT_PRODUCTS[drawing.format] : undefined

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 1px 2px rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.08)"
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.14)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"
      }}
    >
      <div
        style={{
          aspectRatio: product
            ? `${product.aspect.w} / ${product.aspect.h}`
            : "3 / 4",
          background: "#f4f3f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
        }}
      >
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(drawing.data)}`}
          alt={drawing.name}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            background: "#ffffff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
          }}
        />
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        {isEditing ? (
          <input
            ref={editInputRef}
            value={editingValue}
            onChange={(e) => onChangeRename(e.target.value)}
            onBlur={onCommitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") onCommitRename()
              if (e.key === "Escape") onCancelRename()
            }}
            aria-label={`Rename ${drawing.name}`}
            style={{
              width: "100%",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(0,0,0,0.85)",
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.12)",
              borderRadius: 8,
              padding: "6px 10px",
              outline: "none",
            }}
          />
        ) : (
          <button
            onClick={onStartRename}
            title="Click to rename"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              textAlign: "left",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "text",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "rgba(0,0,0,0.85)",
                letterSpacing: "-0.005em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                minWidth: 0,
                flex: 1,
              }}
            >
              {drawing.name}
            </span>
            <Pencil size={11} style={{ color: "rgba(0,0,0,0.35)", flexShrink: 0 }} aria-hidden />
          </button>
        )}

        {product && (
          <p
            style={{
              margin: "4px 0 14px 0",
              fontSize: 12,
              color: "rgba(0,0,0,0.5)",
            }}
          >
            {product.tierLabel} · {product.shortLabel}
          </p>
        )}
        {!product && <div style={{ height: 14 }} />}

        <button
          onClick={onPrint}
          style={primaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,1)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,0,0,0.88)"
          }}
        >
          <ShoppingBag size={14} />
          Print canvas
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 6,
            marginTop: 8,
          }}
        >
          <SecondaryButton onClick={onLoad} icon={<WindowRestore size={13} />} label="Open" />
          <SecondaryButton
            onClick={onDelete}
            icon={<Trash2 size={13} />}
            label="Delete"
            danger
            disabled={deleteDisabled}
            disabledTitle="Wait for the previous undo to finish"
          />
        </div>
      </div>
    </article>
  )
}

function SecondaryButton({
  onClick,
  icon,
  label,
  danger,
  disabled,
  disabledTitle,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  danger?: boolean
  disabled?: boolean
  disabledTitle?: string
}) {
  const baseColor = danger ? "rgba(180,40,40,0.85)" : "rgba(0,0,0,0.65)"
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledTitle ?? label : label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        background: "transparent",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 8,
        padding: "6px 8px",
        fontFamily: "inherit",
        fontSize: 12,
        fontWeight: 500,
        color: baseColor,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.15s, border-color 0.15s, opacity 0.15s",
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.background = danger
          ? "rgba(220,60,60,0.06)"
          : "rgba(0,0,0,0.03)"
        e.currentTarget.style.borderColor = danger
          ? "rgba(220,60,60,0.2)"
          : "rgba(0,0,0,0.16)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)"
      }}
    >
      {icon}
      {label}
    </button>
  )
}

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  width: "100%",
  background: "rgba(0,0,0,0.88)",
  color: "#ffffff",
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  letterSpacing: "-0.005em",
  cursor: "pointer",
  transition: "background 0.15s",
}
