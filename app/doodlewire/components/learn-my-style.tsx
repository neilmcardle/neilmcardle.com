"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ElementType, WfElement } from "./wireframe-canvas";
import { renderElement } from "@/app/doodlewire/components/wireframe-element";
import {
  addTemplate,
  loadTemplates,
  resetAllTemplates,
} from "@/app/doodlewire/components/template-store";

interface Step {
  type: ElementType;
  title: string;
  hint: string;
  previewBbox: { w: number; h: number };
  label?: string;
}

const STEPS: Step[] = [
  {
    type: "button",
    title: "Button",
    hint: "A small filled or outlined rectangle.",
    previewBbox: { w: 140, h: 40 },
  },
  {
    type: "input",
    title: "Text input",
    hint: "A wider thin rectangle. A field to type into.",
    previewBbox: { w: 240, h: 40 },
  },
  {
    type: "text",
    title: "Text",
    hint: "A line or two of horizontal strokes for body text.",
    previewBbox: { w: 240, h: 60 },
  },
  {
    type: "heading",
    title: "Heading",
    hint: "A short thick bar, or write the word.",
    previewBbox: { w: 220, h: 40 },
  },
  {
    type: "link",
    title: "Link",
    hint: "Underline a short piece of text.",
    previewBbox: { w: 120, h: 24 },
  },
  {
    type: "toggle",
    title: "Toggle",
    hint: "A pill shape with a circle at one end.",
    previewBbox: { w: 44, h: 24 },
  },
  {
    type: "dropdown",
    title: "Dropdown",
    hint: "A rectangle with a small triangle on the right.",
    previewBbox: { w: 200, h: 40 },
  },
  {
    type: "card",
    title: "Card",
    hint: "A larger rounded rectangle, often with a shadow.",
    previewBbox: { w: 240, h: 160 },
  },
  {
    type: "divider",
    title: "Divider",
    hint: "A single thin horizontal line.",
    previewBbox: { w: 240, h: 2 },
  },
  {
    type: "image",
    title: "Image",
    hint: "A rectangle with an X through it.",
    previewBbox: { w: 200, h: 140 },
  },
  {
    type: "icon",
    title: "Icon",
    hint: "A tiny simple shape: star, gear, anything.",
    previewBbox: { w: 28, h: 28 },
  },
  {
    type: "icon",
    title: "Close (X)",
    hint: "Two diagonal lines crossing.",
    previewBbox: { w: 28, h: 28 },
    label: "close",
  },
  {
    type: "icon",
    title: "Tick",
    hint: "A short tick mark: down then up to the right.",
    previewBbox: { w: 28, h: 28 },
    label: "check",
  },
  {
    type: "icon",
    title: "Plus",
    hint: "Two short lines crossing at right angles.",
    previewBbox: { w: 28, h: 28 },
    label: "add",
  },
  {
    type: "icon",
    title: "Search",
    hint: "A circle with a short line off its bottom-right.",
    previewBbox: { w: 28, h: 28 },
    label: "search",
  },
  {
    type: "badge",
    title: "Badge",
    hint: "A small rounded label.",
    previewBbox: { w: 80, h: 24 },
  },
  {
    type: "nav",
    title: "Nav",
    hint: "A row of short labels along the top.",
    previewBbox: { w: 320, h: 48 },
  },
];

interface LearnMyStyleProps {
  open: boolean;
  onClose: () => void;
  onTemplatesAdded: () => void;
}

export function LearnMyStyle({
  open,
  onClose,
  onTemplatesAdded,
}: LearnMyStyleProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [savedThisStep, setSavedThisStep] = useState(false);
  const [resetState, setResetState] = useState<"idle" | "confirming">("idle");
  const [storedCount, setStoredCount] = useState(0);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    setIsNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setStepIdx(0);
      setSavedThisStep(false);
      setResetState("idle");
      setStoredCount(loadTemplates().length);
    }
  }, [open]);

  function handleResetClick() {
    if (resetState === "idle") {
      setResetState("confirming");
      return;
    }
    resetAllTemplates();
    setStoredCount(0);
    setResetState("idle");
    onTemplatesAdded();
  }

  useEffect(() => {
    if (resetState !== "confirming") return;
    const t = setTimeout(() => setResetState("idle"), 4000);
    return () => clearTimeout(t);
  }, [resetState]);

  if (!open) return null;
  const step = STEPS[stepIdx];
  const previewTargetH = isNarrow ? 100 : step.previewBbox.h;
  const previewScale = isNarrow
    ? Math.min(1, previewTargetH / step.previewBbox.h)
    : 1;

  function handleSave(strokes: { points: { x: number; y: number }[] }[]) {
    if (strokes.length === 0) return;
    addTemplate({
      type: step.type,
      strokes,
      label: step.label,
      source: "onboarding",
    });
    setSavedThisStep(true);
    setStoredCount(loadTemplates().length);
    onTemplatesAdded();
  }

  function next() {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(stepIdx + 1);
      setSavedThisStep(false);
    } else {
      onClose();
    }
  }

  function prev() {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      setSavedThisStep(false);
    }
  }

  function skip() {
    next();
  }

  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-skip-export="1"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgb(0 0 0 / 0.6)",
        display: "flex",
        alignItems: isNarrow ? "stretch" : "center",
        justifyContent: "center",
        zIndex: 100,
        padding: isNarrow ? 0 : 20,
        paddingTop: isNarrow ? "env(safe-area-inset-top, 0px)" : 20,
        paddingBottom: isNarrow ? "env(safe-area-inset-bottom, 0px)" : 20,
        fontFamily: "var(--font-inter, system-ui, sans-serif)",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 880,
          maxHeight: isNarrow ? "none" : "calc(100vh - 40px)",
          background: "var(--color-raised)",
          borderRadius: isNarrow ? 0 : 20,
          boxShadow: isNarrow ? "none" : "var(--edge-lifted)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isNarrow ? "12px 14px" : "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                margin: 0,
                fontWeight: 500,
                fontSize: 16,
                color: "var(--color-ink)",
              }}
            >
              Learn my style
            </h2>
            <div
              style={{ fontSize: 13, color: "var(--color-text)", marginTop: 2 }}
            >
              {stepIdx + 1} of {STEPS.length}
              {isNarrow ? "" : " · draw it however you like"}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            {storedCount > 0 && (
              <button
                type="button"
                onClick={handleResetClick}
                style={{
                  background:
                    resetState === "confirming"
                      ? "var(--color-ink)"
                      : "transparent",
                  border: resetState === "confirming" ? "none" : "none",
                  color:
                    resetState === "confirming"
                      ? "var(--color-bg)"
                      : "var(--color-text)",
                  fontSize: 13,
                  fontWeight: 500,
                  padding: "6px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  transition:
                    "background 0.15s var(--ease-out), color 0.15s var(--ease-out), border-color 0.15s var(--ease-out)",
                  whiteSpace: "nowrap",
                }}
              >
                {resetState === "confirming"
                  ? isNarrow
                    ? `Forget ${storedCount}?`
                    : `Yes, forget all ${storedCount}`
                  : isNarrow
                    ? `Forget (${storedCount})`
                    : `Forget all my drawings (${storedCount})`}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text)",
                cursor: "pointer",
                width: 32,
                height: 32,
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <div
          style={{
            height: 2,
            background: "rgba(255,255,255,0.06)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "100%",
              transform: `scaleX(${progress / 100})`,
              transformOrigin: "left center",
              background: "var(--color-ink)",
              transition: "transform 0.24s var(--ease-out)",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
            gap: 0,
            flex: 1,
            minHeight: 0,
          }}
        >
          <div
            style={{
              padding: isNarrow ? 16 : 28,
              borderRight: isNarrow
                ? "none"
                : "1px solid rgba(255,255,255,0.06)",
              borderBottom: isNarrow
                ? "1px solid rgba(255,255,255,0.06)"
                : "none",
              background: "var(--color-bg)",
              minHeight: isNarrow ? 0 : 360,
              display: "flex",
              flexDirection: "column",
              gap: isNarrow ? 10 : 16,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text)",
                letterSpacing: 0,
              }}
            >
              This is a {step.title.toLowerCase()}
            </div>
            <div
              style={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "#ffffff",
                borderRadius: 10,
                padding: 16,
              }}
            >
              <div
                style={{
                  width: step.previewBbox.w * previewScale,
                  height: step.previewBbox.h * previewScale,
                  position: "relative",
                  maxWidth: "100%",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: step.previewBbox.w,
                    height: step.previewBbox.h,
                    position: "absolute",
                    top: 0,
                    left: 0,
                    transform: `scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  {renderElement(
                    {
                      id: "preview",
                      type: step.type,
                      label: step.label,
                      bbox: { x: 0, y: 0, ...step.previewBbox },
                    } as WfElement,
                    () => {},
                  )}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--color-text)",
                lineHeight: 1.5,
              }}
            >
              {step.hint}
            </div>
          </div>

          <div
            style={{
              padding: isNarrow ? 16 : 28,
              display: "flex",
              flexDirection: "column",
              gap: isNarrow ? 10 : 16,
              minHeight: isNarrow ? 240 : 360,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text)",
                letterSpacing: 0,
              }}
            >
              Draw it how you would
            </div>
            <DrawingPad
              key={stepIdx}
              onSave={handleSave}
              saved={savedThisStep}
              compact={isNarrow}
            />
          </div>
        </div>

        <footer
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isNarrow ? "10px 14px" : "14px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "var(--color-bg)",
            gap: 4,
          }}
        >
          <button
            type="button"
            onClick={prev}
            disabled={stepIdx === 0}
            style={{
              background: "transparent",
              border: "none",
              color:
                stepIdx === 0 ? "var(--color-underline)" : "var(--color-text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: stepIdx === 0 ? "not-allowed" : "pointer",
              padding: "8px 12px",
            }}
          >
            Back
          </button>
          <button
            type="button"
            onClick={skip}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              padding: "8px 12px",
            }}
          >
            Skip this one
          </button>
          <button
            type="button"
            onClick={next}
            style={{
              background: "var(--color-ink)",
              color: "var(--color-bg)",
              border: "none",
              padding: "8px 16px",
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {stepIdx === STEPS.length - 1 ? "Finish" : "Next"}
          </button>
        </footer>
      </div>
    </div>
  );
}

interface DrawingPadProps {
  onSave: (strokes: { points: { x: number; y: number }[] }[]) => void;
  saved: boolean;
  compact?: boolean;
}

function DrawingPad({ onSave, saved, compact }: DrawingPadProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<{ points: { x: number; y: number }[] }[]>([]);
  const currentRef = useRef<{ points: { x: number; y: number }[] } | null>(
    null,
  );
  const dprRef = useRef(1);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [autoSaved, setAutoSaved] = useState(saved);

  const resize = useCallback(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const r = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;
    redraw();
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  function redraw() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const all = [
      ...strokesRef.current,
      ...(currentRef.current ? [currentRef.current] : []),
    ];
    for (const s of all) {
      if (s.points.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++)
        ctx.lineTo(s.points[i].x, s.points[i].y);
      ctx.stroke();
    }
  }

  function getPoint(e: React.PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    currentRef.current = { points: [getPoint(e)] };
    redraw();
  }

  function onMove(e: React.PointerEvent) {
    if (e.buttons === 0 || !currentRef.current) return;
    currentRef.current.points.push(getPoint(e));
    redraw();
  }

  function onUp() {
    if (currentRef.current && currentRef.current.points.length > 1) {
      strokesRef.current.push(currentRef.current);
      setHasStrokes(true);
      setAutoSaved(false);
    }
    currentRef.current = null;
    redraw();
  }

  function clear() {
    strokesRef.current = [];
    currentRef.current = null;
    setHasStrokes(false);
    setAutoSaved(false);
    redraw();
  }

  function save() {
    if (strokesRef.current.length === 0) return;
    onSave(strokesRef.current);
    setAutoSaved(true);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
      <div
        ref={wrapRef}
        style={{
          flex: 1,
          minHeight: 220,
          border: "1.5px dashed rgba(0,0,0,0.18)",
          borderRadius: 10,
          position: "relative",
          background: "#ffffff",
          touchAction: "none",
          overflow: "hidden",
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            cursor: "crosshair",
          }}
        />
        {!hasStrokes && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text)",
              fontSize: 13,
              pointerEvents: "none",
            }}
          >
            Draw here
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={clear}
          disabled={!hasStrokes}
          style={{
            background: "transparent",
            border: "none",
            color: hasStrokes ? "var(--color-text)" : "var(--color-underline)",
            padding: "6px 12px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            cursor: hasStrokes ? "pointer" : "not-allowed",
          }}
        >
          Clear
        </button>
        <button
          type="button"
          onClick={save}
          disabled={!hasStrokes || autoSaved}
          style={{
            background: autoSaved
              ? "var(--color-ink)"
              : hasStrokes
                ? "var(--color-ink)"
                : "rgba(255,255,255,0.06)",
            color:
              hasStrokes || autoSaved
                ? "var(--color-bg)"
                : "var(--color-underline)",
            border: "none",
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 13,
            fontWeight: 500,
            cursor: hasStrokes && !autoSaved ? "pointer" : "not-allowed",
            transition: "background 0.15s var(--ease-out)",
          }}
        >
          {autoSaved ? "Saved" : "Save"}
        </button>
        {!compact && (
          <span
            style={{ fontSize: 13, color: "var(--color-text)", marginLeft: 4 }}
          >
            Save more than one variation if you want.
          </span>
        )}
      </div>
    </div>
  );
}
