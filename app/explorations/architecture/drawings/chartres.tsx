import { measures } from "../sources";
import {
  Arrow,
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
} from "./kit";

const ms = measures("chartres");
const NAVE = ms("nave") / 2;
const VAULT = ms("vault");
const RIDGE = ms("ridge");

type Frame = ReturnType<typeof frame>;

const box = (m: Frame, u0: number, u1: number, v0: number, v1: number) =>
  poly([m.p(u0, v0), m.p(u0, v1), m.p(u1, v1), m.p(u1, v0)], true);

const curve = (
  m: Frame,
  a: [number, number],
  c: [number, number],
  b: [number, number],
) =>
  `M${m.x(a[0])},${m.y(a[1])}Q${m.x(c[0])},${m.y(c[1])} ${m.x(b[0])},${m.y(b[1])}`;

function rib(
  m: Frame,
  span: number,
  spring: number,
  rise: number,
  at = 0,
  dir = 1,
) {
  const r = (span * span + rise * rise) / (2 * span);
  const scale = m.x(1) - m.x(0);
  return `M${m.x(at + dir * span)},${m.y(spring)}A${r * scale},${r * scale} 0 0 ${dir > 0 ? 0 : 1} ${m.x(at)},${m.y(spring + rise)}`;
}

function flyers(m: Frame) {
  const spokes = [0.18, 0.36, 0.54, 0.72];
  const lower = (t: number): [number, number] => {
    const a: [number, number] = [18.2, 20.5];
    const c: [number, number] = [11.5, 21.5];
    const b: [number, number] = [9.8, 26.8];
    const k = 1 - t;
    return [
      k * k * a[0] + 2 * k * t * c[0] + t * t * b[0],
      k * k * a[1] + 2 * k * t * c[1] + t * t * b[1],
    ];
  };
  const top = (t: number): [number, number] => [18.2 - 8.4 * t, 25.3 + 4 * t];
  return (
    <g className="profile">
      <path d={poly([m.p(18.2, 26), m.p(9.8, 30)])} />
      <path d={poly([m.p(18.2, 25.3), m.p(9.8, 29.3)])} />
      <path d={curve(m, [18.2, 20.5], [11.5, 21.5], [9.8, 26.8])} />
      <g className="fine">
        {spokes.map((t) => {
          const [u, v] = lower(t);
          const [tu, tv] = top(t * 0.92 + 0.04);
          return <path key={t} d={poly([m.p(u, v), m.p(tu, tv)])} />;
        })}
      </g>
      <path d={poly([m.p(18.2, 31), m.p(9.8, 35)])} />
      <path d={curve(m, [18.2, 28.6], [12, 29.2], [9.8, 33.2])} />
    </g>
  );
}

function pier(m: Frame) {
  return (
    <path
      className="profile mask"
      d={poly(
        [
          m.p(18.2, 0),
          m.p(22.8, 0),
          m.p(22.8, 2),
          m.p(22.5, 2),
          m.p(22.5, 16),
          m.p(21.8, 17),
          m.p(21.8, 31),
          m.p(21.4, 31),
          m.p(21.4, 35),
          m.p(20, 38.5),
          m.p(18.6, 35),
          m.p(18.6, 31),
          m.p(18.2, 31),
        ],
        true,
      )}
    />
  );
}

function half(m: Frame) {
  return (
    <>
      {pier(m)}
      <g className="profile">
        <path d={box(m, 8.2, 10.2, 0, 12)} />
        <path d={rib(m, NAVE, 28, VAULT - 28, 0)} />
        <path d={rib(m, 3.25, 9.5, 4.3, 13.45)} />
        <path d={rib(m, 3.25, 9.5, 4.3, 13.45, -1)} />
      </g>
      <g className="fine">
        <path d={poly([m.p(8.6, 12), m.p(8.6, 28)])} />
        <path d={poly([m.p(9.8, 12), m.p(9.8, 14)])} />
        <path d={poly([m.p(9.0, 20.4), m.p(9.0, 33.5)])} />
        <path d={poly([m.p(17.45, 3), m.p(17.45, 10.5)])} />
      </g>
      {flyers(m)}
      <g className="cut poche stone">
        <path d={box(m, 8.2, 10.2, 12.8, 14)} />
        <path d={box(m, 8.2, 9.8, 14, 14.6)} />
        <path d={box(m, 8.2, 9.8, 18.6, 20.4)} />
        <path d={box(m, 8.2, 9.8, 33.5, 37.5)} />
        <path d={box(m, 16.7, 18.2, 0, 3)} />
        <path d={box(m, 16.7, 18.2, 10.5, 16)} />
        <path
          d={`${curve(m, [8.2, 33.5], [5, VAULT - 0.1], [0, VAULT])}L${m.x(0)},${m.y(VAULT + 0.35)}Q${m.x(5.2)},${m.y(VAULT + 0.25)} ${m.x(8.2)},${m.y(35.2)}Z`}
        />
        <path
          d={`${curve(m, [10.2, 12.8], [13.45, 14.6], [16.7, 12.8])}L${m.x(16.7)},${m.y(13.6)}Q${m.x(13.45)},${m.y(15.2)} ${m.x(10.2)},${m.y(13.6)}Z`}
        />
      </g>
      <g className="cut">
        <path d={poly([m.p(10.6, 37.2), m.p(0, RIDGE)])} />
        <path d={poly([m.p(18.8, 15.7), m.p(9.8, 20.6)])} />
      </g>
      <g className="fine">
        <path d={poly([m.p(10.0, 37.6), m.p(0, RIDGE - 0.6)])} />
        <path d={poly([m.p(18.6, 16.3), m.p(9.8, 21.1)])} />
        <path d={poly([m.p(0, 37.8), m.p(9.8, 37.8)])} />
        <path d={poly([m.p(0, 37.8), m.p(0, RIDGE - 0.6)])} />
        <path d={poly([m.p(0.2, 40), m.p(6.2, 43.2)])} />
        <path d={poly([m.p(0, 45.6), m.p(4.2, 45.6)])} />
      </g>
    </>
  );
}

const S = 7.5;
const f = frame(400, 440, S);

const main = (
  <>
    <ScaleBar x={40} y={40} scale={S} step={5} count={2} />
    <path className="cut poche rock" d={box(f, -24, 24, -1.5, 0)} />
    <path className="cut" d={poly([f.p(-30, 0), f.p(30, 0)])} />
    {half(f)}
    <g transform="translate(800 0) scale(-1 1)">{half(f)}</g>
    <Arrow
      points={[
        f.p(6.5, 33.8),
        f.p(9.8, 33.4),
        f.p(18.2, 29.6),
        f.p(20.1, 27),
        f.p(20.3, 14),
        f.p(20.5, 1),
      ]}
    />
    <Person x={f.x(-4)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-NAVE, 6)}
      b={f.p(NAVE, 6)}
      offset={0.1}
      value={ms("nave")}
    />
    <DimensionLine
      a={f.p(-5.5, VAULT - 1.4)}
      b={f.p(-5.5, 0)}
      offset={0.1}
      value={VAULT}
    />
  </>
);

const D = 8.5;
const d = frame(20, 372, D);

const detail = (
  <>
    <path className="cut" d={poly([d.p(-1, 0), d.p(25, 0)])} />
    <path
      className="profile"
      d={poly([d.p(8.2, 0), d.p(8.2, 37.5), d.p(9.8, 37.5), d.p(9.8, 0)])}
    />
    <path className="fine" d={poly([d.p(9.0, 20.4), d.p(9.0, 33.5)])} />
    <path className="profile" d={rib(d, NAVE, 28, VAULT - 28, 0)} />
    <path className="profile" d={poly([d.p(18.2, 31), d.p(9.8, 35)])} />
    <path
      className="profile"
      d={curve(d, [18.2, 28.6], [12, 29.2], [9.8, 33.2])}
    />
    <path className="profile" d={poly([d.p(18.8, 15.7), d.p(9.8, 20.6)])} />
    {pier(d)}
    <Arrow points={[d.p(4.5, 34.2), d.p(8.0, 32.4)]} />
    <Arrow points={[d.p(10.4, 33.0), d.p(17.6, 29.4)]} />
    <Arrow points={[d.p(20, 37.4), d.p(20, 32)]} />
    <Arrow points={[d.p(20.1, 28.6), d.p(20.3, 16), d.p(20.5, 1.2)]} />
  </>
);

export const chartres: Drawings = {
  main: {
    title: "Section through the nave",
    caption:
      "Cross-section through the middle of a nave bay, looking east. Cut parts are hatched; the piers, ribs and flying buttresses are seen beyond. The red line follows the push of the vault down to the ground.",
    viewBox: [800, 480],
    art: main,
    labels: [
      {
        at: [f.x(-0.3), f.y(VAULT + 0.2)],
        to: [225, 140],
        text: "Stone vault",
        anchor: "end",
      },
      { at: [f.x(14), f.y(32.4)], to: [612, 175], text: "Flying buttress" },
      { at: [f.x(21.9), f.y(10)], to: [612, 340], text: "Buttress pier" },
      {
        at: [f.x(-9.0), f.y(26)],
        to: [222, 250],
        text: "Clerestory window",
        anchor: "end",
      },
      {
        at: [f.x(20.5), f.y(2)],
        to: [612, 425],
        text: "Thrust reaches the ground",
      },
      { at: [f.x(4.5), f.y(45)], to: [480, 66], text: "Timber roof" },
      {
        at: [f.x(-13.45), f.y(6)],
        to: [222, 410],
        text: "Aisle",
        anchor: "end",
      },
    ],
  },
  detail: {
    title: "Where the push goes",
    caption:
      "The push of the vault, traced in red. The flyer carries it over the aisle, the weight of the pinnacle bends it downward, and it reaches the ground inside the pier.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: [d.x(5.5), d.y(33.6)], to: [24, 30], text: "Vault pushes out" },
      {
        at: [d.x(14), d.y(31.4)],
        to: [236, 118],
        text: "Flyer carries it across",
      },
      { at: [d.x(20), d.y(36)], to: [236, 60], text: "Pinnacle adds weight" },
      { at: [d.x(20.4), d.y(8)], to: [236, 290], text: "Push turns down" },
      {
        at: [d.x(20.5), d.y(0)],
        to: [236, 390],
        text: "Lands inside the base",
      },
    ],
  },
};
