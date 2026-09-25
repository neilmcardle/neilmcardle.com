import type { VectorPaintOrientation } from "./products";

export interface Stroke {
  c: string;
  w: number;
  p: number[];
}

export interface Drawing {
  id: string;
  name: string;
  orientation: VectorPaintOrientation;
  strokes: Stroke[];
  createdAt: number;
  updatedAt: number;
}

export interface DrawingPayload {
  orientation: VectorPaintOrientation;
  strokes: Stroke[];
}

export const PAGE_SHORT = 1500;
export const PAGE_LONG = 2000;
export const PAPER = "#FFFFFF";

export function pageSize(orientation: VectorPaintOrientation) {
  return orientation === "portrait"
    ? { w: PAGE_SHORT, h: PAGE_LONG }
    : { w: PAGE_LONG, h: PAGE_SHORT };
}

export const PAINTS = [
  { name: "Crayon", hex: "#1C1917" },
  { name: "Tomato", hex: "#E8412A" },
  { name: "Tangerine", hex: "#FF8A1F" },
  { name: "Sunshine", hex: "#FFC72C" },
  { name: "Leaf", hex: "#2FA35B" },
  { name: "Mint", hex: "#7ED9B0" },
  { name: "Sky", hex: "#3BA7F0" },
  { name: "Navy", hex: "#24408F" },
  { name: "Grape", hex: "#8B4FD6" },
  { name: "Bubblegum", hex: "#FF6FB1" },
  { name: "Cocoa", hex: "#8A5A3C" },
  { name: "Peach", hex: "#FFC9A8" },
] as const;

export const BRUSHES = [
  { name: "Thin", w: 10 },
  { name: "Medium", w: 22 },
  { name: "Thick", w: 44 },
  { name: "Huge", w: 84 },
] as const;

const LIMITS = {
  strokes: 4000,
  pointsPerStroke: 20000,
  totalPoints: 400000,
  minW: 2,
  maxW: 160,
  coordMin: -200,
  coordMax: PAGE_LONG + 200,
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function round(n: number) {
  return Math.round(n * 10) / 10;
}

export function strokePath(p: number[]): string {
  const n = p.length / 2;
  if (n === 0) return "";
  if (n === 1) return `M${round(p[0])} ${round(p[1])}l0.1 0`;
  if (n === 2)
    return `M${round(p[0])} ${round(p[1])}L${round(p[2])} ${round(p[3])}`;
  let d = `M${round(p[0])} ${round(p[1])}`;
  for (let i = 1; i < n - 1; i++) {
    const x = p[i * 2];
    const y = p[i * 2 + 1];
    const mx = (x + p[i * 2 + 2]) / 2;
    const my = (y + p[i * 2 + 3]) / 2;
    d += `Q${round(x)} ${round(y)} ${round(mx)} ${round(my)}`;
  }
  d += `L${round(p[p.length - 2])} ${round(p[p.length - 1])}`;
  return d;
}

export function parseDrawingPayload(input: unknown): DrawingPayload | null {
  if (!input || typeof input !== "object") return null;
  const { orientation, strokes } = input as Record<string, unknown>;
  if (orientation !== "portrait" && orientation !== "landscape") return null;
  if (
    !Array.isArray(strokes) ||
    strokes.length === 0 ||
    strokes.length > LIMITS.strokes
  )
    return null;

  let total = 0;
  const clean: Stroke[] = [];
  for (const s of strokes) {
    if (!s || typeof s !== "object") return null;
    const { c, w, p } = s as Record<string, unknown>;
    if (typeof c !== "string" || !HEX.test(c)) return null;
    if (
      typeof w !== "number" ||
      !Number.isFinite(w) ||
      w < LIMITS.minW ||
      w > LIMITS.maxW
    )
      return null;
    if (
      !Array.isArray(p) ||
      p.length < 2 ||
      p.length % 2 !== 0 ||
      p.length > LIMITS.pointsPerStroke
    )
      return null;
    total += p.length;
    if (total > LIMITS.totalPoints) return null;
    const points: number[] = [];
    for (const v of p) {
      if (typeof v !== "number" || !Number.isFinite(v)) return null;
      points.push(Math.min(LIMITS.coordMax, Math.max(LIMITS.coordMin, v)));
    }
    clean.push({ c: c.toUpperCase(), w, p: points });
  }
  return { orientation, strokes: clean };
}

export function drawingToSvg(
  drawing: DrawingPayload,
  opts: {
    widthPx: number;
    heightPx: number;
    marginX?: number;
    marginY?: number;
  },
): string {
  const { w, h } = pageSize(drawing.orientation);
  const mx = opts.marginX ?? 0;
  const my = opts.marginY ?? 0;
  const paths = drawing.strokes
    .map(
      (s) =>
        `<path d="${strokePath(s.p)}" stroke="${s.c}" stroke-width="${s.w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.widthPx}" height="${opts.heightPx}" viewBox="${-mx} ${-my} ${w + mx * 2} ${h + my * 2}">` +
    `<rect x="${-mx}" y="${-my}" width="${w + mx * 2}" height="${h + my * 2}" fill="${PAPER}"/>` +
    `<defs><clipPath id="page"><rect width="${w}" height="${h}"/></clipPath></defs>` +
    `<g clip-path="url(#page)">${paths}</g></svg>`
  );
}
