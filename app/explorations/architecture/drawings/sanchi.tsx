import { measures } from "../sources";
import {
  arc,
  Arrow,
  DimensionLine,
  frame,
  Person,
  poly,
  round,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const m = measures("sanchi");
const DRUM = m("dome") / 2;
const DOME = DRUM - m("path");
const DRUM_TOP = m("terrace");
const CROWN = m("height");
const RAIL = m("railing") / 2;

const S = 11;
const f = frame(400, 340, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

function railing(radius: number, base: number, height: number, gap: number) {
  const step = 2.4 / radius;
  const posts: number[] = [];
  for (let a = -Math.PI / 2 + step / 2; a < Math.PI / 2; a += step) {
    const u = radius * Math.sin(a);
    if (Math.abs(u) > gap) posts.push(u);
  }
  const bars = [0.3, 0.52, 0.74].map((k) => base + height * k);
  const runs: [number, number][] =
    gap > 0
      ? [
          [-radius, -gap],
          [gap, radius],
        ]
      : [[-radius, radius]];
  return (
    <g>
      {runs.map(([a, b]) => (
        <path
          key={a}
          className="profile mask"
          d={box(a, b, base, base + height)}
        />
      ))}
      <g className="fine">
        {runs.flatMap(([a, b]) =>
          bars.map((v) => (
            <path key={`${a}-${v}`} d={poly([f.p(a, v), f.p(b, v)])} />
          )),
        )}
        {posts.map((u) => (
          <path
            key={u}
            d={box(u - 0.17, u + 0.17, base, base + height * 0.86)}
          />
        ))}
        {runs.map(([a, b]) => (
          <path
            key={`top-${a}`}
            d={poly([
              f.p(a, base + height * 0.86),
              f.p(b, base + height * 0.86),
            ])}
          />
        ))}
      </g>
    </g>
  );
}

function torana() {
  const beams = [6.2, 7.25, 8.3];
  return (
    <g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <path
            className="profile mask"
            d={box(side * 3.4 - 0.35, side * 3.4 + 0.35, 0, 5.4)}
          />
          <path
            className="profile mask"
            d={box(side * 3.4 - 0.6, side * 3.4 + 0.6, 5.4, 6.2)}
          />
        </g>
      ))}
      {beams.map((v) => (
        <g key={v}>
          <path
            className="profile mask"
            d={`M${f.x(-5.2)},${f.y(v)}Q${f.x(0)},${f.y(v - 0.25)} ${f.x(5.2)},${f.y(v)}L${f.x(5.2)},${f.y(v + 0.5)}Q${f.x(0)},${f.y(v + 0.25)} ${f.x(-5.2)},${f.y(v + 0.5)}Z`}
          />
          <circle
            className="profile mask"
            cx={f.x(-5.45)}
            cy={f.y(v + 0.25)}
            r={0.28 * S}
          />
          <circle
            className="profile mask"
            cx={f.x(5.45)}
            cy={f.y(v + 0.25)}
            r={0.28 * S}
          />
        </g>
      ))}
      <g className="fine">
        {[-1.4, 0, 1.4].map((u) =>
          [6.7, 7.75].map((v) => (
            <path key={`${u}-${v}`} d={box(u - 0.18, u + 0.18, v, v + 0.5)} />
          )),
        )}
      </g>
      <circle className="profile mask" cx={f.x(0)} cy={f.y(9.45)} r={0.6 * S} />
      <path className="fine" d={poly([f.p(0, 8.85), f.p(0, 10.05)])} />
      <path className="fine" d={poly([f.p(-0.6, 9.45), f.p(0.6, 9.45)])} />
      {[-3.4, 3.4].map((u) => (
        <path
          key={u}
          className="profile"
          d={poly([
            f.p(u - 0.35, 9.5),
            f.p(u - 0.35, 8.85),
            f.p(u + 0.35, 8.85),
            f.p(u + 0.35, 9.5),
          ])}
        />
      ))}
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    <path className="cut" d={poly([f.p(-34, 0), f.p(34, 0)])} />
    <path
      className="profile mask"
      d={`M${f.x(-DOME)},${f.y(DRUM_TOP)}A${DOME * S},${(CROWN - DRUM_TOP) * S} 0 0 1 ${f.x(DOME)},${f.y(DRUM_TOP)}Z`}
    />
    <path className="profile mask" d={box(-2.6, 2.6, CROWN, 18.4)} />
    <g className="fine">
      {[-1.6, -0.5, 0.5, 1.6].map((u) => (
        <path key={u} d={poly([f.p(u, CROWN), f.p(u, 18.2)])} />
      ))}
    </g>
    <path className="profile" d={poly([f.p(0, 18.4), f.p(0, 21.9)])} />
    {[
      [19.2, 3.4],
      [20.1, 2.8],
      [21.0, 2.2],
    ].map(([v, w]) => (
      <path
        key={v}
        className="profile mask"
        d={box(-w / 2, w / 2, v, v + 0.25)}
      />
    ))}
    <path className="profile mask" d={box(-DRUM, DRUM, 0, DRUM_TOP)} />
    {railing(DRUM - 0.2, DRUM_TOP, 1.0, 0)}
    <path
      className="idea"
      d={poly([f.p(14, DRUM_TOP + 0.5), f.p(-12, DRUM_TOP + 0.5)])}
    />
    <Arrow points={[f.p(-11, DRUM_TOP + 0.5), f.p(-14, DRUM_TOP + 0.5)]} />
    <g className="fine">
      <path d={poly([f.p(-1.4, 0), f.p(-9, DRUM_TOP)])} />
      <path d={poly([f.p(-1.4, 1), f.p(-9, DRUM_TOP + 1)])} />
      <path d={poly([f.p(1.4, 0), f.p(9, DRUM_TOP)])} />
      <path d={poly([f.p(1.4, 1), f.p(9, DRUM_TOP + 1)])} />
    </g>
    {railing(RAIL, 0, 3.1, 3.0)}
    {torana()}
    <Person x={f.x(-24)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-DRUM, 0)}
      b={f.p(DRUM, 0)}
      offset={18}
      value={m("dome")}
    />
    <DimensionLine
      a={f.p(-2.6, CROWN)}
      b={f.p(-2.6, 0)}
      offset={241}
      value={CROWN}
    />
  </>
);

const D = 7.2;
const C: Point = [200, 200];
const at = (r: number, deg: number): Point => [
  C[0] + r * D * Math.cos((deg * Math.PI) / 180),
  C[1] - r * D * Math.sin((deg * Math.PI) / 180),
];

function gateway(deg: number) {
  const n = (deg * Math.PI) / 180;
  const t: Point = [-Math.sin(n), -Math.cos(n)];
  const base = at(23.4, deg);
  const off = (k: number): Point => [
    base[0] + t[0] * k * D,
    base[1] + t[1] * k * D,
  ];
  const pillar = (k: number) => {
    const [x, y] = off(k);
    return (
      <rect
        key={k}
        className="profile mask"
        x={round(x - 0.4 * D)}
        y={round(y - 0.4 * D)}
        width={0.8 * D}
        height={0.8 * D}
      />
    );
  };
  return (
    <g key={deg}>
      <path className="profile" d={poly([off(-5.4), off(5.4)])} />
      {pillar(-3.4)}
      {pillar(3.4)}
    </g>
  );
}

const GATES = [90, 0, 270, 180];
const GAP = 9;

const detail = (
  <>
    <g className="cut">
      {GATES.map((g) => (
        <g key={g}>
          <path d={poly(arc(C, RAIL * D, g + GAP, g + 90 - GAP, 20))} />
          <path d={poly(arc(C, (RAIL + 0.6) * D, g + GAP, g + 90 - GAP, 20))} />
        </g>
      ))}
    </g>
    {GATES.map(gateway)}
    <circle className="profile" cx={C[0]} cy={C[1]} r={DRUM * D} />
    <circle className="profile" cx={C[0]} cy={C[1]} r={DOME * D} />
    <path
      className="profile"
      d={poly(
        [
          [C[0] - 2.6 * D, C[1] - 2.6 * D],
          [C[0] + 2.6 * D, C[1] - 2.6 * D],
          [C[0] + 2.6 * D, C[1] + 2.6 * D],
          [C[0] - 2.6 * D, C[1] + 2.6 * D],
        ],
        true,
      )}
    />
    <circle className="fine" cx={C[0]} cy={C[1]} r={1.7 * D} />
    <g className="fine">
      <path
        d={poly(
          [
            [C[0] - 9 * D, C[1] + 18.3 * D],
            [C[0] - 1.2 * D, C[1] + 18.3 * D],
            [C[0] - 1.2 * D, C[1] + 20 * D],
            [C[0] - 9 * D, C[1] + 20 * D],
          ],
          true,
        )}
      />
      <path
        d={poly(
          [
            [C[0] + 1.2 * D, C[1] + 18.3 * D],
            [C[0] + 9 * D, C[1] + 18.3 * D],
            [C[0] + 9 * D, C[1] + 20 * D],
            [C[0] + 1.2 * D, C[1] + 20 * D],
          ],
          true,
        )}
      />
    </g>
    {[100, 10, -80, -170].map((a) => (
      <Arrow key={`g${a}`} points={arc(C, 19.9 * D, a + 62, a + 6, 16)} />
    ))}
    {[145, 55, -35, -125].map((a) => (
      <Arrow key={`u${a}`} points={arc(C, 17.2 * D, a + 56, a + 10, 14)} />
    ))}
  </>
);

export const sanchi: Drawings = {
  main: {
    title: "South elevation",
    caption:
      "Elevation from the south, through the south gateway, with the double stair rising behind it. The dome is solid. The red line is the upper path on the drum, walked clockwise like the ground path inside the railing.",
    viewBox: [800, 400],
    art: main,
    labels: [
      { at: f.p(-7, 13.5), to: [230, 130], text: "Solid dome", anchor: "end" },
      { at: f.p(1.4, 19.5), to: [460, 70], text: "Harmika and umbrellas" },
      { at: f.p(4.8, 8.5), to: [640, 190], text: "Gateway (torana)" },
      { at: f.p(13, 4.8), to: [640, 240], text: "Upper path" },
      { at: f.p(21.4, 2.0), to: [660, 300], text: "Stone railing" },
    ],
  },
  detail: {
    title: "Plan: two paths round",
    caption:
      "Plan of the stupa. Pilgrims enter through a gateway, walk clockwise on the ground path inside the railing, then climb the south stair and circle again on the drum. There is no way in.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: at(19.9, 16),
        to: [392, 24],
        text: "Walk clockwise",
        anchor: "end",
      },
      {
        at: at(DOME * 0.85, 40),
        to: [392, 64],
        text: "Solid dome",
        anchor: "end",
      },
      { at: at(19.9, 128), to: [8, 24], text: "Ground path" },
      { at: at(17.2, 222), to: [8, 392], text: "Upper path" },
      { at: at(23.4, 0), to: [392, 340], text: "Gateway", anchor: "end" },
      { at: [C[0] + 5 * D, C[1] + 19.2 * D], to: [300, 392], text: "Stair" },
    ],
  },
};
