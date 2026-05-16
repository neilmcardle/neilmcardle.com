// Geometric fallback classifier. The $P template matcher only works once
// the user has trained drawings — a brand-new user drawing their first
// doodle would otherwise get nothing back. This module analyses the raw
// geometry of a doodle (aspect ratio, circularity, line-ness, stroke
// layout) and makes a best-guess element type with no training at all.
//
// It is deliberately a fallback: runRecognition tries trained templates
// first and only drops to this when nothing confident matches. Guesses
// here are approximate — the user corrects via the type menu or thumbs-
// down, and trained templates progressively take over.

import type { ElementType } from "./wireframe-canvas";

type Pt = { x: number; y: number };
type Stroke = { points: Pt[] };
type Bbox = { x: number; y: number; w: number; h: number };

export interface ShapeGuess {
  type: ElementType;
  // 0..1. Heuristic guesses are never high-confidence; this is mostly used
  // to decide guess-vs-give-up, not to compete with template matches.
  confidence: number;
}

// Classify a single cluster of strokes (one drawn element) by geometry.
// Returns null only for degenerate input — for any real shape it always
// guesses, so the user never sees "nothing happened".
export function classifyShape(strokes: Stroke[]): ShapeGuess | null {
  const pts = strokes.flatMap((s) => s.points);
  if (pts.length < 2) return null;

  const bbox = bboxOf(pts);
  if (bbox.w < 6 && bbox.h < 6) return null;

  const longSide = Math.max(bbox.w, bbox.h);
  const shortSide = Math.max(1, Math.min(bbox.w, bbox.h));
  const thinness = shortSide / longSide;
  const aspect = bbox.w / Math.max(1, bbox.h);
  const horizontal = bbox.w >= bbox.h;

  // 1. Line — one dimension much smaller than the other. A horizontal line
  //    is a divider; a vertical one is unusual, treat it as a divider too.
  if (thinness < 0.16) {
    return { type: "divider", confidence: 0.7 };
  }

  // 2. X / crossed strokes → image placeholder. Two strokes, both roughly
  //    straight, running opposite diagonals, sharing the same area.
  if (strokes.length === 2 && looksLikeX(strokes)) {
    return { type: "image", confidence: 0.6 };
  }

  // 3. Stack of horizontal strokes. Three tidy ones read as a hamburger
  //    menu; more (or uneven) reads as a text block.
  const hLines = horizontalStrokeCount(strokes);
  if (hLines >= 3 && strokes.length <= 4 && aspect < 2.2) {
    return { type: "menu", confidence: 0.5 };
  }
  if (hLines >= 2 && strokes.length >= 2 && bbox.h > 36) {
    return { type: "text", confidence: 0.5 };
  }

  // 4. Circular — points roughly equidistant from the centroid and the
  //    box is close to square. Small circle = radio, larger = avatar.
  if (aspect > 0.6 && aspect < 1.7 && radiusVariation(pts, bbox) < 0.1) {
    return longSide < 70
      ? { type: "radio", confidence: 0.55 }
      : { type: "avatar", confidence: 0.6 };
  }

  // 5. Everything else is a box. Aspect ratio and size pick the family.
  return classifyBox(bbox, aspect, horizontal);
}

// Rectangle-family disambiguation. Mirrors the size families in
// snap-size.ts so a guessed element lands at a sensible scale.
function classifyBox(bbox: Bbox, aspect: number, horizontal: boolean): ShapeGuess {
  const area = bbox.w * bbox.h;
  const longSide = Math.max(bbox.w, bbox.h);

  // Tall box → card if large, otherwise a text block.
  if (!horizontal && aspect < 0.85) {
    return area > 60000
      ? { type: "card", confidence: 0.45 }
      : { type: "text", confidence: 0.45 };
  }

  // Small square-ish box → checkbox.
  if (longSide < 46 && aspect > 0.7 && aspect < 1.5) {
    return { type: "checkbox", confidence: 0.5 };
  }

  // Wide and thin → input (very wide) or button (moderately wide).
  if (aspect >= 4) return { type: "input", confidence: 0.55 };
  if (aspect >= 2.1) {
    return bbox.w > 220
      ? { type: "input", confidence: 0.45 }
      : { type: "button", confidence: 0.55 };
  }

  // Roughly square / gently wide. Big → card, otherwise → button.
  if (area > 45000) return { type: "card", confidence: 0.45 };
  return { type: "button", confidence: 0.4 };
}

function bboxOf(pts: Pt[]): Bbox {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Coefficient of variation of point distance from the centroid. A circle
// scores ~0.02-0.08, a square ~0.11-0.16, a line much higher — so a
// threshold around 0.1 cleanly separates circular from boxy shapes.
function radiusVariation(pts: Pt[], bbox: Bbox): number {
  const cx = bbox.x + bbox.w / 2;
  const cy = bbox.y + bbox.h / 2;
  let sum = 0;
  for (const p of pts) sum += Math.hypot(p.x - cx, p.y - cy);
  const mean = sum / pts.length;
  if (mean < 1) return 1;
  let variance = 0;
  for (const p of pts) {
    const r = Math.hypot(p.x - cx, p.y - cy);
    variance += (r - mean) * (r - mean);
  }
  return Math.sqrt(variance / pts.length) / mean;
}

// How many strokes run predominantly horizontally (within ~30 degrees).
function horizontalStrokeCount(strokes: Stroke[]): number {
  let count = 0;
  for (const s of strokes) {
    if (s.points.length < 2) continue;
    const a = s.points[0];
    const b = s.points[s.points.length - 1];
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    if (dx > dy * 1.7) count++;
  }
  return count;
}

// Two strokes forming an X: each roughly straight, running opposite
// diagonals, with overlapping bounding boxes.
function looksLikeX(strokes: Stroke[]): boolean {
  if (strokes.length !== 2) return false;
  const [a, b] = strokes;
  if (a.points.length < 2 || b.points.length < 2) return false;
  const slopeA = strokeSlope(a);
  const slopeB = strokeSlope(b);
  // Opposite diagonals: one positive slope, one negative, both meaningful.
  if (!(slopeA * slopeB < 0)) return false;
  if (Math.abs(slopeA) < 0.3 || Math.abs(slopeB) < 0.3) return false;
  const ba = bboxOf(a.points);
  const bb = bboxOf(b.points);
  return rectsOverlap(ba, bb);
}

function strokeSlope(s: Stroke): number {
  const a = s.points[0];
  const b = s.points[s.points.length - 1];
  const dx = b.x - a.x;
  if (Math.abs(dx) < 1) return 0;
  return (b.y - a.y) / dx;
}

function rectsOverlap(a: Bbox, b: Bbox): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}
