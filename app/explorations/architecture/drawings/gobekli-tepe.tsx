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

const m = measures("gobekli-tepe");
const PEDESTAL = m("pedestal");
const HEIGHT = m("pillar");
const HEAD = m("head") / 2;
const SHAFT = m("shaft") / 2;
const INNER = m("inner") / 2;
const WALL = m("wall");
const RING = m("ring");
const CENTRE = m("spacing") / 2;

function pillar(
  u: number,
  base: number,
  height: number,
  shaft: number,
  head: number,
  headHeight: number,
  f: Frame,
) {
  const top = base + height;
  const neck = top - headHeight;
  return poly(
    [
      f.p(u - shaft, base),
      f.p(u - shaft, neck),
      f.p(u - head, neck),
      f.p(u - head, top),
      f.p(u + head, top),
      f.p(u + head, neck),
      f.p(u + shaft, neck),
      f.p(u + shaft, base),
    ],
    true,
  );
}

function figure(u: number, f: Frame, className: string) {
  const b = PEDESTAL;
  const arm = SHAFT * 0.85;
  return (
    <g className={className}>
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            d={`M${f.x(u + side * arm)},${f.y(b + 4.15)}L${f.x(u + side * arm)},${f.y(b + 2.6)}Q${f.x(u + side * arm)},${f.y(b + 2.2)} ${f.x(u + side * 0.08)},${f.y(b + 2.2)}`}
          />
          {[2.3, 2.24, 2.18, 2.12].map((v) => (
            <path
              key={v}
              d={poly([
                f.p(u + side * arm * 0.45, b + v),
                f.p(u + side * 0.07, b + v),
              ])}
            />
          ))}
        </g>
      ))}
    </g>
  );
}

function dress(u: number, f: Frame) {
  const b = PEDESTAL;
  return (
    <g className="fine">
      <path d={poly([f.p(u - SHAFT, b + 2.05), f.p(u + SHAFT, b + 2.05)])} />
      <path d={poly([f.p(u - SHAFT, b + 1.9), f.p(u + SHAFT, b + 1.9)])} />
      <path
        d={poly([
          f.p(u - 0.08, b + 1.9),
          f.p(u - 0.08, b + 2.05),
          f.p(u + 0.08, b + 2.05),
          f.p(u + 0.08, b + 1.9),
        ])}
      />
      <path
        d={poly([
          f.p(u - 0.18, b + 1.9),
          f.p(u, b + 1.05),
          f.p(u + 0.18, b + 1.9),
        ])}
      />
      <path d={poly([f.p(u, b + 1.05), f.p(u + 0.05, b + 0.85)])} />
    </g>
  );
}

function coursing(f: Frame) {
  const rows = [0.64, 1.28, 1.92, 2.56];
  const lines: Point[][] = rows.map((v, r) => {
    const points: Point[] = [];
    for (let u = -INNER; u <= INNER + 0.01; u += 0.35) {
      points.push(f.p(u, v + Math.sin(u * 2.3 + r * 1.7) * 0.05));
    }
    return points;
  });
  const joints: Point[][] = [];
  [0, ...rows].forEach((v, r) => {
    for (
      let u = -INNER + 0.4 + (r % 2) * 0.35;
      u < INNER - 0.2;
      u += 0.7 + ((r * 7 + Math.round(u * 3)) % 3) * 0.15
    ) {
      joints.push([f.p(u, v), f.p(u + 0.03, v + 0.62)]);
    }
  });
  return (
    <g className="fine">
      {[...lines, ...joints].map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
    </g>
  );
}

function pedestal(u: number, f: Frame) {
  return (
    <path
      className="cut poche rock"
      d={poly([
        f.p(u - 0.8, 0),
        f.p(u - 0.8, PEDESTAL),
        f.p(u + 0.8, PEDESTAL),
        f.p(u + 0.8, 0),
      ])}
    />
  );
}

const S = 34;
const f = frame(400, 290, S);
const OUT = INNER + 1.5;
const EDGE = OUT + 2.9;
const BACKS = [-6.1, -4.6, 4.6, 6.1];

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={1} count={3} />
    <path
      className="cut poche earth"
      d={poly(
        [f.p(-EDGE, 0), f.p(-EDGE, WALL + 0.7), f.p(-OUT, WALL), f.p(-OUT, 0)],
        true,
      )}
    />
    <path
      className="cut poche earth"
      d={poly(
        [f.p(EDGE, 0), f.p(EDGE, WALL + 0.7), f.p(OUT, WALL), f.p(OUT, 0)],
        true,
      )}
    />
    <path
      className="cut poche stone"
      d={poly(
        [f.p(-OUT, 0), f.p(-OUT, WALL), f.p(-INNER, WALL), f.p(-INNER, 0)],
        true,
      )}
    />
    <path
      className="cut poche stone"
      d={poly(
        [f.p(INNER, 0), f.p(INNER, WALL), f.p(OUT, WALL), f.p(OUT, 0)],
        true,
      )}
    />
    <path
      className="cut poche rock"
      d={poly(
        [f.p(-EDGE, 0), f.p(EDGE, 0), f.p(EDGE, -1), f.p(-EDGE, -1)],
        true,
      )}
    />
    <path className="profile" d={poly([f.p(-INNER, WALL), f.p(INNER, WALL)])} />
    {coursing(f)}
    {BACKS.map((u) => (
      <path
        key={u}
        className="fine mask"
        d={pillar(u, 0, RING, 0.38, 0.7, 0.65, f)}
      />
    ))}
    {[-CENTRE, CENTRE].map((u) => (
      <g key={u}>
        {pedestal(u, f)}
        <path
          className="profile mask"
          d={pillar(u, PEDESTAL, HEIGHT, SHAFT, HEAD, 1.0, f)}
        />
        {figure(u, f, "fine")}
        {dress(u, f)}
      </g>
    ))}
    <Person x={f.x(0)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-INNER, WALL)}
      b={f.p(INNER, WALL)}
      offset={-(HEIGHT + PEDESTAL - WALL + 0.9) * S}
      value={m("inner")}
    />
    <DimensionLine
      a={f.p(CENTRE - HEAD, PEDESTAL + HEIGHT)}
      b={f.p(CENTRE - HEAD, PEDESTAL)}
      offset={0.35 * S}
      value={HEIGHT}
    />
  </>
);

const D = 56;
const d = frame(200, 345, D);

const detail = (
  <>
    <path
      className="cut poche rock"
      d={poly(
        [
          d.p(-3.2, 0),
          d.p(-0.8, 0),
          d.p(-0.8, PEDESTAL),
          d.p(0.8, PEDESTAL),
          d.p(0.8, 0),
          d.p(3.2, 0),
          d.p(3.2, -0.4),
          d.p(-3.2, -0.4),
        ],
        true,
      )}
    />
    <path
      className="profile mask"
      d={pillar(0, PEDESTAL, HEIGHT, SHAFT, HEAD, 1.0, d)}
    />
    <path
      className="fine"
      d={poly([
        d.p(-HEAD, PEDESTAL + HEIGHT - 1.0),
        d.p(HEAD, PEDESTAL + HEIGHT - 1.0),
      ])}
    />
    {figure(0, d, "idea")}
    {dress(0, d)}
    <Person x={d.x(-2.3)} ground={d.y(0)} scale={D} />
  </>
);

export const gobekliTepe: Drawings = {
  main: {
    title: "Section through Enclosure D",
    caption:
      "Section across Enclosure D, looking past the two central pillars to the far wall. The pillars stand on low pedestals carved from the bedrock. Simplified from published plans; the head and shaft widths are estimates.",
    viewBox: [800, 360],
    art: main,
    labels: [
      {
        at: f.p(-CENTRE, PEDESTAL + HEIGHT - 0.4),
        to: [330, 40],
        text: "Central pillar",
        anchor: "end",
      },
      {
        at: f.p(-CENTRE + SHAFT * 0.85, PEDESTAL + 3.2),
        to: [150, 120],
        text: "Carved arms and hands",
        anchor: "end",
      },
      { at: f.p(OUT - 0.7, 2.2), to: [700, 110], text: "Stone wall" },
      {
        at: f.p(-CENTRE + 0.7, 0.12),
        to: [230, 346],
        text: "Pedestal of bedrock",
        anchor: "end",
      },
      { at: f.p(4.5, -0.5), to: [600, 346], text: "Bedrock" },
      { at: f.p(-INNER - 2.6, 1.2), to: [44, 160], text: "Earth fill" },
    ],
  },
  detail: {
    title: "Central pillar, front face",
    caption:
      "Pillar 18 drawn larger. The T is a figure: the crossbar is the head, and arms, hands, a belt and a fox pelt are carved into the shaft.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(HEAD * 0.8, PEDESTAL + 5.1), to: [300, 40], text: "Head" },
      { at: d.p(SHAFT * 0.85, PEDESTAL + 3.4), to: [300, 140], text: "Arms" },
      { at: d.p(0.12, PEDESTAL + 2.2), to: [300, 205], text: "Hands meet" },
      { at: d.p(SHAFT, PEDESTAL + 1.97), to: [300, 250], text: "Belt" },
      { at: d.p(0.1, PEDESTAL + 1.45), to: [300, 290], text: "Fox pelt" },
      { at: d.p(0.8, 0.12), to: [300, 388], text: "Pedestal" },
    ],
  },
};
