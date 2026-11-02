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

const ms = measures("villa-savoye");
const BAY = ms("grid");
const LEN = ms("length") / 2;

const S = 22;
const f = frame(400, 330, S);

const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

const COLUMNS = [-2, -1, 0, 1, 2].map((k) => k * BAY);
const SOFFIT = ms("pilotis") + 0.3;
const PARAPET = 6.9;

const main = (
  <>
    <ScaleBar x={40} y={32} scale={S} step={1} count={5} />
    <path className="tone" d={box(-8, 8, 0, SOFFIT)} />
    <g className="fine">
      {Array.from({ length: 15 }, (_, i) => -7.7 + i * 1.1).map((u) => (
        <path key={u} d={poly([f.p(u, 0), f.p(u, SOFFIT)])} />
      ))}
      <path d={box(-8, 8, 0, SOFFIT)} />
      <path d={poly([f.p(-8, 2.3), f.p(8, 2.3)])} />
    </g>
    {COLUMNS.map((u) => (
      <path
        key={u}
        className="profile mask"
        d={box(u - 0.15, u + 0.15, 0, SOFFIT)}
      />
    ))}
    <path className="fine mask" d={box(1.8, 6.2, PARAPET, 8.6)} />
    <path className="profile mask" d={box(-3, 3.4, PARAPET, ms("height"))} />
    <path className="fine" d={box(-1.5, 0.8, 7.6, 8.9)} />
    <path className="profile mask" d={box(-LEN, LEN, SOFFIT, PARAPET)} />
    <path className="profile" d={box(-10.2, 10.2, 4.55, 5.75)} />
    <g className="fine">
      {Array.from({ length: 16 }, (_, i) => -9.0 + i * 1.2).map((u) => (
        <path key={u} d={poly([f.p(u, 4.55), f.p(u, 5.75)])} />
      ))}
      <path d={poly([f.p(-10.2, 4.75), f.p(10.2, 4.75)])} />
    </g>
    <path className="cut" d={poly([f.p(-16, 0), f.p(16, 0)])} />
    <Person x={f.x(-2.4)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-LEN, SOFFIT)}
      b={f.p(LEN, SOFFIT)}
      offset={SOFFIT * S + 48}
      value={ms("length")}
    />
    <DimensionLine a={f.p(0, 0)} b={f.p(BAY, 0)} offset={12} value={BAY} />
    <DimensionLine
      a={f.p(0, ms("height"))}
      b={f.p(0, 0)}
      offset={13 * S}
      value={ms("height")}
    />
  </>
);

const K = 22;
const O: Point = [130, 180];
const P = (x: number, y: number, z: number): Point => [
  O[0] + (x - y) * 0.866 * K,
  O[1] + (x + y) * 0.5 * K - z * K,
];

const LEVELS = [0.6, 3.6, 6.6];
const GRID: [number, number][] = [0.9, 4.5, 8.1].flatMap((x) =>
  [0.9, 5.1].map((y) => [x, y] as [number, number]),
);

function slab(top: number) {
  const bottom = top - 0.4;
  return (
    <g key={`slab-${top}`} className="profile mask">
      <path
        d={poly([P(0, 0, top), P(9, 0, top), P(9, 6, top), P(0, 6, top)], true)}
      />
      <path
        d={poly(
          [P(0, 6, top), P(9, 6, top), P(9, 6, bottom), P(0, 6, bottom)],
          true,
        )}
      />
      <path
        d={poly(
          [P(9, 0, top), P(9, 6, top), P(9, 6, bottom), P(9, 0, bottom)],
          true,
        )}
      />
    </g>
  );
}

function columns(from: number, to: number) {
  return (
    <g key={`columns-${from}`} className="idea column">
      {GRID.map(([x, y]) => (
        <path key={`${x}-${y}`} d={poly([P(x, y, from), P(x, y, to)])} />
      ))}
    </g>
  );
}

function footing([x, y]: [number, number]) {
  const a = 0.45;
  return (
    <path
      key={`${x}-${y}`}
      className="fine mask"
      d={poly(
        [
          P(x - a, y + a, 0.2),
          P(x + a, y + a, 0.2),
          P(x + a, y - a, 0.2),
          P(x + a, y - a, -0.4),
          P(x + a, y + a, -0.4),
          P(x - a, y + a, -0.4),
        ],
        true,
      )}
    />
  );
}

function flight(y: number, x0: number, x1: number, z0: number, z1: number) {
  const steps = 12;
  const points: Point[] = [];
  for (let i = 0; i < steps; i++) {
    const x = x0 + ((x1 - x0) * i) / steps;
    const z = z0 + ((z1 - z0) * i) / steps;
    points.push(P(x, y, z), P(x, y, z + (z1 - z0) / steps));
  }
  points.push(P(x1, y, z1));
  return (
    <g key={`flight-${y}`} className="fine">
      <path d={poly(points)} />
      <path d={poly([P(x0, y, z0 - 0.3), P(x1, y, z1 - 0.3)])} />
    </g>
  );
}

const detail = (
  <>
    {GRID.map(footing)}
    {columns(-0.2, LEVELS[0] - 0.4)}
    {slab(LEVELS[0])}
    {columns(LEVELS[0], LEVELS[1] - 0.4)}
    {slab(LEVELS[1])}
    {columns(LEVELS[1], LEVELS[2] - 0.4)}
    {slab(LEVELS[2])}
    {flight(6.6, 1.2, 5.2, LEVELS[0], LEVELS[1])}
  </>
);

export const villaSavoye: Drawings = {
  main: {
    title: "South-east elevation",
    caption:
      "Elevation of the main front. The upper floor is a box on five thin columns; the glass ground floor sits back in the shadow, and the curved screens of the roof garden rise above.",
    viewBox: [800, 414],
    art: main,
    labels: [
      {
        at: [f.x(-2 * BAY), f.y(1.6)],
        to: [100, 290],
        text: "Thin columns",
        anchor: "end",
      },
      {
        at: [f.x(-7.02), f.y(5.15)],
        to: [100, 150],
        text: "Ribbon window",
        anchor: "end",
      },
      { at: [f.x(1), f.y(ms("height"))], to: [650, 100], text: "Roof garden" },
      { at: [f.x(LEN), f.y(6.0)], to: [660, 180], text: "Facade hangs free" },
      { at: [f.x(6.4), f.y(1.6)], to: [650, 310], text: "Glass ground floor" },
    ],
  },
  detail: {
    title: "Dom-ino frame, 1914",
    caption:
      "Le Corbusier's Dom-ino frame of 1914, the idea behind the house. Slabs and thin columns, in red, carry everything, so walls and windows can go wherever the plan needs them.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: P(9, 3, LEVELS[2] - 0.2),
        to: [392, 60],
        text: "Slab overhangs",
        anchor: "end",
      },
      {
        at: P(8.1, 5.1, 2.1),
        to: [392, 344],
        text: "Columns carry it all",
        anchor: "end",
      },
      { at: P(3.2, 6.6, 2.1), to: [24, 380], text: "Stair" },
    ],
  },
};
