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

const m = measures("pantheon");
const R = m("span") / 2;
const WALL = R + m("wall");
const DRUM = m("drum");
const OCULUS = m("oculus") / 2;
const RINGS_OUT = m("rings");
const STEP_IN = 22.5;
const STEP_TOP = 33;
const TOP_V = R + Math.sqrt(R * R - OCULUS * OCULUS) + m("top");
const EX_C =
  (OCULUS * OCULUS + TOP_V * TOP_V - STEP_IN * STEP_IN - STEP_TOP * STEP_TOP) /
  (2 * (TOP_V - STEP_TOP));
const EX_R = Math.hypot(STEP_IN, STEP_TOP - EX_C);

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

const inner = (a: number, r = R): Point => [
  r * Math.cos(rad(a)),
  R + r * Math.sin(rad(a)),
];
const outer = (a: number): Point => [
  EX_R * Math.cos(rad(a)),
  EX_C + EX_R * Math.sin(rad(a)),
];
const outerAngle = ([u, v]: Point) => deg(Math.atan2(v - EX_C, u));
const OCULUS_IN = deg(Math.acos(OCULUS / R));
const OCULUS_OUT = deg(Math.acos(OCULUS / EX_R));

function range(from: number, to: number, at: (a: number) => Point, steps = 24) {
  return Array.from({ length: steps + 1 }, (_, i) =>
    at(from + ((to - from) * i) / steps),
  );
}

function onExtrados(a: number): Point {
  const k = rad(a);
  const dy = R - EX_C;
  const b = 2 * dy * Math.sin(k);
  const t = (-b + Math.sqrt(b * b - 4 * (dy * dy - EX_R * EX_R))) / 2;
  return [t * Math.cos(k), R + t * Math.sin(k)];
}

const STEPS: Point[] = (() => {
  const points: Point[] = [[WALL, DRUM]];
  const dx = (WALL - STEP_IN) / RINGS_OUT;
  const dv = (STEP_TOP - DRUM) / RINGS_OUT;
  for (let i = 0; i < RINGS_OUT; i++) {
    const [u, v] = points[points.length - 1];
    points.push([u - dx, v], [u - dx, v + dv]);
  }
  return points;
})();

const RINGS = [
  [4, 15],
  [16.2, 26.6],
  [27.8, 37.6],
  [38.8, 48.2],
  [49.4, 58],
];

function intrados(): Point[] {
  const points: Point[] = [inner(0)];
  RINGS.forEach(([a0, a1]) => {
    points.push(...range(points.length === 1 ? 0 : a0 - 1.2, a0, inner, 2));
    points.push(
      inner(a0, R + 0.8),
      ...range(a0, a1, (a) => inner(a, R + 0.8), 6),
      inner(a1),
    );
  });
  points.push(...range(RINGS[RINGS.length - 1][1], OCULUS_IN, inner, 12));
  return points;
}

function half(m: ReturnType<typeof frame>) {
  const ring = intrados();
  const outline: Point[] = [
    [R + 3, 0],
    [WALL, 0],
    ...STEPS,
    ...range(outerAngle([STEP_IN, STEP_TOP]), OCULUS_OUT, outer),
    [OCULUS, R + Math.sqrt(R * R - OCULUS * OCULUS)],
    ...[...ring].reverse(),
    [R, 9.2],
    [R + 3, 9.2],
  ];
  return (
    <>
      <path
        className="cut poche stone"
        d={poly(
          outline.map(([u, v]) => m.p(u, v)),
          true,
        )}
      />
      <g className="fine">
        <path d={poly([m.p(R + 0.4, 0), m.p(R + 0.4, 8.2)])} />
        <path d={poly([m.p(R + 1.2, 0), m.p(R + 1.2, 8.2)])} />
        <path
          d={poly([m.p(R + 0.1, 8.2), m.p(R + 1.5, 8.2), m.p(R + 1.5, 9.2)])}
        />
      </g>
    </>
  );
}

const S = 8;
const f = frame(400, 440, S);

function interior() {
  const chords = [9.2, 12.4, 14.2, 15];
  const lines: Point[][] = chords.map((v) => [f.p(-R, v), f.p(R, v)]);
  RINGS.flat().forEach((a) => {
    const [u, v] = inner(a);
    lines.push([f.p(-u, v), f.p(u, v)]);
  });
  for (let k = 1; k < 14; k++) {
    const c = Math.cos(rad((180 * k) / 14));
    lines.push(
      range(
        RINGS[0][0],
        RINGS[4][1],
        (a) => {
          const [u, v] = inner(a);
          return f.p(u * c, v);
        },
        12,
      ),
    );
  }
  for (let k = -3; k <= 3; k++) {
    const u = k * 5.6;
    lines.push([
      f.p(u - 1.1, 16.2),
      f.p(u - 1.1, 19.6),
      f.p(u + 1.1, 19.6),
      f.p(u + 1.1, 16.2),
    ]);
  }
  return (
    <g className="fine">
      {lines.map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={40} scale={S} step={5} count={2} />
    <path
      className="cut poche rock"
      d={poly([f.p(-32, 0), f.p(32, 0), f.p(32, -1.6), f.p(-32, -1.6)], true)}
    />
    <path className="cut" d={poly([f.p(-40, 0), f.p(40, 0)])} />
    {interior()}
    {half(f)}
    <g transform="translate(800 0) scale(-1 1)">{half(f)}</g>
    <circle className="idea dash" cx={f.x(0)} cy={f.y(R)} r={R * S} />
    <DimensionLine
      a={f.p(-R, R)}
      b={f.p(R, R)}
      offset={(R - 6) * S}
      value={m("span")}
    />
    <DimensionLine
      a={f.p(-OCULUS, 2 * R)}
      b={f.p(-OCULUS, 0)}
      offset={(31 - OCULUS) * S}
      value={m("span")}
    />
    <DimensionLine
      a={f.p(-OCULUS, TOP_V)}
      b={f.p(OCULUS, TOP_V)}
      offset={-12}
      value={m("oculus")}
    />
    <Person x={f.x(-8)} ground={f.y(0)} scale={S} />
  </>
);

const D = 7.2;
const d = frame(36, 366, D);
const map = (points: Point[]) => points.map(([u, v]) => d.p(u, v));
const E45 = onExtrados(45);

const zones = {
  wall: [
    [R, 0],
    [WALL, 0],
    [WALL, R],
    [R, R],
  ] as Point[],
  lower: [
    [R, R],
    [WALL, R],
    ...STEPS,
    ...range(outerAngle([STEP_IN, STEP_TOP]), outerAngle(E45), outer, 12),
    inner(45),
    ...range(45, 0, inner, 16),
  ] as Point[],
  upper: [
    E45,
    ...range(outerAngle(E45), OCULUS_OUT, outer, 16),
    [OCULUS, R + Math.sqrt(R * R - OCULUS * OCULUS)],
    ...range(OCULUS_IN, 45, inner, 16),
  ] as Point[],
};

const detail = (
  <>
    <path className="fine dash" d={poly([d.p(0, 0), d.p(0, 47)])} />
    <path className="cut" d={poly([d.p(-2, 0), d.p(31, 0)])} />
    <path className="cut poche dense" d={poly(map(zones.wall), true)} />
    <path className="cut poche mid" d={poly(map(zones.lower), true)} />
    <path className="cut poche light" d={poly(map(zones.upper), true)} />
    <path
      className="idea"
      d={poly(
        map([
          [R, R],
          [WALL, R],
        ]),
      )}
    />
    <path className="idea" d={poly(map([inner(45), E45]))} />
    <path className="fine dash" d={poly(map(range(0, OCULUS_IN, inner, 24)))} />
  </>
);

export const pantheon: Drawings = {
  main: {
    title: "Section through the rotunda",
    caption:
      "Cross-section through the rotunda, with the portico left off. The dashed red circle is the sphere the room is built around: 43.3 m wide and 43.3 m from floor to oculus.",
    viewBox: [800, 480],
    art: main,
    labels: [
      {
        at: [f.x(OCULUS * 0.6), f.y(TOP_V - 0.6)],
        to: [500, 40],
        text: "Oculus, open to the sky",
      },
      { at: [f.x(13), f.y(41.6)], to: [560, 84], text: "Shell thins to 1.2 m" },
      { at: [f.x(25), f.y(30.6)], to: [650, 170], text: "Step rings" },
      { at: [f.x(26.5), f.y(15)], to: [650, 300], text: "Wall 6.4 m thick" },
      {
        at: [f.x(R * Math.cos(rad(-40))), f.y(R + R * Math.sin(rad(-40)))],
        to: [650, 410],
        text: "A sphere fits inside",
      },
      {
        at: [f.x(-23.2), f.y(5)],
        to: [150, 420],
        text: "Niche",
        anchor: "end",
      },
    ],
  },
  detail: {
    title: "Half section, concrete mix",
    caption:
      "Half the wall and dome, drawn larger. The stone mixed into the concrete gets lighter with height. The heights where one mix gives way to the next are estimates.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: [d.x(24.75), d.y(10)],
        to: [258, 300],
        text: "Travertine and tufa",
      },
      { at: [d.x(24.2), d.y(27)], to: [258, 196], text: "Tufa and brick" },
      { at: [d.x(10.6), d.y(41.5)], to: [258, 96], text: "Pumice and tufa" },
      {
        at: [d.x(OCULUS + 0.3), d.y(43.8)],
        to: [96, 22],
        text: "1.2 m at the top",
      },
      {
        at: [d.x(24.75), d.y(0)],
        to: [d.x(24.75), 378],
        text: "Wall 6.4 m",
        anchor: "middle",
      },
    ],
  },
};
