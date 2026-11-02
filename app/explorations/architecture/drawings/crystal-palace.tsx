import { measures } from "../sources";
import {
  Arrow,
  DimensionLine,
  frame,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const ms = measures("crystal-palace");
const M = ms("module");
const RIDGE = ms("ridge");
const TRANSEPT = ms("transept");
const TIERS: [number, number][] = [
  [9.5, 7.32],
  [7.5, 13.4],
  [3.5, 19.5],
];
const ARCH_R = 1.5 * M;
const ARCH_SPRING = TRANSEPT - ARCH_R;

const S = 5.2;
const f = frame(400, 300, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

function zigzag(u0: number, u1: number, v: number, rise = 0.5): Point[] {
  const pts: Point[] = [];
  for (let u = u0, i = 0; u <= u1 + 0.01; u += RIDGE / 2, i++)
    pts.push(f.p(u, v + (i % 2 ? rise : 0)));
  return pts;
}

function tier(halfModules: number, top: number, base: number, key: string) {
  const half = halfModules * M;
  const cols = Array.from(
    { length: halfModules * 2 + 1 },
    (_, i) => -half + i * M,
  );
  const mullions: number[] = [];
  cols.slice(0, -1).forEach((u) => mullions.push(u + M / 3, u + (2 * M) / 3));
  return (
    <g key={key}>
      <path className="profile mask" d={box(-half, half, base, top)} />
      <g className="fine">
        {mullions.map((u) => (
          <path key={u} d={poly([f.p(u, base), f.p(u, top - 0.9)])} />
        ))}
        <path
          d={poly([
            f.p(-half, base + (top - base) * 0.45),
            f.p(half, base + (top - base) * 0.45),
          ])}
        />
        <path d={poly([f.p(-half, top - 0.9), f.p(half, top - 0.9)])} />
      </g>
      <g className="profile">
        {cols.map((u) => (
          <path key={u} d={poly([f.p(u, base), f.p(u, top - 0.9)])} />
        ))}
      </g>
      <path className="fine" d={poly(zigzag(-half, half, top))} />
    </g>
  );
}

function transept() {
  const ribs = Array.from({ length: 13 }, (_, i) => (Math.PI * i) / 12);
  const arc = (r: number) =>
    poly(
      Array.from({ length: 33 }, (_, i) =>
        f.p(
          r * Math.cos((Math.PI * i) / 32),
          ARCH_SPRING + r * Math.sin((Math.PI * i) / 32),
        ),
      ),
    );
  return (
    <g>
      <path
        className="profile mask"
        d={`${arc(ARCH_R)}L${f.x(-ARCH_R)},${f.y(TIERS[2][1])}L${f.x(ARCH_R)},${f.y(TIERS[2][1])}Z`}
      />
      <g className="fine">
        {ribs.map((a) => (
          <path
            key={a}
            d={poly([
              f.p(
                0.25 * ARCH_R * Math.cos(a),
                ARCH_SPRING + 0.25 * ARCH_R * Math.sin(a),
              ),
              f.p(ARCH_R * Math.cos(a), ARCH_SPRING + ARCH_R * Math.sin(a)),
            ])}
          />
        ))}
        <path d={arc(ARCH_R * 0.25)} />
        <path d={arc(ARCH_R * 0.62)} />
      </g>
      <path className="profile" d={arc(ARCH_R)} />
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    {transept()}
    {tier(TIERS[2][0], TIERS[2][1], TIERS[1][1], "t3")}
    {tier(TIERS[1][0], TIERS[1][1], TIERS[0][1], "t2")}
    {tier(TIERS[0][0], TIERS[0][1], 0, "t1")}
    <path className="idea" d={box(2 * M, 3 * M, 0, TIERS[0][1])} />
    <path className="cut" d={poly([f.p(-74, 0), f.p(74, 0)])} />
    <DimensionLine a={f.p(2 * M, 0)} b={f.p(3 * M, 0)} offset={14} value={M} />
    <DimensionLine
      a={f.p(-9.5 * M, 0)}
      b={f.p(9.5 * M, 0)}
      offset={38}
      value={ms("width")}
    />
    <DimensionLine
      a={f.p(0, TRANSEPT)}
      b={f.p(0, 0)}
      offset={370}
      value={TRANSEPT}
    />
  </>
);

const D = 46;
const d = frame(30, 372, D);
const dbox = (u0: number, u1: number, v0: number, v1: number) =>
  poly([d.p(u0, v0), d.p(u0, v1), d.p(u1, v1), d.p(u1, v0)], true);
const GIRDER: [number, number] = [4.1, 5.0];
const ROOF = GIRDER[1] + 0.15;
const RISE = 0.25;

function furrows() {
  const pts: Point[] = [];
  for (let k = 0; k <= 6; k++)
    pts.push(d.p((k * RIDGE) / 2 + 0.2, ROOF + (k % 2 ? RISE : 0)));
  return pts;
}

const GUTTERS = [0, 1, 2, 3].map((k) => k * RIDGE + 0.2);

const detail = (
  <>
    <path className="profile mask" d={dbox(-0.12, 0.3, 0, GIRDER[1])} />
    <path className="fine" d={poly([d.p(0.03, 0), d.p(0.03, GIRDER[0])])} />
    <path className="fine" d={poly([d.p(0.15, 0), d.p(0.15, GIRDER[0])])} />
    <path className="profile mask" d={dbox(M - 0.2, M + 0.22, 0, GIRDER[1])} />
    <path
      className="profile mask"
      d={dbox(0.3, M - 0.2, GIRDER[0], GIRDER[1])}
    />
    <g className="fine">
      {Array.from({ length: 12 }, (_, i) => 0.3 + (i * (M - 0.5)) / 12).map(
        (u, i) => (
          <path
            key={u}
            d={poly([
              d.p(u, i % 2 ? GIRDER[0] : GIRDER[1]),
              d.p(u + (M - 0.5) / 12, i % 2 ? GIRDER[1] : GIRDER[0]),
            ])}
          />
        ),
      )}
    </g>
    <path className="profile" d={poly(furrows())} />
    {GUTTERS.map((u) => (
      <path
        key={u}
        className="profile mask"
        d={poly(
          [
            d.p(u - 0.13, ROOF + 0.02),
            d.p(u - 0.11, ROOF - 0.18),
            d.p(u + 0.11, ROOF - 0.18),
            d.p(u + 0.13, ROOF + 0.02),
          ],
          true,
        )}
      />
    ))}
    <Arrow points={[d.p(1.25, ROOF + 0.55), d.p(0.35, ROOF + 0.1)]} />
    <Arrow points={[d.p(0.1, ROOF - 0.3), d.p(0.09, 1.0)]} />
    <DimensionLine
      a={d.p(0.2, ROOF + RISE)}
      b={d.p(0.2 + RIDGE, ROOF + RISE)}
      offset={-24}
      value={RIDGE}
    />
  </>
);

export const crystalPalace: Drawings = {
  main: {
    title: "South front of the transept",
    caption:
      "The south end of the building, with the arched transept rising above three tiers. Everything is on a 24 ft grid; one bay is outlined in red. The width, grid and transept height are from published figures; the tier heights are estimates.",
    viewBox: [800, 374],
    art: main,
    labels: [
      {
        at: f.p(ARCH_R * 0.5, ARCH_SPRING + ARCH_R * 0.85),
        to: [560, 60],
        text: "Arched transept",
      },
      {
        at: f.p(-6.4 * M, TIERS[1][1] + 0.3),
        to: [240, 120],
        text: "Ridge-and-furrow roof",
        anchor: "end",
      },
      { at: f.p(-8.6 * M, 5.5), to: [60, 200], text: "Iron and glass" },
    ],
  },
  detail: {
    title: "Roof and drainage",
    caption:
      "Section through one bay of roof. The glass is laid in ridges and furrows. Rain runs off the glass into Paxton's timber gutters in the furrows, along to the girder, and down inside the hollow cast-iron columns, which doubled as drainpipes.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: d.p(1.8, ROOF + 0.15),
        to: [230, 70],
        text: "Glass ridge and furrow",
      },
      {
        at: d.p(RIDGE + 0.3, ROOF - 0.1),
        to: [230, 200],
        text: "Paxton gutter",
      },
      { at: d.p(3, GIRDER[0] + 0.2), to: [230, 270], text: "Iron girder" },
      { at: d.p(0.15, 2.5), to: [130, 340], text: "Hollow column" },
    ],
  },
};
