"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, WfElement } from "./wireframe-canvas";
import { renderElement } from "./wireframe-element";
import { getResizeMode, resizeBbox, type ResizeHandle } from "./snap-size";

interface ElementCellProps {
  element: WfElement;
  selected: boolean;
  onSelect: () => void;
  onMove: (dx: number, dy: number) => void;
  onResize: (bbox: WfElement["bbox"]) => void;
  onRemove: () => void;
  onLabelChange: (label: string) => void;
  onTypeChange: (type: ElementType) => void;
  onLayer: (direction: "forward" | "backward") => void;
  onFeedback: (correct: boolean) => void;
  canForward: boolean;
  canBackward: boolean;
}

// Pixels of pointer movement before a pointerdown is treated as a drag
// instead of a tap. Slightly generous so a fingertip stay-put still
// registers as a tap on touch devices.
const TAP_DRAG_THRESHOLD = 8;

const ALL_TYPES: ElementType[] = [
  "button",
  "input",
  "textarea",
  "checkbox",
  "radio",
  "toggle",
  "heading",
  "paragraph",
  "image",
  "container",
  "card",
  "divider",
  "nav",
  "avatar",
  "icon",
  "link",
  "badge",
  "dropdown",
  "menu",
];

export function ElementCell({
  element,
  selected,
  onSelect,
  onMove,
  onResize,
  onRemove,
  onLabelChange,
  onTypeChange,
  onLayer,
  onFeedback,
  canForward,
  canBackward,
}: ElementCellProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [thanked, setThanked] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const resizeMode = getResizeMode(element.type);
  const typeMenuRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // The popover sits at fixed viewport coordinates so it can flip above
  // or below the cell, and slide horizontally to stay inside the viewport
  // when the cell is near an edge.
  const [menuFixed, setMenuFixed] = useState<{ left: number; top: number } | null>(null);

  // Close the type menu when clicking elsewhere.
  useEffect(() => {
    if (!typeMenuOpen) return;
    function onDocDown(e: PointerEvent) {
      if (typeMenuRef.current && !typeMenuRef.current.contains(e.target as Node)) {
        setTypeMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [typeMenuOpen]);

  // Place the popover so it stays inside the viewport. Prefer above the cell
  // and right-aligned to it; flip below if there is no room above; clamp
  // horizontally when the cell is near a left or right edge.
  useEffect(() => {
    if (!typeMenuOpen) {
      setMenuFixed(null);
      return;
    }
    function compute() {
      const wrap = wrapperRef.current;
      if (!wrap) return;
      const POPOVER_W = 264;
      const POPOVER_MAX_H = 280;
      const GAP = 8;
      const r = wrap.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let left = r.right - POPOVER_W;
      if (left < GAP) left = GAP;
      if (left + POPOVER_W > vw - GAP) left = Math.max(GAP, vw - GAP - POPOVER_W);
      let top = r.top - GAP - POPOVER_MAX_H;
      if (top < GAP) top = r.bottom + GAP;
      if (top + POPOVER_MAX_H > vh - GAP) top = Math.max(GAP, vh - GAP - POPOVER_MAX_H);
      setMenuFixed({ left, top });
    }
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [typeMenuOpen]);

  function startDrag(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    let lastX = startX;
    let lastY = startY;
    let movedPastThreshold = false;

    function onMoveDoc(ev: PointerEvent) {
      if (!movedPastThreshold) {
        const totalDx = ev.clientX - startX;
        const totalDy = ev.clientY - startY;
        if (Math.abs(totalDx) <= TAP_DRAG_THRESHOLD && Math.abs(totalDy) <= TAP_DRAG_THRESHOLD) {
          return;
        }
        movedPastThreshold = true;
        setDragging(true);
        lastX = ev.clientX;
        lastY = ev.clientY;
        return;
      }
      const dx = ev.clientX - lastX;
      const dy = ev.clientY - lastY;
      lastX = ev.clientX;
      lastY = ev.clientY;
      if (dx !== 0 || dy !== 0) onMove(dx, dy);
    }

    function onUpDoc() {
      document.removeEventListener("pointermove", onMoveDoc);
      document.removeEventListener("pointerup", onUpDoc);
      document.removeEventListener("pointercancel", onUpDoc);
      setDragging(false);
      // Pointer never crossed the drag threshold — treat as a tap and
      // toggle this element's selection.
      if (!movedPastThreshold) {
        onSelect();
      }
    }

    document.addEventListener("pointermove", onMoveDoc);
    document.addEventListener("pointerup", onUpDoc);
    document.addEventListener("pointercancel", onUpDoc);
  }

  function startResize(e: React.PointerEvent, handle: ResizeHandle) {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startBbox = { ...element.bbox };

    function onMoveDoc(ev: PointerEvent) {
      const next = resizeBbox(element.type, {
        handle,
        dx: ev.clientX - startX,
        dy: ev.clientY - startY,
        startBbox,
      });
      onResize(next);
    }

    function onUpDoc() {
      document.removeEventListener("pointermove", onMoveDoc);
      document.removeEventListener("pointerup", onUpDoc);
      document.removeEventListener("pointercancel", onUpDoc);
      setResizing(false);
    }

    document.addEventListener("pointermove", onMoveDoc);
    document.addEventListener("pointerup", onUpDoc);
    document.addEventListener("pointercancel", onUpDoc);
  }

  function handleConfirm(e: React.MouseEvent) {
    e.stopPropagation();
    onFeedback(true);
    setThanked(true);
    setTimeout(() => setThanked(false), 1200);
  }

  function handleReject(e: React.MouseEvent) {
    e.stopPropagation();
    onFeedback(false);
  }

  return (
    <div
      ref={wrapperRef}
      onPointerDown={startDrag}
      style={{
        position: "absolute",
        left: element.bbox.x,
        top: element.bbox.y,
        width: element.bbox.w,
        height: element.bbox.h,
        pointerEvents: "auto",
        cursor: dragging ? "grabbing" : resizing ? "default" : "grab",
        touchAction: "none",
        outline:
          dragging || resizing
            ? "1.5px dashed rgba(10,10,10,0.4)"
            : selected
              ? "1.5px solid rgba(10,10,10,0.4)"
              : "none",
        outlineOffset: 4,
        transition: "outline-color 0.15s",
      }}
      className="group"
    >
      {renderElement(element, onLabelChange)}
      <ResizeHandles
        mode={resizeMode}
        resizing={resizing}
        selected={selected}
        onStart={startResize}
      />


      {/* Per-element toolbar. Sits above the element by default but flips
          below when the element is near the top of the canvas (toolbar is
          ~34px tall). Visible whenever the element is selected; otherwise
          fades in on hover. */}
      <div
        data-skip-export="1"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          ...(element.bbox.y < 48
            ? { top: "auto", bottom: -34 }
            : { top: -34, bottom: "auto" }),
          right: 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: 2,
          background: "#0a0a0a",
          color: "#ffffff",
          borderRadius: 999,
          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
          opacity: selected ? 1 : 0,
          transition: "opacity 0.15s",
          pointerEvents: "auto",
        }}
        className="group-hover:!opacity-100"
      >
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setTypeMenuOpen((v) => !v);
          }}
          title="Change type"
          aria-label="Change type"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "0 8px",
            height: 24,
            background: typeMenuOpen ? "rgba(255,255,255,0.12)" : "transparent",
            color: "#ffffff",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: 0.2,
            textTransform: "capitalize",
          }}
        >
          {element.type}
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <Divider />
        <ToolBtn
          label="Send backward"
          disabled={!canBackward}
          onClick={(e) => {
            e.stopPropagation();
            onLayer("backward");
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="13" height="13" rx="1.5" />
            <rect x="8" y="8" width="13" height="13" rx="1.5" fill="#0a0a0a" />
          </svg>
        </ToolBtn>
        <ToolBtn
          label="Bring forward"
          disabled={!canForward}
          onClick={(e) => {
            e.stopPropagation();
            onLayer("forward");
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="8" y="8" width="13" height="13" rx="1.5" />
            <rect x="3" y="3" width="13" height="13" rx="1.5" fill="#0a0a0a" />
          </svg>
        </ToolBtn>
        <Divider />
        <ToolBtn label="Looks right" onClick={handleConfirm} highlighted={thanked}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v12" />
            <path d="M15 5.88 14 12h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 24H7V10l4.93-8.66A2 2 0 0 1 13.7 0H14a2 2 0 0 1 2 2v3.88z" />
          </svg>
        </ToolBtn>
        <ToolBtn label="Wrong, redraw" onClick={handleReject}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 14V2" />
            <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H17v12l-4.93 8.66A2 2 0 0 1 10.3 24H10a2 2 0 0 1-2-2v-3.88z" />
          </svg>
        </ToolBtn>
        <Divider />
        <ToolBtn label="Delete" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
          <span style={{ fontSize: 14, lineHeight: 1, padding: "0 2px" }}>×</span>
        </ToolBtn>
      </div>

      {typeMenuOpen && menuFixed && (
        <div
          ref={typeMenuRef}
          data-skip-export="1"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuFixed.left,
            top: menuFixed.top,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: 4,
            zIndex: 60,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            width: 264,
            maxHeight: 280,
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onTypeChange(t);
                setTypeMenuOpen(false);
              }}
              style={{
                padding: "6px 8px",
                background: t === element.type ? "#0a0a0a" : "transparent",
                color: t === element.type ? "#ffffff" : "#0a0a0a",
                border: "none",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                textAlign: "left",
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (t !== element.type) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                if (t !== element.type) (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface ToolBtnProps {
  label: string;
  disabled?: boolean;
  highlighted?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function ToolBtn({ label, disabled, highlighted, onClick, children }: ToolBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      aria-label={label}
      title={label}
      disabled={disabled}
      style={{
        width: 24,
        height: 24,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: highlighted ? "#16a34a" : "transparent",
        color: disabled ? "rgba(255,255,255,0.3)" : "#ffffff",
        border: "none",
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !highlighted) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(e) => {
        if (!highlighted) (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.18)", margin: "0 1px" }} />;
}

interface ResizeHandlesProps {
  mode: ReturnType<typeof getResizeMode>;
  resizing: boolean;
  selected: boolean;
  onStart: (e: React.PointerEvent, handle: ResizeHandle) => void;
}

function ResizeHandles({ mode, resizing, selected, onStart }: ResizeHandlesProps) {
  if (mode === "none") return null;
  const visible = resizing || selected;
  const showE = mode === "flowWidth" || mode === "flowBoth";
  const showS = mode === "flowBoth";
  const showSE = mode === "flowBoth" || mode === "centredSquare" || mode === "centredBoth";
  return (
    <>
      {showE && <EdgeHandle axis="x" visible={visible} onStart={(e) => onStart(e, "e")} />}
      {showS && <EdgeHandle axis="y" visible={visible} onStart={(e) => onStart(e, "s")} />}
      {showSE && <CornerHandle visible={visible} onStart={(e) => onStart(e, "se")} />}
    </>
  );
}

function EdgeHandle({
  axis,
  visible,
  onStart,
}: {
  axis: "x" | "y";
  visible: boolean;
  onStart: (e: React.PointerEvent) => void;
}) {
  const horizontal = axis === "x";
  return (
    <button
      type="button"
      onPointerDown={onStart}
      aria-label={horizontal ? "Resize width" : "Resize height"}
      data-skip-export="1"
      className="wf-resize-handle group-hover:!opacity-100"
      style={{
        position: "absolute",
        // Larger touch targets than the visible pill so a fingertip can
        // grab them reliably. Visual pill is centred inside the hit area.
        ...(horizontal
          ? { right: -16, top: "50%", transform: "translate(0, -50%)", width: 32, height: 44 }
          : { bottom: -16, left: "50%", transform: "translate(-50%, 0)", width: 44, height: 32 }),
        background: "transparent",
        border: "none",
        borderRadius: 0,
        padding: 0,
        cursor: horizontal ? "ew-resize" : "ns-resize",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s",
        zIndex: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          display: "block",
          ...(horizontal ? { width: 8, height: 28 } : { width: 28, height: 8 }),
          background: "#ffffff",
          border: "1.5px solid #0a0a0a",
          borderRadius: 999,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      />
    </button>
  );
}

function CornerHandle({
  visible,
  onStart,
}: {
  visible: boolean;
  onStart: (e: React.PointerEvent) => void;
}) {
  return (
    <button
      type="button"
      onPointerDown={onStart}
      aria-label="Resize"
      data-skip-export="1"
      className="wf-resize-handle group-hover:!opacity-100"
      style={{
        position: "absolute",
        // 32×32 hit area with a 12×12 pill centred inside it.
        right: -16,
        bottom: -16,
        width: 32,
        height: 32,
        background: "transparent",
        border: "none",
        borderRadius: 0,
        padding: 0,
        cursor: "nwse-resize",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.15s",
        zIndex: 10,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          display: "block",
          width: 12,
          height: 12,
          background: "#ffffff",
          border: "1.5px solid #0a0a0a",
          borderRadius: 999,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      />
    </button>
  );
}
