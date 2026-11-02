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

type Frame = ReturnType<typeof frame>;

const ms = measures("angkor-wat");
const OUTER = ms("outer") / 2;
const SECOND = ms("second") / 2;
const UPPER = ms("upper") / 2;
const TOWER = ms("tower");
const SPAN = ms("span") / 2;

const S = 3.2;
const f = frame(400, 300, S);
const box = (m: Frame, u0: number, u1: number, v0: number, v1: number) =>
  poly([m.p(u0, v0), m.p(u0, v1), m.p(u1, v1), m.p(u1, v0)], true);

function bud(u: number, base: number, top: number, w: number, key: string) {
  const h = top - base;
  const b1 = base + h * 0.16;
  const half = w / 2;
  const x = (k: number) => f.x(u + k);
  const y = (v: number) => f.y(v);
  const tiers = [0.3, 0.42, 0.53, 0.63, 0.72, 0.8, 0.87].map((t) => {
    const v = base + h * t;
    const k = (t - 0.16) / 0.84;
    const width = half * (1.06 - 1.06 * Math.pow(k, 2.2));
    return poly([f.p(u - width, v), f.p(u + width, v)]);
  });
  return (
    <g key={key}>
      <path
        className="profile mask"
        d={`M${x(-half)},${y(base)}L${x(-half)},${y(b1)}C${x(-half * 1.12)},${y(b1 + h * 0.4)} ${x(-half * 0.3)},${y(top - h * 0.14)} ${x(0)},${y(top)}C${x(half * 0.3)},${y(top - h * 0.14)} ${x(half * 1.12)},${y(b1 + h * 0.4)} ${x(half)},${y(b1)}L${x(half)},${y(base)}Z`}
      />
      <g className="fine">
        {tiers.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </g>
  );
}

function gallery(
  half: number,
  base: number,
  wall: number,
  ridge: number,
  key: string,
) {
  const pillars = Math.floor((2 * half - 6) / 3.2);
  return (
    <g key={key}>
      <path className="profile mask" d={box(f, -half, half, base, wall)} />
      <path
        className="profile mask"
        d={poly(
          [
            f.p(-half, wall),
            f.p(-half + 1.2, ridge),
            f.p(half - 1.2, ridge),
            f.p(half, wall),
          ],
          true,
        )}
      />
      <g className="fine">
        <path d={poly([f.p(-half, wall - 0.5), f.p(half, wall - 0.5)])} />
        {Array.from(
          { length: pillars },
          (_, i) => -half + 3 + i * 3.2 + 1.6,
        ).map((u) => (
          <path key={u} d={poly([f.p(u, base), f.p(u, wall - 0.5)])} />
        ))}
      </g>
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    {bud(0, 25.5, TOWER, 15, "centre")}
    {[-UPPER + 4, UPPER - 4].map((u) =>
      bud(u, 25.5, TOWER - 10, 10, `upper${u}`),
    )}
    {gallery(UPPER, 20, 24.2, 25.5, "upper")}
    <path
      className="profile mask"
      d={poly(
        [
          f.p(-UPPER - 6, 7),
          f.p(-UPPER - 2, 20),
          f.p(UPPER + 2, 20),
          f.p(UPPER + 6, 7),
        ],
        true,
      )}
    />
    <g className="fine">
      <path d={poly([f.p(-UPPER - 4.5, 11.5), f.p(UPPER + 4.5, 11.5)])} />
      <path d={poly([f.p(-UPPER - 3.2, 15.8), f.p(UPPER + 3.2, 15.8)])} />
      <path d={poly([f.p(-3, 7), f.p(-3, 20)])} />
      <path d={poly([f.p(3, 7), f.p(3, 20)])} />
      {Array.from({ length: 26 }, (_, i) => 7.25 + i * 0.5).map((v) => (
        <path key={v} d={poly([f.p(-3, v), f.p(3, v)])} />
      ))}
    </g>
    {[-SECOND + 3, SECOND - 3].map((u) => bud(u, 14, 21, 7, `second${u}`))}
    {gallery(SECOND, 7, 12.5, 14, "second")}
    <path
      className="profile mask"
      d={box(f, -SECOND - 2, SECOND + 2, 3.5, 7)}
    />
    {[-OUTER + 3, OUTER - 3].map((u) => bud(u, 11.5, 17, 8, `outer${u}`))}
    {gallery(OUTER, 3.5, 10, 11.5, "outer")}
    {bud(0, 11.5, 19, 9, "gate")}
    <path className="profile mask" d={box(f, -12, 12, 3.5, 12)} />
    <path
      className="fine"
      d={poly([
        f.p(-2.5, 3.5),
        f.p(-2.5, 8.5),
        f.p(0, 10),
        f.p(2.5, 8.5),
        f.p(2.5, 3.5),
      ])}
    />
    <path className="profile mask" d={box(f, -OUTER - 2, OUTER + 2, 0, 3.5)} />
    <path className="cut" d={poly([f.p(-OUTER - 12, 0), f.p(OUTER + 12, 0)])} />
    <Person x={f.x(-20)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-OUTER, 0)}
      b={f.p(OUTER, 0)}
      offset={16}
      value={ms("outer")}
    />
    <DimensionLine
      a={f.p(0, TOWER)}
      b={f.p(0, 0)}
      offset={-(OUTER + 18) * S}
      value={TOWER}
    />
  </>
);

const D = 31;
const d = frame(152, 330, D);
const dbox = (u0: number, u1: number, v0: number, v1: number) =>
  box(d, u0, u1, v0, v1);
const COURSES = 8;
const RISE = 0.45;
const STEP = SPAN / COURSES;
const SPRING = 3.6;

const inner = (i: number) => SPAN - STEP * (i + 1);
const LEFT_STEPS: Point[] = Array.from({ length: COURSES }, (_, i) => [
  d.p(-inner(i) - STEP, SPRING + RISE * i),
  d.p(-inner(i), SPRING + RISE * i),
  d.p(-inner(i), SPRING + RISE * (i + 1)),
]).flat();

const detail = (
  <>
    <path className="cut poche stone" d={dbox(-2.9, 4.3, -0.6, 0)} />
    <path className="cut poche stone" d={dbox(-2.3, -SPAN, 0, SPRING)} />
    <path
      className="cut poche stone"
      d={dbox(SPAN, SPAN + 0.43, 0, SPRING - 0.4)}
    />
    <path
      className="cut poche stone"
      d={dbox(SPAN, 2.3, SPRING - 0.4, SPRING)}
    />
    {Array.from({ length: COURSES }, (_, i) => (
      <g key={i}>
        <path
          className="cut poche stone"
          d={dbox(
            -2.3 + 0.11 * i,
            -inner(i),
            SPRING + RISE * i,
            SPRING + RISE * (i + 1),
          )}
        />
        <path
          className="cut poche stone"
          d={dbox(
            inner(i),
            2.3 - 0.11 * i,
            SPRING + RISE * i,
            SPRING + RISE * (i + 1),
          )}
        />
      </g>
    ))}
    <path
      className="cut poche stone"
      d={dbox(
        -0.35,
        0.35,
        SPRING + RISE * COURSES,
        SPRING + RISE * COURSES + 0.35,
      )}
    />
    <path className="cut poche stone" d={dbox(3.5, 3.9, 0, 2.6)} />
    {Array.from({ length: 4 }, (_, k) => (
      <path
        key={k}
        className="cut poche stone"
        d={dbox(
          3.5 - 0.3 * (k + 1),
          3.9 - 0.08 * k,
          2.6 + RISE * k,
          2.6 + RISE * (k + 1),
        )}
      />
    ))}
    <path className="idea" d={poly(LEFT_STEPS)} />
    <path
      className="idea"
      d={poly(LEFT_STEPS.map(([x, y]) => [2 * d.x(0) - x, y] as Point))}
    />
    <DimensionLine
      a={d.p(-SPAN, 2.3)}
      b={d.p(SPAN, 2.3)}
      offset={0.1}
      value={ms("span")}
    />
    <Person x={d.x(0.4)} ground={d.y(0)} scale={D} />
  </>
);

export const angkorWat: Drawings = {
  main: {
    title: "West elevation",
    caption:
      "Elevation from the west, across the moat causeway. Three rings of galleries step up to the central terrace and its five towers. The plan sizes are surveyed; the heights of the terraces and corner towers are estimates.",
    viewBox: [800, 364],
    art: main,
    labels: [
      {
        at: f.p(1.5, TOWER - 6),
        to: [300, 40],
        text: "Central tower",
        anchor: "end",
      },
      { at: f.p(UPPER - 4, TOWER - 14), to: [560, 70], text: "Corner towers" },
      {
        at: f.p(-UPPER - 2.5, 16.5),
        to: [190, 150],
        text: "Upper terrace",
        anchor: "end",
      },
      { at: f.p(2, 18.6), to: [560, 130], text: "Steep stairs" },
      {
        at: f.p(-SECOND + 8, 10),
        to: [190, 196],
        text: "Second gallery",
        anchor: "end",
      },
      {
        at: f.p(OUTER - 12, 6),
        to: [540, 350],
        text: "Outer gallery of reliefs",
      },
    ],
  },
  detail: {
    title: "A corbelled gallery",
    caption:
      "Section through the outer gallery. There is no true arch and no keystone: each course of stone steps in a little past the one below, held in place by the weight on its tail, until the two sides meet. Corbelling only spans a few metres, so the galleries are long and narrow.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: d.p(0.2, SPRING + RISE * COURSES + 0.2),
        to: [290, 40],
        text: "No keystone",
      },
      {
        at: d.p(inner(4), SPRING + RISE * 4.5),
        to: [290, 100],
        text: "Courses step in",
      },
      { at: d.p(3.0, 3.1), to: [290, 196], text: "Half-vault" },
      { at: d.p(SPAN + 0.2, 1.5), to: [290, 380], text: "Square pillar" },
      { at: d.p(-1.8, 1.8), to: [24, 380], text: "Relief wall" },
    ],
  },
};
