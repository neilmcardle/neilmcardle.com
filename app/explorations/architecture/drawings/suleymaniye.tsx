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

const ms = measures("suleymaniye");
const R = ms("dome") / 2;
const APEX = ms("apex");
const RING = APEX - R;
const SPRING = RING - R;
const WALL = ms("hall") / 2;
const MINARET = ms("minaret");
const rad = (deg: number) => (deg * Math.PI) / 180;

const S = 5.6;
const f = frame(400, 455, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

function ellipse(
  m: Frame,
  cu: number,
  cv: number,
  r: number,
  from: number,
  to: number,
  steps = 28,
): Point[] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = rad(from + ((to - from) * i) / steps);
    return m.p(cu + r * Math.cos(t), cv + r * Math.sin(t));
  });
}

const t0 = (Math.asin(2.6 / R) * 180) / Math.PI;
const dome = poly(
  [
    ...ellipse(f, 0, RING, R + 1, t0, 180 - t0),
    ...ellipse(f, 0, RING, R, 180 - t0, t0),
  ],
  true,
);

function halfDome(side: 1 | -1) {
  const outer = ellipse(
    f,
    side * R,
    SPRING,
    R + 0.9,
    side > 0 ? 0 : 180,
    90,
    20,
  );
  const inner = ellipse(f, side * R, SPRING, R, 90, side > 0 ? 0 : 180, 20);
  return poly([...outer, ...inner], true);
}

function pendentive(side: 1 | -1) {
  const curve = ellipse(f, 0, SPRING, R, side > 0 ? 0 : 180, 90, 20);
  return poly([...curve, f.p(0, RING), f.p(side * R, RING)], true);
}

const WINDOWS = Array.from({ length: 16 }, (_, k) => {
  const a = rad((k + 0.5) * (180 / 16));
  return { u: R * Math.cos(a), w: 0.9 * Math.sin(a) };
});

function turret(u: number) {
  return (
    <g key={u}>
      <path
        className="profile mask"
        d={box(u - 1.3, u + 1.3, RING + 1, RING + 6)}
      />
      <path
        className="profile mask"
        d={`M${f.x(u - 1.5)},${f.y(RING + 6)}Q${f.x(u)},${f.y(RING + 8.5)} ${f.x(u + 1.5)},${f.y(RING + 6)}Z`}
      />
    </g>
  );
}

const MIN_U = -WALL - 4.5;

function minaret() {
  const balconies = [40, 51, 60];
  return (
    <g>
      <path
        className="profile mask"
        d={box(MIN_U - 1.1, MIN_U + 1.1, 0, 63.8)}
      />
      {balconies.map((v) => (
        <path
          key={v}
          className="profile mask"
          d={box(MIN_U - 1.9, MIN_U + 1.9, v, v + 1.2)}
        />
      ))}
      <path
        className="profile mask"
        d={poly(
          [
            f.p(MIN_U - 1.3, 63.8),
            f.p(MIN_U, MINARET - 1.2),
            f.p(MIN_U + 1.3, 63.8),
          ],
          true,
        )}
      />
      <path
        className="profile"
        d={poly([f.p(MIN_U, MINARET - 1.2), f.p(MIN_U, MINARET)])}
      />
    </g>
  );
}

function arcade(v0: number, v1: number, count: number, span: number) {
  const bay = span / count;
  return Array.from({ length: count }, (_, i) => {
    const a = -span / 2 + i * bay + bay * 0.14;
    const b = a + bay * 0.72;
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
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    <path className="cut poche rock" d={box(-WALL - 1, WALL + 1, -1.4, 0)} />
    {minaret()}
    <path className="profile mask" d={box(-R - 3.2, -R, 0, SPRING)} />
    <path className="profile mask" d={box(R, R + 3.2, 0, SPRING)} />
    <path className="profile" d={poly(ellipse(f, 0, SPRING, R, 180, 0))} />
    <g className="fine">
      {arcade(0, 11, 5, 2 * R - 2)}
      <path d={poly([f.p(-R, 12), f.p(R, 12)])} />
      {arcade(12, 20, 7, 2 * R - 2)}
      {[-7.5, -5, -2.5, 0, 2.5, 5, 7.5].map((u) => (
        <path key={u} d={box(u - 0.7, u + 0.7, 28.5, 32.5)} />
      ))}
      {WINDOWS.map(({ u, w }) => (
        <path key={u} d={box(u - w / 2, u + w / 2, RING + 0.4, RING + 2.4)} />
      ))}
      {[-1, 1].map((side) => (
        <path
          key={side}
          d={`M${f.x(side * (R + 4))},${f.y(0)}L${f.x(side * (R + 4))},${f.y(11)}A${4.6 * S},${4.6 * S} 0 0 ${side > 0 ? 1 : 0} ${f.x(side * (R + 13.2))},${f.y(11)}L${f.x(side * (R + 13.2))},${f.y(0)}`}
        />
      ))}
    </g>
    <path className="tone" d={pendentive(-1)} />
    <path className="tone" d={pendentive(1)} />
    <path className="cut poche rock" d={dome} />
    <path
      className="cut poche rock"
      d={box(-R - 2, -R, RING - 1.2, RING + 0.6)}
    />
    <path
      className="cut poche rock"
      d={box(R, R + 2, RING - 1.2, RING + 0.6)}
    />
    <path className="cut poche rock" d={halfDome(-1)} />
    <path className="cut poche rock" d={halfDome(1)} />
    <path
      className="idea"
      d={poly(ellipse(f, -R, SPRING, R - 0.25, 180, 90, 20))}
    />
    <path
      className="idea"
      d={poly(ellipse(f, R, SPRING, R - 0.25, 0, 90, 20))}
    />
    <path className="cut poche rock" d={box(-WALL, -2 * R, 0, SPRING + 1.5)} />
    <path className="cut poche rock" d={box(2 * R, WALL, 0, SPRING + 1.5)} />
    {turret(-R - 1)}
    {turret(R + 1)}
    <path className="cut" d={poly([f.p(-WALL - 9, 0), f.p(WALL + 4, 0)])} />
    <Person x={f.x(-4)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-R, RING)}
      b={f.p(R, RING)}
      offset={16}
      value={ms("dome")}
    />
    <DimensionLine
      a={f.p(0, APEX)}
      b={f.p(0, 0)}
      offset={-(WALL + 2.5) * S}
      value={APEX}
    />
    <DimensionLine
      a={f.p(-WALL, 0)}
      b={f.p(WALL, 0)}
      offset={1.4 * S + 12}
      value={ms("hall")}
    />
    <DimensionLine
      a={f.p(MIN_U - 1.9, MINARET)}
      b={f.p(MIN_U - 1.9, 0)}
      offset={12}
      value={MINARET}
    />
  </>
);

const D = 5.8;
const d = frame(40, 345, D);
const darc = (cu: number, cv: number, r: number, from: number, to: number) =>
  poly(ellipse(d, cu, cv, r, from, to, 24));

const detail = (
  <>
    <path className="cut" d={poly([d.p(-2, 0), d.p(36, 0)])} />
    <path className="profile" d={darc(0, RING, R, 90, 0)} />
    <path className="profile" d={poly([d.p(R, RING), d.p(R, SPRING)])} />
    <path className="profile" d={darc(R, SPRING, R, 90, 0)} />
    <path
      className="profile mask"
      d={poly(
        [
          d.p(2 * R, 0),
          d.p(2 * R, SPRING),
          d.p(WALL, SPRING),
          d.p(WALL + 3, 12),
          d.p(WALL + 3, 0),
        ],
        true,
      )}
    />
    <Arrow points={[d.p(R * 0.7, RING + R * 0.72), d.p(R + 0.6, RING + 1)]} />
    <Arrow
      points={[d.p(R + 2, SPRING + R - 1.2), d.p(2 * R - 1.5, SPRING + 2.5)]}
    />
    <Arrow points={[d.p(2 * R + 1.5, SPRING - 0.5), d.p(2 * R + 1.5, 1)]} />
  </>
);

export const suleymaniye: Drawings = {
  main: {
    title: "Long section, looking east",
    caption:
      "Section along the main axis, with the half-domes in red and one of the tall minarets beyond. The dome rises to twice its width. The pier, window and half-dome sizes are drawn from the dome's dimensions and photographs.",
    viewBox: [800, 506],
    art: main,
    labels: [
      { at: f.p(MIN_U + 1, 62), to: [140, 60], text: "Minaret", anchor: "end" },
      { at: f.p(R + 2.2, RING + 4), to: [610, 196], text: "Weight tower" },
      { at: f.p(R + 6, SPRING + 10), to: [610, 250], text: "Half-dome" },
      { at: f.p(R * 0.85, SPRING + 9), to: [610, 300], text: "Pendentive" },
      { at: f.p(WALL - 1.3, 12), to: [610, 360], text: "Thick end wall" },
    ],
  },
  detail: {
    title: "The cascade of domes",
    caption:
      "Diagram of half the building. The push of the dome passes into a half-dome, and from the half-dome into the thick end walls and buttresses, stepping down like water over a weir.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: d.p(R * 0.8, RING + R * 0.6),
        to: [250, 40],
        text: "Dome pushes out",
      },
      {
        at: d.p(R + 5, SPRING + R * 0.8),
        to: [250, 110],
        text: "Half-dome takes it",
      },
      { at: d.p(2 * R + 1.5, 10), to: [250, 380], text: "Walls carry it down" },
    ],
  },
};
