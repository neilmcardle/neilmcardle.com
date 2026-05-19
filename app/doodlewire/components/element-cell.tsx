"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ELEMENT_TYPES, type ElementType, type WfElement } from "./wireframe-canvas";
import { buttonVariant, headingLevel, ICON_CHOICES, pickIcon, renderElement } from "./wireframe-element";
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
  onLevelChange: (level: number) => void;
  onVariantChange: (variant: "primary" | "secondary") => void;
  onLayer: (direction: "forward" | "backward") => void;
  onFeedback: (correct: boolean) => void;
  canForward: boolean;
  canBackward: boolean;
}

// Pixels of pointer movement before a pointerdown is treated as a drag
// instead of a tap. Slightly generous so a fingertip stay-put still
// registers as a tap on touch devices.
const TAP_DRAG_THRESHOLD = 8;


export function ElementCell({
  element,
  selected,
  onSelect,
  onMove,
  onResize,
  onRemove,
  onLabelChange,
  onTypeChange,
  onLevelChange,
  onVariantChange,
  onLayer,
  onFeedback,
  canForward,
  canBackward,
}: ElementCellProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [thanked, setThanked] = useState(false);
  // Which popover is open: element-type grid, icon grid, heading-level
  // grid, or none. Only one is ever open, so the positioning and
  // outside-click logic is shared between them.
  const [openMenu, setOpenMenu] = useState<"type" | "icon" | "level" | "variant" | null>(null);
  const resizeMode = getResizeMode(element.type);
  // Small elements (icons ~20px) are hard to grab. Extend the
  // draggable area outward so the effective hit target is at least ~44px.
  const hitPad = Math.max(0, (44 - Math.min(element.bbox.w, element.bbox.h)) / 2);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  // Toolbar offset relative to the element wrapper. Computed by clamping
  // against the viewport so the toolbar never spills off any edge —
  // a CSS anchor alone can't do this since the element's screen position
  // and the toolbar's width are both unknown ahead of time.
  const [toolbarPos, setToolbarPos] = useState<{ left: number; top: number }>({
    left: 0,
    top: -38,
  });

  const positionToolbar = useCallback(() => {
    const wrap = wrapperRef.current;
    const bar = toolbarRef.current;
    if (!wrap || !bar) return;
    const wr = wrap.getBoundingClientRect();
    const bw = bar.offsetWidth || 200;
    const bh = bar.offsetHeight || 30;
    const GAP = 6;
    const M = 8; // viewport margin
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: right-align to the element, then clamp into the viewport.
    let left = wr.width - bw;
    let screenLeft = wr.left + left;
    if (screenLeft < M) left += M - screenLeft;
    screenLeft = wr.left + left;
    if (screenLeft + bw > vw - M) left -= screenLeft + bw - (vw - M);

    // Vertical: above the element; flip below if that clips the top edge.
    let top = -bh - GAP;
    if (wr.top + top < M) top = wr.height + GAP;
    // If below also clips the bottom, sit it just inside the top margin.
    if (wr.top + top + bh > vh - M && wr.top - bh - GAP < M) {
      top = M - wr.top;
    }
    setToolbarPos({ left, top });
  }, []);

  // Reposition whenever the toolbar becomes visible via selection, and on
  // viewport changes. Hover and drag trigger it through event handlers.
  useLayoutEffect(() => {
    if (selected) positionToolbar();
  }, [selected, element.bbox.x, element.bbox.y, element.bbox.w, element.bbox.h, positionToolbar]);

  useEffect(() => {
    window.addEventListener("resize", positionToolbar);
    return () => window.removeEventListener("resize", positionToolbar);
  }, [positionToolbar]);
  // The popover sits at fixed viewport coordinates so it can flip above
  // or below the cell, and slide horizontally to stay inside the viewport
  // when the cell is near an edge.
  // top OR bottom is set, never both — `bottom` anchors the popover by its
  // own bottom edge (so its rendered height doesn't matter), `top` anchors
  // by the top edge when we've flipped to below the wrapper.
  const [menuFixed, setMenuFixed] = useState<{
    left: number;
    top: number | null;
    bottom: number | null;
  } | null>(null);

  // Close the open popover when clicking elsewhere.
  useEffect(() => {
    if (!openMenu) return;
    function onDocDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [openMenu]);

  // Place the popover so it stays inside the viewport. Prefer above the cell
  // and right-aligned to it; flip below if there is no room above; clamp
  // horizontally when the cell is near a left or right edge.
  useEffect(() => {
    if (!openMenu) {
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
      // Prefer placing above with a `bottom` anchor — that way the popover
      // hugs the wrapper regardless of how tall it actually renders. Fall
      // back to placing below (anchored by `top`) only when there is no room
      // above for the worst-case height.
      if (r.top - GAP - POPOVER_MAX_H >= GAP) {
        setMenuFixed({ left, top: null, bottom: vh - r.top + GAP });
      } else {
        let top = r.bottom + GAP;
        if (top + POPOVER_MAX_H > vh - GAP) top = Math.max(GAP, vh - GAP - POPOVER_MAX_H);
        setMenuFixed({ left, top, bottom: null });
      }
    }
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [openMenu]);

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
      if (dx !== 0 || dy !== 0) {
        onMove(dx, dy);
        positionToolbar();
      }
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
      onPointerEnter={positionToolbar}
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
      {hitPad > 0 && (
        <div
          data-skip-export="1"
          aria-hidden
          style={{
            position: "absolute",
            inset: -hitPad,
          }}
        />
      )}
      {renderElement(element, onLabelChange, (h) => {
        // The text element auto-grows: apply the measured height as a
        // height-only resize so the bbox follows the wrapped text.
        if (Math.abs(h - element.bbox.h) > 0.5) {
          onResize({ ...element.bbox, h });
        }
      })}
      <ResizeHandles
        mode={resizeMode}
        resizing={resizing}
        selected={selected}
        onStart={startResize}
      />


      {/* Per-element toolbar. Position is computed by positionToolbar() so
          it stays clamped inside the viewport on every edge. Visible
          whenever the element is selected; otherwise fades in on hover. */}
      <div
        ref={toolbarRef}
        data-skip-export="1"
        onPointerDown={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: toolbarPos.left,
          top: toolbarPos.top,
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
            setOpenMenu((v) => (v === "type" ? null : "type"));
          }}
          title="Change type"
          aria-label="Change type"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "0 8px",
            height: 24,
            background: openMenu === "type" ? "rgba(255,255,255,0.12)" : "transparent",
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
        {element.type === "icon" && (
          <ToolBtn
            label="Choose icon"
            active={openMenu === "icon"}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((v) => (v === "icon" ? null : "icon"));
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </ToolBtn>
        )}
        {element.type === "heading" && (
          <ToolBtn
            label="Heading level"
            active={openMenu === "level"}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((v) => (v === "level" ? null : "level"));
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.2 }}>
              H{headingLevel(element.level)}
            </span>
          </ToolBtn>
        )}
        {element.type === "button" && (
          <ToolBtn
            label="Button variant"
            active={openMenu === "variant"}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((v) => (v === "variant" ? null : "variant"));
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.2 }}>
              {buttonVariant(element.variant) === "secondary" ? "2°" : "1°"}
            </span>
          </ToolBtn>
        )}
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

      {openMenu === "type" && menuFixed && (
        <div
          ref={menuRef}
          data-skip-export="1"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuFixed.left,
            top: menuFixed.top ?? undefined,
            bottom: menuFixed.bottom ?? undefined,
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
          {ELEMENT_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onTypeChange(t);
                setOpenMenu(null);
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

      {openMenu === "icon" && menuFixed && (
        <div
          ref={menuRef}
          data-skip-export="1"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuFixed.left,
            top: menuFixed.top ?? undefined,
            bottom: menuFixed.bottom ?? undefined,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: 6,
            zIndex: 60,
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 2,
            width: 264,
            maxHeight: 280,
            overflowY: "auto",
            pointerEvents: "auto",
          }}
        >
          {ICON_CHOICES.map(({ name, Icon }) => {
            const current = pickIcon(element.label) === Icon;
            return (
              <button
                key={name}
                type="button"
                title={name}
                aria-label={name}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onLabelChange(name);
                  setOpenMenu(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  aspectRatio: "1 / 1",
                  background: current ? "#0a0a0a" : "transparent",
                  color: current ? "#ffffff" : "#0a0a0a",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!current) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!current) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Icon width={17} height={17} strokeWidth={1.8} />
              </button>
            );
          })}
        </div>
      )}

      {openMenu === "level" && menuFixed && (
        <div
          ref={menuRef}
          data-skip-export="1"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuFixed.left,
            top: menuFixed.top ?? undefined,
            bottom: menuFixed.bottom ?? undefined,
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
            pointerEvents: "auto",
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((lvl) => {
            const current = headingLevel(element.level) === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onLevelChange(lvl);
                  setOpenMenu(null);
                }}
                style={{
                  padding: "8px 8px",
                  background: current ? "#0a0a0a" : "transparent",
                  color: current ? "#ffffff" : "#0a0a0a",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!current) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!current) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                H{lvl}
              </button>
            );
          })}
        </div>
      )}

      {openMenu === "variant" && menuFixed && (
        <div
          ref={menuRef}
          data-skip-export="1"
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuFixed.left,
            top: menuFixed.top ?? undefined,
            bottom: menuFixed.bottom ?? undefined,
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: 4,
            zIndex: 60,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 2,
            width: 264,
            pointerEvents: "auto",
          }}
        >
          {(["primary", "secondary"] as const).map((v) => {
            const current = buttonVariant(element.variant) === v;
            return (
              <button
                key={v}
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onVariantChange(v);
                  setOpenMenu(null);
                }}
                style={{
                  padding: "8px 8px",
                  background: current ? "#0a0a0a" : "transparent",
                  color: current ? "#ffffff" : "#0a0a0a",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (!current) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.06)";
                }}
                onMouseLeave={(e) => {
                  if (!current) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {v}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface ToolBtnProps {
  label: string;
  disabled?: boolean;
  // Green "confirmed" flash (thumbs-up feedback).
  highlighted?: boolean;
  // Subtle white background while a paired popover is open.
  active?: boolean;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

function ToolBtn({ label, disabled, highlighted, active, onClick, children }: ToolBtnProps) {
  const baseBg = highlighted ? "#16a34a" : active ? "rgba(255,255,255,0.12)" : "transparent";
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
        background: baseBg,
        color: disabled ? "rgba(255,255,255,0.3)" : "#ffffff",
        border: "none",
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!disabled && !highlighted && !active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.12)";
      }}
      onMouseLeave={(e) => {
        if (!highlighted) (e.currentTarget as HTMLElement).style.background = baseBg;
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
