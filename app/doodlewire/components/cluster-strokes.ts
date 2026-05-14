// Group strokes into spatial clusters so the recogniser can match each
// drawn element independently rather than treating the whole canvas as one
// shape. Two strokes belong to the same cluster when the shortest distance
// between their bounding boxes is within `maxGap` pixels.
//
// Union-find over all stroke pairs. O(n²) which is fine — a single
// recognise pass rarely has more than a few dozen strokes.

type Pt = { x: number; y: number };
type Stroke = { points: Pt[] };
type Bbox = { x: number; y: number; w: number; h: number };

export const DEFAULT_CLUSTER_GAP = 40;

export function clusterStrokes<S extends Stroke>(strokes: S[], maxGap: number = DEFAULT_CLUSTER_GAP): S[][] {
  if (strokes.length === 0) return [];
  if (strokes.length === 1) return [strokes];

  const bboxes = strokes.map(bboxOf);
  const parent = strokes.map((_, i) => i);

  function find(i: number): number {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  }

  function union(a: number, b: number) {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  }

  for (let i = 0; i < strokes.length; i++) {
    for (let j = i + 1; j < strokes.length; j++) {
      if (bboxDistance(bboxes[i], bboxes[j]) <= maxGap) {
        union(i, j);
      }
    }
  }

  const groups = new Map<number, S[]>();
  for (let i = 0; i < strokes.length; i++) {
    const root = find(i);
    let g = groups.get(root);
    if (!g) {
      g = [];
      groups.set(root, g);
    }
    g.push(strokes[i]);
  }
  return Array.from(groups.values());
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

// Shortest distance between two axis-aligned rectangles. Returns 0 when
// they overlap or touch.
function bboxDistance(a: Bbox, b: Bbox): number {
  const dx = Math.max(0, Math.max(a.x - (b.x + b.w), b.x - (a.x + a.w)));
  const dy = Math.max(0, Math.max(a.y - (b.y + b.h), b.y - (a.y + a.h)));
  return Math.hypot(dx, dy);
}
