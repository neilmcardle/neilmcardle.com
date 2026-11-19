export type Point = { x: number; y: number };
export type Polygon = Point[];

export function toPolygon(points: number[][]): Polygon {
  return points.map(([x, y]) => ({ x, y }));
}

export function pointInPolygon(p: Point, poly: Polygon): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (
      a.y > p.y !== b.y > p.y &&
      p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function closestOnSegment(p: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy;
  const t =
    len === 0
      ? 0
      : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len));
  return { x: a.x + t * dx, y: a.y + t * dy };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function centroid(poly: Polygon): Point {
  const sum = poly.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), {
    x: 0,
    y: 0,
  });
  return { x: sum.x / poly.length, y: sum.y / poly.length };
}

export function clampInside(p: Point, poly: Polygon): Point {
  if (pointInPolygon(p, poly)) return p;
  let best = poly[0];
  let bestDistance = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const c = closestOnSegment(p, poly[i], poly[(i + 1) % poly.length]);
    const d = distance(p, c);
    if (d < bestDistance) {
      bestDistance = d;
      best = c;
    }
  }
  const middle = centroid(poly);
  for (let step = 1; step <= 40; step++) {
    const t = step * 0.5;
    const candidate = {
      x: best.x + ((middle.x - best.x) / distance(best, middle)) * t,
      y: best.y + ((middle.y - best.y) / distance(best, middle)) * t,
    };
    if (pointInPolygon(candidate, poly)) return candidate;
  }
  return middle;
}

function cross(o: Point, a: Point, b: Point): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function segmentsCross(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return (
    ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
    ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))
  );
}

function lineOfSight(a: Point, b: Point, poly: Polygon): boolean {
  for (let i = 0; i < poly.length; i++) {
    if (segmentsCross(a, b, poly[i], poly[(i + 1) % poly.length])) return false;
  }
  for (const t of [0.25, 0.5, 0.75]) {
    if (
      !pointInPolygon(
        { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t },
        poly,
      )
    )
      return false;
  }
  return true;
}

function insetCorners(poly: Polygon, amount: number): Point[] {
  const corners: Point[] = [];
  for (let i = 0; i < poly.length; i++) {
    const prev = poly[(i - 1 + poly.length) % poly.length];
    const curr = poly[i];
    const next = poly[(i + 1) % poly.length];
    const ax = prev.x - curr.x;
    const ay = prev.y - curr.y;
    const bx = next.x - curr.x;
    const by = next.y - curr.y;
    const la = Math.hypot(ax, ay) || 1;
    const lb = Math.hypot(bx, by) || 1;
    let dx = ax / la + bx / lb;
    let dy = ay / la + by / lb;
    const l = Math.hypot(dx, dy);
    if (l < 1e-6) continue;
    dx /= l;
    dy /= l;
    for (const sign of [1, -1]) {
      const candidate = {
        x: curr.x + dx * amount * sign,
        y: curr.y + dy * amount * sign,
      };
      if (pointInPolygon(candidate, poly)) {
        corners.push(candidate);
        break;
      }
    }
  }
  return corners;
}

export function findPath(start: Point, goal: Point, poly: Polygon): Point[] {
  const from = clampInside(start, poly);
  const to = clampInside(goal, poly);
  if (lineOfSight(from, to, poly)) return [to];
  const nodes = [from, to, ...insetCorners(poly, 6)];
  const count = nodes.length;
  const cost = new Array(count).fill(Infinity);
  const previous = new Array<number>(count).fill(-1);
  const open = new Set<number>([0]);
  cost[0] = 0;
  while (open.size) {
    let current = -1;
    let bestScore = Infinity;
    for (const n of open) {
      const score = cost[n] + distance(nodes[n], to);
      if (score < bestScore) {
        bestScore = score;
        current = n;
      }
    }
    if (current === 1) break;
    open.delete(current);
    for (let n = 0; n < count; n++) {
      if (n === current) continue;
      const step = cost[current] + distance(nodes[current], nodes[n]);
      if (step < cost[n] && lineOfSight(nodes[current], nodes[n], poly)) {
        cost[n] = step;
        previous[n] = current;
        open.add(n);
      }
    }
  }
  if (previous[1] === -1) return [to];
  const path: Point[] = [];
  for (let n = 1; n !== 0 && n !== -1; n = previous[n]) path.unshift(nodes[n]);
  return path;
}
