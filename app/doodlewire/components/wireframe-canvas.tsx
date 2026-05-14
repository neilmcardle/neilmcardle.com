"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ElementCell } from "./element-cell";
import { clusterStrokes } from "./cluster-strokes";
import { exportAsHtml, exportAsReact } from "./export";
import { captureWireframePng, defaultPngFilename, savePng } from "./exportImage";
import { LearnMyStyle } from "./learn-my-style";
import { normalize, rankTemplates } from "./point-cloud-recognizer";
import { snapToStandard } from "./snap-size";
import {
  deleteTemplate,
  loadTemplates,
  recordHit,
  type Template,
} from "./template-store";

export type ElementType =
  | "button"
  | "input"
  | "textarea"
  | "checkbox"
  | "radio"
  | "toggle"
  | "heading"
  | "paragraph"
  | "image"
  | "container"
  | "card"
  | "divider"
  | "nav"
  | "avatar"
  | "icon"
  | "link"
  | "badge"
  | "dropdown"
  | "menu";

export interface WfElement {
  id: string;
  type: ElementType;
  label?: string;
  bbox: { x: number; y: number; w: number; h: number };
  // Set when the element came from a local template match. Lets us
  // attribute thumbs-down feedback back to the template so bad ones decay.
  templateId?: string;
}

type Pt = { x: number; y: number };
// freehand strokes are user annotations / sketches. They render in a softer
// grey, never trigger recognition, and never appear in exported output.
type Stroke = { points: Pt[]; freehand?: boolean };
type Mode = "pen" | "ink" | "eraser" | "snip";
type SnipRect = { x: number; y: number; w: number; h: number };

const STROKE_WIDTH = 2.5;
const ERASER_RADIUS = 18;
// Hand-drawn variation is large, so we accept matches in two ways:
// (1) very tight match (distance < TIGHT) regardless of runner-up, or
// (2) reasonably close (distance < THRESHOLD) AND the closest template
//     of a DIFFERENT type is at least MARGIN times further away.
// This catches genuine matches a strict absolute cap was missing.
const LOCAL_MATCH_TIGHT = 5;
const LOCAL_MATCH_THRESHOLD = 11;
const LOCAL_MATCH_MARGIN = 1.3;

export default function WireframeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const strokesRef = useRef<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const inFlightRef = useRef(false);
  const dprRef = useRef(1);

  const [elements, setElements] = useState<WfElement[]>([]);
  const [mode, setMode] = useState<Mode>("pen");
  const [recognizing, setRecognizing] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  // The chrome (top bar, toolbar, pills) is hidden until the user moves the
  // cursor. This is a minimalist gesture: the canvas IS the product, every
  // bit of UI fades in on demand and back out on idle. On touch devices
  // there is no equivalent of cursor idleness, so the chrome stays put.
  const [isTouch, setIsTouch] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  // Pointer events stay enabled for the full fade-out duration so a user
  // clicking a half-faded pill still hits the pill rather than the canvas
  // behind it. Only flips off once the fade has completed.
  const [chromeInteractive, setChromeInteractive] = useState(false);
  // Bumped whenever the stroke buffer changes, so the Recognise pill can
  // reposition or appear / disappear. The strokes themselves live in a ref
  // for redraw performance.
  const [strokeRev, setStrokeRev] = useState(0);
  const bumpStrokes = useCallback(() => setStrokeRev((n) => n + 1), []);

  // Marquee crop. Live during drag, persists after release for the user to
  // confirm download or cancel. Cleared whenever snip mode is exited.
  const [snipRect, setSnipRect] = useState<SnipRect | null>(null);
  const [snipDragging, setSnipDragging] = useState(false);
  const snipStartRef = useRef<{ x: number; y: number } | null>(null);
  const [snipSaving, setSnipSaving] = useState(false);

  // On touch devices, finished captures land here and a preview modal opens
  // with explicit save / share affordances. Browser auto-download is hostile
  // on iOS — the file vanishes without ever reaching Photos.
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  // Local recogniser templates. Loaded once on mount and refreshed whenever
  // a new template is saved. Kept in a ref so the recognition path doesn't
  // close over a stale value.
  const templatesRef = useRef<Template[]>([]);
  const [templateCount, setTemplateCount] = useState(0);
  const [learnOpen, setLearnOpen] = useState(false);
  // Transient flash pill at the top of the canvas. Surfaces what just
  // happened: a local match, an API call, a template deletion, etc.
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  // Keep the canvas pixel-perfect on every viewport change.
  useEffect(() => {
    function resize() {
      const el = containerRef.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return;
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      setSize({ w: rect.width, h: rect.height });
      redraw();
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load templates on mount. We no longer auto-open the Learn-my-style
  // modal: it only opens when the user clicks the top-bar button.
  useEffect(() => {
    const all = loadTemplates();
    templatesRef.current = all;
    setTemplateCount(all.length);
  }, []);

  // Touch detection. (hover: none) catches phones and tablets reliably; a
  // hybrid laptop with a touchscreen won't false-positive.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(hover: none) and (pointer: coarse)");
    setIsTouch(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Chrome auto-hide. Cursor moves → fade in. Idle 2.4s → fade out. Keyboard
  // events count too so power users who hit Enter aren't left in the dark.
  // On touch devices the chrome stays visible permanently — there's no idle
  // signal to drive the fade and the toolbar must always be reachable.
  useEffect(() => {
    if (isTouch) {
      setChromeVisible(true);
      return;
    }
    let idle: ReturnType<typeof setTimeout> | null = null;
    function show() {
      setChromeVisible(true);
      if (idle) clearTimeout(idle);
      idle = setTimeout(() => setChromeVisible(false), 2400);
    }
    window.addEventListener("pointermove", show);
    window.addEventListener("pointerdown", show);
    window.addEventListener("keydown", show);
    return () => {
      window.removeEventListener("pointermove", show);
      window.removeEventListener("pointerdown", show);
      window.removeEventListener("keydown", show);
      if (idle) clearTimeout(idle);
    };
  }, [isTouch]);

  // Mirror chromeVisible to chromeInteractive, but delay the OFF transition
  // by the fade duration so clicks land during the fade-out.
  useEffect(() => {
    if (chromeVisible) {
      setChromeInteractive(true);
      return;
    }
    const t = setTimeout(() => setChromeInteractive(false), 720);
    return () => clearTimeout(t);
  }, [chromeVisible]);

  const refreshTemplates = useCallback(() => {
    const all = loadTemplates();
    templatesRef.current = all;
    setTemplateCount(all.length);
  }, []);

  // Auto-clear the flash pill after a short window.
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 2400);
    return () => clearTimeout(t);
  }, [flash]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    ctx.lineWidth = STROKE_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawStroke = (s: Stroke) => {
      if (s.points.length === 0) return;
      ctx.strokeStyle = s.freehand ? "#9ca3af" : "#0a0a0a";
      ctx.beginPath();
      ctx.moveTo(s.points[0].x, s.points[0].y);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i].x, s.points[i].y);
      }
      ctx.stroke();
    };

    for (const s of strokesRef.current) drawStroke(s);
    if (currentStrokeRef.current) drawStroke(currentStrokeRef.current);
  }, []);

  function getPoint(e: React.PointerEvent): Pt {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startStroke(e: React.PointerEvent) {
    if (recognizing) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pt = getPoint(e);

    if (mode === "eraser") {
      eraseAt(pt);
      return;
    }
    if (mode === "snip") {
      snipStartRef.current = pt;
      setSnipRect({ x: pt.x, y: pt.y, w: 0, h: 0 });
      setSnipDragging(true);
      return;
    }
    currentStrokeRef.current = { points: [pt], freehand: mode === "ink" };
    redraw();
  }

  function continueStroke(e: React.PointerEvent) {
    if (e.buttons === 0) return;
    const pt = getPoint(e);
    if (mode === "eraser") {
      eraseAt(pt);
      return;
    }
    if (mode === "snip") {
      const start = snipStartRef.current;
      if (!start) return;
      setSnipRect({
        x: Math.min(start.x, pt.x),
        y: Math.min(start.y, pt.y),
        w: Math.abs(pt.x - start.x),
        h: Math.abs(pt.y - start.y),
      });
      return;
    }
    if (!currentStrokeRef.current) return;
    currentStrokeRef.current.points.push(pt);
    redraw();
  }

  function endStroke() {
    if (mode === "snip") {
      setSnipDragging(false);
      snipStartRef.current = null;
      // Tiny accidental clicks shouldn't leave a confirm bar floating.
      setSnipRect((prev) => (prev && (prev.w < 6 || prev.h < 6) ? null : prev));
      return;
    }
    if (mode !== "eraser" && currentStrokeRef.current && currentStrokeRef.current.points.length > 1) {
      strokesRef.current.push(currentStrokeRef.current);
      bumpStrokes();
    }
    currentStrokeRef.current = null;
    redraw();
  }

  function changeMode(next: Mode) {
    if (next !== "snip") {
      setSnipRect(null);
      setSnipDragging(false);
      snipStartRef.current = null;
    }
    setMode(next);
  }

  async function downloadSnip() {
    if (!snipRect || !containerRef.current) return;
    setSnipSaving(true);
    try {
      const dataUrl = await captureWireframePng(containerRef.current, snipRect);
      if (isTouch) {
        setSavedImageUrl(dataUrl);
        setSnipRect(null);
        setMode("pen");
        return;
      }
      const result = await savePng(dataUrl, defaultPngFilename());
      if (result === "cancelled") {
        // Keep marquee + tool so the user can retry the share.
        return;
      }
      if (result === "shared") setFlash({ kind: "local", text: "Image shared" });
      else setFlash({ kind: "local", text: "Image saved" });
      setSnipRect(null);
      setMode("pen");
    } catch {
      // Surface failure quietly via flash — keeps the marquee in place so
      // the user can retry without redrawing it.
      setFlash({ kind: "info", text: "Couldn't export the image. Try again." });
    } finally {
      setSnipSaving(false);
    }
  }

  function cancelSnip() {
    setSnipRect(null);
    setSnipDragging(false);
    snipStartRef.current = null;
  }

  function eraseAt(pt: Pt) {
    const before = strokesRef.current.length;
    strokesRef.current = strokesRef.current.filter((s) =>
      s.points.every((p) => Math.hypot(p.x - pt.x, p.y - pt.y) > ERASER_RADIUS),
    );
    if (strokesRef.current.length !== before) {
      bumpStrokes();
      redraw();
    }
  }

  function removeStrokeAt(index: number) {
    if (index < 0 || index >= strokesRef.current.length) return;
    strokesRef.current = strokesRef.current.filter((_, i) => i !== index);
    bumpStrokes();
    redraw();
  }

  const runRecognition = useCallback(() => {
    if (inFlightRef.current) return;
    const recognisable = strokesRef.current.filter((s) => !s.freehand);
    if (recognisable.length === 0) return;

    // Cluster strokes by spatial proximity so each drawn element gets its
    // own recognition pass. A user who scribbled five buttons in a row no
    // longer ends up with a single chimeric match.
    const clusters = clusterStrokes(recognisable);

    const stamped: WfElement[] = [];
    const matchedStrokes = new Set<Stroke>();

    for (const cluster of clusters) {
      const strokesAtCall: Stroke[] = cluster.map((s) => ({ points: s.points.slice() }));
      // Pure local recognition. Rank every template, accept the closest if
      // (a) the distance is very tight, or (b) it is below threshold AND
      // the closest template of a different type is far enough away.
      const candidateCloud = normalize(strokesAtCall);
      const ranked = rankTemplates(candidateCloud, templatesRef.current);
      const top = ranked[0];
      const runnerUp = ranked.find((r) => r.template.type !== top?.template.type);
      const veryTight = top && top.distance < LOCAL_MATCH_TIGHT;
      const closeEnough = top && top.distance < LOCAL_MATCH_THRESHOLD;
      const decisiveLead = !runnerUp || runnerUp.distance > top!.distance * LOCAL_MATCH_MARGIN;
      const accept = veryTight || (closeEnough && decisiveLead);
      if (!top || !accept) continue;

      const bbox = aggregateStrokeBbox(strokesAtCall);
      stamped.push({
        id: `${Date.now()}-${stamped.length}-local`,
        type: top.template.type,
        label: top.template.label,
        bbox: snapToStandard(top.template.type, bbox),
        templateId: top.template.id,
      });
      recordHit(top.template.id);
      for (const s of cluster) matchedStrokes.add(s);
    }

    if (stamped.length > 0) {
      strokesRef.current = strokesRef.current.filter((s) => s.freehand || !matchedStrokes.has(s));
      setElements((prev) => [...prev, ...stamped]);
      if (stamped.length === 1) {
        setFlash({ kind: "local", text: `Matched as ${stamped[0].type}` });
      } else {
        setFlash({ kind: "local", text: `Matched ${stamped.length} elements` });
      }
      bumpStrokes();
      redraw();
      return;
    }

    // No confident match anywhere. Keep the strokes on the canvas so the
    // user can either erase or train. The flash points them at the right
    // action.
    setFlash({
      kind: "info",
      text: templatesRef.current.length === 0
        ? "No drawings yet. Open Learn my style to teach the recogniser."
        : "Not recognised. Open Learn my style to teach this shape.",
    });
  }, [redraw, bumpStrokes]);

  function clearAll() {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setElements([]);
    bumpStrokes();
    redraw();
  }

  async function saveCanvasImage(): Promise<"saved" | "preview" | "cancelled"> {
    if (!containerRef.current) return "cancelled";
    try {
      const dataUrl = await captureWireframePng(containerRef.current);
      if (isTouch) {
        setSavedImageUrl(dataUrl);
        return "preview";
      }
      const result = await savePng(dataUrl, defaultPngFilename());
      if (result === "shared") {
        setFlash({ kind: "local", text: "Image shared" });
        return "saved";
      }
      if (result === "downloaded") {
        setFlash({ kind: "local", text: "Image saved" });
        return "saved";
      }
      return "cancelled";
    } catch {
      setFlash({ kind: "info", text: "Couldn't save the image. Try again." });
      return "cancelled";
    }
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((e) => e.id !== id));
  }

  function moveElement(id: string, dx: number, dy: number) {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, bbox: { ...e.bbox, x: e.bbox.x + dx, y: e.bbox.y + dy } } : e)),
    );
  }

  function resizeElement(id: string, bbox: WfElement["bbox"]) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, bbox } : e)));
  }

  function updateLabel(id: string, label: string) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, label } : e)));
  }

  function updateType(id: string, type: ElementType) {
    setElements((prev) =>
      prev.map((e) => (e.id === id ? { ...e, type, bbox: snapToStandard(type, e.bbox) } : e)),
    );
  }

  // Global Enter shortcut. Fires recognition when there are pending strokes.
  // Skipped while the user is editing text inside an element.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) return;
      }
      if (strokesRef.current.length === 0) return;
      if (inFlightRef.current) return;
      e.preventDefault();
      void runRecognition();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runRecognition]);

  const pillPos = recognisePillPosition(strokesRef.current);
  const dotIndices = findDotStrokes(strokesRef.current);
  // strokeRev is read here only to force a re-render when strokes change.
  void strokeRev;

  function moveLayer(id: string, direction: "forward" | "backward") {
    setElements((prev) => {
      const i = prev.findIndex((e) => e.id === id);
      if (i < 0) return prev;
      const j = direction === "forward" ? i + 1 : i - 1;
      if (j < 0 || j >= prev.length) return prev;
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function recordFeedback(id: string, correct: boolean) {
    const el = elements.find((e) => e.id === id);
    if (!el) return;
    try {
      const key = "wireframe_feedback_v1";
      const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
      existing.push({
        ts: Date.now(),
        type: el.type,
        label: el.label,
        bbox: el.bbox,
        correct,
        fromTemplate: el.templateId ?? null,
      });
      const trimmed = existing.slice(-500);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } catch {
      // Storage may be full or disabled. Feedback is best-effort.
    }
    // Feed the signal back to the template store so the local recogniser
    // learns from corrections. A thumbs-down on a locally-matched element
    // retires that exact template immediately (we trust the signal — one
    // wrong match is enough). Thumbs-up just bumps its hit count.
    if (el.templateId) {
      if (correct) {
        recordHit(el.templateId);
      } else {
        const removed = deleteTemplate(el.templateId);
        if (removed) {
          setFlash({ kind: "removed", text: `Removed your ${removed.type} drawing` });
        }
      }
      refreshTemplates();
    }
    if (!correct) removeElement(id);
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        touchAction: "none",
        overscrollBehavior: "none",
        background: "#ffffff",
        cursor: mode === "eraser" ? "cell" : "crosshair",
        fontFamily: "var(--font-inter, system-ui, sans-serif)",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={startStroke}
        onPointerMove={continueStroke}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />

      {snipRect && (
        <div
          data-skip-export="1"
          style={{
            position: "absolute",
            left: snipRect.x,
            top: snipRect.y,
            width: snipRect.w,
            height: snipRect.h,
            border: "1.5px dashed #0a0a0a",
            background: "rgba(10,10,10,0.04)",
            pointerEvents: "none",
            zIndex: 30,
          }}
        />
      )}

      {/* Recognised elements layer. Sits above the doodles so the polished
          wireframe is what the user mostly sees. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
        }}
      >
        {elements.map((el, i) => (
          <ElementCell
            key={el.id}
            element={el}
            onMove={(dx, dy) => moveElement(el.id, dx, dy)}
            onResize={(bbox) => resizeElement(el.id, bbox)}
            onRemove={() => removeElement(el.id)}
            onLabelChange={(label) => updateLabel(el.id, label)}
            onTypeChange={(type) => updateType(el.id, type)}
            onLayer={(direction) => moveLayer(el.id, direction)}
            onFeedback={(correct) => recordFeedback(el.id, correct)}
            canForward={i < elements.length - 1}
            canBackward={i > 0}
          />
        ))}
      </div>

      {/* Chrome shell. Position absolute to overlay the canvas; pointer
          events stay none on the shell itself so the canvas underneath
          still gets pointer events through empty regions. Children opt
          in to pointer-events: auto where they need clicks. While
          chromeVisible is false we also disable all descendant clicks. */}
      <div
        className={chromeInteractive ? "wf-chrome wf-chrome-visible" : "wf-chrome"}
        data-skip-export="1"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: chromeVisible ? 1 : 0,
          transition: "opacity 700ms ease",
        }}
      >
        <TopBar
          templateCount={templateCount}
          onLearn={() => setLearnOpen(true)}
        />
        <Toolbar
          mode={mode}
          setMode={changeMode}
          onClear={clearAll}
          onSaveImage={saveCanvasImage}
          onExport={() => setShowExport(true)}
          hasContent={elements.length > 0 || strokesRef.current.length > 0}
        />
        {dotIndices.map(({ index, x, y }) => (
          <DotDeleteButton
            key={`${index}-${x}-${y}`}
            x={x}
            y={y}
            onClick={() => removeStrokeAt(index)}
          />
        ))}
        {snipRect && !snipDragging && snipRect.w >= 6 && snipRect.h >= 6 && (
          <SnipActionBar
            rect={snipRect}
            viewport={size}
            saving={snipSaving}
            onCancel={cancelSnip}
            onDownload={() => void downloadSnip()}
          />
        )}
        {recognizing && <ThinkingPill />}
        {!recognizing && pillPos && (
          <RecognisePill
            x={pillPos.x}
            y={pillPos.y}
            onClick={() => void runRecognition()}
          />
        )}
        <FlashPill message={flash} />
      </div>
      {showExport && (
        <ExportDialog
          elements={elements}
          size={size}
          containerRef={containerRef}
          isTouch={isTouch}
          onPreviewImage={(dataUrl) => {
            setSavedImageUrl(dataUrl);
            setShowExport(false);
          }}
          onClose={() => setShowExport(false)}
        />
      )}
      {savedImageUrl && (
        <SavedImagePreview
          dataUrl={savedImageUrl}
          filename={defaultPngFilename()}
          onClose={() => setSavedImageUrl(null)}
        />
      )}
      <LearnMyStyle
        open={learnOpen}
        onClose={() => { setLearnOpen(false); refreshTemplates(); }}
        onTemplatesAdded={refreshTemplates}
      />
      <style jsx global>{`
        .wf-chrome:not(.wf-chrome-visible) * {
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}

function recognisePillPosition(strokes: Stroke[]): { x: number; y: number } | null {
  const recognisable = strokes.filter((s) => !s.freehand);
  if (recognisable.length === 0) return null;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of recognisable) {
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!isFinite(minX)) return null;
  const cx = (minX + maxX) / 2;
  // Just above the stroke bbox so the pill doesn't obscure the doodle. If the
  // doodle is near the top of the canvas, drop the pill below it instead.
  const above = minY - 44;
  return { x: cx, y: above < 12 ? maxY + 16 : above };
}

interface RecognisePillProps {
  x: number;
  y: number;
  onClick: () => void;
}

function RecognisePill({ x, y, onClick }: RecognisePillProps) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, 0)",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        height: 30,
        padding: "0 12px 0 10px",
        background: "#ffffff",
        color: "#0a0a0a",
        border: "1.5px solid #0a0a0a",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        pointerEvents: "auto",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        zIndex: 50,
        animation: "wfPillIn 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: 999,
          background: "#16a34a",
          animation: "wfPillPulse 1.4s ease-in-out infinite",
        }}
      />
      Recognise
      <kbd
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "1px 6px",
          marginLeft: 2,
          background: "rgba(10,10,10,0.08)",
          color: "#0a0a0a",
          borderRadius: 4,
          fontSize: 10,
          fontWeight: 600,
          fontFamily: "inherit",
        }}
      >
        ↵
      </kbd>
      <style jsx>{`
        @keyframes wfPillIn {
          from { transform: translate(-50%, 6px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes wfPillPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(0.85); }
        }
      `}</style>
    </button>
  );
}

// A "dot" is a stroke whose bbox is tiny in both dimensions — almost always
// an accidental click rather than an intentional mark. We surface a small ×
// next to each so they can be removed without switching to the eraser.
const DOT_THRESHOLD = 6;

function findDotStrokes(strokes: Stroke[]): { index: number; x: number; y: number }[] {
  const out: { index: number; x: number; y: number }[] = [];
  for (let i = 0; i < strokes.length; i++) {
    const s = strokes[i];
    if (s.points.length === 0) continue;
    if (s.freehand) continue;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    if (maxX - minX <= DOT_THRESHOLD && maxY - minY <= DOT_THRESHOLD) {
      out.push({ index: i, x: maxX, y: minY });
    }
  }
  return out;
}

function DotDeleteButton({ x, y, onClick }: { x: number; y: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Delete dot"
      title="Delete dot"
      style={{
        position: "absolute",
        left: x + 6,
        top: y - 8,
        width: 16,
        height: 16,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        color: "#0a0a0a",
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: 999,
        padding: 0,
        fontSize: 11,
        lineHeight: 1,
        cursor: "pointer",
        pointerEvents: "auto",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
        zIndex: 45,
      }}
    >
      ×
    </button>
  );
}

interface SnipActionBarProps {
  rect: SnipRect;
  viewport: { w: number; h: number };
  saving: boolean;
  onCancel: () => void;
  onDownload: () => void;
}

function SnipActionBar({ rect, viewport, saving, onCancel, onDownload }: SnipActionBarProps) {
  const BAR_W = 200;
  const BAR_H = 36;
  const GAP = 10;
  // Anchor below the rectangle by default; flip above if it would clip the
  // bottom edge. Horizontally align to the rectangle's right and clamp.
  let left = rect.x + rect.w - BAR_W;
  let top = rect.y + rect.h + GAP;
  if (top + BAR_H > viewport.h - GAP) top = Math.max(GAP, rect.y - GAP - BAR_H);
  left = Math.max(GAP, Math.min(left, viewport.w - GAP - BAR_W));
  return (
    <div
      data-skip-export="1"
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        position: "absolute",
        left,
        top,
        width: BAR_W,
        height: BAR_H,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
        background: "#0a0a0a",
        color: "#ffffff",
        borderRadius: 999,
        padding: 4,
        boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
        pointerEvents: "auto",
        zIndex: 50,
      }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onCancel(); }}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(255,255,255,0.8)",
          fontSize: 12,
          fontWeight: 500,
          padding: "0 12px",
          height: 28,
          borderRadius: 999,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDownload(); }}
        disabled={saving}
        style={{
          background: "#ffffff",
          color: "#0a0a0a",
          border: "none",
          fontSize: 12,
          fontWeight: 600,
          padding: "0 14px",
          height: 28,
          borderRadius: 999,
          cursor: saving ? "default" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Saving…" : "Download PNG"}
      </button>
    </div>
  );
}

function aggregateStrokeBbox(strokes: Stroke[]): { x: number; y: number; w: number; h: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const s of strokes) {
    for (const p of s.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

interface TopBarProps {
  templateCount: number;
  onLearn: () => void;
}

function TopBar({ templateCount, onLearn }: TopBarProps) {
  return (
    <header
      style={{
        position: "absolute",
        top: "env(safe-area-inset-top, 0px)",
        left: "env(safe-area-inset-left, 0px)",
        right: "env(safe-area-inset-right, 0px)",
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: "0 18px",
        gap: 12,
        zIndex: 40,
        pointerEvents: "none",
      }}
    >
      <Link
        href="/"
        aria-label="Back to neilmcardle.com"
        style={{
          color: "rgba(0,0,0,0.45)",
          display: "flex",
          transition: "color 0.15s",
          pointerEvents: "auto",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
      </Link>
      <span style={{ color: "rgba(0,0,0,0.18)" }}>·</span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(0,0,0,0.75)",
          letterSpacing: "-0.01em",
        }}
      >
        DoodleWire
      </span>
      <div style={{ flex: 1 }} />
      <button
        type="button"
        onClick={onLearn}
        style={{
          pointerEvents: "auto",
          background: "transparent",
          border: "1px solid rgba(0,0,0,0.12)",
          color: "rgba(0,0,0,0.7)",
          fontSize: 12,
          fontWeight: 500,
          padding: "6px 12px",
          borderRadius: 999,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Learn my style
        {templateCount > 0 && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 18,
              height: 18,
              padding: "0 6px",
              borderRadius: 999,
              background: "#0a0a0a",
              color: "#ffffff",
              fontSize: 10,
              fontWeight: 700,
              lineHeight: 1,
            }}
            title={`${templateCount} saved drawing${templateCount === 1 ? "" : "s"}`}
          >
            {templateCount}
          </span>
        )}
      </button>
    </header>
  );
}

type FlashKind = "local" | "removed" | "info";

interface FlashMessage {
  kind: FlashKind;
  text: string;
}

const FLASH_COLORS: Record<FlashKind, string> = {
  local: "#16a34a",
  removed: "#dc2626",
  info: "#525252",
};

function FlashPill({ message }: { message: FlashMessage | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message.text}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "absolute",
            top: 56,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 45,
            pointerEvents: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            background: FLASH_COLORS[message.kind],
            color: "#ffffff",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.01em",
            boxShadow: "0 6px 16px rgba(0,0,0,0.18)",
          }}
        >
          {message.text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ToolbarProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  onClear: () => void;
  onSaveImage: () => Promise<"saved" | "preview" | "cancelled">;
  onExport: () => void;
  hasContent: boolean;
}

function Toolbar({ mode, setMode, onClear, onSaveImage, onExport, hasContent }: ToolbarProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [savingImage, setSavingImage] = useState(false);
  const [imageSaved, setImageSaved] = useState(false);

  async function handleSaveImage(e: React.MouseEvent) {
    e.stopPropagation();
    if (savingImage) return;
    setSavingImage(true);
    const result = await onSaveImage();
    setSavingImage(false);
    if (result === "saved") {
      setImageSaved(true);
      setTimeout(() => setImageSaved(false), 1400);
    }
    // For "preview", the modal that opens IS the feedback; skip the badge.
  }

  // Cancel pending-clear if the user clicks anywhere outside the toolbar, or
  // after a short timeout. Both feel like "they changed their mind".
  useEffect(() => {
    if (!confirmingClear) return;
    const t = setTimeout(() => setConfirmingClear(false), 4000);
    function onDocDown(e: PointerEvent) {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-clear-confirm='1']")) return;
      setConfirmingClear(false);
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onDocDown);
    };
  }, [confirmingClear]);

  function handleClearClick() {
    if (!hasContent) return;
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    setConfirmingClear(false);
    onClear();
  }

  return (
    <div
      style={{
        position: "absolute",
        bottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 999,
        padding: 4,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)",
        zIndex: 40,
        pointerEvents: "auto",
      }}
    >
      <ToolBtn
        active={mode === "pen"}
        onClick={() => setMode("pen")}
        label="Pen"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
          </svg>
        }
      />
      <ToolBtn
        active={mode === "ink"}
        onClick={() => setMode("ink")}
        label="Ink (annotations, won't be recognised)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />
          </svg>
        }
      />
      <ToolBtn
        active={mode === "snip"}
        onClick={() => setMode("snip")}
        label="Snip (drag to export a region as PNG)"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 3">
            <rect x="4" y="4" width="16" height="16" rx="1" />
          </svg>
        }
      />
      <ToolBtn
        active={mode === "eraser"}
        onClick={() => setMode("eraser")}
        label="Eraser"
        icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 20H8.5L3 14.5a2.83 2.83 0 0 1 0-4L13.5 0 24 10.5 13.5 21" />
          </svg>
        }
      />
      <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)", margin: "0 4px" }} />
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 32, mass: 0.9 }}
        style={{ display: "inline-flex", alignItems: "center", overflow: "hidden" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {confirmingClear ? (
            <motion.div
              key="confirm"
              data-clear-confirm="1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#0a0a0a",
                color: "#ffffff",
                borderRadius: 999,
                padding: "0 4px 0 12px",
                height: 32,
                fontSize: 12,
                fontWeight: 600,
                whiteSpace: "nowrap",
                transformOrigin: "left center",
              }}
            >
              <span>Clear all?</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmingClear(false); }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                  fontWeight: 500,
                  padding: "0 10px",
                  height: 24,
                  borderRadius: 999,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                disabled={savingImage}
                style={{
                  background: imageSaved ? "#16a34a" : "rgba(255,255,255,0.14)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "0 12px",
                  height: 24,
                  borderRadius: 999,
                  cursor: savingImage ? "default" : "pointer",
                  opacity: savingImage ? 0.7 : 1,
                  transition: "background 0.15s, opacity 0.15s",
                }}
              >
                {imageSaved ? "Saved" : savingImage ? "Saving…" : "Save image"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleClearClick(); }}
                style={{
                  background: "#dc2626",
                  border: "none",
                  color: "#ffffff",
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "0 12px",
                  height: 24,
                  borderRadius: 999,
                  cursor: "pointer",
                }}
              >
                Clear
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="bin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              style={{ display: "inline-flex", transformOrigin: "left center" }}
            >
              <ToolBtn
                onClick={handleClearClick}
                label="Clear"
                disabled={!hasContent}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <button
        type="button"
        onClick={onExport}
        disabled={!hasContent}
        style={{
          marginLeft: 4,
          padding: "0 14px",
          height: 32,
          borderRadius: 999,
          background: hasContent ? "#0a0a0a" : "rgba(0,0,0,0.1)",
          color: hasContent ? "#ffffff" : "rgba(0,0,0,0.4)",
          border: "none",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: hasContent ? "pointer" : "not-allowed",
          transition: "background 0.15s",
        }}
      >
        Export
      </button>
    </div>
  );
}

interface ToolBtnProps {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}

function ToolBtn({ active, disabled, onClick, label, icon }: ToolBtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      style={{
        width: 36,
        height: 32,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "#0a0a0a" : "transparent",
        color: active ? "#ffffff" : disabled ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.7)",
        border: "none",
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {icon}
    </button>
  );
}

function ThinkingPill() {
  return (
    <div
      style={{
        position: "absolute",
        top: 14,
        right: 18,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        background: "rgba(10,10,10,0.92)",
        color: "#ffffff",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        letterSpacing: "0.01em",
        zIndex: 50,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "#ffffff",
          animation: "wfPulse 1.2s ease-in-out infinite",
        }}
      />
      Reading your doodle
      <style jsx>{`
        @keyframes wfPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

interface ExportDialogProps {
  elements: WfElement[];
  size: { w: number; h: number };
  containerRef: React.RefObject<HTMLDivElement | null>;
  isTouch: boolean;
  onPreviewImage: (dataUrl: string) => void;
  onClose: () => void;
}

type ExportFormat = "html" | "react" | "image";

function ExportDialog({ elements, size, containerRef, isTouch, onPreviewImage, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("html");
  const code = format === "html" ? exportAsHtml(elements, size) : format === "react" ? exportAsReact(elements, size) : "";
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadDone, setDownloadDone] = useState<"shared" | "downloaded" | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard API may be unavailable on non-secure origins. Falls through silently.
    }
  }

  async function downloadImage() {
    if (!containerRef.current) return;
    setDownloading(true);
    setDownloadError(null);
    setDownloadDone(null);
    try {
      const dataUrl = await captureWireframePng(containerRef.current);
      if (isTouch) {
        onPreviewImage(dataUrl);
        return;
      }
      const result = await savePng(dataUrl, defaultPngFilename());
      if (result !== "cancelled") {
        setDownloadDone(result);
        setTimeout(() => setDownloadDone(null), 1800);
      }
    } catch {
      setDownloadError("Couldn't export the image. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-skip-export="1"
      onClick={onClose}
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(10,10,10,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>Export wireframe</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
              color: "rgba(0,0,0,0.5)",
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "10px 18px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <FormatTab active={format === "html"} onClick={() => setFormat("html")}>HTML / CSS</FormatTab>
          <FormatTab active={format === "react"} onClick={() => setFormat("react")}>React / Tailwind</FormatTab>
          <FormatTab active={format === "image"} onClick={() => setFormat("image")}>Image (PNG)</FormatTab>
          <div style={{ flex: 1 }} />
          {format === "image" ? (
            <button
              type="button"
              onClick={downloadImage}
              disabled={downloading}
              style={{
                padding: "0 14px",
                height: 32,
                borderRadius: 999,
                background: downloadDone ? "#16a34a" : "#0a0a0a",
                color: "#ffffff",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: downloading ? "default" : "pointer",
                opacity: downloading ? 0.6 : 1,
                transition: "background 0.15s, opacity 0.15s",
              }}
            >
              {downloadDone === "shared"
                ? "Shared"
                : downloadDone === "downloaded"
                  ? "Saved"
                  : downloading
                    ? "Saving…"
                    : "Save image"}
            </button>
          ) : (
            <button
              type="button"
              onClick={copy}
              style={{
                padding: "0 14px",
                height: 32,
                borderRadius: 999,
                background: copied ? "#16a34a" : "#0a0a0a",
                color: "#ffffff",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
        {format === "image" ? (
          <div
            style={{
              flex: 1,
              padding: 24,
              background: "#fafaf9",
              color: "#0a0a0a",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflow: "auto",
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600 }}>Save the whole screen as PNG</div>
            <div style={{ fontSize: 12, color: "rgba(0,0,0,0.6)", lineHeight: 1.55 }}>
              Captures every element and stroke currently on the canvas. On mobile this opens the
              share sheet so you can save to Photos, Files, or send it. On desktop it downloads a
              PNG. Tip — use the Snip tool in the toolbar to capture just a region.
            </div>
            {downloadError && (
              <div style={{ fontSize: 12, color: "#dc2626" }}>{downloadError}</div>
            )}
          </div>
        ) : (
          <pre
            style={{
              flex: 1,
              margin: 0,
              padding: 18,
              background: "#fafaf9",
              color: "#0a0a0a",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 12,
              lineHeight: 1.55,
              overflow: "auto",
              whiteSpace: "pre",
            }}
          >
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}

interface SavedImagePreviewProps {
  dataUrl: string;
  filename: string;
  onClose: () => void;
}

// Shown on touch devices after a capture. The browser-download path doesn't
// land anywhere visible on iOS, so we show the PNG inline with explicit
// affordances: long-press to save to Photos, or tap Share to use the system
// share sheet (which has a fresh user-gesture from the button click, so it
// fires reliably).
function SavedImagePreview({ dataUrl, filename, onClose }: SavedImagePreviewProps) {
  const [sharing, setSharing] = useState(false);

  async function share() {
    if (sharing) return;
    setSharing(true);
    try {
      await savePng(dataUrl, filename);
    } catch {
      // Quietly swallow — the user still has the inline image to long-press.
    } finally {
      setSharing(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-skip-export="1"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10,10,10,0.78)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: "calc(20px + env(safe-area-inset-top, 0px)) 16px calc(20px + env(safe-area-inset-bottom, 0px))",
        gap: 16,
        fontFamily: "var(--font-inter, system-ui, sans-serif)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%",
          maxHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dataUrl}
          alt="Doodlewire capture"
          style={{
            maxWidth: "100%",
            maxHeight: "60vh",
            objectFit: "contain",
            borderRadius: 10,
            background: "#ffffff",
            boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
          }}
        />
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.92)",
            textAlign: "center",
            lineHeight: 1.5,
            padding: "0 12px",
          }}
        >
          Press and hold the image, then choose Save to Photos.
          <br />
          Or tap Share for more options.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={share}
            disabled={sharing}
            style={{
              background: "#ffffff",
              color: "#0a0a0a",
              border: "none",
              padding: "0 18px",
              height: 40,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
              cursor: sharing ? "default" : "pointer",
              opacity: sharing ? 0.7 : 1,
            }}
          >
            {sharing ? "Sharing…" : "Share"}
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.4)",
              padding: "0 18px",
              height: 40,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function FormatTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "6px 12px",
        height: 32,
        borderRadius: 999,
        background: active ? "rgba(10,10,10,0.06)" : "transparent",
        color: active ? "#0a0a0a" : "rgba(0,0,0,0.55)",
        border: "none",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.15s",
      }}
    >
      {children}
    </button>
  );
}
