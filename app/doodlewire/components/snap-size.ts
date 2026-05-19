import type { ElementType, WfElement } from "./wireframe-canvas";

type Bbox = WfElement["bbox"];

// Resize behaviour per element type. Drives which handles render and how
// the bbox responds to pointer drags.
//   flowWidth     → right-edge handle only, top-left anchored (height fixed)
//   flowBoth      → right, bottom, and bottom-right corner; top-left anchored
//   centredSquare → bottom-right corner only, centre anchored, w == h
//   centredBoth   → bottom-right corner only, centre anchored, w and h independent
//   none          → no handles
export type ResizeMode = "flowWidth" | "flowBoth" | "centredSquare" | "centredBoth" | "none";

const RESIZE_MODES: Record<ElementType, ResizeMode> = {
  button: "flowWidth",
  input: "flowWidth",
  heading: "flowWidth",
  divider: "flowWidth",
  nav: "flowWidth",
  link: "flowWidth",
  badge: "flowWidth",
  dropdown: "flowWidth",
  // Width-resizable; height follows the typed text via auto-grow.
  text: "flowWidth",
  image: "flowBoth",
  card: "flowBoth",
  icon: "centredSquare",
  toggle: "centredBoth",
};

export function getResizeMode(type: ElementType): ResizeMode {
  return RESIZE_MODES[type] ?? "none";
}

// Discrete preset sizes per type. Three steps where the type supports a
// range; one entry where the dimension is fixed. The first and last entries
// define the min and max for free-drag (⌥ held).
// Shared S/M/L sizes so similar element families align when stacked together.
// Form controls (button, input, dropdown) all use FORM_CONTROL_W so a Save
// button below a text input doesn't drift to a different width step. The
// text element uses CONTENT_W.
const FORM_CONTROL_W = [160, 240, 360];
const CONTENT_W = [240, 360, 520];

const PRESETS: Record<ElementType, { w: number[]; h: number[] }> = {
  button:    { w: FORM_CONTROL_W, h: [40] },
  input:     { w: FORM_CONTROL_W, h: [40] },
  dropdown:  { w: FORM_CONTROL_W, h: [40] },
  // Text starts one line tall (40); height then auto-grows with content.
  text:      { w: CONTENT_W,      h: [40] },
  card:      { w: [280, 400, 520], h: [160, 240, 320] },
  toggle:    { w: [36, 46, 56],   h: [20, 26, 32] },
  heading:   { w: [160, 320, 560], h: [44] },
  image:     { w: [120, 240, 480], h: [90, 180, 360] },
  divider:   { w: [120, 240, 480], h: [2] },
  nav:       { w: [280, 480, 720], h: [48] },
  icon:      { w: [20, 24, 32],   h: [20, 24, 32] },
  link:      { w: [60, 120, 220], h: [24] },
  badge:     { w: [48, 96, 160],  h: [22] },
};

export type ResizeHandle = "e" | "s" | "se";

interface ResizeArgs {
  handle: ResizeHandle;
  dx: number;
  dy: number;
  startBbox: Bbox;
}

// Compute the new bbox during a resize drag. Always snaps to the nearest
// preset — the wireframe stays on a tidy S/M/L step. Flow types are
// top-left anchored; centred types lock the centre.
export function resizeBbox(type: ElementType, args: ResizeArgs): Bbox {
  const mode = getResizeMode(type);
  if (mode === "none") return args.startBbox;
  const presets = PRESETS[type];
  const { handle, dx, dy, startBbox } = args;
  const centred = mode === "centredSquare" || mode === "centredBoth";
  // Centred resize doubles the pointer delta because the opposite edge moves
  // by the same amount in the opposite direction. This keeps the handle
  // glued to the pointer.
  const scale = centred ? 2 : 1;

  let targetW = startBbox.w;
  let targetH = startBbox.h;
  if (handle === "e" || handle === "se") targetW = startBbox.w + dx * scale;
  if (handle === "s" || handle === "se") targetH = startBbox.h + dy * scale;
  if (mode === "centredSquare") {
    const side = Math.max(targetW, targetH);
    targetW = side;
    targetH = side;
  }

  const w = nearestPreset(presets.w, targetW);
  const h = nearestPreset(presets.h, targetH);

  if (centred) {
    const cx = startBbox.x + startBbox.w / 2;
    const cy = startBbox.y + startBbox.h / 2;
    return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
  }
  return { x: startBbox.x, y: startBbox.y, w, h };
}

function nearestPreset(options: number[], target: number): number {
  if (options.length === 1) return options[0];
  let best = options[0];
  let bestDist = Math.abs(target - best);
  for (const o of options) {
    const d = Math.abs(target - o);
    if (d < bestDist) {
      best = o;
      bestDist = d;
    }
  }
  return best;
}

// Snap a recognised doodle bbox to a standard, well-proportioned size for
// its component type. Picks the nearest S/M/L preset rather than a
// continuous clamp, so recognised elements arrive at the same discrete
// widths their resize handles snap to and similar families align when
// stacked. Anchored top-left for flowable elements, centred at the
// doodle's centroid for icon-like fixed-size elements.
export function snapToStandard(type: ElementType, bbox: Bbox): Bbox {
  const presets = PRESETS[type];
  if (!presets) return bbox;
  const mode = getResizeMode(type);
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;

  if (mode === "centredSquare") {
    const drawnMaxDim = Math.max(bbox.w, bbox.h);
    const side = nearestPreset(presets.w, drawnMaxDim);
    return { x: Math.round(cx - side / 2), y: Math.round(cy - side / 2), w: side, h: side };
  }

  const w = nearestPreset(presets.w, Math.round(bbox.w));
  const h = nearestPreset(presets.h, Math.round(bbox.h));

  if (mode === "centredBoth") {
    return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
  }
  return { x: Math.round(bbox.x), y: Math.round(bbox.y), w, h };
}
