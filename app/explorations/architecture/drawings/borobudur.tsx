import { measures } from "../sources";
import {
  arc,
  Arrow,
  DimensionLine,
  frame,
  Person,
  poly,
  round,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const m = measures("borobudur");
const HALF = m("base") / 2;
const FIRST = HALF - m("first");
const STEP = m("step");

type Frame = ReturnType<typeof frame>;

const SQUARES: [number, number, number][] = [
  [HALF, 0, 4.0],
  [FIRST, 4.0, 8.6],
  [FIRST - STEP, 8.6, 12.6],
  [FIRST - 2 * STEP, 12.6, 16.3],
  [FIRST - 3 * STEP, 16.3, 19.7],
  [FIRST - 4 * STEP, 19.7, 22.5],
];
const ROUNDS: [number, number, number][] = [
  [27, 22.5, 24.3],
  [21.5, 24.3, 26.1],
  [16, 26.1, 27.9],
];
const RINGS = [
  { r: 25, n: 32, base: 24.3 },
  { r: 19.5, n: 24, base: 26.1 },
  { r: 14, n: 16, base: 27.9 },
];

const S = 5.4;
const f = frame(400, 300, S);
const box = (h: number, v0: number, v1: number) =>
  poly([f.p(-h, v0), f.p(-h, v1), f.p(h, v1), f.p(h, v0)], true);

function stupa(
  m: Frame,
  u: number,
  base: number,
  scale = 1,
  key?: string,
  tall = scale,
) {
  const p = (du: number, dv: number) =>
    `${m.x(u + du * scale)},${m.y(base + dv * tall)}`;
  return (
    <g key={key}>
      <path
        className="profile mask"
        d={`M${p(-1.8, 0)}L${p(-1.8, 0.5)}L${p(-1.7, 0.5)}Q${p(-1.75, 2.2)} ${p(-0.45, 2.85)}L${p(-0.45, 3.25)}L${p(0.45, 3.25)}L${p(0.45, 2.85)}Q${p(1.75, 2.2)} ${p(1.7, 0.5)}L${p(1.8, 0.5)}L${p(1.8, 0)}Z`}
      />
      <path
        className="profile"
        d={`M${p(-0.3, 3.25)}L${p(0, 4.3)}L${p(0.3, 3.25)}`}
      />
      {scale < 2 && (
        <g className="fine">
          {[-0.8, 0, 0.8].map((k) => (
            <path
              key={k}
              d={`M${p(k, 1.0)}L${p(k + 0.25, 1.35)}L${p(k, 1.7)}L${p(k - 0.25, 1.35)}Z`}
            />
          ))}
        </g>
      )}
    </g>
  );
}

function ringStupas(ring: (typeof RINGS)[number]) {
  const items = Array.from({ length: ring.n }, (_, k) => {
    const a = (2 * Math.PI * (k + 0.5)) / ring.n;
    return { u: ring.r * Math.cos(a), depth: Math.sin(a) };
  })
    .filter((s) => s.depth <= 0.05)
    .sort((a, b) => b.depth - a.depth);
  return items.map((s, i) => stupa(f, s.u, ring.base, 1, `${ring.r}-${i}`));
}

function squareTerrace([h, v0, v1]: [number, number, number], i: number) {
  const niches = i > 0 ? Math.floor((2 * h - 8) / 3.6) : 0;
  return (
    <g key={h}>
      <path className="profile mask" d={box(h, v0, v1)} />
      <g className="fine">
        <path d={poly([f.p(-h + 1.2, v0), f.p(-h + 1.2, v1)])} />
        <path d={poly([f.p(h - 1.2, v0), f.p(h - 1.2, v1)])} />
        {i === 0 && <path d={poly([f.p(-h, 1.4), f.p(h, 1.4)])} />}
        {Array.from({ length: niches }, (_, k) => {
          const u = -h + 4 + k * 3.6 + 1.8;
          if (Math.abs(u) < 2.4) return null;
          return (
            <path
              key={k}
              d={`M${f.x(u - 0.7)},${f.y(v0 + 0.6)}L${f.x(u - 0.7)},${f.y(v1 - 1.6)}Q${f.x(u)},${f.y(v1 - 0.9)} ${f.x(u + 0.7)},${f.y(v1 - 1.6)}L${f.x(u + 0.7)},${f.y(v0 + 0.6)}`}
            />
          );
        })}
      </g>
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    {stupa(f, 0, 27.9, m("stupa") / 3.6, "centre", (m("height") - 27.9) / 4.3)}
    {ringStupas(RINGS[2])}
    <path
      className="profile mask"
      d={box(ROUNDS[2][0], ROUNDS[2][1], ROUNDS[2][2])}
    />
    {ringStupas(RINGS[1])}
    <path
      className="profile mask"
      d={box(ROUNDS[1][0], ROUNDS[1][1], ROUNDS[1][2])}
    />
    {ringStupas(RINGS[0])}
    <path
      className="profile mask"
      d={box(ROUNDS[0][0], ROUNDS[0][1], ROUNDS[0][2])}
    />
    {[...SQUARES].reverse().map((t) => squareTerrace(t, SQUARES.indexOf(t)))}
    <path
      className="profile mask"
      d={poly(
        [f.p(-1.7, 0), f.p(-1.7, 22.5), f.p(1.7, 22.5), f.p(1.7, 0)],
        true,
      )}
    />
    <g className="fine">
      {Array.from({ length: 22 }, (_, k) => k + 0.5).map((v) => (
        <path key={v} d={poly([f.p(-1.7, v), f.p(1.7, v)])} />
      ))}
    </g>
    <g className="idea dash">
      {SQUARES.slice(1, 5).map(([h, v0]) => (
        <path key={h} d={poly([f.p(h - 3, v0 + 1.1), f.p(-h + 3, v0 + 1.1)])} />
      ))}
    </g>
    {SQUARES.slice(1, 5).map(([h, v0]) => (
      <Arrow key={h} points={[f.p(-h + 6, v0 + 1.1), f.p(-h + 3, v0 + 1.1)]} />
    ))}
    <path className="cut" d={poly([f.p(-68, 0), f.p(68, 0)])} />
    <Person x={f.x(-36)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={16}
      value={m("base")}
    />
    <DimensionLine
      a={f.p(0, m("height"))}
      b={f.p(0, 0)}
      offset={-66 * S}
      value={m("height")}
    />
  </>
);

const D = 2.4;
const C: Point = [200, 202];
const pp = (x: number, y: number): Point => [C[0] + x * D, C[1] + y * D];

function redent(h: number, a = 1.6) {
  const corner: Point[] = [
    [h - 3 * a, -h],
    [h - 3 * a, -h + a],
    [h - 2 * a, -h + a],
    [h - 2 * a, -h + 2 * a],
    [h - a, -h + 2 * a],
    [h - a, -h + 3 * a],
    [h, -h + 3 * a],
  ];
  const all: Point[] = [];
  for (let q = 0; q < 4; q++) {
    corner.forEach(([x, y]) => {
      let px = x;
      let py = y;
      for (let r = 0; r < q; r++) [px, py] = [-py, px];
      all.push(pp(px, py));
    });
  }
  return poly(all, true);
}

const GALLERIES = SQUARES.slice(1, 5).map(
  ([h], i) => (h + SQUARES[i + 2][0]) / 2,
);

function route(): Point[] {
  const pts: Point[] = [];
  GALLERIES.forEach((g) => {
    pts.push(
      pp(g, -1.5),
      pp(g, g),
      pp(-g, g),
      pp(-g, -g),
      pp(g, -g),
      pp(g, -3),
    );
  });
  [24, 18.5, 12].forEach((r) => {
    pts.push(...arc(C, r * D, 5, -355, 40).slice(1));
  });
  return pts;
}

const ROUTE = route();

const detail = (
  <>
    {SQUARES.map(([h]) => (
      <path key={h} className={h === HALF ? "cut" : "profile"} d={redent(h)} />
    ))}
    {ROUNDS.map(([r]) => (
      <circle key={r} className="profile" cx={C[0]} cy={C[1]} r={r * D} />
    ))}
    <circle className="profile mask" cx={C[0]} cy={C[1]} r={5 * D} />
    <g className="fine">
      {RINGS.flatMap((ring) =>
        Array.from({ length: ring.n }, (_, k) => {
          const a = (2 * Math.PI * (k + 0.5)) / ring.n;
          return (
            <circle
              key={`${ring.r}-${k}`}
              cx={round(C[0] + ring.r * D * Math.cos(a))}
              cy={round(C[1] + ring.r * D * Math.sin(a))}
              r={1.7 * D}
            />
          );
        }),
      )}
      {[0, 90, 180, 270].map((deg) => {
        const t = (deg * Math.PI) / 180;
        const along = (k: number): Point => [
          C[0] + Math.cos(t) * k * D,
          C[1] + Math.sin(t) * k * D,
        ];
        const side = (k: number, s: number): Point => [
          along(k)[0] - Math.sin(t) * s * D,
          along(k)[1] + Math.cos(t) * s * D,
        ];
        return (
          <path
            key={deg}
            d={poly(
              [side(27, -1.6), side(63, -1.6), side(63, 1.6), side(27, 1.6)],
              true,
            )}
          />
        );
      })}
    </g>
    <path className="idea" d={poly(ROUTE)} />
    <Arrow points={ROUTE.slice(-2)} />
    {[
      [pp(GALLERIES[0], 20), pp(GALLERIES[0], 30)],
      [pp(10, GALLERIES[0]), pp(-2, GALLERIES[0])],
      [pp(-GALLERIES[0], -10), pp(-GALLERIES[0], -22)],
      [pp(-10, -GALLERIES[0]), pp(2, -GALLERIES[0])],
    ].map((pts, i) => (
      <Arrow key={i} points={pts as Point[]} />
    ))}
  </>
);

export const borobudur: Drawings = {
  main: {
    title: "Elevation",
    caption:
      "Elevation of one side. The red dashed lines are the gallery paths behind each balustrade, walked clockwise past the carved reliefs before the stair takes you up a level. The base was later wrapped in a broad foot that hides its first row of reliefs.",
    viewBox: [800, 356],
    art: main,
    labels: [
      { at: f.p(0, 33), to: [470, 40], text: "Central stupa" },
      {
        at: f.p(RINGS[0].r * Math.cos(Math.PI * 1.6), 26.5),
        to: [560, 80],
        text: "72 latticed stupas",
      },
      { at: f.p(25, 23.4), to: [600, 120], text: "Three round terraces" },
      {
        at: f.p(-(FIRST - 4 * STEP) + 4, 17.4),
        to: [300, 70],
        text: "Four galleries of reliefs",
        anchor: "end",
      },
      { at: f.p(-58, 1.4), to: [40, 330], text: "Hidden foot" },
      { at: f.p(1.7, 6), to: [470, 330], text: "Stair on each side" },
    ],
  },
  detail: {
    title: "Plan of the pilgrim route",
    caption:
      "Plan, with the route in red. Pilgrims enter from the east, circle each square gallery clockwise, climb, and circle again, about 5 km in all, before the round terraces lead to the central stupa.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: pp(GALLERIES[0], -1.5),
        to: [392, 24],
        text: "Start at the east stair",
        anchor: "end",
      },
      { at: pp(-53, -20), to: [8, 24], text: "Square galleries" },
      { at: pp(-30, GALLERIES[0]), to: [8, 392], text: "Walk clockwise" },
      {
        at: pp(15.2, 15.2),
        to: [392, 392],
        text: "Round terraces",
        anchor: "end",
      },
    ],
  },
};
