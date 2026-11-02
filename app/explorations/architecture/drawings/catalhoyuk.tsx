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

const m = measures("catalhoyuk");

type Frame = ReturnType<typeof frame>;

const T = m("wall");
const SLAB = 0.3;

const box = (m: Frame, u0: number, u1: number, v0: number, v1: number) =>
  poly([m.p(u0, v0), m.p(u0, v1), m.p(u1, v1), m.p(u1, v0)], true);

function ladder(
  m: Frame,
  foot: number,
  floor: number,
  top: number,
  head: number,
) {
  const rungs = Array.from({ length: 7 }, (_, i) => (i + 1) / 8);
  const at = (t: number, side: number): Point =>
    m.p(foot + (top - foot) * t + side, floor + (head - floor) * t);
  return (
    <g className="fine">
      <path d={poly([at(0, 0), at(1, 0)])} />
      <path d={poly([at(0, 0.4), at(1, 0.4)])} />
      {rungs.map((t) => (
        <path key={t} d={poly([at(t, 0), at(t, 0.4)])} />
      ))}
    </g>
  );
}

function oven(m: Frame, u: number, floor: number, w = 0.9, h = 0.7) {
  return (
    <path
      className="profile mask"
      d={`M${m.x(u - w / 2)},${m.y(floor)}Q${m.x(u - w / 2)},${m.y(floor + h * 1.3)} ${m.x(u)},${m.y(floor + h)}Q${m.x(u + w / 2)},${m.y(floor + h * 1.3)} ${m.x(u + w / 2)},${m.y(floor)}`}
    />
  );
}

const ROOM = m("room");
const HEIGHT = m("height");

const HOUSES: [number, number, number, number][] = [
  [-18.2, -12.6, 0.0, 3.0],
  [-12.6, -6.4, 0.6, 3.5],
  [-6.4, -0.6, 0.3, 3.2],
  [-0.6, -0.6 + ROOM + 2 * T, 1.0, 1.0 + HEIGHT],
  [6.4, 12.0, 0.5, 3.3],
  [12.0, 17.6, 0.0, 2.9],
];

const S = 19.5;
const f = frame(404, 290, S);

function house([u0, u1, floor, roof]: [number, number, number, number]) {
  const hatch = u1 - T - 1.2;
  return (
    <g key={u0}>
      <path className="cut poche earth" d={box(f, u0, u1, -3, floor - SLAB)} />
      <g className="fine dash">
        <path d={poly([f.p(u0 + 0.9, -3), f.p(u0 + 0.9, floor - 0.6)])} />
        <path d={poly([f.p(u1 - 1.3, -3), f.p(u1 - 1.3, floor - 0.6)])} />
        <path d={poly([f.p(u0 + 0.9, -1.6), f.p(u1 - 1.3, -1.6)])} />
      </g>
      <path
        className="profile"
        d={poly([f.p(u0 + T, floor), f.p(u1 - T, floor)])}
      />
      <path
        className="profile"
        d={box(f, u0 + T, u0 + T + 1.8, floor, floor + 0.3)}
      />
      <path
        className="cut poche mid"
        d={box(f, u0, u0 + T, floor - SLAB, roof + SLAB)}
      />
      <path
        className="cut poche mid"
        d={box(f, u1 - T, u1, floor - SLAB, roof + SLAB)}
      />
      <path
        className="cut poche mid"
        d={box(f, u0 + T, hatch - 0.4, roof, roof + SLAB)}
      />
      <path
        className="cut poche mid"
        d={box(f, hatch + 0.4, u1 - T, roof, roof + SLAB)}
      />
      {ladder(f, hatch - 1.25, floor, hatch - 0.25, roof + SLAB)}
      {oven(f, u1 - T - 0.55, floor)}
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={1} count={5} />
    <path
      className="cut poche earth"
      d={poly([f.p(-20.2, -3), f.p(-18.2, 0.3), f.p(-18.2, -3)], true)}
    />
    <path
      className="cut poche earth"
      d={poly([f.p(19.4, -3), f.p(17.6, 0.3), f.p(17.6, -3)], true)}
    />
    {HOUSES.map(house)}
    <path className="cut" d={poly([f.p(-20.4, -3), f.p(19.8, -3)])} />
    <DimensionLine
      a={f.p(-0.6 + T, 1.0 + HEIGHT + SLAB)}
      b={f.p(-0.6 + T + ROOM, 1.0 + HEIGHT + SLAB)}
      offset={-46}
      value={ROOM}
    />
    <DimensionLine
      a={f.p(-0.6 + T + 0.4, 1.0 + HEIGHT)}
      b={f.p(-0.6 + T + 0.4, 1.0)}
      offset={-8}
      value={HEIGHT}
    />
    <Arrow
      points={[
        f.p(-5.6, 3.85),
        f.p(-2.4, 3.85),
        f.p(-2.6, 3.0),
        f.p(-3.3, 1.0),
      ]}
    />
    <Person x={f.x(8.6)} ground={f.y(3.3 + SLAB)} scale={S} />
    <Person x={f.x(-4.6)} ground={f.y(0.3)} scale={S} />
  </>
);

const D = 48;
const d = frame(200, 320, D);

const detail = (
  <>
    <path className="cut poche earth" d={box(d, -3.9, 3.9, -0.8, -SLAB)} />
    <path className="cut poche mid" d={box(d, -3 - T, -3, -SLAB, 3.0 + SLAB)} />
    <path className="cut poche mid" d={box(d, 3, 3 + T, -SLAB, 3.0 + SLAB)} />
    <path className="cut poche mid" d={box(d, -3, 1.4, 3.0, 3.0 + SLAB)} />
    <path className="cut poche mid" d={box(d, 2.2, 3, 3.0, 3.0 + SLAB)} />
    <path className="cut" d={poly([d.p(-3.9, 3.3), d.p(-3 - T, 3.3)])} />
    <path className="cut" d={poly([d.p(3 + T, 3.3), d.p(3.9, 3.3)])} />
    <path className="profile" d={poly([d.p(-3, 0), d.p(3, 0)])} />
    <path className="profile" d={box(d, -3, -1.2, 0, 0.35)} />
    <ellipse
      className="fine dash"
      cx={d.x(-2.1)}
      cy={d.y(-0.5)}
      rx={0.5 * D}
      ry={0.16 * D}
    />
    <g className="fine">
      <path
        d={`M${d.x(-1.25)},${d.y(1.6)}Q${d.x(-1.0)},${d.y(1.3)} ${d.x(-0.75)},${d.y(1.6)}L${d.x(-0.78)},${d.y(2.0)}L${d.x(-1.22)},${d.y(2.0)}Z`}
      />
      <path
        d={`M${d.x(-1.22)},${d.y(1.95)}Q${d.x(-1.75)},${d.y(1.95)} ${d.x(-1.55)},${d.y(2.5)}`}
      />
      <path
        d={`M${d.x(-0.78)},${d.y(1.95)}Q${d.x(-0.25)},${d.y(1.95)} ${d.x(-0.45)},${d.y(2.5)}`}
      />
      <path d={box(d, -2.6, -1.6, 0.9, 1.6)} />
    </g>
    {ladder(d, 0.35, 0, 1.4, 3.3)}
    {oven(d, 2.45, 0, 1.0, 0.8)}
    <path
      className="idea"
      d={`M${d.x(2.45)},${d.y(0.95)}C${d.x(2.1)},${d.y(1.6)} ${d.x(2.6)},${d.y(2.2)} ${d.x(2.0)},${d.y(2.8)}S${d.x(1.9)},${d.y(3.6)} ${d.x(1.75)},${d.y(4.2)}`}
    />
    <Arrow points={[d.p(1.78, 4.0), d.p(1.75, 4.25)]} />
    <Arrow points={[d.p(1.0, 4.3), d.p(1.15, 3.4), d.p(0.45, 0.6)]} />
    <Person x={d.x(-0.5)} ground={d.y(0)} scale={D} />
  </>
);

export const catalhoyuk: Drawings = {
  main: {
    title: "Section through a cluster of houses",
    caption:
      "Section through six houses built wall against wall. There are no streets or doors at ground level: people walked across the roofs and climbed down ladders. The red line follows the way in.",
    viewBox: [800, 420],
    art: main,
    labels: [
      { at: f.p(8.75, 4.9), to: [640, 120], text: "Roofs were the streets" },
      {
        at: [f.x(-1.7), f.y(3.35)],
        to: [330, 110],
        text: "Hatch and ladder",
        anchor: "end",
      },
      {
        at: f.p(6.4, 2.5),
        to: [600, 165],
        text: "Each house has its own walls",
      },
      {
        at: [f.x(-15.5), f.y(0.15)],
        to: [110, 160],
        text: "Platform",
        anchor: "end",
      },
      {
        at: [f.x(-1.4), f.y(0.55)],
        to: [330, 400],
        text: "Oven below the hatch",
        anchor: "end",
      },
      {
        at: [f.x(8), f.y(-1.6)],
        to: [560, 400],
        text: "Older houses buried below",
      },
    ],
  },
  detail: {
    title: "One house, drawn larger",
    caption:
      "The roof hatch was both door and chimney. Smoke from the oven rose out past the ladder people climbed in by. The dead were buried under the platforms.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: [d.x(1.8), d.y(3.4)],
        to: [230, 40],
        text: "Hatch: door and chimney",
      },
      { at: d.p(-1.0, 1.75), to: [24, 60], text: "Plastered bull horns" },
      { at: [d.x(0.75), d.y(1.6)], to: [176, 112], text: "Ladder" },
      { at: [d.x(2.45), d.y(0.4)], to: [330, 374], text: "Oven" },
      { at: [d.x(-2.4), d.y(0.18)], to: [24, 374], text: "Platform" },
      {
        at: [d.x(-1.7), d.y(-0.5)],
        to: [150, 388],
        text: "Burials below the floor",
      },
    ],
  },
};
