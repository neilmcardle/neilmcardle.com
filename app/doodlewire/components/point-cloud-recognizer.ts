// Pure-JS port of the $P Point Cloud Recognizer (Vatavu, Anthony, Wobbrock,
// 2012). Match a set of strokes (any number, any order) against saved
// templates by resampling all stroke points into a fixed-size cloud and
// computing a greedy minimum-distance matching.
//
// Reference: http://depts.washington.edu/madlab/proj/dollar/pdollar.html
//
// Why this and not $1: $1 is single-stroke. Wireframe doodles routinely use
// multiple strokes (e.g. an X, or a rectangle drawn in three segments).
// $P is multi-stroke-friendly without requiring a specific stroke order.

export interface Pt {
  x: number;
  y: number;
  // Stroke ID: which stroke this point came from. Used so the resampler
  // distributes points across strokes proportional to their length.
  id: number;
}

export interface Stroke {
  points: { x: number; y: number }[];
}

// Number of resampled points per gesture. The paper uses 32 as a sensible
// default; higher = more accurate but quadratically slower at match time.
const N_POINTS = 32;

// Greedy cloud match step. ε in the paper. Smaller = better match, slower.
const EPSILON = 0.5;

export interface NormalizedCloud {
  points: Pt[];
}

export function normalize(strokes: Stroke[]): NormalizedCloud {
  const pts = flatten(strokes);
  const resampled = resample(pts, N_POINTS);
  const scaled = scale(resampled);
  const translated = translateToOrigin(scaled);
  return { points: translated };
}

function flatten(strokes: Stroke[]): Pt[] {
  const out: Pt[] = [];
  strokes.forEach((s, sid) => {
    for (const p of s.points) out.push({ x: p.x, y: p.y, id: sid });
  });
  return out;
}

function pathLength(pts: Pt[]): number {
  let d = 0;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].id !== pts[i - 1].id) continue;
    d += dist(pts[i - 1], pts[i]);
  }
  return d;
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length < 2) {
    // Pad with copies if the user drew a single point.
    const padded: Pt[] = [];
    for (let i = 0; i < n; i++) padded.push({ ...(pts[0] ?? { x: 0, y: 0, id: 0 }) });
    return padded;
  }
  const I = pathLength(pts) / (n - 1);
  if (!isFinite(I) || I === 0) {
    // All points collapsed to one location. Return n copies.
    return new Array(n).fill(0).map(() => ({ ...pts[0] }));
  }
  let D = 0;
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].id !== pts[i - 1].id) {
      // Stroke boundary: don't interpolate across pen lifts. Just continue.
      continue;
    }
    const d = dist(pts[i - 1], pts[i]);
    if (D + d >= I) {
      const qx = pts[i - 1].x + ((I - D) / d) * (pts[i].x - pts[i - 1].x);
      const qy = pts[i - 1].y + ((I - D) / d) * (pts[i].y - pts[i - 1].y);
      const q: Pt = { x: qx, y: qy, id: pts[i].id };
      out.push(q);
      pts.splice(i, 0, q);
      D = 0;
    } else {
      D += d;
    }
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  if (out.length > n) out.length = n;
  return out;
}

function scale(pts: Pt[]): Pt[] {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const size = Math.max(maxX - minX, maxY - minY);
  if (!isFinite(size) || size === 0) return pts.map((p) => ({ ...p }));
  return pts.map((p) => ({
    x: (p.x - minX) / size,
    y: (p.y - minY) / size,
    id: p.id,
  }));
}

function translateToOrigin(pts: Pt[]): Pt[] {
  let cx = 0, cy = 0;
  for (const p of pts) {
    cx += p.x;
    cy += p.y;
  }
  cx /= pts.length;
  cy /= pts.length;
  return pts.map((p) => ({ x: p.x - cx, y: p.y - cy, id: p.id }));
}

function cloudDistance(pts1: Pt[], pts2: Pt[], start: number): number {
  const n = pts1.length;
  const matched: boolean[] = new Array(n).fill(false);
  let sum = 0;
  let i = start;
  let remaining = n;
  while (remaining > 0) {
    let min = Infinity;
    let index = -1;
    for (let j = 0; j < n; j++) {
      if (matched[j]) continue;
      const d = dist(pts1[i], pts2[j]);
      if (d < min) {
        min = d;
        index = j;
      }
    }
    if (index === -1) break;
    matched[index] = true;
    const weight = 1 - ((i - start + n) % n) / n;
    sum += weight * min;
    i = (i + 1) % n;
    remaining--;
  }
  return sum;
}

export function greedyCloudMatch(candidate: NormalizedCloud, template: NormalizedCloud): number {
  const n = candidate.points.length;
  const step = Math.max(1, Math.floor(Math.pow(n, 1 - EPSILON)));
  let min = Infinity;
  for (let i = 0; i < n; i += step) {
    const d1 = cloudDistance(candidate.points, template.points, i);
    const d2 = cloudDistance(template.points, candidate.points, i);
    if (d1 < min) min = d1;
    if (d2 < min) min = d2;
  }
  return min;
}

export interface MatchResult<T> {
  template: T;
  // Raw point-cloud distance. Lower = closer match.
  distance: number;
}

// Score every template against the candidate, ascending by distance. The
// caller decides whether a single best match is good enough, plus runs its
// own ambiguity check by inspecting the runner-up.
export function rankTemplates<T extends { cloud: NormalizedCloud }>(
  candidate: NormalizedCloud,
  templates: T[],
): MatchResult<T>[] {
  if (templates.length === 0) return [];
  const ranked = templates.map((t) => ({
    template: t,
    distance: greedyCloudMatch(candidate, t.cloud),
  }));
  ranked.sort((a, b) => a.distance - b.distance);
  return ranked;
}
