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

const ms = measures("cordoba");
const BAY = ms("spacing");
const SHAFT = ms("diameter") / 2;

type Frame = ReturnType<typeof frame>;

const IMPOST = 3.35;
const SPRING = 6.3;
const TOP = ms("top");
const PIER = 0.35;
const rad = (deg: number) => (deg * Math.PI) / 180;

function ring(
  m: Frame,
  c: Point,
  r0: number,
  r1: number,
  from: number,
  to: number,
  count: number,
) {
  return Array.from({ length: count }, (_, i) => {
    const a = from + ((to - from) * i) / count;
    const b = from + ((to - from) * (i + 1)) / count;
    const pts: Point[] = [
      m.p(c[0] + r0 * Math.cos(rad(a)), c[1] + r0 * Math.sin(rad(a))),
      m.p(c[0] + r1 * Math.cos(rad(a)), c[1] + r1 * Math.sin(rad(a))),
      m.p(c[0] + r1 * Math.cos(rad(b)), c[1] + r1 * Math.sin(rad(b))),
      m.p(c[0] + r0 * Math.cos(rad(b)), c[1] + r0 * Math.sin(rad(b))),
    ];
    return (
      <path
        key={`${c[0]}-${i}`}
        className={i % 2 ? "fine mask" : "fine tone"}
        d={poly(pts, true)}
      />
    );
  });
}

function horseshoe(m: Frame, ua: number, ub: number) {
  const mid = (ua + ub) / 2;
  const half = (ub - ua) / 2 - PIER;
  const cv = IMPOST + 0.5;
  const r = Math.hypot(half, 0.5);
  const R = 1.75;
  const up = Math.sqrt(R * R - half * half);
  const s = m.x(1) - m.x(0);
  const top = (Math.atan2(up, half) * 180) / Math.PI;
  return (
    <g key={`h${ua}`}>
      <path
        className="profile mask"
        d={`M${m.x(mid - half)},${m.y(IMPOST)}A${r * s},${r * s} 0 1 1 ${m.x(mid + half)},${m.y(IMPOST)}L${m.x(mid + half)},${m.y(cv + up)}A${R * s},${R * s} 0 0 0 ${m.x(mid - half)},${m.y(cv + up)}Z`}
      />
      {ring(m, [mid, cv], r, R, top, 180 - top, 7)}
      <path
        className="profile"
        d={`M${m.x(mid - half)},${m.y(IMPOST)}A${r * s},${r * s} 0 1 1 ${m.x(mid + half)},${m.y(IMPOST)}`}
      />
    </g>
  );
}

function upper(m: Frame, ua: number, ub: number) {
  const mid = (ua + ub) / 2;
  const r = (ub - ua) / 2 - PIER;
  return (
    <g key={`u${ua}`}>
      <path
        className="tone"
        d={`M${m.x(mid - r)},${m.y(SPRING)}A${r * (m.x(1) - m.x(0))},${r * (m.x(1) - m.x(0))} 0 0 1 ${m.x(mid + r)},${m.y(SPRING)}Z`}
      />
      {ring(m, [mid, SPRING], r, r + 0.45, 0, 180, 9)}
      <path
        className="profile"
        d={poly(
          Array.from({ length: 25 }, (_, i) =>
            m.p(
              mid + (r + 0.45) * Math.cos(rad(180 - 7.5 * i)),
              SPRING + (r + 0.45) * Math.sin(rad(180 - 7.5 * i)),
            ),
          ),
        )}
      />
      <path
        className="profile"
        d={poly(
          Array.from({ length: 25 }, (_, i) =>
            m.p(
              mid + r * Math.cos(rad(180 - 7.5 * i)),
              SPRING + r * Math.sin(rad(180 - 7.5 * i)),
            ),
          ),
        )}
      />
    </g>
  );
}

function column(m: Frame, u: number, i: number) {
  const cap = 2.6 + (i % 2) * 0.08;
  return (
    <g key={`c${u}`}>
      <path
        className="profile mask"
        d={poly(
          [
            m.p(u - 0.3, 0),
            m.p(u - 0.3, 0.3),
            m.p(u + 0.3, 0.3),
            m.p(u + 0.3, 0),
          ],
          true,
        )}
      />
      <path
        className="profile mask"
        d={poly(
          [
            m.p(u - SHAFT, 0.3),
            m.p(u - SHAFT + 0.02, cap),
            m.p(u + SHAFT - 0.02, cap),
            m.p(u + SHAFT, 0.3),
          ],
          true,
        )}
      />
      <path
        className="profile mask"
        d={poly(
          [
            m.p(u - SHAFT, cap),
            m.p(u - 0.38, ms("column")),
            m.p(u + 0.38, ms("column")),
            m.p(u + SHAFT, cap),
          ],
          true,
        )}
      />
      <path
        className="fine"
        d={poly([m.p(u - 0.28, cap + 0.18), m.p(u + 0.28, cap + 0.18)])}
      />
      <path
        className="profile mask"
        d={poly(
          [
            m.p(u - 0.48, ms("column")),
            m.p(u - 0.48, IMPOST),
            m.p(u + 0.48, IMPOST),
            m.p(u + 0.48, ms("column")),
          ],
          true,
        )}
      />
      <path
        className="profile mask"
        d={poly(
          [
            m.p(u - PIER, IMPOST),
            m.p(u - PIER, SPRING),
            m.p(u + PIER, SPRING),
            m.p(u + PIER, IMPOST),
          ],
          true,
        )}
      />
    </g>
  );
}

function arcade(m: Frame, axes: number[], from: number, to: number) {
  return (
    <>
      <path
        className="tone"
        d={poly([m.p(from, 0), m.p(from, TOP), m.p(to, TOP), m.p(to, 0)], true)}
      />
      <path
        className="profile mask"
        d={poly(
          [m.p(from, SPRING), m.p(from, TOP), m.p(to, TOP), m.p(to, SPRING)],
          true,
        )}
      />
      {axes.slice(0, -1).map((u, i) => upper(m, u, axes[i + 1]))}
      {axes.map((u, i) => column(m, u, i))}
      {axes.slice(0, -1).map((u, i) => horseshoe(m, u, axes[i + 1]))}
      <path
        className="profile"
        d={poly([m.p(from, TOP + 0.25), m.p(to, TOP + 0.25)])}
      />
      <path className="profile" d={poly([m.p(from, TOP), m.p(to, TOP)])} />
    </>
  );
}

const S = 34;
const f = frame(400, 410, S);
const MAIN_AXES = [-2, -1, 0, 1, 2].map((k) => k * BAY);
const EDGE = 2.5 * BAY;

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={1} count={3} />
    {arcade(f, MAIN_AXES, -EDGE, EDGE)}
    <path className="cut" d={poly([f.p(-9, 0), f.p(9, 0)])} />
    <DimensionLine
      a={f.p(-EDGE, ms("column"))}
      b={f.p(-EDGE, 0)}
      offset={14}
      value={ms("column")}
    />
    <DimensionLine
      a={f.p(-EDGE, TOP)}
      b={f.p(-EDGE, 0)}
      offset={40}
      value={TOP}
    />
    <DimensionLine a={f.p(0, 0)} b={f.p(BAY, 0)} offset={18} value={BAY} />
    <Person x={f.x(-4.6)} ground={f.y(0)} scale={S} />
  </>
);

const D = 32;
const d = frame(180, 370, D);

const detail = (
  <>
    {arcade(d, [-BAY, 0, BAY], -BAY - 0.5, BAY + 0.5)}
    <path className="cut" d={poly([d.p(-4, 0), d.p(4, 0)])} />
    <Arrow points={[d.p(0, TOP - 0.3), d.p(0, IMPOST + 0.2)]} />
    <Arrow points={[d.p(0, 2.9), d.p(0, 0.5)]} />
    <Arrow points={[d.p(-2.2, 4.9), d.p(-0.55, 4.6)]} />
    <Arrow points={[d.p(2.2, 4.9), d.p(0.55, 4.6)]} />
  </>
);

export const cordoba: Drawings = {
  main: {
    title: "Elevation of one arcade",
    caption:
      "A row of the prayer hall's arcades, from the first building phase. The reused columns were too short for a tall hall, so a pier stands on each one and carries a second tier of arches. The overall height is an estimate.",
    viewBox: [800, 460],
    art: main,
    labels: [
      { at: f.p(1.5 * BAY, 7.75), to: [676, 120], text: "Upper arch" },
      {
        at: f.p(1.5 * BAY + 1.05, 7.0),
        to: [676, 176],
        text: "Brick and stone",
      },
      { at: f.p(1.5 * BAY, 5.4), to: [676, 230], text: "Horseshoe brace" },
      { at: f.p(2 * BAY + PIER, 4.6), to: [676, 280], text: "Pier on column" },
      {
        at: f.p(-2 * BAY - SHAFT, 1.5),
        to: [150, 446],
        text: "Reused Roman column",
      },
    ],
  },
  detail: {
    title: "One support, two tiers",
    caption:
      "The roof's weight comes down the pier and onto the column. The horseshoe arches below tie each pier to the next, so the tall, thin supports cannot buckle sideways.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(0.1, 7.2), to: [304, 60], text: "Weight down" },
      { at: d.p(PIER, 5.6), to: [304, 150], text: "Pier" },
      { at: d.p(2.0, 4.95), to: [304, 206], text: "Braces" },
      { at: d.p(0.48, 3.2), to: [304, 262], text: "Impost block" },
      { at: d.p(0.2, 1.5), to: [304, 320], text: "Column" },
    ],
  },
};
