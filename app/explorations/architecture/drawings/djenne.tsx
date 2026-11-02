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

const ms = measures("djenne");
const P = ms("platformHeight");
const HALF = ms("platform") / 2;
const TOWER = ms("tower");
const WALL_H = 10;
const WALL = 25;

const S = 8;
const f = frame(400, 340, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

function pinnacle(u: number, v: number, w: number) {
  return `M${f.x(u - w / 2)},${f.y(v)}Q${f.x(u - w / 2)},${f.y(v + w * 0.9)} ${f.x(u)},${f.y(v + w * 1.5)}Q${f.x(u + w / 2)},${f.y(v + w * 0.9)} ${f.x(u + w / 2)},${f.y(v)}Z`;
}

function tower(u: number, height: number, base: number) {
  const top = P + height - 1.6;
  const pts: Point[] = [
    f.p(u - base / 2, P),
    f.p(u - base * 0.32, top),
    f.p(u + base * 0.32, top),
    f.p(u + base / 2, P),
  ];
  const rows = [5, 8, 11, 14, 17].filter((v) => v < top - 0.8);
  return (
    <g key={u}>
      <path className="profile mask" d={poly(pts, true)} />
      <path className="profile mask" d={pinnacle(u, top, base * 0.5)} />
      <circle
        className="profile mask"
        cx={f.x(u)}
        cy={f.y(top + base * 0.78)}
        r={0.45 * S}
      />
      <g className="idea">
        {rows.flatMap((v) => {
          const half = base / 2 - (base * 0.18 * (v - P)) / (top - P);
          return [-0.5, 0, 0.5].map((k) => (
            <circle
              key={`${v}-${k}`}
              cx={f.x(u + k * half * 1.2)}
              cy={f.y(v)}
              r={1.3}
            />
          ));
        })}
      </g>
    </g>
  );
}

const BUTTRESSES = Array.from(
  { length: 15 },
  (_, i) => -WALL + 1.5 + i * 3.4,
).filter((u) => Math.abs(u) > 3.2 && Math.abs(Math.abs(u) - 16) > 2.8);

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    <path className="profile mask" d={box(-HALF, HALF, 0, P)} />
    <g className="fine">
      {[-1, 1].map((side) => (
        <g key={side}>
          {Array.from({ length: 6 }, (_, k) => (
            <path
              key={k}
              d={poly([
                f.p(side * (HALF + 0.6 * (k + 1)), P - 0.5 * (k + 1)),
                f.p(side * (HALF + 0.6 * k), P - 0.5 * (k + 1)),
              ])}
            />
          ))}
        </g>
      ))}
    </g>
    <path className="profile mask" d={box(-WALL, WALL, P, P + WALL_H)} />
    <g className="profile">
      {BUTTRESSES.map((u) => (
        <g key={u}>
          <path
            className="mask"
            d={box(u - 0.6, u + 0.6, P, P + WALL_H + 0.6)}
          />
          <path className="mask" d={pinnacle(u, P + WALL_H + 0.6, 1.2)} />
        </g>
      ))}
    </g>
    <g className="idea">
      {BUTTRESSES.flatMap((u) =>
        [5.5, 8.5, 11.5].map((v) => (
          <circle key={`${u}-${v}`} cx={f.x(u)} cy={f.y(v)} r={1.3} />
        )),
      )}
    </g>
    {tower(-16, TOWER - 4.5, 5)}
    {tower(16, TOWER - 4.5, 5)}
    {tower(0, TOWER, 6)}
    <path className="cut" d={poly([f.p(-48, 0), f.p(48, 0)])} />
    <Person x={f.x(-30)} ground={f.y(P)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={16}
      value={ms("platform")}
    />
    <DimensionLine a={f.p(-HALF, P)} b={f.p(-HALF, 0)} offset={36} value={P} />
    <DimensionLine
      a={f.p(0, P + TOWER)}
      b={f.p(0, P)}
      offset={-(HALF - 4) * S}
      value={TOWER}
    />
  </>
);

const D = 40;
const d = frame(150, 360, D);
const WALL_TOP = 7.6;
const outer = (v: number) => -0.5 + 0.25 * (v / WALL_TOP);
const inner = (v: number) => 0.5 - 0.1 * (v / WALL_TOP);
const TORON = [2.4, 4.8, 7.0];

const detail = (
  <>
    <path
      className="cut poche earth"
      d={poly(
        [d.p(-3.2, 0), d.p(3.4, 0), d.p(3.4, -0.4), d.p(-3.2, -0.4)],
        true,
      )}
    />
    <path
      className="cut poche mid"
      d={poly(
        [
          d.p(outer(0), 0),
          d.p(outer(WALL_TOP), WALL_TOP),
          d.p(inner(WALL_TOP), WALL_TOP),
          d.p(inner(0), 0),
        ],
        true,
      )}
    />
    <path
      className="fine"
      d={poly([
        d.p(outer(0) - 0.07, 0),
        d.p(outer(WALL_TOP) - 0.07, WALL_TOP),
        d.p(outer(WALL_TOP), WALL_TOP),
      ])}
    />
    <path
      className="profile mask"
      d={poly(
        [
          d.p(inner(WALL_TOP) - 0.1, WALL_TOP),
          d.p(3.4, WALL_TOP),
          d.p(3.4, WALL_TOP + 0.3),
          d.p(inner(WALL_TOP) - 0.1, WALL_TOP + 0.3),
        ],
        true,
      )}
    />
    <g className="fine">
      {[0.6, 1.4, 2.2, 3.0].map((u) => (
        <circle key={u} cx={d.x(u)} cy={d.y(WALL_TOP - 0.12)} r={0.1 * D} />
      ))}
    </g>
    <g className="idea">
      {TORON.map((v) => (
        <path
          key={v}
          className="mask"
          d={poly(
            [
              d.p(outer(v) - ms("toron"), v - 0.05),
              d.p(inner(v) - 0.2, v - 0.05),
              d.p(inner(v) - 0.2, v + 0.05),
              d.p(outer(v) - ms("toron"), v + 0.05),
            ],
            true,
          )}
        />
      ))}
    </g>
    <Person
      x={d.x(outer(TORON[1]) - 0.45)}
      ground={d.y(TORON[1] + 0.05)}
      scale={D}
    />
    <DimensionLine
      a={d.p(outer(0), 0)}
      b={d.p(inner(0), 0)}
      offset={20}
      value={ms("wall")}
    />
    <DimensionLine
      a={d.p(outer(TORON[0]) - ms("toron"), TORON[0])}
      b={d.p(outer(TORON[0]), TORON[0])}
      offset={16}
      along={-18}
      value={ms("toron")}
    />
  </>
);

export const djenne: Drawings = {
  main: {
    title: "East front, facing the market",
    caption:
      "The qibla wall with its three towers, on a platform 3 m above the market square. The red dots are the ends of the palm-wood toron that bristle from the walls. The platform and the central tower are from published figures; the wall height, side towers and buttress spacing are estimates.",
    viewBox: [800, 400],
    art: main,
    labels: [
      { at: f.p(0.4, P + TOWER - 0.4), to: [470, 40], text: "Central tower" },
      {
        at: f.p(BUTTRESSES[0], P + WALL_H + 1.4),
        to: [220, 120],
        text: "Buttress pinnacles",
        anchor: "end",
      },
      {
        at: f.p(BUTTRESSES.find((u) => u > 6) ?? 8, 8.5),
        to: [640, 110],
        text: "Toron ends",
      },
      { at: f.p(30, 1.5), to: [650, 370], text: "Raised platform" },
    ],
  },
  detail: {
    title: "Wall section, at replastering",
    caption:
      "A section through the mud wall. The toron, in red, stick out about 60 cm and serve as permanent scaffolding: every year the townspeople climb them to spread a fresh coat of mud over the whole building before the rains.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: d.p(outer(TORON[2]) - 0.4, TORON[2]),
        to: [24, 40],
        text: "Palm-wood toron",
      },
      { at: d.p(outer(1.2) - 0.05, 1.2), to: [24, 330], text: "Fresh coat" },
      { at: d.p(0, 3.6), to: [260, 200], text: "Sun-dried mud brick" },
      { at: d.p(1.4, WALL_TOP - 0.12), to: [296, 96], text: "Palm-log roof" },
    ],
  },
};
