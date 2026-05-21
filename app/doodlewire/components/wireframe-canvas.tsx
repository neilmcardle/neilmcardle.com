"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { ElementCell } from "./element-cell";
import { clusterStrokes, type StrokeCluster } from "./cluster-strokes";
import { exportAsHtml, exportAsReact } from "./export";
import { captureWireframePng, defaultPngFilename, savePng } from "./exportImage";
import { LearnMyStyle } from "./learn-my-style";
import { normalize, rankTemplates } from "./point-cloud-recognizer";
import { classifyShape } from "./shape-heuristics";
import { snapToStandard } from "./snap-size";
import {
  deleteTemplate,
  loadTemplates,
  recordHit,
  type Template,
} from "./template-store";

// Single runtime source of truth for element types. ElementType is derived
// from it, and template-store uses it to discard saved templates whose type
// has since been removed from the app.
export const ELEMENT_TYPES = [
  "button",
  "input",
  "text",
  "toggle",
  "heading",
  "image",
  "card",
  "divider",
  "nav",
  "icon",
  "link",
  "badge",
  "dropdown",
] as const;

export type ElementType = (typeof ELEMENT_TYPES)[number];

export interface WfElement {
  id: string;
  type: ElementType;
  label?: string;
  bbox: { x: number; y: number; w: number; h: number };
  // Set when the element came from a local template match. Lets us
  // attribute thumbs-down feedback back to the template so bad ones decay.
  templateId?: string;
  // Heading level (1-6). Only meaningful for type === "heading"; absent
  // headings render at level 2.
  level?: number;
  // Visual variant. Currently used by type === "button" to switch between
  // a filled "primary" button and an outlined "secondary" button. Absent
  // buttons render as primary.
  variant?: "primary" | "secondary";
}

type Pt = { x: number; y: number };
// freehand strokes are user annotations / sketches. They render in a softer
// grey, never trigger recognition, and never appear in exported output.
type Stroke = { points: Pt[]; freehand?: boolean };
type Mode = "pen" | "ink" | "eraser" | "snip";
type SnipRect = { x: number; y: number; w: number; h: number };

// One page of the document. The currently-viewed page's elements/strokes/
// scroll are held in the live React state (elements, strokesRef, scrollY);
// pages[] stores every page. On a page switch the live state is snapshotted
// back into pages[] and the target page is loaded into it.
interface PageSnapshot {
  id: string;
  elements: WfElement[];
  strokes: Stroke[];
  scrollY: number;
}

function makePageId(): string {
  return `page-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// The whole document (every page's elements, strokes and scroll) is
// persisted to localStorage so work survives an app relaunch. Trained
// recogniser templates persist separately via template-store.
const DOC_STORAGE_KEY = "doodlewire_document_v1";
// Whether recognition fires automatically after an idle pause ("on") or only
// when the user taps the Recognise button ("off").
const AUTO_RECOGNISE_KEY = "doodlewire_auto_recognise_v1";
// Set once the double-tap-to-select hint has been shown, so it appears only
// the first time the user has elements on the canvas.
const DBLTAP_HINT_KEY = "doodlewire_dbltap_hint_v1";

// Double-tap gesture window: two pen taps within this time and distance read
// as a "select an element" gesture rather than two doodles.
const DOUBLE_TAP_MS = 300;
const DOUBLE_TAP_DIST = 24;
// Max pointer travel for a pen gesture to still count as a tap (not a stroke).
const TAP_MOVE_MAX = 12;

function saveDocument(pages: PageSnapshot[], currentPage: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      DOC_STORAGE_KEY,
      JSON.stringify({ pages, currentPage }),
    );
  } catch {
    // Quota exceeded or storage disabled — persistence is best-effort.
  }
}

function loadDocument(): { pages: PageSnapshot[]; currentPage: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(DOC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { pages?: PageSnapshot[]; currentPage?: number };
    if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) return null;
    const cp =
      typeof parsed.currentPage === "number"
        ? Math.max(0, Math.min(parsed.currentPage, parsed.pages.length - 1))
        : 0;
    return { pages: parsed.pages, currentPage: cp };
  } catch {
    return null;
  }
}

const STROKE_WIDTH = 2.5;
const ERASER_RADIUS = 18;
// Hand-drawn variation is large, so we accept matches in two ways:
// (1) very tight match (distance < TIGHT) regardless of runner-up, or
// (2) reasonably close (distance < THRESHOLD) AND the closest template
//     of a DIFFERENT type is at least MARGIN times further away.
// This catches genuine matches a strict absolute cap was missing.
// Thresholds were bumped after adding aspect-ratio penalty to the score:
// a correct match with slight aspect drift now lands ~1 higher than it
// did under shape-only scoring. We compensate so the accept rate doesn't
// drop on legit matches while wrong-aspect candidates get pushed out.
const LOCAL_MATCH_TIGHT = 6;
const LOCAL_MATCH_THRESHOLD = 13;
const LOCAL_MATCH_MARGIN = 1.3;

export default function WireframeCanvas() {
  // Restore a persisted document on first render (run once via lazy init).
  const [restored] = useState(() => loadDocument());
  const restoredPage = restored
    ? restored.pages[restored.currentPage]
    : undefined;

  const containerRef = useRef<HTMLDivElement>(null);
  // Bottom canvas captures pointer events; the ink canvas sits above the
  // recognised-elements layer and is where strokes are actually painted, so
  // live drawing always renders on top of the wireframe boxes.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inkCanvasRef = useRef<HTMLCanvasElement>(null);
  const elementsLayerRef = useRef<HTMLDivElement>(null);

  const strokesRef = useRef<Stroke[]>(
    restoredPage ? [...restoredPage.strokes] : [],
  );
  const currentStrokeRef = useRef<Stroke | null>(null);
  const inFlightRef = useRef(false);
  const dprRef = useRef(1);

  // Vertical scroll. The page is a tall document; strokes and elements are
  // stored in document coordinates (y can run far below the viewport). The
  // canvas stays viewport-sized and redraws content offset by scrollY.
  // scrollYRef is the source of truth for the render path (no stale
  // closures); scrollY mirrors it for React-rendered layers.
  const scrollYRef = useRef(restoredPage?.scrollY ?? 0);
  const [scrollY, setScrollY] = useState(restoredPage?.scrollY ?? 0);
  // Active pointers, for distinguishing a one-finger draw from a two-finger
  // pan. A gesture locks to "draw" or "pan" until all fingers lift.
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<"idle" | "draw" | "pan">("idle");
  // Two-finger pan locks to a vertical (scroll) or horizontal (page-switch)
  // axis once it crosses a small threshold.
  const panStartRef = useRef({ x: 0, y: 0 });
  const panLastRef = useRef({ x: 0, y: 0 });
  const panAxisRef = useRef<"none" | "v" | "h">("none");
  // Auto-recognise debounce. Cancelled on every new stroke and re-armed on
  // every stroke completion so recognition only fires after a true pause.
  const recogniseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Double-tap-to-select tracking. tapDownRef records where/when the current
  // pen gesture began; lastTapRef remembers the previous quick tap so a
  // second one nearby is read as a select gesture rather than a doodle.
  const tapDownRef = useRef<{ t: number; x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ t: number; x: number; y: number; dotPushed: boolean } | null>(null);

  const [elements, setElements] = useState<WfElement[]>(
    restoredPage ? [...restoredPage.elements] : [],
  );
  // All pages. pages[currentPage] is kept loosely — the live elements /
  // strokesRef / scrollY are the source of truth for the current page and
  // are snapshotted back into pages[] only on a page switch (or save).
  const [pages, setPages] = useState<PageSnapshot[]>(
    () => restored?.pages ?? [{ id: makePageId(), elements: [], strokes: [], scrollY: 0 }],
  );
  const [currentPage, setCurrentPage] = useState(restored?.currentPage ?? 0);
  const [mode, setMode] = useState<Mode>("pen");
  const [recognizing, setRecognizing] = useState(false);
  // Recognition mode. When true, recognition fires after an idle pause; when
  // false the user triggers it explicitly via the Recognise button.
  const [autoRecognise, setAutoRecognise] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(AUTO_RECOGNISE_KEY) !== "off";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(AUTO_RECOGNISE_KEY, autoRecognise ? "on" : "off");
  }, [autoRecognise]);
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

  // Touch users have no hover, so the per-element toolbar and resize handles
  // are reached by tapping the element to select it. Desktop users get the
  // same model in addition to hover. Tapping the canvas (or starting a
  // stroke) deselects.
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Local recogniser templates. Loaded once on mount and refreshed whenever
  // a new template is saved. Kept in a ref so the recognition path doesn't
  // close over a stale value.
  const templatesRef = useRef<Template[]>([]);
  const [templateCount, setTemplateCount] = useState(0);
  const [learnOpen, setLearnOpen] = useState(false);
  // Transient flash pill above the toolbar. Surfaces what just happened:
  // a local match, a template deletion, an export result, etc.
  const [flash, setFlash] = useState<FlashMessage | null>(null);

  // While a text field is being edited, the canvas content is shifted up
  // by this many px so the focused element clears the iOS keyboard.
  const [keyboardShift, setKeyboardShift] = useState(0);
  const keyboardShiftRef = useRef(0);
  const editingNodeRef = useRef<HTMLElement | null>(null);

  // Keep the canvas pixel-perfect on every viewport change.
  useEffect(() => {
    function resize() {
      const el = containerRef.current;
      const canvas = canvasRef.current;
      if (!el || !canvas) return;
      const rect = el.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      for (const c of [canvas, inkCanvasRef.current]) {
        if (!c) continue;
        c.width = Math.round(rect.width * dpr);
        c.height = Math.round(rect.height * dpr);
        c.style.width = `${rect.width}px`;
        c.style.height = `${rect.height}px`;
      }
      setSize({ w: rect.width, h: rect.height });
      redraw();
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load templates on mount. Learn my style opens only from the Settings
  // menu in the toolbar.
  useEffect(() => {
    const all = loadTemplates();
    templatesRef.current = all;
    setTemplateCount(all.length);
  }, []);

  // Persist the whole document on any change, debounced. The current page's
  // live state (elements / strokesRef / scrollY) is folded into pages[]
  // before serialising, since pages[currentPage] is otherwise stale.
  useEffect(() => {
    const t = setTimeout(() => {
      const full = pages.map((p, i) =>
        i === currentPage
          ? { ...p, elements, strokes: strokesRef.current, scrollY: scrollYRef.current }
          : p,
      );
      saveDocument(full, currentPage);
    }, 800);
    return () => clearTimeout(t);
  }, [elements, pages, currentPage, strokeRev, scrollY]);

  // Keyboard-aware shift. When a contentEditable inside the canvas is
  // focused and the iOS keyboard appears (visualViewport shrinks), shift
  // the canvas content up so the edited element sits above the keyboard
  // rather than behind it or the bottom toolbar.
  useEffect(() => {
    const container = containerRef.current;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!container) return;

    function applyShift(v: number) {
      keyboardShiftRef.current = v;
      setKeyboardShift(v);
    }

    function recompute() {
      const node = editingNodeRef.current;
      if (!node || !vv) {
        applyShift(0);
        return;
      }
      const rect = node.getBoundingClientRect();
      // rect reflects the current shift; add it back for the natural pos.
      const naturalBottom = rect.bottom + keyboardShiftRef.current;
      const desired = Math.max(0, Math.round(naturalBottom + 28 - vv.height));
      applyShift(desired);
    }

    function onFocusIn(e: FocusEvent) {
      const t = e.target as HTMLElement | null;
      if (t && t.isContentEditable) {
        editingNodeRef.current = t;
        recompute();
      }
    }
    function onFocusOut() {
      editingNodeRef.current = null;
      applyShift(0);
    }

    container.addEventListener("focusin", onFocusIn);
    container.addEventListener("focusout", onFocusOut);
    vv?.addEventListener("resize", recompute);
    vv?.addEventListener("scroll", recompute);
    return () => {
      container.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", recompute);
      vv?.removeEventListener("scroll", recompute);
    };
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

  // Auto-clear the flash pill after a short window. Actionable flashes
  // linger longer so there is time to read the message and tap the button.
  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), flash.action ? 7000 : 2400);
    return () => clearTimeout(t);
  }, [flash]);

  const redraw = useCallback(() => {
    const canvas = inkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = dprRef.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    // Shift the whole document up by scrollY: strokes are stored in
    // document coordinates and drawn into a viewport-sized canvas.
    ctx.translate(0, -scrollYRef.current);
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

  // Document-space point — y includes the scroll offset, so strokes and
  // elements live in a coordinate system independent of how far the page
  // is scrolled.
  function getPoint(e: React.PointerEvent): Pt {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + scrollYRef.current,
    };
  }

  // Viewport-space point — no scroll offset. Used by the snip tool, whose
  // crop region and capture both work in screen coordinates.
  function getScreenPoint(e: React.PointerEvent): Pt {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // How far the page can scroll. Always allows a full screen of blank space
  // below the lowest content so there is room to scroll down and draw
  // further — the page extends as content is added lower.
  function maxScrollY(): number {
    let bottom = 0;
    for (const el of elements) bottom = Math.max(bottom, el.bbox.y + el.bbox.h);
    for (const s of strokesRef.current) {
      for (const p of s.points) bottom = Math.max(bottom, p.y);
    }
    return Math.max(0, bottom) + size.h;
  }

  function applyScroll(next: number) {
    const clamped = Math.max(0, Math.min(next, maxScrollY()));
    if (clamped === scrollYRef.current) return;
    scrollYRef.current = clamped;
    setScrollY(clamped);
    redraw();
  }

  function cancelScheduledRecognise() {
    if (recogniseTimerRef.current) {
      clearTimeout(recogniseTimerRef.current);
      recogniseTimerRef.current = null;
    }
  }

  function averagePointer(): { x: number; y: number } {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (const p of pointersRef.current.values()) {
      sx += p.x;
      sy += p.y;
      n++;
    }
    return n ? { x: sx / n, y: sy / n } : { ...panLastRef.current };
  }

  function startStroke(e: React.PointerEvent) {
    if (recognizing) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // A second finger turns the gesture into a two-finger pan. Abandon any
    // draw / snip in progress. The pan locks to a vertical (scroll) or
    // horizontal (page-switch) axis once it crosses a small threshold.
    if (pointersRef.current.size >= 2) {
      gestureRef.current = "pan";
      currentStrokeRef.current = null;
      setSnipRect(null);
      setSnipDragging(false);
      snipStartRef.current = null;
      const avg = averagePointer();
      panStartRef.current = avg;
      panLastRef.current = avg;
      panAxisRef.current = "none";
      redraw();
      return;
    }

    gestureRef.current = "draw";
    setSelectedElementId(null);
    cancelScheduledRecognise();

    if (mode === "snip") {
      const sp = getScreenPoint(e);
      snipStartRef.current = sp;
      setSnipRect({ x: sp.x, y: sp.y, w: 0, h: 0 });
      setSnipDragging(true);
      return;
    }
    const pt = getPoint(e);
    if (mode === "eraser") {
      eraseAt(pt);
      return;
    }

    // Double-tap to select. Two quick, near-stationary pen taps; the second,
    // if it lands on a recognised element, selects it for dragging instead of
    // drawing. Drawing stays primary — a single tap or any real stroke draws.
    const now = Date.now();
    const lt = lastTapRef.current;
    if (
      lt &&
      now - lt.t < DOUBLE_TAP_MS &&
      Math.hypot(pt.x - lt.x, pt.y - lt.y) < DOUBLE_TAP_DIST
    ) {
      lastTapRef.current = null;
      cancelScheduledRecognise();
      // Remove the dot the first tap may have left behind.
      if (lt.dotPushed) {
        const ss = strokesRef.current;
        const last = ss[ss.length - 1];
        if (last && !last.freehand && isDotStroke(last)) ss.pop();
      }
      const hit = topElementAt(pt);
      setSelectedElementId(hit ? hit.id : null);
      currentStrokeRef.current = null;
      bumpStrokes();
      redraw();
      return;
    }

    currentStrokeRef.current = { points: [pt], freehand: mode === "ink" };
    tapDownRef.current = { t: now, x: pt.x, y: pt.y };
    redraw();
  }

  // Topmost recognised element whose bbox contains a document-space point.
  // Later elements render on top, so iterate from the end.
  function topElementAt(pt: Pt): WfElement | null {
    for (let i = elements.length - 1; i >= 0; i--) {
      const b = elements[i].bbox;
      if (pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h) {
        return elements[i];
      }
    }
    return null;
  }

  function continueStroke(e: React.PointerEvent) {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (gestureRef.current === "pan") {
      const avg = averagePointer();
      if (panAxisRef.current === "none") {
        const dx = avg.x - panStartRef.current.x;
        const dy = avg.y - panStartRef.current.y;
        if (Math.max(Math.abs(dx), Math.abs(dy)) > 12) {
          panAxisRef.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
        }
      }
      if (panAxisRef.current === "v") {
        // Fingers moving down reveal content above → scrollY decreases.
        applyScroll(scrollYRef.current - (avg.y - panLastRef.current.y));
      }
      // Horizontal panning has no live effect — the page switch fires on
      // release once the swipe distance is known.
      panLastRef.current = avg;
      return;
    }
    if (e.buttons === 0) return;
    if (mode === "snip") {
      const start = snipStartRef.current;
      if (!start) return;
      const sp = getScreenPoint(e);
      setSnipRect({
        x: Math.min(start.x, sp.x),
        y: Math.min(start.y, sp.y),
        w: Math.abs(sp.x - start.x),
        h: Math.abs(sp.y - start.y),
      });
      return;
    }
    const pt = getPoint(e);
    if (mode === "eraser") {
      eraseAt(pt);
      return;
    }
    if (!currentStrokeRef.current) return;
    currentStrokeRef.current.points.push(pt);
    redraw();
  }

  function endStroke(e: React.PointerEvent) {
    pointersRef.current.delete(e.pointerId);
    if (gestureRef.current === "pan") {
      // Stay in pan until every finger lifts — don't resume drawing with a
      // leftover finger mid-gesture.
      if (pointersRef.current.size === 0) {
        // A horizontal swipe past the threshold switches page.
        if (panAxisRef.current === "h") {
          const dx = panLastRef.current.x - panStartRef.current.x;
          if (dx <= -60) switchToPage(currentPage + 1);
          else if (dx >= 60) switchToPage(currentPage - 1);
        }
        gestureRef.current = "idle";
        panAxisRef.current = "none";
      }
      return;
    }
    if (pointersRef.current.size === 0) gestureRef.current = "idle";

    if (mode === "snip") {
      setSnipDragging(false);
      snipStartRef.current = null;
      // Tiny accidental clicks shouldn't leave a confirm bar floating.
      setSnipRect((prev) => (prev && (prev.w < 6 || prev.h < 6) ? null : prev));
      return;
    }
    const cs = currentStrokeRef.current;
    if (mode !== "eraser" && cs && cs.points.length > 1) {
      strokesRef.current.push(cs);
      bumpStrokes();
      // Auto-recognise on idle. Re-armed on every stroke end and cancelled
      // on every new stroke start, so the user can draw multiple strokes
      // in quick succession without recognition firing mid-sketch. Ink
      // strokes are excluded by runRecognition itself, so this path is
      // safe regardless of mode. Skipped entirely in manual mode — the user
      // triggers recognition with the Recognise button instead.
      if (autoRecognise) {
        cancelScheduledRecognise();
        recogniseTimerRef.current = setTimeout(() => {
          recogniseTimerRef.current = null;
          runRecognition();
        }, 1200);
      }
    }

    // Remember a quick, near-stationary tap so the next one nearby can be read
    // as a double-tap select. A wobble tap leaves a dot (points > 1); a still
    // tap leaves nothing but is still worth remembering.
    if (cs && (mode === "pen" || mode === "ink") && tapDownRef.current) {
      const ext = strokeExtent(cs.points);
      const elapsed = Date.now() - tapDownRef.current.t;
      lastTapRef.current =
        elapsed < DOUBLE_TAP_MS && ext.w <= TAP_MOVE_MAX && ext.h <= TAP_MOVE_MAX
          ? {
              t: Date.now(),
              x: tapDownRef.current.x,
              y: tapDownRef.current.y,
              dotPushed: cs.points.length > 1,
            }
          : null;
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

  // Capture the whole document (not just the viewport) as a PNG. The canvas
  // bitmap and element layer are temporarily expanded to the full page
  // height, captured, then restored. Imperative throughout so no React
  // re-render is needed mid-capture.
  async function captureFullPage(): Promise<string> {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const layer = elementsLayerRef.current;
    if (!container || !canvas) return "";

    let bottom = size.h;
    for (const el of elements) bottom = Math.max(bottom, el.bbox.y + el.bbox.h);
    for (const s of strokesRef.current) {
      for (const p of s.points) bottom = Math.max(bottom, p.y);
    }
    const pageH = Math.ceil(bottom + 24);
    const dpr = dprRef.current;

    const saved = {
      scroll: scrollYRef.current,
      cw: canvas.width,
      ch: canvas.height,
      csh: canvas.style.height,
      ct: canvas.style.transform,
      lt: layer?.style.transform ?? "",
      ltr: layer?.style.transition ?? "",
      lh: layer?.style.height ?? "",
      overflow: container.style.overflow,
    };

    try {
      scrollYRef.current = 0;
      canvas.width = Math.round(size.w * dpr);
      canvas.height = Math.round(pageH * dpr);
      canvas.style.height = `${pageH}px`;
      canvas.style.transform = "translateY(0)";
      redraw();
      if (layer) {
        layer.style.transform = "translateY(0)";
        layer.style.transition = "none";
        layer.style.height = `${pageH}px`;
      }
      container.style.overflow = "visible";
      return await captureWireframePng(container, { width: size.w, height: pageH });
    } finally {
      scrollYRef.current = saved.scroll;
      canvas.width = saved.cw;
      canvas.height = saved.ch;
      canvas.style.height = saved.csh;
      canvas.style.transform = saved.ct;
      if (layer) {
        layer.style.transform = saved.lt;
        layer.style.transition = saved.ltr;
        layer.style.height = saved.lh;
      }
      container.style.overflow = saved.overflow;
      redraw();
    }
  }

  async function downloadSnip() {
    if (!snipRect || !containerRef.current) return;
    setSnipSaving(true);
    try {
      const dataUrl = await captureWireframePng(containerRef.current, { region: snipRect });
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

  // Recognise a specific set of clusters: rank each against trained templates,
  // fall back to geometric classification, stamp the elements, and clear the
  // strokes that were consumed. Shared by auto-recognition (all clusters) and
  // the per-doodle Recognise buttons (a single cluster).
  const recogniseClusters = useCallback((clusters: StrokeCluster<Stroke>[]) => {
    const stamped: WfElement[] = [];
    const matchedStrokes = new Set<Stroke>();

    for (const { strokes: cluster, isContainer } of clusters) {
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
      const bbox = aggregateStrokeBbox(strokesAtCall);

      if (!top || !accept) {
        // No confident trained-template match. Fall back to geometric
        // classification so an untrained / first-time doodle still
        // produces something. A detected container is always a card.
        // Heuristic guesses carry no templateId.
        const guess = isContainer
          ? { type: "card" as ElementType, confidence: 0.6 }
          : classifyShape(strokesAtCall);
        if (guess) {
          stamped.push({
            id: `${Date.now()}-${stamped.length}-geo`,
            type: guess.type,
            bbox: snapToStandard(guess.type, bbox),
          });
          for (const s of cluster) matchedStrokes.add(s);
        }
        continue;
      }

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
      // First successful recognition: teach the (otherwise hidden) drag
      // gesture once, since elements no longer grab single taps.
      if (typeof window !== "undefined" && window.localStorage.getItem(DBLTAP_HINT_KEY) !== "shown") {
        window.localStorage.setItem(DBLTAP_HINT_KEY, "shown");
        setFlash({ kind: "info", text: "Double-tap an element to move it" });
      } else if (stamped.length === 1) {
        setFlash({ kind: "local", text: `Matched as ${stamped[0].type}` });
      } else {
        setFlash({ kind: "local", text: `Matched ${stamped.length} elements` });
      }
      bumpStrokes();
      redraw();
      return;
    }

    // Neither templates nor geometry produced anything — the doodle was
    // too small or degenerate to read. Keep the strokes so the user can
    // redraw or train, and point them at Learn my style.
    setFlash({
      kind: "info",
      text: "Couldn't read that",
      action: {
        label: "Learn my style",
        onClick: () => {
          setFlash(null);
          setLearnOpen(true);
        },
      },
    });
  }, [redraw, bumpStrokes]);

  // Recognise everything on the canvas at once. Used by auto-recognition (on
  // idle) and is the all-in-one path; per-doodle buttons call recogniseClusters
  // with just their own cluster.
  const runRecognition = useCallback(() => {
    if (inFlightRef.current) return;
    const recognisable = strokesRef.current.filter((s) => !s.freehand);
    if (recognisable.length === 0) return;
    recogniseClusters(clusterStrokes(recognisable));
  }, [recogniseClusters]);

  function clearAll() {
    strokesRef.current = [];
    currentStrokeRef.current = null;
    setElements([]);
    scrollYRef.current = 0;
    setScrollY(0);
    bumpStrokes();
    redraw();
  }

  // Snapshot the live current-page state back into pages[]. The arrays are
  // copied so a stored page never shares a reference with the live state —
  // otherwise drawing on one page could mutate another's strokes.
  function snapshotCurrentPage(prev: PageSnapshot[]): PageSnapshot[] {
    const next = [...prev];
    next[currentPage] = {
      ...next[currentPage],
      elements: [...elements],
      strokes: [...strokesRef.current],
      scrollY: scrollYRef.current,
    };
    return next;
  }

  // Load a page's stored state into the live working state. Arrays are
  // copied for the same isolation reason as snapshotCurrentPage.
  function loadPage(page: PageSnapshot) {
    cancelScheduledRecognise();
    strokesRef.current = [...page.strokes];
    currentStrokeRef.current = null;
    scrollYRef.current = page.scrollY;
    setElements([...page.elements]);
    setScrollY(page.scrollY);
    setSelectedElementId(null);
    bumpStrokes();
    redraw();
  }

  function switchToPage(target: number) {
    if (target === currentPage || target < 0 || target >= pages.length) return;
    const targetPage = pages[target];
    setPages(snapshotCurrentPage);
    setCurrentPage(target);
    loadPage(targetPage);
  }

  function addPage() {
    const newIndex = pages.length;
    setPages((prev) => [
      ...snapshotCurrentPage(prev),
      { id: makePageId(), elements: [], strokes: [], scrollY: 0 },
    ]);
    setCurrentPage(newIndex);
    loadPage({ id: "", elements: [], strokes: [], scrollY: 0 });
  }

  // Delete the current page and move to a neighbour. The last page can't
  // be deleted — there is always at least one.
  function deleteCurrentPage() {
    if (pages.length <= 1) return;
    const remaining = pages.filter((_, i) => i !== currentPage);
    const newCurrent = currentPage > 0 ? currentPage - 1 : 0;
    setPages(remaining);
    setCurrentPage(newCurrent);
    loadPage(remaining[newCurrent]);
  }

  // Reset the whole document to a single blank page. Trained recogniser
  // templates are left alone — those are reset from Learn my style.
  function clearAllPages() {
    const blank: PageSnapshot = { id: makePageId(), elements: [], strokes: [], scrollY: 0 };
    setPages([blank]);
    setCurrentPage(0);
    loadPage(blank);
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((e) => e.id !== id));
    setSelectedElementId((current) => (current === id ? null : current));
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

  function updateLevel(id: string, level: number) {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, level } : e)));
  }

  function updateVariant(id: string, variant: "primary" | "secondary") {
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, variant } : e)));
  }

  // Clean up any pending recognise schedule when the canvas unmounts.
  useEffect(() => cancelScheduledRecognise, []);

  const dotIndices = findDotStrokes(strokesRef.current);
  // Shown whenever the canvas is empty — a friendly nudge to start drawing.
  const showLearnHint = strokesRef.current.length === 0 && elements.length === 0;
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
        onWheel={(e) => applyScroll(scrollYRef.current + e.deltaY)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          transform: `translateY(${-keyboardShift}px)`,
          transition: "transform 0.2s ease",
        }}
      />

      {showLearnHint && <LearnHint />}

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
          wireframe is what the user mostly sees. Translated by the scroll
          offset (elements are in document coordinates) plus any keyboard
          shift. */}
      <div
        ref={elementsLayerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          transform: `translateY(${-(scrollY + keyboardShift)}px)`,
          transition: keyboardShift > 0 ? "transform 0.2s ease" : "none",
        }}
      >
        {elements.map((el, i) => (
          <ElementCell
            key={el.id}
            element={el}
            selected={selectedElementId === el.id}
            onDeselect={() => setSelectedElementId(null)}
            onMove={(dx, dy) => moveElement(el.id, dx, dy)}
            onResize={(bbox) => resizeElement(el.id, bbox)}
            onRemove={() => removeElement(el.id)}
            onLabelChange={(label) => updateLabel(el.id, label)}
            onTypeChange={(type) => updateType(el.id, type)}
            onLevelChange={(level) => updateLevel(el.id, level)}
            onVariantChange={(variant) => updateVariant(el.id, variant)}
            onLayer={(direction) => moveLayer(el.id, direction)}
            onFeedback={(correct) => recordFeedback(el.id, correct)}
            canForward={i < elements.length - 1}
            canBackward={i > 0}
          />
        ))}
      </div>

      {/* Ink overlay. Sits above the elements layer so live and committed
          doodles always render on top of the recognised wireframe boxes.
          pointerEvents: none so it never intercepts — the bottom canvas
          handles all gestures, and selected-element handles below stay
          reachable. */}
      <canvas
        ref={inkCanvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
          pointerEvents: "none",
          transform: `translateY(${-keyboardShift}px)`,
          transition: "transform 0.2s ease",
        }}
      />

      {(elements.length > 0 || strokesRef.current.length > 0 || scrollY > 0) && (
        <ScrollHandle
          scrollY={scrollY}
          maxScroll={maxScrollY()}
          viewportH={size.h}
          onScroll={applyScroll}
        />
      )}

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
        <TopBar />
        <PageIndicator
          count={pages.length}
          current={currentPage}
          onSelect={switchToPage}
          onAdd={addPage}
        />
        <Toolbar
          mode={mode}
          setMode={changeMode}
          onClear={clearAll}
          onExport={() => setShowExport(true)}
          onLearn={() => setLearnOpen(true)}
          onDeletePage={deleteCurrentPage}
          onClearAllPages={clearAllPages}
          canDeletePage={pages.length > 1}
          templateCount={templateCount}
          hasContent={elements.length > 0 || strokesRef.current.length > 0}
          autoRecognise={autoRecognise}
          onToggleAutoRecognise={() => setAutoRecognise((v) => !v)}
        />
        {dotIndices.map(({ index, x, y }) => (
          <DotDeleteButton
            key={`${index}-${x}-${y}`}
            x={x}
            y={y - scrollY}
            onClick={() => removeStrokeAt(index)}
          />
        ))}
        {/* Manual mode: a Recognise button floats beside each separate doodle
            so the user can convert them one at a time. Hidden in auto mode. */}
        {!autoRecognise &&
          clusterStrokes(strokesRef.current.filter((s) => !s.freehand)).map((cluster, i) => {
            const b = aggregateStrokeBbox(cluster.strokes);
            if (b.w <= DOT_THRESHOLD && b.h <= DOT_THRESHOLD) return null;
            return (
              <ClusterRecogniseButton
                key={`rec-${i}-${Math.round(b.x)}-${Math.round(b.y)}`}
                x={b.x + b.w}
                y={b.y - scrollY}
                onClick={() => recogniseClusters([cluster])}
              />
            );
          })}
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
        <FlashPill message={flash} />
      </div>
      {showExport && (
        <ExportDialog
          elements={elements}
          size={size}
          isTouch={isTouch}
          onCaptureFullPage={captureFullPage}
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

// A "dot" is a stroke whose bbox is tiny in both dimensions — almost always
// an accidental click rather than an intentional mark. We surface a small ×
// next to each so they can be removed without switching to the eraser.
const DOT_THRESHOLD = 6;

// Width/height span of a set of points. Used to tell a tap from a stroke.
function strokeExtent(points: Pt[]): { w: number; h: number } {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX)) return { w: 0, h: 0 };
  return { w: maxX - minX, h: maxY - minY };
}

function isDotStroke(stroke: Stroke): boolean {
  const ext = strokeExtent(stroke.points);
  return ext.w <= DOT_THRESHOLD && ext.h <= DOT_THRESHOLD;
}

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

// Empty-canvas encouragement. Plain, non-interactive grey text — it fades
// out the moment the user starts drawing (gated by showLearnHint).
function LearnHint() {
  return (
    <div
      data-skip-export="1"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 25,
      }}
    >
      <span
        style={{
          color: "rgba(0,0,0,0.32)",
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: "0.01em",
        }}
      >
        Doodles away!
      </span>
    </div>
  );
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

// Floats beside an un-recognised doodle in manual mode. Tapping it recognises
// just that doodle's cluster into a wireframe element.
function ClusterRecogniseButton({ x, y, onClick }: { x: number; y: number; onClick: () => void }) {
  return (
    <button
      type="button"
      data-skip-export="1"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label="Recognise this drawing"
      title="Recognise this drawing"
      style={{
        position: "absolute",
        left: x + 8,
        top: y - 6,
        height: 28,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "0 10px",
        background: "#0a0a0a",
        color: "#ffffff",
        border: "none",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
        cursor: "pointer",
        pointerEvents: "auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        zIndex: 46,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="11" height="11" rx="2" />
        <circle cx="16" cy="16" r="5" />
      </svg>
      Recognise
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

// True when the app is running inside the Capacitor iOS shell. Capacitor
// sets `window.Capacitor` before our bundle runs, so this resolves
// synchronously on first render — no flash of the wrong chrome.
function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return cap?.isNativePlatform?.() === true;
}

function TopBar() {
  // On native, the top bar is empty (no back link, no wordmark, no actions),
  // so we don't render it at all. On the web, it's used to navigate back to
  // neilmcardle.com — keep that affordance.
  const isNative = isNativeApp();
  if (isNative) return null;
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
    </header>
  );
}

type FlashKind = "local" | "removed" | "info";

interface FlashMessage {
  kind: FlashKind;
  text: string;
  // Optional inline action. Renders a tappable button in the pill; an
  // actionable flash also stays on screen longer and captures pointer
  // events so the button is reachable.
  action?: { label: string; onClick: () => void };
}

// Status dot colour per flash kind. The pill itself is always a clean white
// pill with a thin border — matching the Recognise pill and the rest of the
// app's chrome — so the dot carries the meaning. Amber (not red) for info:
// "not recognised" is a gentle heads-up, not a failure.
const FLASH_DOT: Record<FlashKind, string> = {
  local: "#16a34a",
  removed: "#dc2626",
  info: "#f59e0b",
};

interface ScrollHandleProps {
  scrollY: number;
  maxScroll: number;
  viewportH: number;
  onScroll: (y: number) => void;
}

// Visible, one-finger-draggable scroll thumb on the right edge. Two-finger
// pan still works, but this is the discoverable affordance — and shows how
// far down the page you are. The hit area is wide for fingertips; the
// visible bar inside is thin.
function ScrollHandle({ scrollY, maxScroll, viewportH, onScroll }: ScrollHandleProps) {
  if (maxScroll <= 0 || viewportH <= 0) return null;
  const MARGIN_TOP = 60;
  const MARGIN_BOTTOM = 96;
  const trackH = Math.max(80, viewportH - MARGIN_TOP - MARGIN_BOTTOM);
  const docH = maxScroll + viewportH;
  const thumbH = Math.max(44, (viewportH / docH) * trackH);
  const thumbTop = (scrollY / maxScroll) * (trackH - thumbH);

  function startDrag(e: React.PointerEvent) {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const startClientY = e.clientY;
    const startScroll = scrollY;
    const span = trackH - thumbH;

    function move(ev: PointerEvent) {
      if (span <= 0) return;
      const delta = ((ev.clientY - startClientY) / span) * maxScroll;
      onScroll(startScroll + delta);
    }
    function up() {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
    }
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);
  }

  return (
    <div
      data-skip-export="1"
      style={{
        position: "absolute",
        top: MARGIN_TOP,
        right: "calc(2px + env(safe-area-inset-right, 0px))",
        width: 28,
        height: trackH,
        pointerEvents: "none",
        zIndex: 35,
      }}
    >
      <div
        onPointerDown={startDrag}
        style={{
          position: "absolute",
          top: thumbTop,
          right: 0,
          width: 28,
          height: thumbH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "grab",
          touchAction: "none",
          pointerEvents: "auto",
        }}
      >
        <span
          style={{
            width: 5,
            height: "100%",
            borderRadius: 999,
            background: "rgba(10,10,10,0.28)",
          }}
        />
      </div>
    </div>
  );
}

// One row in the Settings dropdown. Destructive rows turn red and, once
// `confirming`, show "Tap again to confirm" instead of their label.
function SettingsItem({
  label,
  icon,
  badge,
  destructive,
  confirming,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  destructive?: boolean;
  confirming?: boolean;
  onClick: () => void;
}) {
  const idleBg = confirming ? "rgba(220,38,38,0.1)" : "transparent";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        background: idleBg,
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: confirming ? 600 : 500,
        color: confirming || destructive ? "#dc2626" : "#0a0a0a",
        cursor: "pointer",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        if (!confirming) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = idleBg;
      }}
    >
      {icon}
      <span style={{ flex: 1 }}>{confirming ? "Tap again to confirm" : label}</span>
      {badge != null && (
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
        >
          {badge}
        </span>
      )}
    </button>
  );
}

interface PageIndicatorProps {
  count: number;
  current: number;
  onSelect: (i: number) => void;
  onAdd: () => void;
}

// Top-centre pill: a dot per page (current one filled) plus a + to add a
// page. Tapping a dot switches page; two-finger horizontal swipe does too.
function PageIndicator({ count, current, onSelect, onAdd }: PageIndicatorProps) {
  return (
    <div
      data-skip-export="1"
      style={{
        position: "absolute",
        top: "calc(10px + env(safe-area-inset-top, 0px))",
        left: "50%",
        transform: "translateX(-50%)",
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        padding: "5px 8px",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 999,
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        pointerEvents: "auto",
        zIndex: 40,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Page ${i + 1}`}
          title={`Page ${i + 1}`}
          style={{
            width: 26,
            height: 26,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: 999,
            cursor: "pointer",
            padding: 0,
          }}
        >
          <span
            style={{
              width: i === current ? 9 : 7,
              height: i === current ? 9 : 7,
              borderRadius: 999,
              background: i === current ? "#0a0a0a" : "rgba(0,0,0,0.22)",
              transition: "width 0.15s, height 0.15s, background 0.15s",
            }}
          />
        </button>
      ))}
      <div style={{ width: 1, height: 14, background: "rgba(0,0,0,0.1)", margin: "0 3px" }} />
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add page"
        title="Add page"
        style={{
          width: 26,
          height: 26,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          borderRadius: 999,
          cursor: "pointer",
          padding: 0,
          color: "#0a0a0a",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}

function FlashPill({ message }: { message: FlashMessage | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          key={message.text}
          // x stays at -50% through every state so the pill is centred;
          // y animates the slide-in. Centring via a CSS transform here
          // would be clobbered by Framer Motion's own transform.
          initial={{ opacity: 0, x: "-50%", y: 8 }}
          animate={{ opacity: 1, x: "-50%", y: 0 }}
          exit={{ opacity: 0, x: "-50%", y: 6 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: "absolute",
            // Sits just above the bottom toolbar (toolbar bottom offset 24
            // + toolbar height ~40 + a 14 gap), clear of the home indicator.
            bottom: "calc(78px + env(safe-area-inset-bottom, 0px))",
            left: "50%",
            zIndex: 45,
            // Actionable flashes need taps to reach the button.
            pointerEvents: message.action ? "auto" : "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            maxWidth: "min(86vw, 420px)",
            padding: message.action ? "5px 5px 5px 14px" : "9px 15px",
            background: "#ffffff",
            color: "#0a0a0a",
            border: "1px solid rgba(0,0,0,0.1)",
            borderRadius: 999,
            fontSize: 12.5,
            fontWeight: 500,
            lineHeight: 1.35,
            letterSpacing: "0.005em",
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: 7,
              height: 7,
              borderRadius: 999,
              background: FLASH_DOT[message.kind],
            }}
          />
          <span style={{ whiteSpace: "nowrap" }}>{message.text}</span>
          {message.action && (
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                message.action!.onClick();
              }}
              style={{
                flexShrink: 0,
                padding: "0 12px",
                height: 28,
                background: "#0a0a0a",
                color: "#ffffff",
                border: "none",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {message.action.label}
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ToolbarProps {
  mode: Mode;
  setMode: (m: Mode) => void;
  onClear: () => void;
  onExport: () => void;
  onLearn: () => void;
  onDeletePage: () => void;
  onClearAllPages: () => void;
  canDeletePage: boolean;
  templateCount: number;
  hasContent: boolean;
  autoRecognise: boolean;
  onToggleAutoRecognise: () => void;
}

function Toolbar({
  mode,
  setMode,
  onClear,
  onExport,
  onLearn,
  onDeletePage,
  onClearAllPages,
  canDeletePage,
  templateCount,
  hasContent,
  autoRecognise,
  onToggleAutoRecognise,
}: ToolbarProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // A destructive settings entry needs a second tap to confirm.
  const [pendingConfirm, setPendingConfirm] = useState<"delete-page" | "clear-all" | null>(null);
  const settingsRef = useRef<HTMLDivElement | null>(null);

  // Close the settings menu when tapping elsewhere.
  useEffect(() => {
    if (!settingsOpen) return;
    function onDocDown(e: PointerEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [settingsOpen]);

  // A pending confirm resets when the menu closes, or after a short pause.
  useEffect(() => {
    if (!settingsOpen) setPendingConfirm(null);
  }, [settingsOpen]);
  useEffect(() => {
    if (!pendingConfirm) return;
    const t = setTimeout(() => setPendingConfirm(null), 4000);
    return () => clearTimeout(t);
  }, [pendingConfirm]);

  function handleDeletePage() {
    if (pendingConfirm === "delete-page") {
      setPendingConfirm(null);
      setSettingsOpen(false);
      onDeletePage();
    } else {
      setPendingConfirm("delete-page");
    }
  }

  function handleClearAllPages() {
    if (pendingConfirm === "clear-all") {
      setPendingConfirm(null);
      setSettingsOpen(false);
      onClearAllPages();
    } else {
      setPendingConfirm("clear-all");
    }
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
      {!confirmingClear && (
        <>
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
                <path d="M3 13c1.5-7 3-7 4.5 0s3 7 4.5 0 3-7 4.5 0 3 7 4.5 0" />
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
          <button
            type="button"
            onClick={onToggleAutoRecognise}
            aria-label={`Auto-gen ${autoRecognise ? "on" : "off"}`}
            title={`Auto-generate is ${autoRecognise ? "on" : "off"} — tap to turn ${autoRecognise ? "off" : "on"}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              height: 32,
              padding: "0 10px",
              borderRadius: 999,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "rgba(0,0,0,0.7)",
              fontSize: 11,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            <span>Auto-gen</span>
            <span
              aria-hidden="true"
              style={{
                position: "relative",
                width: 30,
                height: 17,
                flexShrink: 0,
                borderRadius: 999,
                background: autoRecognise ? "#0a0a0a" : "rgba(0,0,0,0.2)",
                transition: "background 0.15s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: autoRecognise ? 15 : 2,
                  width: 13,
                  height: 13,
                  borderRadius: 999,
                  background: "#ffffff",
                  transition: "left 0.15s",
                }}
              />
            </span>
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)", margin: "0 4px" }} />
        </>
      )}
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
      {!confirmingClear && (
        <>
          <button
            type="button"
            onClick={onExport}
            disabled={!hasContent}
            aria-label="Export"
            title="Export"
            style={{
              marginLeft: 4,
              width: 36,
              height: 32,
              borderRadius: 999,
              background: hasContent ? "#0a0a0a" : "rgba(0,0,0,0.1)",
              color: hasContent ? "#ffffff" : "rgba(0,0,0,0.4)",
              border: "none",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: hasContent ? "pointer" : "not-allowed",
              transition: "background 0.15s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.08)", margin: "0 4px" }} />
          <div ref={settingsRef} style={{ position: "relative", display: "inline-flex" }}>
            <ToolBtn
              active={settingsOpen}
              onClick={() => setSettingsOpen((v) => !v)}
              label="Settings"
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
            />
            {settingsOpen && (
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(100% + 10px)",
                  right: -4,
                  minWidth: 220,
                  background: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 10,
                  boxShadow: "0 10px 28px rgba(0,0,0,0.16)",
                  padding: 4,
                  zIndex: 60,
                }}
              >
                <SettingsItem
                  label="Learn my style"
                  badge={templateCount > 0 ? templateCount : undefined}
                  onClick={() => {
                    setSettingsOpen(false);
                    onLearn();
                  }}
                />
                <SettingsItem
                  label="Support development"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                      <line x1="6" y1="1" x2="6" y2="4" />
                      <line x1="10" y1="1" x2="10" y2="4" />
                      <line x1="14" y1="1" x2="14" y2="4" />
                    </svg>
                  }
                  onClick={() => {
                    setSettingsOpen(false);
                    // Donations on iOS must go through an external web payment;
                    // Apple rejects donation flows that try to use IAP. window.open
                    // routes to Safari via the Capacitor WebView automatically, and
                    // works the same way in a regular browser.
                    window.open("https://buymeacoffee.com/neilmcardle", "_blank", "noopener");
                  }}
                />
                <div style={{ height: 1, background: "rgba(0,0,0,0.08)", margin: "4px 6px" }} />
                {canDeletePage && (
                  <SettingsItem
                    label="Delete this page"
                    destructive
                    confirming={pendingConfirm === "delete-page"}
                    onClick={handleDeletePage}
                  />
                )}
                <SettingsItem
                  label="Clear all pages"
                  destructive
                  confirming={pendingConfirm === "clear-all"}
                  onClick={handleClearAllPages}
                />
              </div>
            )}
          </div>
        </>
      )}
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
  isTouch: boolean;
  onCaptureFullPage: () => Promise<string>;
  onPreviewImage: (dataUrl: string) => void;
  onClose: () => void;
}

type ExportFormat = "html" | "react" | "image";

function ExportDialog({ elements, size, isTouch, onCaptureFullPage, onPreviewImage, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("html");
  // The exported stage must be tall enough for elements below the fold, so
  // the code export uses the document height, not the viewport height.
  const docSize = {
    w: size.w,
    h: elements.reduce((m, el) => Math.max(m, el.bbox.y + el.bbox.h), size.h),
  };
  const code = format === "html" ? exportAsHtml(elements, docSize) : format === "react" ? exportAsReact(elements, docSize) : "";
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
    setDownloading(true);
    setDownloadError(null);
    setDownloadDone(null);
    try {
      const dataUrl = await onCaptureFullPage();
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
        {/* Format tabs in their own row. Short single-word labels so they
            never wrap on a phone. Active tab uses a solid dark fill for
            unambiguous selected state. */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "10px 18px 0",
          }}
        >
          <FormatTab active={format === "html"} onClick={() => setFormat("html")}>HTML</FormatTab>
          <FormatTab active={format === "react"} onClick={() => setFormat("react")}>React</FormatTab>
          <FormatTab active={format === "image"} onClick={() => setFormat("image")}>Image</FormatTab>
        </div>
        {/* Action row, separated from tabs so the dialog reads top-to-bottom:
            title → format → primary action → preview. */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          {format === "image" ? (
            <button
              type="button"
              onClick={downloadImage}
              disabled={downloading}
              style={{
                padding: "0 16px",
                height: 36,
                borderRadius: 999,
                background: downloadDone ? "#16a34a" : "#0a0a0a",
                color: "#ffffff",
                border: "none",
                fontSize: 13,
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
                padding: "0 16px",
                height: 36,
                borderRadius: 999,
                background: copied ? "#16a34a" : "#0a0a0a",
                color: "#ffffff",
                border: "none",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              {copied ? "Copied" : `Copy ${format === "html" ? "HTML" : "React"}`}
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
  onClose: () => void;
}

// Shown on touch devices after a capture. The browser-download path doesn't
// land anywhere visible on iOS, so we show the PNG inline and rely on iOS's
// native long-press-to-save-image gesture. No Web Share API call — it's
// unreliable once any await crosses a user-gesture boundary, and the inline
// long-press flow always works.
function SavedImagePreview({ dataUrl, onClose }: SavedImagePreviewProps) {
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
        </div>
        <div
          style={{ display: "flex", alignItems: "center" }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#ffffff",
              color: "#0a0a0a",
              border: "none",
              padding: "0 22px",
              height: 40,
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 600,
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
        padding: "0 14px",
        height: 32,
        borderRadius: 999,
        background: active ? "#0a0a0a" : "transparent",
        color: active ? "#ffffff" : "rgba(0,0,0,0.6)",
        border: active ? "none" : "1px solid rgba(0,0,0,0.1)",
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 0.15s, color 0.15s, border-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}
