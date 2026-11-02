import { measures } from "../sources";
import {
  Arrow,
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

type Frame = ReturnType<typeof frame>;

const ms = measures("forbidden-city");
const T = ms("terrace");
const HALF = ms("width") / 2;
const TOP = T + ms("height");
const COL = ms("column");
const AXIS = 30.07;
const BAYS = 11;

const S = 7.5;
const f = frame(400, 340, S);
const box = (m: Frame, u0: number, u1: number, v0: number, v1: number) =>
  poly([m.p(u0, v0), m.p(u0, v1), m.p(u1, v1), m.p(u1, v0)], true);

const TIERS: [number, number, number][] = [
  [40, 0, T / 3],
  [37.5, T / 3, (2 * T) / 3],
  [35, (2 * T) / 3, T],
];

function tier([h, v0, v1]: [number, number, number]) {
  const posts = Array.from(
    { length: Math.floor((2 * h) / 2) + 1 },
    (_, i) => -h + i * 2,
  ).filter((u) => Math.abs(u) > 3.6);
  return (
    <g key={h}>
      <path className="profile mask" d={box(f, -h, h, v0, v1 - 1.1)} />
      <g className="fine">
        <path d={poly([f.p(-h, v1 - 0.15), f.p(-3.6, v1 - 0.15)])} />
        <path d={poly([f.p(3.6, v1 - 0.15), f.p(h, v1 - 0.15)])} />
        <path d={poly([f.p(-h, v1 - 0.75), f.p(-3.6, v1 - 0.75)])} />
        <path d={poly([f.p(3.6, v1 - 0.75), f.p(h, v1 - 0.75)])} />
        {posts.map((u) => (
          <path key={u} d={poly([f.p(u, v1 - 1.1), f.p(u, v1)])} />
        ))}
      </g>
    </g>
  );
}

function roof(
  tip: number,
  eave: number,
  top: number,
  ridge: number,
  curl = 0.6,
) {
  const pts: Point[] = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const u = -tip + (tip - ridge) * t;
    const v = eave + (top - eave) * Math.pow(t, 1.7);
    pts.push(f.p(u, v));
  }
  const right = [...pts]
    .reverse()
    .map(([x, y]) => [2 * f.x(0) - x, y] as Point);
  return poly(
    [
      f.p(-tip - 0.4, eave + curl),
      ...pts,
      ...right,
      f.p(tip + 0.4, eave + curl),
      f.p(tip, eave - 0.5),
      f.p(-tip, eave - 0.5),
    ],
    true,
  );
}

function brackets(
  v0: number,
  v1: number,
  from: number,
  to: number,
  step: number,
) {
  const units: number[] = [];
  for (let u = from; u <= to + 0.01; u += step) units.push(u);
  return (
    <g className="idea">
      <path d={poly([f.p(-to - 0.6, v0), f.p(to + 0.6, v0)])} />
      {units
        .flatMap((u) => [u, -u])
        .filter((u, i, a) => a.indexOf(u) === i)
        .map((u) => (
          <path
            key={u}
            d={poly([
              f.p(u - 0.35, v0),
              f.p(u - 0.35, v0 + (v1 - v0) * 0.4),
              f.p(u - 0.7, v0 + (v1 - v0) * 0.4),
              f.p(u - 0.7, v1),
              f.p(u + 0.7, v1),
              f.p(u + 0.7, v0 + (v1 - v0) * 0.4),
              f.p(u + 0.35, v0 + (v1 - v0) * 0.4),
              f.p(u + 0.35, v0),
            ])}
          />
        ))}
    </g>
  );
}

const BAY = (2 * AXIS) / BAYS;
const COLUMNS = Array.from({ length: BAYS + 1 }, (_, i) => -AXIS + i * BAY);
const EAVE_COL = 7.5;
const LOWER = T + EAVE_COL + 0.6;
const UPPER = T + 12.3;

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    <path className="mask" d={roof(33, T + 15.1, T + 23.6, 16)} />
    <path className="profile" d={roof(33, T + 15.1, T + 23.6, 16)} />
    <path className="profile mask" d={box(f, -16, 16, T + 23.6, T + 24.4)} />
    {[-1, 1].map((side) => (
      <path
        key={side}
        className="profile mask"
        d={poly([
          f.p(side * 16, T + 24.4),
          f.p(side * 16, TOP - 0.6),
          f.p(side * 15.2, TOP),
          f.p(side * 14.4, TOP - 0.4),
          f.p(side * 14.6, T + 24.4),
        ])}
      />
    ))}
    {brackets(T + 14.3, T + 15.3, 0, 26, BAY / 2)}
    <path className="profile mask" d={box(f, -27, 27, UPPER, T + 14.3)} />
    <g className="fine">
      {Array.from({ length: 19 }, (_, i) => -27 + i * 3).map((u) => (
        <path key={u} d={poly([f.p(u, UPPER), f.p(u, T + 14.3)])} />
      ))}
    </g>
    <path
      className="profile mask"
      d={roof(34.5, LOWER + 0.9, UPPER, 27, 0.5)}
    />
    {brackets(LOWER - 0.6, LOWER + 0.6, 0, AXIS, BAY / 2)}
    <path
      className="profile mask"
      d={box(f, -HALF + 0.9, HALF - 0.9, T + EAVE_COL, LOWER - 0.6)}
    />
    <path className="tone" d={box(f, -AXIS, AXIS, T, T + EAVE_COL)} />
    <g className="fine">
      {COLUMNS.slice(2, -2)
        .flatMap((u, i, a) =>
          i < a.length - 1
            ? Array.from({ length: 5 }, (_, k) => u + (BAY * (k + 1)) / 6)
            : [],
        )
        .map((u) => (
          <path key={u} d={poly([f.p(u, T), f.p(u, T + EAVE_COL - 0.8)])} />
        ))}
      <path
        d={poly([
          f.p(-AXIS + 2 * BAY, T + EAVE_COL - 0.8),
          f.p(AXIS - 2 * BAY, T + EAVE_COL - 0.8),
        ])}
      />
    </g>
    {COLUMNS.map((u) => (
      <path
        key={u}
        className="profile mask"
        d={box(f, u - COL / 2, u + COL / 2, T, T + EAVE_COL)}
      />
    ))}
    {[...TIERS].reverse().map(tier)}
    <path className="profile mask" d={box(f, -3.6, 3.6, 0, T)} />
    <g className="fine">
      {Array.from({ length: 27 }, (_, i) => 0.3 + i * 0.3).map((v) => (
        <path key={v} d={poly([f.p(-3.6, v), f.p(-1.5, v)])} />
      ))}
      {Array.from({ length: 27 }, (_, i) => 0.3 + i * 0.3).map((v) => (
        <path key={`r${v}`} d={poly([f.p(1.5, v), f.p(3.6, v)])} />
      ))}
      <path d={box(f, -1.5, 1.5, 0, T)} />
    </g>
    <path className="cut" d={poly([f.p(-46, 0), f.p(46, 0)])} />
    <Person x={f.x(-8)} ground={f.y(T)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, T)}
      b={f.p(HALF, T)}
      offset={T * S + 14}
      value={ms("width")}
    />
    <DimensionLine a={f.p(-40, T)} b={f.p(-40, 0)} offset={14} value={T} />
    <DimensionLine
      a={f.p(-15.2, TOP)}
      b={f.p(-15.2, T)}
      offset={(43 - 15.2) * S}
      value={ms("height")}
    />
  </>
);

const D = 70;
const d = frame(200, 330, D);
const dbox = (u0: number, u1: number, v0: number, v1: number) =>
  box(d, u0, u1, v0, v1);

function arm(half: number, v0: number, v1: number) {
  return (
    <path
      className="profile mask"
      d={`M${d.x(-half)},${d.y(v1)}L${d.x(half)},${d.y(v1)}L${d.x(half)},${d.y(v0 + 0.1)}Q${d.x(half)},${d.y(v0)} ${d.x(half - 0.15)},${d.y(v0)}L${d.x(-half + 0.15)},${d.y(v0)}Q${d.x(-half)},${d.y(v0)} ${d.x(-half)},${d.y(v0 + 0.1)}Z`}
    />
  );
}

function block(u: number, v0: number, w = 0.34) {
  return (
    <path
      key={`${u}-${v0}`}
      className="profile mask"
      d={poly(
        [
          d.p(u - w / 2, v0),
          d.p(u - w / 2 - 0.04, v0 + 0.2),
          d.p(u + w / 2 + 0.04, v0 + 0.2),
          d.p(u + w / 2, v0),
        ],
        true,
      )}
    />
  );
}

const detail = (
  <>
    <path className="profile mask" d={dbox(-COL / 2, COL / 2, -0.85, -0.35)} />
    <path className="profile mask" d={dbox(-2, 2, -0.35, 0)} />
    <path className="profile mask" d={dbox(-2, 2, 0, 0.14)} />
    <path
      className="profile mask"
      d={poly(
        [d.p(-0.3, 0.14), d.p(-0.45, 0.5), d.p(0.45, 0.5), d.p(0.3, 0.14)],
        true,
      )}
    />
    {arm(0.95, 0.5, 0.7)}
    {[-0.95, 0, 0.95].map((u) => block(u, 0.7))}
    {arm(1.35, 0.9, 1.1)}
    {[-1.35, -0.45, 0.45, 1.35].map((u) => block(u, 1.1))}
    {arm(1.7, 1.3, 1.5)}
    {[-1.7, -0.85, 0, 0.85, 1.7].map((u) => block(u, 1.5))}
    <path className="profile mask" d={dbox(-2.1, 2.1, 1.7, 1.95)} />
    <circle className="profile mask" cx={d.x(0)} cy={d.y(2.22)} r={0.27 * D} />
    <Arrow points={[d.p(-1.6, 1.62), d.p(-0.35, 0.3)]} />
    <Arrow points={[d.p(1.6, 1.62), d.p(0.35, 0.3)]} />
    <Arrow points={[d.p(0, -0.1), d.p(0, -0.8)]} />
  </>
);

export const forbiddenCity: Drawings = {
  main: {
    title: "Hall of Supreme Harmony, south front",
    caption:
      "The hall as rebuilt in 1695, on its three-tier marble terrace. Bracket sets, in red, sit between the columns and both tiers of eaves. The roof and bracket profiles are drawn from photographs and are approximate.",
    viewBox: [800, 400],
    art: main,
    labels: [
      { at: f.p(15.4, TOP - 1), to: [560, 30], text: "Ridge ornament" },
      { at: f.p(24, T + 18.5), to: [660, 70], text: "Double hipped roof" },
      { at: f.p(26.5, T + 14.8), to: [660, 120], text: "Dougong brackets" },
      { at: f.p(AXIS, T + 4), to: [660, 236], text: "Timber column" },
      {
        at: f.p(-38.5, T / 6),
        to: [140, 392],
        text: "Three-tier marble terrace",
      },
    ],
  },
  detail: {
    title: "One bracket set",
    caption:
      "A bracket set drawn larger. Wooden arms and small blocks stack in tiers, each wider than the one below, so the weight of the eaves gathers onto the column. The joints are fitted, not nailed, and can rock a little without coming apart.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(0.2, 2.45), to: [300, 40], text: "Eave purlin" },
      { at: d.p(1.5, 1.42), to: [300, 90], text: "Arms widen" },
      { at: d.p(-1.7, 1.6), to: [24, 90], text: "Small blocks" },
      { at: d.p(-0.4, 0.35), to: [24, 300], text: "Cap block" },
      { at: d.p(0.3, -0.7), to: [300, 380], text: "Column" },
    ],
  },
};
