import { measures } from "../sources";
import {
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
} from "./kit";

const ms = measures("home-insurance");
const HALF = ms("width") / 2;
const FT = 0.3048;
const STOREYS = [19, 13, 12, 12, 11, 11, 11, 11, 18].map((h) => h * FT);
const LEVELS = STOREYS.reduce<number[]>(
  (acc, h) => [...acc, acc[acc.length - 1] + h],
  [0],
);
const TOP = LEVELS[LEVELS.length - 1];
const BAYS = 8;
const BAY = (2 * HALF) / BAYS;
const LINES = Array.from({ length: BAYS + 1 }, (_, i) => -HALF + i * BAY);

const S = 9;
const f = frame(400, 380, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

const facade = (
  <g>
    <path className="profile mask" d={box(-HALF, 0, 0, TOP)} />
    <g className="fine">
      {LEVELS.slice(1, -1).map((v) => (
        <path key={v} d={poly([f.p(-HALF, v), f.p(0, v)])} />
      ))}
      {LINES.filter((u) => u < 0).flatMap((u) =>
        STOREYS.map((h, k) => {
          const v0 = LEVELS[k] + (k === 0 ? 0.6 : 0.9);
          const v1 = LEVELS[k] + h - 0.6;
          return (
            <path key={`${u}-${k}`} d={box(u + 0.7, u + BAY - 0.7, v0, v1)} />
          );
        }),
      )}
    </g>
    <g className="profile">
      {LINES.filter((u) => u <= 0).map((u) => (
        <path key={u} d={box(u - 0.45, u + 0.45, 0, TOP)} />
      ))}
    </g>
  </g>
);

const skeleton = (
  <g>
    <path className="fine dash" d={box(0, HALF, 0, TOP)} />
    <g className="idea">
      {LINES.filter((u) => u >= 0).map((u) => (
        <path key={u} d={poly([f.p(u, 0), f.p(u, TOP)])} />
      ))}
      {LEVELS.slice(1).map((v) => (
        <path key={v} d={poly([f.p(0, v), f.p(HALF, v)])} />
      ))}
    </g>
    <g className="fine">
      {LEVELS.slice(1).flatMap((v) =>
        LINES.filter((u) => u >= 0 && u < HALF - 0.1).map((u) => (
          <path
            key={`${u}-${v}`}
            d={`M${f.x(u)},${f.y(v - 0.35)}Q${f.x(u + BAY / 2)},${f.y(v - 0.05)} ${f.x(u + BAY)},${f.y(v - 0.35)}`}
          />
        )),
      )}
    </g>
  </g>
);

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    {facade}
    {skeleton}
    <path className="profile mask" d={box(-HALF - 0.6, 0, TOP, TOP + 1.2)} />
    <path className="cut" d={poly([f.p(-30, 0), f.p(30, 0)])} />
    <Person x={f.x(-2)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={16}
      value={ms("width")}
    />
    <DimensionLine
      a={f.p(-HALF - 0.6, TOP)}
      b={f.p(-HALF - 0.6, 0)}
      offset={16}
      value={ms("height")}
    />
  </>
);

const D = 62;
const d = frame(150, 360, D);
const dbox = (u0: number, u1: number, v0: number, v1: number) =>
  poly([d.p(u0, v0), d.p(u0, v1), d.p(u1, v1), d.p(u1, v0)], true);
const FLOOR = 3.6;

const detail = (
  <>
    <path className="cut poche mid" d={dbox(-0.8, -0.2, 0, 5.2)} />
    <path className="cut poche mid" d={dbox(0.2, 0.8, 0, FLOOR - 0.45)} />
    <path className="cut poche mid" d={dbox(0.2, 0.8, FLOOR + 0.1, 5.2)} />
    <path className="idea mask" d={dbox(-0.2, 0.2, 0, 5.2)} />
    <path className="fine" d={poly([d.p(-0.08, 0), d.p(-0.08, 5.2)])} />
    <path className="fine" d={poly([d.p(0.08, 0), d.p(0.08, 5.2)])} />
    <path
      className="idea mask"
      d={dbox(0.2, 0.95, FLOOR - 0.45, FLOOR - 0.3)}
    />
    <g className="idea">
      <path className="mask" d={dbox(0.95, 1.25, FLOOR - 0.05, FLOOR + 0.02)} />
      <path className="mask" d={dbox(1.07, 1.13, FLOOR - 0.42, FLOOR - 0.05)} />
      <path className="mask" d={dbox(0.95, 1.25, FLOOR - 0.49, FLOOR - 0.42)} />
    </g>
    <path
      className="cut poche mid"
      d={`M${d.x(1.25)},${d.y(FLOOR + 0.02)}L${d.x(3.8)},${d.y(FLOOR + 0.02)}L${d.x(3.8)},${d.y(FLOOR - 0.42)}Q${d.x(2.52)},${d.y(FLOOR - 0.18)} ${d.x(1.25)},${d.y(FLOOR - 0.42)}Z`}
    />
    <path className="cut" d={poly([d.p(-1.6, 0), d.p(3.9, 0)])} />
    <Person x={d.x(3.45)} ground={d.y(0)} scale={D} />
  </>
);

export const homeInsurance: Drawings = {
  main: {
    title: "LaSalle Street front, opened up",
    caption:
      "The 138 ft front as built in 1885, with nine storeys at the floor heights published in 1884. On the left, the brick and stone front; on the right, the same front with its walls removed to show the iron frame, in red, that carried them. The bay spacing is an estimate.",
    viewBox: [800, 436],
    art: main,
    labels: [
      { at: f.p(BAY * 3, 9), to: [640, 290], text: "Iron columns" },
      { at: f.p(BAY * 3.5, LEVELS[5]), to: [640, 180], text: "Iron beams" },
      {
        at: f.p(BAY * 3.5, LEVELS[8]),
        to: [640, 70],
        text: "Steel beams above",
      },
      {
        at: f.p(-HALF + BAY * 1.5, 22),
        to: [160, 120],
        text: "Brick and stone front",
        anchor: "end",
      },
    ],
  },
  detail: {
    title: "Column and floor",
    caption:
      "Section through a pier at one floor. A cast-iron column, in red, runs up inside the brick pier. An iron beam rests on a bracket from the column and carries a floor of hollow clay tile. The details are typical of the time rather than measured from this building.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(0, 4.6), to: [270, 40], text: "Cast-iron column" },
      { at: d.p(-0.55, 4.0), to: [24, 40], text: "Brick pier" },
      { at: d.p(1.1, FLOOR - 0.2), to: [270, 110], text: "Iron beam" },
      { at: d.p(0.6, FLOOR - 0.38), to: [270, 262], text: "Bracket" },
      { at: d.p(2.6, FLOOR - 0.1), to: [280, 190], text: "Hollow tile floor" },
    ],
  },
};
