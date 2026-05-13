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
  textarea: "flowBoth",
  paragraph: "flowBoth",
  image: "flowBoth",
  container: "flowBoth",
  card: "flowBoth",
  checkbox: "centredSquare",
  radio: "centredSquare",
  avatar: "centredSquare",
  icon: "centredSquare",
  menu: "centredSquare",
  toggle: "centredBoth",
};

export function getResizeMode(type: ElementType): ResizeMode {
  return RESIZE_MODES[type] ?? "none";
}

// Discrete preset sizes per type. Three steps where the type supports a
// range; one entry where the dimension is fixed. The first and last entries
// define the min and max for free-drag (⌥ held).
const PRESETS: Record<ElementType, { w: number[]; h: number[] }> = {
  button:    { w: [96, 144, 240],  h: [40] },
  input:     { w: [180, 280, 360], h: [40] },
  textarea:  { w: [220, 360, 480], h: [80, 140, 240] },
  checkbox:  { w: [16, 20, 24],    h: [16, 20, 24] },
  radio:     { w: [16, 20, 24],    h: [16, 20, 24] },
  toggle:    { w: [36, 46, 56],    h: [20, 26, 32] },
  heading:   { w: [160, 320, 560], h: [44] },
  paragraph: { w: [240, 360, 520], h: [56, 120, 200] },
  image:     { w: [120, 240, 480], h: [90, 180, 360] },
  container: { w: [200, 360, 560], h: [120, 240, 360] },
  card:      { w: [280, 380, 480], h: [160, 240, 320] },
  divider:   { w: [120, 240, 480], h: [2] },
  nav:       { w: [280, 480, 720], h: [48] },
  avatar:    { w: [32, 48, 64],    h: [32, 48, 64] },
  icon:      { w: [20, 24, 32],    h: [20, 24, 32] },
  link:      { w: [60, 120, 220],  h: [24] },
  badge:     { w: [48, 96, 160],   h: [22] },
  dropdown:  { w: [160, 240, 320], h: [40] },
  menu:      { w: [40, 52, 64],    h: [40, 52, 64] },
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
// its component type. Anchored top-left for flowable elements, centred at
// the doodle's centroid for icon-like fixed-size elements.
export function snapToStandard(type: ElementType, bbox: Bbox): Bbox {
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  const drawnMaxDim = Math.max(bbox.w, bbox.h);

  function centred(w: number, h: number): Bbox {
    return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
  }

  // Centred element whose size tracks the user's drawing within a range.
  // Square aspect: the larger of width or height drives the side. Use
  // for icon-buttons, avatars, checkboxes, etc.
  function centredSquare(min: number, max: number): Bbox {
    const side = Math.round(clamp(drawnMaxDim, min, max));
    return { x: Math.round(cx - side / 2), y: Math.round(cy - side / 2), w: side, h: side };
  }

  function flow(w: number, h: number): Bbox {
    return { x: Math.round(bbox.x), y: Math.round(bbox.y), w, h };
  }

  function clamp(v: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, v));
  }

  switch (type) {
    case "button":
      return flow(clamp(Math.round(bbox.w), 96, 240), 40);
    case "input":
      return flow(clamp(Math.round(bbox.w), 180, 360), 40);
    case "textarea":
      return flow(clamp(Math.round(bbox.w), 220, 480), clamp(Math.round(bbox.h), 80, 240));
    case "checkbox":
      return centredSquare(16, 24);
    case "radio":
      return centredSquare(16, 24);
    case "toggle": {
      const w = Math.round(clamp(bbox.w, 36, 56));
      const h = Math.round(clamp(w * 0.55, 20, 32));
      return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w, h };
    }
    case "heading":
      return flow(clamp(Math.round(bbox.w), 160, 560), 44);
    case "paragraph":
      return flow(clamp(Math.round(bbox.w), 240, 520), clamp(Math.round(bbox.h), 56, 200));
    case "image":
      return flow(clamp(Math.round(bbox.w), 120, 480), clamp(Math.round(bbox.h), 90, 360));
    case "container":
      return flow(Math.max(160, Math.round(bbox.w)), Math.max(120, Math.round(bbox.h)));
    case "card":
      return flow(clamp(Math.round(bbox.w), 280, 480), clamp(Math.round(bbox.h), 160, 320));
    case "divider":
      return flow(clamp(Math.round(bbox.w), 120, 480), 2);
    case "nav":
      return flow(clamp(Math.round(bbox.w), 280, 720), 48);
    case "avatar":
      return centredSquare(32, 64);
    case "icon":
      return centredSquare(20, 32);
    case "link":
      return flow(clamp(Math.round(bbox.w), 60, 220), 24);
    case "badge":
      return flow(clamp(Math.round(bbox.w), 48, 160), 22);
    case "dropdown":
      return flow(clamp(Math.round(bbox.w), 160, 320), 40);
    case "menu":
      return centredSquare(40, 64);
    default:
      return bbox;
  }
}
