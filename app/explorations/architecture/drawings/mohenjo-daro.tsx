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

const m = measures("mohenjo-daro");
const EAST = 100 + m("street");
const CH = m("drain");

type Rect = { e: number; s: number; w: number; h: number };

function random(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const S = 2.6;
const X0 = 30;
const Y0 = 100;
const px = (e: number, s: number): Point => [X0 + e * S, Y0 + s * S];
const rect = ({ e, s, w, h }: Rect) =>
  poly([px(e, s), px(e + w, s), px(e + w, s + h), px(e, s + h)], true);

const COLS: [number, number][] = [
  [0, 100],
  [EAST, 185],
  [190, 240],
];
const ROWS: [number, number][] = [
  [0, 45],
  [52, 100],
  [106, 140],
];

const rand = random(7);

function split(r: Rect, depth: number, out: Rect[]) {
  if (r.w * r.h < 340 || depth > 4 || Math.min(r.w, r.h) < 9) {
    out.push(r);
    return;
  }
  const k = 0.38 + rand() * 0.24;
  if (r.w >= r.h) {
    const a = Math.round(r.w * k);
    split({ ...r, w: a }, depth + 1, out);
    split({ ...r, e: r.e + a, w: r.w - a }, depth + 1, out);
  } else {
    const a = Math.round(r.h * k);
    split({ ...r, h: a }, depth + 1, out);
    split({ ...r, s: r.s + a, h: r.h - a }, depth + 1, out);
  }
}

const BLOCKS: Rect[] = [];
const LANES: Rect[] = [];
const HOUSES: Rect[] = [];

COLS.forEach(([e0, e1]) =>
  ROWS.forEach(([s0, s1]) => {
    const block = { e: e0, s: s0, w: e1 - e0, h: s1 - s0 };
    BLOCKS.push(block);
    const parts: Rect[] = [];
    if (block.w > 60) {
      const at = e0 + Math.round(block.w * (0.42 + rand() * 0.16));
      LANES.push({ e: at, s: s0, w: 2, h: block.h });
      parts.push(
        { ...block, w: at - e0 },
        { ...block, e: at + 2, w: e1 - at - 2 },
      );
    } else {
      parts.push(block);
    }
    parts.forEach((part) => split(part, 0, HOUSES));
  }),
);

const courtyard = (h: Rect) => h.w > 12 && h.h > 12;
const COURTYARDS = HOUSES.filter(courtyard);
const WELLS = HOUSES.filter((_, i) => i % 5 === 2);
const CHUTES = HOUSES.filter(
  (h) => (h.e + h.w === 100 || h.e === EAST) && Math.round(h.s) % 2 === 0,
);

const DRAINS: Point[][] = [
  [px(101, 0), px(101, 140)],
  [px(EAST - 1, 0), px(EAST - 1, 140)],
  [px(0, 48.5), px(240, 48.5)],
  [px(0, 103), px(240, 103)],
  [px(187.5, 0), px(187.5, 140)],
];
const HOLES: Point[] = [
  ...[12, 30, 66, 84, 120].map((s) => px(101, s)),
  ...[22, 76, 128].map((s) => px(EAST - 1, s)),
  ...[20, 64, 150, 214].map((e) => px(e, 48.5)),
  ...[40, 140, 210].map((e) => px(e, 103)),
];

const featureHouse =
  COURTYARDS.find((h) => h.e > 190 && h.s > 100) ??
  COURTYARDS.find((h) => h.s > 100) ??
  COURTYARDS[0];
const wellHouse =
  WELLS.find((h) => h.e > 120 && h.s > 100) ??
  WELLS.find((h) => h.s > 100) ??
  WELLS[0];
const wellAt = (h: Rect) => px(h.e + 2.2, h.s + 2.2);
const chute = CHUTES.find((h) => h.s > 100) ?? CHUTES[0];
const chuteFrom = (h: Rect) =>
  h.e === EAST ? px(EAST, h.s + h.h / 2) : px(100, h.s + h.h / 2);
const chuteTo = (h: Rect) =>
  h.e === EAST ? px(EAST - 1, h.s + h.h / 2) : px(101, h.s + h.h / 2);
const lane = LANES.find((l) => l.e > EAST && l.s > 100) ?? LANES[0];

const BOTTOM = [
  {
    at: HOLES.find(([, y]) => y > Y0 + 120 * S) ?? HOLES[0],
    text: "Inspection hole",
  },
  { at: chuteFrom(chute), text: "House drain" },
  { at: px(lane.e + 1, 138), text: "Narrow lane" },
  { at: wellAt(wellHouse), text: "Well" },
  {
    at: px(
      featureHouse.e + featureHouse.w / 2,
      featureHouse.s + featureHouse.h / 2,
    ),
    text: "Courtyard house",
  },
]
  .sort((a, b) => a.at[0] - b.at[0])
  .map((l, i) => ({
    ...l,
    to: [l.at[0], i % 2 ? 504 : 482] as Point,
    anchor: "middle" as const,
  }));

const main = (
  <>
    <ScaleBar x={30} y={36} scale={S} step={10} count={3} />
    <g className="profile">
      {HOUSES.map((h, i) => (
        <path key={i} d={rect(h)} />
      ))}
    </g>
    <g className="fine">
      {COURTYARDS.map((h, i) => (
        <path
          key={i}
          d={rect({
            e: h.e + h.w * 0.32,
            s: h.s + h.h * 0.32,
            w: h.w * 0.36,
            h: h.h * 0.36,
          })}
        />
      ))}
      {WELLS.map((h, i) => (
        <circle key={i} cx={wellAt(h)[0]} cy={wellAt(h)[1]} r={0.9 * S} />
      ))}
    </g>
    <g className="cut">
      {BLOCKS.map((b, i) => (
        <path key={i} d={rect(b)} />
      ))}
    </g>
    <g className="idea">
      {DRAINS.map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
      {CHUTES.map((h, i) => (
        <path key={i} d={poly([chuteFrom(h), chuteTo(h)])} />
      ))}
      {HOLES.map(([x, y], i) => (
        <rect
          key={i}
          x={x - 2.2}
          y={y - 2.2}
          width={4.4}
          height={4.4}
          className="mask"
        />
      ))}
    </g>
    <path
      className="profile"
      d={poly([
        [770, 58],
        [770, 30],
      ])}
    />
    <path
      className="profile"
      d={poly([
        [765, 38],
        [770, 30],
        [775, 38],
      ])}
    />
    <Person x={px(104.5, 60)[0]} ground={px(104.5, 60)[1]} scale={S} />
    <DimensionLine
      a={px(100, 0)}
      b={px(EAST, 0)}
      offset={-10}
      value={m("street")}
    />
  </>
);

const D = 36;
const d = frame(200, 300, D);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([d.p(u0, v0), d.p(u0, v1), d.p(u1, v1), d.p(u1, v0)], true);

const detail = (
  <>
    <path className="cut poche earth" d={box(-4.6, 4.6, -1.6, 0)} />
    <path className="cut poche mid" d={box(-3.25, -2.5, -0.7, -0.06)} />
    <path className="profile mask" d={box(-3.0, -3.0 + CH, -0.45, -0.06)} />
    <path className="cut poche stone" d={box(-3.4, -2.35, -0.06, 0.08)} />
    <path className="cut poche mid" d={box(-1.5, -0.1, -1.3, 0)} />
    <path className="profile mask" d={box(-1.25, -0.35, -1.1, -0.05)} />
    <path className="profile mask" d={box(-2.75, -1.25, -0.36, -0.2)} />
    <path className="cut poche mid" d={box(0, 0.9, -0.6, 6.4)} />
    <path
      className="profile mask"
      d={poly(
        [
          d.p(0.32, 3.55),
          d.p(0.32, -0.12),
          d.p(-0.35, -0.12),
          d.p(-0.35, -0.32),
          d.p(0.58, -0.32),
          d.p(0.58, 3.55),
        ],
        true,
      )}
    />
    <path className="cut" d={poly([d.p(-4.6, 0), d.p(-3.6, 0)])} />
    <path className="cut" d={poly([d.p(-2.1, 0), d.p(-1.5, 0)])} />
    <path className="cut" d={poly([d.p(-0.1, 0), d.p(0, 0)])} />
    <path className="cut poche earth" d={box(0.9, 4.6, -0.6, 0.4)} />
    <path className="cut poche stone" d={box(0.9, 4.6, 3.2, 3.5)} />
    <path
      className="profile"
      d={poly([d.p(0.9, 3.68), d.p(2.6, 3.58), d.p(2.6, 3.5)])}
    />
    <path
      className="profile"
      d={poly([d.p(2.6, 3.5), d.p(2.6, 3.75), d.p(2.75, 3.75), d.p(2.75, 3.5)])}
    />
    <path className="cut poche stone" d={box(0, 4.6, 6.4, 6.7)} />
    <Arrow
      points={[
        d.p(2.2, 3.85),
        d.p(0.75, 3.75),
        d.p(0.45, 3.2),
        d.p(0.45, 0.2),
        d.p(0.1, -0.22),
        d.p(-0.75, -0.6),
      ]}
    />
    <Arrow points={[d.p(-1.4, -0.28), d.p(-2.7, -0.28)]} />
    <Person x={d.x(1.8)} ground={d.y(3.62)} scale={D} />
  </>
);

export const mohenjoDaro: Drawings = {
  main: {
    title: "Plan of the lower town",
    caption:
      "A representative plan, not a survey. The street widths, lanes and house sizes follow the lower town, but the houses are schematic. Covered drains, in red, run along the streets, with inspection holes and short drains coming in from the houses.",
    viewBox: [800, 530],
    art: main,
    labels: [
      { at: [770, 22], text: "N", anchor: "middle" },
      { at: px(104.5, 3), to: [262, 82], text: "Main street", anchor: "end" },
      { at: px(EAST - 1, 3), to: [360, 64], text: "Covered drain" },
      ...BOTTOM,
    ],
  },
  detail: {
    title: "Street edge, in section",
    caption:
      "Water from an upstairs bathing floor runs down a chute in the wall into a brick sump at the street edge. Silt settles there; the water flows on into the covered drain under the street.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(1.2, 3.67), to: [296, 214], text: "Bathing floor" },
      { at: d.p(0.58, 1.6), to: [296, 250], text: "Chute in wall" },
      { at: d.p(-2.88, -0.3), to: [24, 200], text: "Covered street drain" },
      {
        at: d.p(-0.8, -0.9),
        to: [194, 272],
        text: "Sump catches silt",
        anchor: "end",
      },
      { at: d.p(-3.3, 0.04), to: [24, 232], text: "Lift bricks to clean it" },
    ],
  },
};
