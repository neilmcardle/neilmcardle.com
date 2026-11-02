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

const ms = measures("florence");
const H = ms("span") / 2;
const SP = ms("spring");
const R = 0.8 * ms("span");
const C = R - H;
const OCULUS = 2.95;
const DRUM = 4.2;
const GAP = ms("gap");
const TOP = ms("top");

const rad = (deg: number) => (deg * Math.PI) / 180;
const endAngle = (r: number) => (Math.acos((-OCULUS - C) / r) * 180) / Math.PI;
const at = (r: number, a: number): [number, number] => [
  C + r * Math.cos(rad(a)),
  SP + r * Math.sin(rad(a)),
];

function shell(
  m: Frame,
  inner: (t: number) => number,
  thick: (t: number) => number,
) {
  const steps = 32;
  const a1 = endAngle(inner(1));
  const pts = (fn: (t: number) => number) =>
    Array.from({ length: steps + 1 }, (_, i) => {
      const t = i / steps;
      return m.p(...at(fn(t), 180 + (a1 - 180) * t));
    });
  const lower = pts(inner);
  const upper = pts((t) => inner(t) + thick(t));
  return poly([...lower, ...upper.reverse()], true);
}

const innerShell = (t: number) => R + 0 * t;
const innerThick = (t: number) =>
  ms("innerBase") + (ms("innerTop") - ms("innerBase")) * t;
const outerStart = (t: number) => R + innerThick(t) + GAP;
const outerThick = (t: number) =>
  ms("outerBase") + (ms("outerTop") - ms("outerBase")) * t;

const CHAINS = [172, 162, 151, 139];

function half(m: Frame) {
  return (
    <>
      <path
        className="profile mask"
        d={poly(
          [m.p(-H - DRUM, 0), m.p(-H - DRUM, 42), m.p(-H, 42), m.p(-H, 0)],
          true,
        )}
      />
      <path
        className="profile"
        d={`M${m.x(-H)},${m.y(0)}L${m.x(-H)},${m.y(22)}`}
      />
      <path
        className="cut poche rock"
        d={poly(
          [m.p(-H - DRUM, 42), m.p(-H - DRUM, 46), m.p(-H, 46), m.p(-H, 42)],
          true,
        )}
      />
      <path
        className="cut poche rock"
        d={poly(
          [m.p(-H - DRUM, 51), m.p(-H - DRUM, SP), m.p(-H, SP), m.p(-H, 51)],
          true,
        )}
      />
      <path
        className="fine"
        d={poly([m.p(-H - DRUM / 2, 46), m.p(-H - DRUM / 2, 51)])}
      />
      <path className="cut poche rock" d={shell(m, innerShell, innerThick)} />
      <path className="cut poche rock" d={shell(m, outerStart, outerThick)} />
      <path
        className="cut poche rock"
        d={poly(
          [
            m.p(-H - DRUM, SP),
            m.p(-H - DRUM + 0.6, SP + 3),
            m.p(...at(outerStart(0), 172)),
            m.p(...at(R, 180)),
          ],
          true,
        )}
      />
      <g className="idea">
        {CHAINS.map((a) => (
          <path
            key={a}
            d={poly([
              m.p(...at(R - 0.2, a)),
              m.p(
                ...at(R + innerThick((180 - a) / (180 - endAngle(R))) + 0.2, a),
              ),
            ])}
          />
        ))}
      </g>
    </>
  );
}

const S = 3.6;
const f = frame(400, 450, S);
const RING = at(R, endAngle(R))[1];
const RING_TOP = at(
  outerStart(1) + outerThick(1),
  endAngle(outerStart(1) + outerThick(1)),
)[1];

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    <path
      className="profile"
      d={`M${f.x(-16)},${f.y(0)}L${f.x(-16)},${f.y(24)}A${23 * S},${23 * S} 0 0 1 ${f.x(0)},${f.y(37)}A${23 * S},${23 * S} 0 0 1 ${f.x(16)},${f.y(24)}L${f.x(16)},${f.y(0)}`}
    />
    <path className="fine" d={poly([f.p(-H, 42), f.p(H, 42)])} />
    {half(f)}
    <g transform="translate(800 0) scale(-1 1)">{half(f)}</g>
    <path
      className="cut poche rock"
      d={poly(
        [
          f.p(-OCULUS - 0.5, RING),
          f.p(-OCULUS - 0.5, RING_TOP + 0.4),
          f.p(OCULUS + 0.5, RING_TOP + 0.4),
          f.p(OCULUS + 0.5, RING),
        ],
        true,
      )}
    />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(-3.2, RING_TOP + 0.4),
          f.p(-3.2, 100),
          f.p(3.2, 100),
          f.p(3.2, RING_TOP + 0.4),
        ],
        true,
      )}
    />
    <g className="fine">
      {[-1.6, 0, 1.6].map((u) => (
        <path key={u} d={poly([f.p(u, RING_TOP + 1.5), f.p(u, 98.5)])} />
      ))}
      <path
        d={`M${f.x(-3.2)},${f.y(RING_TOP + 0.6)}Q${f.x(-6)},${f.y(RING_TOP + 1)} ${f.x(-5.2)},${f.y(RING_TOP + 4)}L${f.x(-3.2)},${f.y(97)}`}
      />
      <path
        d={`M${f.x(3.2)},${f.y(RING_TOP + 0.6)}Q${f.x(6)},${f.y(RING_TOP + 1)} ${f.x(5.2)},${f.y(RING_TOP + 4)}L${f.x(3.2)},${f.y(97)}`}
      />
    </g>
    <path
      className="profile mask"
      d={`M${f.x(-3.4)},${f.y(100)}Q${f.x(-1.4)},${f.y(104)} ${f.x(-0.5)},${f.y(108.6)}L${f.x(0.5)},${f.y(108.6)}Q${f.x(1.4)},${f.y(104)} ${f.x(3.4)},${f.y(100)}Z`}
    />
    <circle className="profile mask" cx={f.x(0)} cy={f.y(109.9)} r={1.1 * S} />
    <path className="profile" d={poly([f.p(0, 111), f.p(0, TOP)])} />
    <path
      className="profile"
      d={poly([f.p(-1, TOP - 1.8), f.p(1, TOP - 1.8)])}
    />
    <path className="cut" d={poly([f.p(-40, 0), f.p(40, 0)])} />
    <Person x={f.x(-6)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-H, SP)}
      b={f.p(H, SP)}
      offset={-12}
      value={ms("span")}
    />
    <DimensionLine
      a={f.p(-H - DRUM, SP)}
      b={f.p(-H - DRUM, 0)}
      offset={22}
      value={SP}
    />
    <DimensionLine
      a={f.p(0, TOP)}
      b={f.p(0, 0)}
      offset={(H + DRUM + 16) * S}
      value={TOP}
    />
  </>
);

const ROWS = 30;
const BRICK = 30;

function brickwork() {
  const flat: Point[][] = [];
  const upright: Point[][] = [];
  for (let i = 0; i < ROWS; i++) {
    const y = 340 - i * 10;
    flat.push([
      [30, y],
      [370, y],
    ]);
    for (let x = 30 + (i % 2) * (BRICK / 2); x < 370; x += BRICK)
      flat.push([
        [x, y],
        [x, y - 10],
      ]);
    if (i % 2 === 0 && i < ROWS - 2) {
      for (let x = 30 + (((i / 2) * 12) % 72); x < 362; x += 72) {
        upright.push([
          [x, y],
          [x, y - 20],
          [x + 8, y - 20],
          [x + 8, y],
        ]);
      }
    }
  }
  return { flat, upright };
}

const BRICKS = brickwork();

const detail = (
  <>
    <path
      className="mask"
      d={poly(
        [
          [30, 40],
          [370, 40],
          [370, 340],
          [30, 340],
        ],
        true,
      )}
    />
    <g className="fine">
      {BRICKS.flat.map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
    </g>
    <g className="idea">
      {BRICKS.upright.map((b, i) => (
        <path key={i} className="mask" d={poly(b, true)} />
      ))}
    </g>
    <path
      className="profile"
      d={poly(
        [
          [30, 40],
          [370, 40],
          [370, 340],
          [30, 340],
        ],
        true,
      )}
    />
  </>
);

export const florence: Drawings = {
  main: {
    title: "Section through the dome",
    caption:
      "Section across the corners of the octagon. Two shells of brick rise from the drum on the pointed-fifth curve, the thick inner one carrying the thin outer one, with a gap between them for stairs. The red marks are the stone and timber chains that hoop the dome. The drum, piers and lantern are simplified.",
    viewBox: [800, 480],
    art: main,
    labels: [
      { at: f.p(1.5, 104), to: [560, 50], text: "Lantern" },
      {
        at: f
          .p(...at(outerStart(0.7) + outerThick(0.7), 132))
          .map((v, i) => (i === 0 ? 800 - v : v)) as Point,
        to: [580, 140],
        text: "Thin outer shell",
      },
      {
        at: f
          .p(...at(R + 1, 166))
          .map((v, i) => (i === 0 ? 800 - v : v)) as Point,
        to: [580, 196],
        text: "Thick inner shell",
      },
      {
        at: f
          .p(...at(R + 0.8, CHAINS[2]))
          .map((v, i) => (i === 0 ? 800 - v : v)) as Point,
        to: [580, 250],
        text: "Stone and timber chains",
      },
      { at: f.p(H + DRUM / 2, 53), to: [580, 300], text: "Drum" },
    ],
  },
  detail: {
    title: "Herringbone brickwork",
    caption:
      "A patch of the inner shell. Upright bricks, in red, are set into the flat courses at intervals and shift along a little in each course, so they climb the dome in spirals. Each upright held the next course in place while its mortar set, which is how the dome rose without wooden centring.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: [55, 334], to: [40, 380], text: "Flat courses" },
      {
        at: [BRICKS.upright[8][1][0] + 4, BRICKS.upright[8][0][1] - 10],
        to: [220, 380],
        text: "Upright bricks lock it",
      },
      {
        at: [
          BRICKS.upright[BRICKS.upright.length - 3][1][0] + 4,
          BRICKS.upright[BRICKS.upright.length - 3][1][1] + 2,
        ],
        to: [370, 24],
        text: "Spirals up the dome",
        anchor: "end",
      },
    ],
  },
};
