import type { ReactNode } from "react";

export type Point = [number, number];

export type Label = {
  at: Point;
  to?: Point;
  text: string;
  anchor?: "start" | "middle" | "end";
};

export type Sheet = {
  title: string;
  caption: string;
  viewBox: [number, number];
  labels: Label[];
  art: ReactNode;
};

export type Drawings = {
  main: Sheet;
  detail: Sheet;
};

export const pt = ([x, y]: Point) => `${x.toFixed(1)},${y.toFixed(1)}`;

export const poly = (points: Point[], close = false) =>
  `M${points.map(pt).join("L")}${close ? "Z" : ""}`;

export const round = (n: number) => Math.round(n * 100) / 100;

export function frame(cx: number, ground: number, scale: number) {
  return {
    x: (u: number) => round(cx + u * scale),
    y: (v: number) => round(ground - v * scale),
    p: (u: number, v: number): Point => [
      round(cx + u * scale),
      round(ground - v * scale),
    ],
  };
}

export function arc(c: Point, r: number, from: number, to: number, steps = 32) {
  const points: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
    points.push([c[0] + r * Math.cos(a), c[1] - r * Math.sin(a)]);
  }
  return points;
}

export function Arrow({
  points,
  className = "idea",
}: {
  points: Point[];
  className?: string;
}) {
  const [x1, y1] = points[points.length - 2];
  const [x2, y2] = points[points.length - 1];
  const a = Math.atan2(y2 - y1, x2 - x1);
  const size = 7;
  const left: Point = [
    x2 - size * Math.cos(a - 0.45),
    y2 - size * Math.sin(a - 0.45),
  ];
  const right: Point = [
    x2 - size * Math.cos(a + 0.45),
    y2 - size * Math.sin(a + 0.45),
  ];
  return (
    <g className={className}>
      <path d={poly(points)} />
      <path d={poly([left, [x2, y2], right])} />
    </g>
  );
}

export function DimensionLine({
  a,
  b,
  offset,
  value,
  unit = "m",
  along = 0,
}: {
  a: Point;
  b: Point;
  offset: number;
  value: number;
  unit?: string;
  along?: number;
}) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const d: Point = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
  const n: Point = [-d[1], d[0]];
  const side = Math.sign(offset) || 1;
  const at = (p: Point, k: number): Point => [p[0] + n[0] * k, p[1] + n[1] * k];
  const a1 = at(a, offset);
  const b1 = at(b, offset);
  const slash = (p: Point): Point[] => {
    const s: Point = [(d[0] + n[0]) * 2.8, (d[1] + n[1]) * 2.8];
    return [
      [p[0] - s[0], p[1] - s[1]],
      [p[0] + s[0], p[1] + s[1]],
    ];
  };
  let angle = (Math.atan2(d[1], d[0]) * 180) / Math.PI;
  if (angle >= 90) angle -= 180;
  if (angle < -90) angle += 180;
  const mid = at(
    [(a[0] + b[0]) / 2 + d[0] * along, (a[1] + b[1]) / 2 + d[1] * along],
    offset + side * 5,
  );
  const r = (angle * Math.PI) / 180;
  const up = Math.sin(r) * n[0] * side - Math.cos(r) * n[1] * side;
  const baseline = up > 0 ? "auto" : "hanging";
  return (
    <g className="dimension">
      <g className="fine">
        <path d={poly([at(a, side * 3), at(a, offset + side * 4)])} />
        <path d={poly([at(b, side * 3), at(b, offset + side * 4)])} />
        <path d={poly([a1, b1])} />
        <path d={poly(slash(a1))} />
        <path d={poly(slash(b1))} />
      </g>
      <text
        className="dimtext"
        x={mid[0]}
        y={mid[1]}
        textAnchor="middle"
        dominantBaseline={baseline}
        transform={`rotate(${angle.toFixed(2)} ${mid[0].toFixed(1)} ${mid[1].toFixed(1)})`}
      >
        {`${value.toLocaleString("en-GB")} ${unit}`}
      </text>
    </g>
  );
}

export function ScaleBar({
  x,
  y,
  scale,
  step,
  count,
}: {
  x: number;
  y: number;
  scale: number;
  step: number;
  count: number;
}) {
  const w = step * scale;
  return (
    <g className="scalebar">
      {Array.from({ length: count }, (_, i) => (
        <rect
          key={i}
          className={i % 2 ? "fine" : "fine solid"}
          x={x + i * w}
          y={y}
          width={w}
          height={4}
        />
      ))}
      <text x={x} y={y - 5}>
        0
      </text>
      <text x={x + count * w} y={y - 5} textAnchor="middle">
        {step * count} m
      </text>
    </g>
  );
}

export function Person({
  x,
  ground,
  scale,
}: {
  x: number;
  ground: number;
  scale: number;
}) {
  const h = 1.75 * scale;
  const head = h * 0.075;
  return (
    <g className="person">
      <circle className="fine" cx={x} cy={ground - h + head} r={head} />
      <path
        className="fine"
        d={poly([
          [x - h * 0.06, ground],
          [x - h * 0.035, ground - h * 0.48],
          [x - h * 0.1, ground - h * 0.5],
          [x - h * 0.11, ground - h * 0.8],
          [x, ground - h * 0.83],
          [x + h * 0.11, ground - h * 0.8],
          [x + h * 0.1, ground - h * 0.5],
          [x + h * 0.035, ground - h * 0.48],
          [x + h * 0.06, ground],
        ])}
      />
    </g>
  );
}

export function Defs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <defs>
        <pattern
          id="arch-hatch"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="5" className="pattern" />
        </pattern>
        <pattern
          id="arch-cross"
          width="4"
          height="4"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="4" className="pattern" />
          <line x1="0" y1="0" x2="4" y2="0" className="pattern" />
        </pattern>
        <pattern
          id="arch-earth"
          width="12"
          height="12"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="3" r="0.7" className="dot" />
          <circle cx="8" cy="1.5" r="0.5" className="dot" />
          <circle cx="6" cy="8" r="0.8" className="dot" />
          <circle cx="11" cy="10" r="0.5" className="dot" />
          <circle cx="1" cy="10.5" r="0.4" className="dot" />
        </pattern>
        <pattern
          id="arch-light"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="4" r="1.6" className="ring" />
          <circle cx="10" cy="10" r="1.2" className="ring" />
          <circle cx="11" cy="3" r="0.6" className="dot" />
        </pattern>
        <pattern
          id="arch-mid"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect x="1" y="1" width="3" height="1.6" className="dot" />
          <circle cx="6" cy="5.5" r="0.9" className="dot" />
        </pattern>
        <pattern
          id="arch-dense"
          width="6"
          height="6"
          patternUnits="userSpaceOnUse"
        >
          <rect x="0.5" y="0.5" width="2.6" height="2" className="dot" />
          <rect x="3.5" y="3.2" width="2" height="2.2" className="dot" />
        </pattern>
      </defs>
    </svg>
  );
}
