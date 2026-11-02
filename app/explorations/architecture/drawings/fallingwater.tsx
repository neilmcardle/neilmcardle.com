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

const ms = measures("fallingwater");
const CANT = ms("cantilever");
const BEAM = ms("beam");
const PARAPET = 0.66;

const S = 19;
const f = frame(420, 450, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

const LEDGE = 5;
const LIVING = 8;
const SECOND = 11;
const THIRD = 14;
const PIERS = [-6, -2.2];
const TIP = PIERS[0] - CANT;

function terrace(u0: number, u1: number, v: number, key: string) {
  const r = PARAPET / 2;
  return (
    <path
      key={key}
      className="profile mask"
      d={`M${f.x(u0 + r)},${f.y(v)}L${f.x(u1 - r)},${f.y(v)}A${r * S},${r * S} 0 0 0 ${f.x(u1 - r)},${f.y(v + PARAPET)}L${f.x(u0 + r)},${f.y(v + PARAPET)}A${r * S},${r * S} 0 0 0 ${f.x(u0 + r)},${f.y(v)}Z`}
    />
  );
}

function glazing(u0: number, u1: number, v0: number, v1: number, step = 0.9) {
  const lines: Point[][] = [];
  for (let u = u0 + step; u < u1 - 0.1; u += step)
    lines.push([f.p(u, v0), f.p(u, v1)]);
  return (
    <g className="fine">
      <path d={box(u0, u1, v0, v1)} />
      {lines.map((l, i) => (
        <path key={i} d={poly(l)} />
      ))}
    </g>
  );
}

function stoneCourses(u0: number, u1: number, v0: number, v1: number) {
  const lines: Point[][] = [];
  for (let v = v0 + 0.35; v < v1; v += 0.35 + ((v * 7) % 3) * 0.06)
    lines.push([f.p(u0, v), f.p(u1, v)]);
  return (
    <g className="fine">
      {lines.map((l, i) => (
        <path key={i} d={poly(l)} />
      ))}
    </g>
  );
}

const WATER = Array.from({ length: 9 }, (_, i) => -13.5 + i * 0.9);

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={2} count={3} />
    <path className="fine" d={poly([f.p(-17, 0.3), f.p(12, 0.3)])} />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(-14, 0),
          f.p(-14, LEDGE),
          f.p(0, LEDGE + 0.2),
          f.p(4, LEDGE + 1),
          f.p(12, LEDGE + 2.4),
          f.p(12, 0),
        ],
        true,
      )}
    />
    <g className="fine">
      {[1.2, 2.4, 3.6].map((v) => (
        <path key={v} d={poly([f.p(-6, v + 0.1), f.p(12, v + v * 0.25)])} />
      ))}
    </g>
    <g className="fine dash">
      {WATER.map((u) => (
        <path
          key={u}
          d={`M${f.x(u)},${f.y(LEDGE)}Q${f.x(u - 0.3)},${f.y(LEDGE * 0.5)} ${f.x(u - 0.15)},${f.y(0.3)}`}
        />
      ))}
    </g>
    <path className="profile mask" d={box(3.5, 7.5, LEDGE + 1, THIRD + 5.5)} />
    {stoneCourses(3.5, 7.5, LEDGE + 1, THIRD + 5.5)}
    {PIERS.map((u) => (
      <g key={u}>
        <path
          className="profile mask"
          d={box(u - 0.5, u + 0.5, LEDGE + 0.1, LIVING - BEAM)}
        />
        {stoneCourses(u - 0.5, u + 0.5, LEDGE + 0.1, LIVING - BEAM)}
      </g>
    ))}
    {glazing(-5, 3.5, LIVING + PARAPET, SECOND)}
    {glazing(-2.5, 3.5, SECOND + PARAPET, THIRD)}
    {glazing(0.5, 3.5, THIRD + PARAPET, THIRD + 3)}
    <path className="profile mask" d={box(0.2, 7.8, THIRD + 3, THIRD + 3.3)} />
    <path className="idea mask" d={box(TIP, 3.5, LIVING - BEAM, LIVING)} />
    {terrace(TIP, 3.5, LIVING, "living")}
    {terrace(-7.5, 3.8, SECOND, "second")}
    {terrace(-2.8, 3.8, THIRD, "third")}
    <Person x={f.x(-8)} ground={f.y(LIVING)} scale={S} />
    <DimensionLine
      a={f.p(TIP, LIVING - BEAM)}
      b={f.p(PIERS[0], LIVING - BEAM)}
      offset={18}
      value={CANT}
    />
  </>
);

const D = 60;
const d = frame(80, 300, D);
const TOP = 3.0;
const SAG = ms("sag");

const detail = (
  <>
    <path
      className="cut poche rock"
      d={poly(
        [d.p(-1.1, 0), d.p(1.6, 0), d.p(1.6, -0.5), d.p(-1.1, -0.5)],
        true,
      )}
    />
    <path
      className="cut poche stone"
      d={poly(
        [
          d.p(-0.3, 0),
          d.p(-0.3, TOP - BEAM),
          d.p(0.3, TOP - BEAM),
          d.p(0.3, 0),
        ],
        true,
      )}
    />
    <path
      className="cut poche mid"
      d={poly(
        [
          d.p(-1, TOP - BEAM),
          d.p(-1, TOP + 0.1),
          d.p(CANT, TOP + 0.1),
          d.p(CANT, TOP - BEAM),
        ],
        true,
      )}
    />
    <path
      className="profile mask"
      d={`M${d.x(CANT - 0.33)},${d.y(TOP + 0.1)}L${d.x(CANT - 0.33)},${d.y(TOP + 0.1 + PARAPET - 0.33)}A${0.33 * D},${0.33 * D} 0 0 0 ${d.x(CANT)},${d.y(TOP + 0.1 + PARAPET - 0.33)}L${d.x(CANT)},${d.y(TOP + 0.1)}Z`}
    />
    <path
      className="fine dash"
      d={`M${d.x(0.3)},${d.y(TOP - BEAM)}Q${d.x(2.6)},${d.y(TOP - BEAM - SAG * 0.25)} ${d.x(CANT)},${d.y(TOP - BEAM - SAG)}`}
    />
    <path
      className="fine dash"
      d={`M${d.x(0.3)},${d.y(TOP + 0.1)}Q${d.x(2.6)},${d.y(TOP + 0.1 - SAG * 0.25)} ${d.x(CANT)},${d.y(TOP + 0.1 - SAG)}`}
    />
    <path
      className="idea"
      d={`M${d.x(-0.95)},${d.y(TOP - 0.12)}Q${d.x(0.6)},${d.y(TOP - BEAM + 0.12)} ${d.x(CANT - 0.05)},${d.y(TOP - 0.2)}`}
    />
    <Arrow points={[d.p(-0.6, TOP - 0.2), d.p(-1.0, TOP - 0.12)]} />
    <Arrow
      points={[d.p(CANT - 0.4, TOP - 0.22), d.p(CANT + 0.05, TOP - 0.2)]}
    />
    <Person x={d.x(2.4)} ground={d.y(TOP + 0.1)} scale={D} />
    <DimensionLine
      a={d.p(0.3, TOP - BEAM)}
      b={d.p(CANT, TOP - BEAM)}
      offset={70}
      value={CANT}
    />
    <DimensionLine
      a={d.p(CANT, TOP + 0.1)}
      b={d.p(CANT, TOP - BEAM)}
      offset={-16}
      value={BEAM}
    />
  </>
);

export const fallingwater: Drawings = {
  main: {
    title: "South front, over the falls",
    caption:
      "The house from downstream, with the living-room terrace cantilevered out over the falls; its cantilever is in red. The 15 ft cantilever is from published figures; the rock, falls and floor levels are drawn from photographs.",
    viewBox: [800, 480],
    art: main,
    labels: [
      {
        at: f.p(TIP + 1.4, LIVING - BEAM / 2),
        to: [236, 150],
        text: "Cantilevered terrace",
        anchor: "end",
      },
      { at: f.p(5.5, THIRD + 2), to: [660, 70], text: "Stone chimney core" },
      {
        at: f.p(-6, LEDGE + 1.5),
        to: [120, 300],
        text: "Pier on the rock",
        anchor: "end",
      },
      { at: f.p(-11, 2.5), to: [120, 400], text: "Waterfall", anchor: "end" },
      { at: f.p(1.5, 9.6), to: [660, 200], text: "Glass between slabs" },
    ],
  },
  detail: {
    title: "The cantilever and its repair",
    caption:
      "Section along a main beam. By 1995 the tip had sagged about 7 inches (dashed). In 2002 steel tendons, in red, were threaded along the beams and tightened against anchors, lifting the terrace slightly and holding it.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(0, 1.2), to: [24, 360], text: "Stone pier" },
      {
        at: d.p(3.2, TOP - BEAM - SAG * 0.6),
        to: [220, 360],
        text: "Sag by 1995",
      },
      { at: d.p(1.8, TOP - 0.3), to: [24, 60], text: "Steel tendon, 2002" },
      { at: d.p(1.2, TOP - 0.45), to: [120, 190], text: "Concrete beam" },
    ],
  },
};
