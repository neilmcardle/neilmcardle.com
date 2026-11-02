import { measures } from "../sources";
import {
  arc,
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const m = measures("hagia-sophia");
const R = m("dome") / 2;
const RING = m("ring");
const SPRING = m("spring");
const RISE = m("crown") - RING;
const rad = (deg: number) => (deg * Math.PI) / 180;

const S = 7.5;
const f = frame(400, 455, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

function ellipse(
  cu: number,
  cv: number,
  ru: number,
  rv: number,
  from: number,
  to: number,
  steps = 32,
): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = rad(from + ((to - from) * i) / steps);
    return f.p(cu + ru * Math.cos(t), cv + rv * Math.sin(t));
  });
}

const t0 = (Math.asin(3.4 / RISE) * 180) / Math.PI;
const domeShell = poly(
  [
    ...ellipse(0, RING, R + 0.75, RISE + 0.75, t0, 180 - t0),
    ...ellipse(0, RING, R, RISE, 180 - t0, t0),
  ],
  true,
);

function halfDome(side: 1 | -1) {
  const cu = side * R;
  const outer = ellipse(cu, SPRING, 16.4, 16.4, side > 0 ? 0 : 180, 90, 20);
  const inner = ellipse(cu, SPRING, R, R, 90, side > 0 ? 0 : 180, 20);
  return poly([...outer, ...inner], true);
}

function pendentive(side: 1 | -1) {
  const curve = ellipse(0, SPRING, R, R, side > 0 ? 0 : 180, 90, 20);
  return poly([...curve, f.p(0, RING), f.p(side * R, RING)], true);
}

const WINDOWS = Array.from({ length: 20 }, (_, k) => {
  const a = rad((k + 0.5) * 9);
  return { u: R * Math.cos(a), w: 1.1 * Math.sin(a) };
});

function arcade(v0: number, v1: number, count: number, span: number) {
  const bay = span / count;
  return Array.from({ length: count }, (_, i) => {
    const a = -span / 2 + i * bay + bay * 0.12;
    const b = a + bay * 0.76;
    const r = (b - a) / 2;
    return (
      <path
        key={`${v0}-${i}`}
        d={`M${f.x(a)},${f.y(v0)}L${f.x(a)},${f.y(v1 - r)}A${r * S},${r * S} 0 0 1 ${f.x(b)},${f.y(v1 - r)}L${f.x(b)},${f.y(v0)}`}
      />
    );
  });
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    <path className="cut poche rock" d={box(-46, 42, -1.5, 0)} />
    <path className="profile mask" d={box(-20.2, -R, 0, SPRING)} />
    <path className="profile mask" d={box(R, 20.2, 0, SPRING)} />
    <path className="profile" d={poly(ellipse(0, SPRING, R, R, 180, 0))} />
    <g className="fine">
      {arcade(0, 13.3, 5, 24)}
      {arcade(13.3, 22.5, 7, 24)}
      <path d={poly([f.p(-R, 13.3), f.p(R, 13.3)])} />
      {[-9, -6, -3, 0, 3, 6, 9].map((u) => (
        <path key={`w1-${u}`} d={box(u - 0.9, u + 0.9, 26.6, 30.6)} />
      ))}
      {[-6, -3, 0, 3, 6].map((u) => (
        <path key={`w2-${u}`} d={box(u - 0.9, u + 0.9, 32.2, 35.6)} />
      ))}
      {WINDOWS.map(({ u, w }) => (
        <path
          key={`d-${u}`}
          d={box(u - w / 2, u + w / 2, RING + 0.4, RING + 3.2)}
        />
      ))}
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            d={`M${f.x(side * 17.5)},${f.y(0)}L${f.x(side * 17.5)},${f.y(13.3)}A${5.6 * S},${5.6 * S} 0 0 ${side > 0 ? 1 : 0} ${f.x(side * 28.7)},${f.y(13.3)}L${f.x(side * 28.7)},${f.y(0)}`}
          />
          <path d={poly([f.p(side * 17.5, 13.3), f.p(side * 28.7, 13.3)])} />
        </g>
      ))}
    </g>
    <path className="tone" d={pendentive(-1)} />
    <path className="tone" d={pendentive(1)} />
    <path className="idea" d={pendentive(-1)} />
    <path className="idea" d={pendentive(1)} />
    <path className="cut poche rock" d={domeShell} />
    <path className="cut poche rock" d={box(-18.2, -R, 38.8, RING + 0.6)} />
    <path className="cut poche rock" d={box(R, 18.2, 38.8, RING + 0.6)} />
    <path className="cut poche rock" d={halfDome(-1)} />
    <path className="cut poche rock" d={halfDome(1)} />
    <path className="cut poche rock" d={box(-40, -38, 0, 25)} />
    <path className="cut poche rock" d={box(-44, -43, 0, 25)} />
    <path className="cut poche rock" d={box(-43, -40, 11.4, 13)} />
    <path className="cut poche rock" d={box(-44, -31.2, 25, 25.8)} />
    <path className="cut poche rock" d={box(38, 39.8, 0, 19)} />
    <path
      className="cut poche rock"
      d={poly(
        [
          ...ellipse(31.2, 19, 8.6, 8.6, 0, 90, 12),
          ...ellipse(31.2, 19, 6.8, 6.8, 90, 0, 12),
        ],
        true,
      )}
    />
    <path className="cut" d={poly([f.p(-50, 0), f.p(46, 0)])} />
    <Person x={f.x(-5)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-R, RING)}
      b={f.p(R, RING)}
      offset={16}
      value={m("dome")}
    />
    <DimensionLine
      a={f.p(0, m("crown"))}
      b={f.p(0, 0)}
      offset={-46 * S}
      value={m("crown")}
    />
  </>
);

const K = 95;
const O: Point = [190, 248];
const DEPTH = 0.35;
const P = (x: number, y: number, z: number): Point => [
  O[0] + (x + y * DEPTH) * K,
  O[1] - (z + y * DEPTH) * K,
];
const line = (points: [number, number, number][]) =>
  poly(points.map(([x, y, z]) => P(x, y, z)));
const steps = (n: number) => Array.from({ length: n + 1 }, (_, i) => i / n);

const archAlongY = (x: number, r = 1) =>
  line(
    steps(32).map((t) => {
      const y = -r + 2 * r * t;
      return [x, y, Math.sqrt(Math.max(0, r * r - y * y))];
    }),
  );
const archAlongX = (y: number, r = 1) =>
  line(
    steps(32).map((t) => {
      const x = -r + 2 * r * t;
      return [x, y, Math.sqrt(Math.max(0, r * r - x * x))];
    }),
  );

function pendentiveFace(sx: number, sy: number) {
  const a = steps(12).map((t) => {
    const y = sy * (1 - t);
    return [sx, y, Math.sqrt(1 - y * y)] as [number, number, number];
  });
  const from = Math.atan2(0, sx);
  let to = Math.atan2(sy, 0);
  if (to - from > Math.PI) to -= 2 * Math.PI;
  if (to - from < -Math.PI) to += 2 * Math.PI;
  const ring = steps(12).map((t) => {
    const k = from + (to - from) * t;
    return [Math.cos(k), Math.sin(k), 1] as [number, number, number];
  });
  const b = steps(12).map((t) => {
    const x = sx * t;
    return [x, sy, Math.sqrt(1 - x * x)] as [number, number, number];
  });
  return line([...a, ...ring, ...b]) + "Z";
}

function hatch(sx: number, sy: number) {
  const base = Math.atan2(sy, sx);
  return [-14, -7, 0, 7, 14].map((d) => {
    const phi = base + rad(d);
    const reach = Math.min(
      1 / Math.abs(Math.cos(phi)),
      1 / Math.abs(Math.sin(phi)),
    );
    const low = Math.sqrt(Math.max(0, 2 - reach * reach));
    const pts = steps(10).map((t) => {
      const z = low + (1 - low) * t;
      const r = Math.sqrt(2 - z * z);
      return [r * Math.cos(phi), r * Math.sin(phi), z] as [
        number,
        number,
        number,
      ];
    });
    return <path key={`${sx}${sy}${d}`} d={line(pts)} />;
  });
}

function domeOutline() {
  const bins = new Map<number, number>();
  for (let i = 0; i <= 60; i++) {
    for (let j = 0; j <= 120; j++) {
      const e = (Math.PI / 2) * (i / 60);
      const a = 2 * Math.PI * (j / 120);
      const [x, y] = P(
        Math.cos(e) * Math.cos(a),
        Math.cos(e) * Math.sin(a),
        1 + Math.sin(e),
      );
      const key = Math.round(x);
      bins.set(key, Math.min(bins.get(key) ?? Infinity, y));
    }
  }
  const top = [...bins.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([x, y]) => [x, y] as Point);
  const front = steps(48).map((t) => {
    const k = Math.PI + Math.PI * t;
    return P(Math.cos(k), Math.sin(k), 1);
  });
  return `${poly(top)}L${front
    .reverse()
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join("L")}Z`;
}

const detail = (
  <>
    <g className="fine">
      <path d={archAlongX(1)} />
      <path d={archAlongY(-1)} />
      <path d={archAlongY(1)} />
      <path
        d={line([
          [-1, 1, 0],
          [-1, 1, -0.9],
        ])}
      />
      <path
        d={line([
          [1, 1, 0],
          [1, 1, -0.9],
        ])}
      />
    </g>
    {[
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ].map(([sx, sy]) => (
      <path key={`${sx}${sy}`} className="tone" d={pendentiveFace(sx, sy)} />
    ))}
    <g className="fine">
      {hatch(1, -1)}
      {hatch(-1, -1)}
      {hatch(1, 1)}
      {hatch(-1, 1)}
    </g>
    <path className="profile mask" d={domeOutline()} />
    <g className="fine">
      {[-150, -120, -90, -60, -30, 0, -180].map((deg) => (
        <path
          key={deg}
          d={line(
            steps(12).map((t) => {
              const e = (Math.PI / 2) * t;
              return [
                Math.cos(e) * Math.cos(rad(deg)),
                Math.cos(e) * Math.sin(rad(deg)),
                1 + Math.sin(e),
              ];
            }),
          )}
        />
      ))}
    </g>
    <g className="profile">
      <path d={archAlongX(-1)} />
      <path d={archAlongX(-1, 1.14)} />
      <path
        d={line([
          [-1, -1, 0],
          [-1, -1, -0.9],
        ])}
      />
      <path
        d={line([
          [1, -1, 0],
          [1, -1, -0.9],
        ])}
      />
      <path
        d={line([
          [-1.14, -1, 0],
          [-1.14, -1, -0.9],
        ])}
      />
      <path
        d={line([
          [1.14, -1, 0],
          [1.14, -1, -0.9],
        ])}
      />
    </g>
    <path
      className="idea"
      d={line(
        steps(64).map((t) => [
          Math.cos(2 * Math.PI * t),
          Math.sin(2 * Math.PI * t),
          1,
        ]),
      )}
    />
  </>
);

export const hagiaSophia: Drawings = {
  main: {
    title: "Long section, looking north",
    caption:
      "Section along the church, looking north, with the dome as rebuilt after it fell in 558. Cut parts are hatched. The red curved triangles are the pendentives that carry the round dome on four arches.",
    viewBox: [800, 480],
    art: main,
    labels: [
      {
        at: f.p(-8, 53.3),
        to: [300, 26],
        text: "Dome, rebuilt in 562",
        anchor: "end",
      },
      { at: f.p(9, 42), to: [560, 64], text: "Ring of 40 windows" },
      { at: f.p(-14.6, 36), to: [200, 120], text: "Pendentive", anchor: "end" },
      { at: f.p(26, 36), to: [640, 120], text: "Half-dome" },
      { at: f.p(-10, 18), to: [180, 290], text: "Gallery", anchor: "end" },
      { at: f.p(-41.5, 6), to: [64, 320], text: "Narthex", anchor: "end" },
      { at: f.p(34.5, 8), to: [650, 356], text: "Apse", anchor: "end" },
    ],
  },
  detail: {
    title: "How a pendentive works",
    caption:
      "Four arches stand on a square. The pendentives, shaded, are curved triangles cut from one sphere; they fill the corners between the arches and finish in a circle. The dome sits on that circle, in red.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: P(0.35, -0.3, 1.88), to: [326, 40], text: "Dome" },
      { at: P(1, 0, 1), to: [326, 150], text: "Ring" },
      { at: P(0.7, -1, Math.sqrt(1 - 0.49)), to: [326, 236], text: "Arch" },
      { at: P(0.92, -0.92, 0.5), to: [326, 196], text: "Pendentive" },
      { at: P(1.07, -1, -0.6), to: [326, 330], text: "Pier" },
    ],
  },
};
