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

const ms = measures("pompidou");
const SPAN = ms("span") / 2;
const HALF = ms("width") / 2;
const HEIGHT = ms("height");
const FLOOR = ms("floor");
const COL = SPAN + 1.6;
const DEPTH = 2.6;
const LEVELS = Array.from(
  { length: Math.round(HEIGHT / FLOOR) + 1 },
  (_, i) => i * FLOOR,
);

const S = 7.2;
const f = frame(400, 360, S);
const box = (m: Frame, u0: number, u1: number, v0: number, v1: number) =>
  poly([m.p(u0, v0), m.p(u0, v1), m.p(u1, v1), m.p(u1, v0)], true);

function truss(v: number) {
  const top = v;
  const bottom = v - DEPTH;
  const diag: Point[][] = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a = -SPAN + ((2 * SPAN) / n) * i;
    const b = a + (2 * SPAN) / n;
    diag.push(
      i % 2 ? [f.p(a, top), f.p(b, bottom)] : [f.p(a, bottom), f.p(b, top)],
    );
  }
  return (
    <g key={v}>
      <path className="profile" d={poly([f.p(-SPAN, top), f.p(SPAN, top)])} />
      <path
        className="profile"
        d={poly([f.p(-SPAN + 0.6, bottom), f.p(SPAN - 0.6, bottom)])}
      />
      <g className="fine">
        {diag.map((l, i) => (
          <path key={i} d={poly(l)} />
        ))}
      </g>
    </g>
  );
}

function gerberette(m: Frame, side: 1 | -1, v: number, key: string) {
  const u = (x: number) => side * x;
  return (
    <path
      key={key}
      className="profile mask"
      d={poly(
        [
          m.p(u(SPAN), v - 0.25),
          m.p(u(COL), v - 0.9),
          m.p(u(HALF), v - 0.35),
          m.p(u(HALF), v),
          m.p(u(COL), v + 0.05),
          m.p(u(SPAN), v),
        ],
        true,
      )}
    />
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    <path className="cut poche rock" d={box(f, -HALF - 4, HALF + 4, -1.5, 0)} />
    {[-1, 1].map((side) => (
      <g key={side}>
        <path
          className="profile mask"
          d={box(f, side * COL - 0.43, side * COL + 0.43, 0, HEIGHT + 1)}
        />
        <path
          className="profile"
          d={poly([f.p(side * HALF, 0), f.p(side * HALF, HEIGHT)])}
        />
        <path
          className="fine"
          d={poly([
            f.p(side * (SPAN - 0.6), 0),
            f.p(side * (SPAN - 0.6), HEIGHT - DEPTH),
          ])}
        />
      </g>
    ))}
    {LEVELS.slice(1).map((v) => truss(v))}
    {LEVELS.slice(1).flatMap((v) => [
      gerberette(f, 1, v, `r${v}`),
      gerberette(f, -1, v, `l${v}`),
    ])}
    <g className="idea">
      {[25.4, 27.2, 28.8].map((u, i) => (
        <path
          key={u}
          className="mask"
          d={box(f, u - 0.5 - i * 0.15, u + 0.5 + i * 0.15, 0, HEIGHT + 3 + i)}
        />
      ))}
      {[10, 17, 24, 31].map((v, i) => (
        <circle
          key={v}
          className="mask"
          cx={f.x(-27 + (i % 2) * 0.6)}
          cy={f.y(v)}
          r={1.6 * S}
        />
      ))}
    </g>
    <Person x={f.x(-4)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-SPAN, LEVELS[3])}
      b={f.p(SPAN, LEVELS[3])}
      offset={-14}
      value={ms("span")}
    />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={1.5 * S + 14}
      value={ms("width")}
    />
    <DimensionLine
      a={f.p(-HALF, HEIGHT)}
      b={f.p(-HALF, 0)}
      offset={40}
      value={HEIGHT}
    />
  </>
);

const D = 38;
const d = frame(56, 220, D);
const G0 = HALF - SPAN - ms("gerberette");

const detail = (
  <>
    <path
      className="profile mask"
      d={box(d, COL - SPAN - 0.43 + 0, COL - SPAN + 0.43, -4, 3)}
    />
    <path
      className="profile mask"
      d={poly(
        [
          d.p(G0 - 0.6, 0.2),
          d.p(G0, 0.2),
          d.p(G0, -DEPTH),
          d.p(G0 - 0.6, -DEPTH),
        ],
        true,
      )}
    />
    <g className="fine">
      <path d={poly([d.p(G0 - 0.6, -1.2), d.p(G0, 0.2)])} />
      <path d={poly([d.p(G0 - 0.6, -DEPTH), d.p(G0, -1.2)])} />
    </g>
    <path
      className="idea mask"
      d={poly(
        [
          d.p(G0, 0),
          d.p(COL - SPAN, -0.75),
          d.p(HALF - SPAN, -0.3),
          d.p(HALF - SPAN, 0.05),
          d.p(COL - SPAN, 0.2),
          d.p(G0, 0.25),
        ],
        true,
      )}
    />
    <circle
      className="profile mask"
      cx={d.x(COL - SPAN)}
      cy={d.y(-0.25)}
      r={0.22 * D}
    />
    <path
      className="profile"
      d={poly([d.p(HALF - SPAN - 0.1, -0.3), d.p(HALF - SPAN - 0.1, -4)])}
    />
    <Arrow points={[d.p(G0 - 0.3, 2.2), d.p(G0 - 0.3, 0.5)]} />
    <Arrow
      points={[d.p(HALF - SPAN - 0.1, -1.6), d.p(HALF - SPAN - 0.1, -3.4)]}
    />
    <Arrow points={[d.p(COL - SPAN, -1.2), d.p(COL - SPAN, -3.4)]} />
    <DimensionLine
      a={d.p(G0, 0.25)}
      b={d.p(HALF - SPAN, 0.25)}
      offset={-40}
      value={ms("gerberette")}
    />
  </>
);

export const pompidou: Drawings = {
  main: {
    title: "Cross-section",
    caption:
      "Section across the building. Each 45 m floor truss rests on cast-steel gerberettes that pivot on the columns; the outer ends are tied down. The services, in red, run up the outside: the ducts on the east side and the escalator tube on the west. The truss depth and duct sizes are estimates.",
    viewBox: [800, 430],
    art: main,
    labels: [
      { at: f.p(0, LEVELS[5] - DEPTH / 2), to: [520, 20], text: "Floor truss" },
      {
        at: f.p(-COL - 0.6, LEVELS[4] - 0.4),
        to: [212, 20],
        text: "Gerberette on column",
      },
      { at: f.p(27.4, 40), to: [660, 60], text: "Ducts outside" },
      {
        at: f.p(-26.4, 17),
        to: [120, 230],
        text: "Escalator tube",
        anchor: "end",
      },
      { at: f.p(HALF, 12), to: [660, 300], text: "Tie rod" },
    ],
  },
  detail: {
    title: "A gerberette",
    caption:
      "One gerberette, a cast-steel bracket 8 m long, in red. It pivots on a pin through the column. The floor truss presses down on the short inner arm, and a tie rod pulls down the long outer arm, so the two balance and the column takes the weight straight down.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(G0 - 0.3, 1.4), to: [24, 60], text: "Truss load" },
      {
        at: d.p(COL - SPAN + 0.1, -0.25),
        to: [150, 280],
        text: "Pin on the column",
      },
      { at: d.p(4.5, -0.1), to: [250, 120], text: "Cast steel" },
      {
        at: d.p(HALF - SPAN - 0.1, -2.4),
        to: [325, 330],
        text: "Tie rod",
        anchor: "end",
      },
    ],
  },
};
