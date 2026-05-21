// Group strokes into the separate elements they represent so the recogniser
// can classify each one independently rather than treating the whole canvas
// as a single shape.
//
// Two refinements over a naive "bounding boxes within N px" union-find, both
// driven by the failure mode where a screen sketch collapses into one blob:
//
//  1. Container detection. A large stroke whose bbox encloses several other
//     strokes is a card/frame. Its outline would otherwise sit within the gap
//     of every element inside it and union them all together, so we pull it
//     out as its own cluster (flagged isContainer) and cluster its contents
//     separately.
//
//  2. Nearest-ink proximity. Two strokes join only when their actual drawn
//     points come within `maxGap`, not merely their bounding boxes. A long
//     thin divider or list row no longer bridges everything its wide bbox
//     happens to overlap. Bbox distance is kept as a cheap pre-filter since
//     point distance can never be smaller than it.

type Pt = { x: number; y: number };
type Stroke = { points: Pt[] };
type Bbox = { x: number; y: number; w: number; h: number };

export const DEFAULT_CLUSTER_GAP = 40;

export interface StrokeCluster<S> {
  strokes: S[];
  // True when this cluster is a single large rectangle enclosing other
  // elements — i.e. a card/frame. runRecognition stamps these as cards.
  isContainer: boolean;
}

export function clusterStrokes<S extends Stroke>(
  strokes: S[],
  maxGap: number = DEFAULT_CLUSTER_GAP,
): StrokeCluster<S>[] {
  if (strokes.length === 0) return [];

  const bboxes = strokes.map(bboxOf);

  // 1. Detect container strokes: large enough to be a frame, and enclosing
  //    the centres of at least a few meaningfully-smaller strokes.
  const containerIdx = new Set<number>();
  for (let i = 0; i < strokes.length; i++) {
    const a = bboxes[i];
    const area = a.w * a.h;
    if (area < 12000) continue;
    let enclosed = 0;
    for (let j = 0; j < strokes.length; j++) {
      if (j === i) continue;
      const b = bboxes[j];
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const inside = cx > a.x && cx < a.x + a.w && cy > a.y && cy < a.y + a.h;
      if (inside && b.w * b.h < area * 0.6) enclosed++;
    }
    if (enclosed >= 3) containerIdx.add(i);
  }

  // 2. Union-find the remaining strokes by nearest-ink proximity.
  const innerIdx = strokes.map((_, i) => i).filter((i) => !containerIdx.has(i));
  const parent = new Map<number, number>();
  for (const i of innerIdx) parent.set(i, i);

  function find(i: number): number {
    let r = i;
    while (parent.get(r) !== r) r = parent.get(r)!;
    while (parent.get(i) !== r) {
      const next = parent.get(i)!;
      parent.set(i, r);
      i = next;
    }
    return r;
  }
  function union(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  }

  for (let x = 0; x < innerIdx.length; x++) {
    for (let y = x + 1; y < innerIdx.length; y++) {
      const i = innerIdx[x];
      const j = innerIdx[y];
      // Fast reject: ink can't be closer than the gap between bounding boxes.
      if (bboxDistance(bboxes[i], bboxes[j]) > maxGap) continue;
      if (strokesWithin(strokes[i], strokes[j], maxGap)) union(i, j);
    }
  }

  const groups = new Map<number, S[]>();
  for (const i of innerIdx) {
    const root = find(i);
    let g = groups.get(root);
    if (!g) {
      g = [];
      groups.set(root, g);
    }
    g.push(strokes[i]);
  }

  // Containers first so they render behind the elements they contain.
  const result: StrokeCluster<S>[] = [];
  for (const i of containerIdx) result.push({ strokes: [strokes[i]], isContainer: true });
  for (const g of groups.values()) result.push({ strokes: g, isContainer: false });
  return result;
}

function bboxOf(stroke: Stroke): Bbox {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of stroke.points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  if (!isFinite(minX)) return { x: 0, y: 0, w: 0, h: 0 };
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

// Shortest distance between two axis-aligned rectangles. Returns 0 when they
// overlap or touch.
function bboxDistance(a: Bbox, b: Bbox): number {
  const dx = Math.max(0, Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)));
  const dy = Math.max(0, Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h)));
  return Math.hypot(dx, dy);
}

// True if any sampled point of A lies within `maxGap` of any sampled point of
// B. Long strokes are subsampled to a cap so this stays cheap.
function strokesWithin(a: Stroke, b: Stroke, maxGap: number): boolean {
  const pa = samplePoints(a.points);
  const pb = samplePoints(b.points);
  const g2 = maxGap * maxGap;
  for (const p of pa) {
    for (const q of pb) {
      const dx = p.x - q.x;
      const dy = p.y - q.y;
      if (dx * dx + dy * dy <= g2) return true;
    }
  }
  return false;
}

function samplePoints(pts: Pt[], cap = 24): Pt[] {
  if (pts.length <= cap) return pts;
  const step = pts.length / cap;
  const out: Pt[] = [];
  for (let i = 0; i < cap; i++) out.push(pts[Math.floor(i * step)]);
  return out;
}
