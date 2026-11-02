import { measures } from "../sources";
import {
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

type Frame = ReturnType<typeof frame>;

const box = (m: Frame, u0: number, u1: number, v0: number, v1: number) =>
  poly([m.p(u0, v0), m.p(u0, v1), m.p(u1, v1), m.p(u1, v0)], true);

const curve = (m: Frame, a: Point, c: Point, b: Point) =>
  `M${m.x(a[0])},${m.y(a[1])}Q${m.x(c[0])},${m.y(c[1])} ${m.x(b[0])},${m.y(b[1])}`;

function circleArc(
  m: Frame,
  c: Point,
  r: number,
  from: number,
  to: number,
  steps = 24,
) {
  return poly(
    Array.from({ length: steps + 1 }, (_, i) => {
      const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
      return m.p(c[0] + r * Math.cos(a), c[1] + r * Math.sin(a));
    }),
  );
}

function ellipseArc(
  m: Frame,
  c: Point,
  rx: number,
  ry: number,
  from: number,
  to: number,
  steps = 24,
) {
  return poly(
    Array.from({ length: steps + 1 }, (_, i) => {
      const a = ((from + ((to - from) * i) / steps) * Math.PI) / 180;
      return m.p(c[0] + rx * Math.cos(a), c[1] + ry * Math.sin(a));
    }),
  );
}

const ms = measures("durham");
const A = ms("span") / 2;
const B = A + ms("pier");
const C = B + ms("aisle");
const W = C + ms("wall");
const VAULT = ms("vault");
const SPRING = 16.5;
const RISE = VAULT - 0.3 - SPRING;
const T_RADIUS = (A * A + RISE * RISE) / (2 * A);
const MID = (B + C) / 2;
const HALF_AISLE = (C - B) / 2;

function half(m: Frame) {
  const tCentre: Point = [A - T_RADIUS, SPRING];
  const tTop = (Math.acos((0 - tCentre[0]) / T_RADIUS) * 180) / Math.PI;
  return (
    <>
      <path className="profile mask" d={box(m, A, B, 0, 9.2)} />
      <g className="fine">
        {Array.from({ length: 7 }, (_, k) => 0.6 + k * 1.2).map((v) => (
          <path key={v} d={poly([m.p(A, v), m.p(B, v + 1.1)])} />
        ))}
      </g>
      <path className="profile mask" d={box(m, A - 0.2, B + 0.2, 9.2, 9.8)} />
      <path
        className="fine"
        d={poly([m.p(A + 0.45, 9.8), m.p(A + 0.45, SPRING)])}
      />
      <path className="fine" d={poly([m.p(A, 9.8), m.p(A, SPRING)])} />
      <path
        className="profile"
        d={circleArc(m, [MID, 6.3], HALF_AISLE, 0, 180)}
      />
      <path className="profile" d={circleArc(m, [C, 17], C - B, 180, 270)} />
      <path
        className="profile"
        d={circleArc(m, [C, 17], C - B - 0.6, 180, 270)}
      />
      <path className="idea" d={circleArc(m, tCentre, T_RADIUS, 0, tTop)} />
      <path
        className="idea"
        d={ellipseArc(m, [0, SPRING], A, VAULT - SPRING, 0, 90)}
      />
      <g className="cut poche stone">
        <path d={box(m, A, B, 10.6, 12.3)} />
        <path d={box(m, A, B, 16.6, 18.2)} />
        <path d={box(m, A, B, 21, 23.5)} />
        <path d={box(m, C, W, 0, 3)} />
        <path d={box(m, C, W, 8.6, 15.2)} />
        <path
          d={`${curve(m, [A, 21.2], [A * 0.5, VAULT + 0.05], [0, VAULT])}L${m.x(0)},${m.y(VAULT + 0.4)}Q${m.x(A * 0.5)},${m.y(VAULT + 0.45)} ${m.x(A)},${m.y(21.8)}Z`}
        />
        <path
          d={`${curve(m, [B, 9.0], [MID, 10.6], [C, 9.0])}L${m.x(C)},${m.y(11)}L${m.x(B)},${m.y(11)}Z`}
        />
      </g>
      <g className="cut">
        <path d={poly([m.p(W + 0.5, 15.0), m.p(B, 17.8)])} />
        <path d={poly([m.p(B + 0.5, 23.3), m.p(0, 31)])} />
      </g>
      <g className="fine">
        <path d={poly([m.p(W + 0.3, 15.5), m.p(B, 18.3)])} />
        <path d={poly([m.p(B, 23.6), m.p(0, 30.4)])} />
        <path d={poly([m.p(0, 23.6), m.p(B, 23.6)])} />
        <path d={poly([m.p(0, 23.6), m.p(0, 30.4)])} />
        <path d={poly([m.p(C + 0.6, 3), m.p(C + 0.6, 8.6)])} />
        <path d={poly([m.p((A + B) / 2, 18.2), m.p((A + B) / 2, 21)])} />
      </g>
    </>
  );
}

const S = 12;
const f = frame(400, 440, S);

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    <path className="cut poche rock" d={box(f, -W - 1, W + 1, -1.4, 0)} />
    <path className="cut" d={poly([f.p(-22, 0), f.p(22, 0)])} />
    {half(f)}
    <g transform="translate(800 0) scale(-1 1)">{half(f)}</g>
    <Person x={f.x(-2)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-A, 4)}
      b={f.p(A, 4)}
      offset={0.1}
      value={ms("span")}
    />
    <DimensionLine
      a={f.p(0, VAULT)}
      b={f.p(0, 0)}
      offset={(W + 3) * S}
      value={VAULT}
    />
  </>
);

const K = 88;
const O: Point = [170, 250];
const DEPTH = 0.35;
const P = (x: number, y: number, z: number): Point => [
  O[0] + (x + y * DEPTH) * K,
  O[1] - (z + y * DEPTH) * K,
];
const line = (pts: [number, number, number][]) =>
  poly(pts.map(([x, y, z]) => P(x, y, z)));
const steps = (n: number) => Array.from({ length: n + 1 }, (_, i) => i / n);

const pointed = (s: number) => {
  const c = s < 0 ? 0.5 : -0.5;
  return Math.sqrt(Math.max(0, 2.25 - (s - c) * (s - c)));
};

const archAlongY = (x: number) =>
  line(
    steps(32).map((t) => {
      const y = -1 + 2 * t;
      return [x, y, pointed(y)];
    }),
  );
const archAlongX = (y: number, grow = 0) =>
  line(
    steps(32).map((t) => {
      const x = -1 + 2 * t;
      return [x * (1 + grow), y, pointed(x) + grow];
    }),
  );
const diagonal = (sign: 1 | -1) =>
  line(
    steps(32).map((t) => {
      const k = -1 + 2 * t;
      return [k, sign * k, Math.sqrt(Math.max(0, 2 - 2 * k * k))];
    }),
  );

function webs() {
  const out: [number, number, number][][] = [];
  [0.35, 0.65, 0.95, 1.2].forEach((z) => {
    const t = Math.sqrt((2 - z * z) / 2);
    const y = Math.sqrt(2.25 - z * z) - 0.5;
    [1, -1].forEach((sx) =>
      [1, -1].forEach((sy) => {
        out.push([
          [sx * t, sy * t, z],
          [sx, sy * y, z],
        ]);
        out.push([
          [sx * t, sy * t, z],
          [sx * y, sy, z],
        ]);
      }),
    );
  });
  return out;
}

const detail = (
  <>
    <g className="fine">
      <path d={archAlongX(1)} />
      <path d={archAlongY(-1)} />
      <path d={archAlongY(1)} />
      {webs().map((pts, i) => (
        <path key={i} d={line(pts)} />
      ))}
      <path
        d={line([
          [-1, 1, 0],
          [-1, 1, -0.9],
        ])}
      />
      <path
        d={line([
          [1, 1, 0],
          [1, 1, -0.9],
        ])}
      />
    </g>
    <path className="idea" d={diagonal(1)} />
    <path className="idea" d={diagonal(-1)} />
    <g className="profile">
      <path d={archAlongX(-1)} />
      <path d={archAlongX(-1, 0.1)} />
      <path
        d={line([
          [-1, -1, 0],
          [-1, -1, -0.9],
        ])}
      />
      <path
        d={line([
          [1, -1, 0],
          [1, -1, -0.9],
        ])}
      />
      <path
        d={line([
          [-1.1, -1, 0.1],
          [-1.1, -1, -0.9],
        ])}
      />
      <path
        d={line([
          [1.1, -1, 0.1],
          [1.1, -1, -0.9],
        ])}
      />
    </g>
  </>
);

export const durham: Drawings = {
  main: {
    title: "Section through the nave",
    caption:
      "Cross-section through a nave bay, looking east. Cut parts are hatched; the round piers, ribs and arches are seen beyond. The ribs of the high vault are in red. Under the gallery roofs, quarter arches brace the nave wall: flying buttresses before they learned to fly. They were enlarged in the 19th century.",
    viewBox: [800, 480],
    art: main,
    labels: [
      {
        at: f.p(-0.4, VAULT + 0.2),
        to: [230, 50],
        text: "Rib vault",
        anchor: "end",
      },
      {
        at: f.p(A * 0.55, VAULT - 0.9),
        to: [520, 50],
        text: "Pointed transverse arch",
      },
      { at: f.p(A * 0.9, SPRING + 2.5), to: [520, 92], text: "Diagonal rib" },
      {
        at: f.p(C - (C - B) * 0.72, 17 - (C - B) * 0.72),
        to: [560, 236],
        text: "Hidden quarter arch",
      },
      { at: f.p((C + W) / 2, 11.5), to: [600, 300], text: "Thick wall" },
      { at: f.p(B, 5), to: [600, 370], text: "Carved round pier" },
      { at: f.p(-MID, 13.5), to: [166, 250], text: "Gallery", anchor: "end" },
      { at: f.p(-MID, 3), to: [166, 400], text: "Aisle", anchor: "end" },
    ],
  },
  detail: {
    title: "One bay of rib vault",
    caption:
      "One bay of the vault. The diagonal ribs, in red, are semicircles over the long diagonals, so they rise higher than a round arch over the shorter sides could. Pointing the side arches lets them reach the same height. The ribs went up first; the thin web was filled in between them.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: P(0.5, 0.5, Math.sqrt(1.5)), to: [300, 40], text: "Diagonal ribs" },
      { at: P(0.5, -1, pointed(0.5)), to: [300, 150], text: "Pointed arch" },
      { at: P(0.95, 0.35, 0.85), to: [300, 206], text: "Thin web" },
      { at: P(1.05, -1, -0.5), to: [300, 330], text: "Pier" },
    ],
  },
};
