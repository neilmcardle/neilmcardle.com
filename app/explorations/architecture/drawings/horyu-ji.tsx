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

const m = measures("horyu-ji");
const TOTAL = m("total");
const BODY_TOP = TOTAL - m("spire");
const DEPTH = m("base");

type Frame = ReturnType<typeof frame>;
type Storey = {
  b: number;
  v0: number;
  h: number;
  e: number;
  ve: number;
  next: number;
  nb: number;
};

const FIRST = m("first") / 2;
const FIFTH = m("fifth") / 2;
const K = BODY_TOP / 25.2;
const STOREYS: Storey[] = [
  { b: FIRST, v0: 1.2, h: 3.6, e: 6.8, ve: 5.3, next: 7.4, nb: 2.7 },
  { b: 2.7, v0: 7.4, h: 2.3, e: 6.0, ve: 10.1, next: 11.9, nb: 2.3 },
  { b: 2.3, v0: 11.9, h: 2.2, e: 5.3, ve: 14.5, next: 16.2, nb: 1.95 },
  { b: 1.95, v0: 16.2, h: 2.1, e: 4.75, ve: 18.7, next: 20.3, nb: FIFTH },
  { b: FIFTH, v0: 20.3, h: 2.0, e: 4.2, ve: 22.7, next: 25.2, nb: 0.4 },
].map((s) => ({
  ...s,
  v0: s.v0 * K,
  h: s.h * K,
  ve: s.ve * K,
  next: s.next * K,
}));

function roofOutline(m: Frame, s: Storey): string {
  const top = s.v0 + s.h;
  const shoulder = s.b + (s.e - s.b) * 0.45;
  return `M${m.x(s.nb)},${m.y(s.next)}Q${m.x(shoulder)},${m.y(s.ve + 0.5)} ${m.x(s.e + 0.15)},${m.y(s.ve + 0.25)}L${m.x(s.e)},${m.y(s.ve - 0.2)}Q${m.x(shoulder)},${m.y(s.ve)} ${m.x(s.b + 0.6)},${m.y(top + 0.85)}L${m.x(s.b)},${m.y(top + 0.85)}`;
}

function roofFill(m: Frame, s: Storey): string {
  const top = s.v0 + s.h;
  return `${roofOutline(m, s)}L${m.x(s.b)},${m.y(top)}L${m.x(0)},${m.y(top)}L${m.x(0)},${m.y(s.next)}Z`;
}

function storey(m: Frame, s: Storey, i: number) {
  const top = s.v0 + s.h;
  const posts = i === 0 ? [1.07] : [s.b / 3];
  return (
    <g key={i}>
      <path
        className="mask"
        d={poly(
          [m.p(0, s.v0), m.p(s.b, s.v0), m.p(s.b, top), m.p(0, top)],
          true,
        )}
      />
      <path className="profile" d={poly([m.p(s.b, s.v0), m.p(s.b, top)])} />
      <g className="fine">
        {posts.map((u) => (
          <path key={u} d={poly([m.p(u, s.v0), m.p(u, top)])} />
        ))}
        {i === 0 ? (
          <path
            d={poly([
              m.p(0, s.v0),
              m.p(0.75, s.v0),
              m.p(0.75, top - 0.6),
              m.p(0, top - 0.6),
            ])}
          />
        ) : (
          <>
            <path
              d={poly([m.p(0, s.v0 + 0.55), m.p(s.b + 0.3, s.v0 + 0.55)])}
            />
            <path
              d={poly([m.p(s.b + 0.3, s.v0), m.p(s.b + 0.3, s.v0 + 0.55)])}
            />
          </>
        )}
        <path
          d={poly([
            m.p(s.b, top + 0.28),
            m.p(s.b + 0.45, top + 0.28),
            m.p(s.b + 0.45, top + 0.56),
            m.p(s.b + 0.85, top + 0.56),
          ])}
        />
        <path
          d={poly([
            m.p(posts[0] - 0.3, top + 0.28),
            m.p(posts[0] + 0.3, top + 0.28),
          ])}
        />
      </g>
      <path className="mask" d={roofFill(m, s)} />
      <path className="profile" d={roofOutline(m, s)} />
      <g className="fine">
        {[0.3, 0.55, 0.8].map((k) => {
          const u = s.b + (s.e - s.b) * k;
          return (
            <path
              key={k}
              d={poly([
                m.p(u, s.ve + 0.05 + (1 - k) * 0.9),
                m.p(u - 0.25, s.ve - 0.05 + (1 - k) * 0.75),
              ])}
            />
          );
        })}
      </g>
    </g>
  );
}

function half(m: Frame) {
  return (
    <>
      <path
        className="mask"
        d={poly([m.p(0, 0), m.p(4.6, 0), m.p(4.6, 1.2), m.p(0, 1.2)], true)}
      />
      <path
        className="profile"
        d={poly([m.p(0, 1.2), m.p(4.6, 1.2), m.p(4.6, 0)])}
      />
      <path
        className="fine"
        d={poly([m.p(0, 0.6), m.p(1.0, 0.6), m.p(1.0, 1.2)])}
      />
      {STOREYS.map((s, i) => storey(m, s, i))}
    </>
  );
}

const S = 12.5;
const f = frame(400, 420, S);
const RINGS = Array.from({ length: 9 }, (_, i) => BODY_TOP + 1.2 + i * 0.5);

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={5} count={2} />
    {half(f)}
    <g transform="translate(800 0) scale(-1 1)">{half(f)}</g>
    <path
      className="cut poche earth"
      d={poly(
        [
          f.p(-16, 0),
          f.p(16, 0),
          f.p(16, -DEPTH - 0.6),
          f.p(-16, -DEPTH - 0.6),
        ],
        true,
      )}
    />
    <path
      className="cut poche stone"
      d={poly(
        [
          f.p(-0.9, -DEPTH - 0.5),
          f.p(-0.9, -DEPTH),
          f.p(0.9, -DEPTH),
          f.p(0.9, -DEPTH - 0.5),
        ],
        true,
      )}
    />
    <path className="idea dash" d={poly([f.p(0, -DEPTH), f.p(0, BODY_TOP)])} />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(-0.9, BODY_TOP),
          f.p(-0.9, BODY_TOP + 0.7),
          f.p(0.9, BODY_TOP + 0.7),
          f.p(0.9, BODY_TOP),
        ],
        true,
      )}
    />
    <path
      className="profile"
      d={poly([f.p(0, BODY_TOP + 0.7), f.p(0, TOTAL - 0.4)])}
    />
    {RINGS.map((v) => (
      <path
        key={v}
        className="profile"
        d={poly([f.p(-0.75, v), f.p(0.75, v)])}
      />
    ))}
    <path
      className="profile"
      d={`M${f.x(-0.7)},${f.y(TOTAL - 2.6)}Q${f.x(-0.9)},${f.y(TOTAL - 1.8)} ${f.x(0)},${f.y(TOTAL - 1.2)}Q${f.x(0.9)},${f.y(TOTAL - 1.8)} ${f.x(0.7)},${f.y(TOTAL - 2.6)}`}
    />
    <circle className="profile" cx={f.x(0)} cy={f.y(TOTAL - 0.3)} r={0.3 * S} />
    <path className="cut" d={poly([f.p(-16, 0), f.p(16, 0)])} />
    <Person x={f.x(-5.6)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(0, TOTAL)}
      b={f.p(0, 0)}
      offset={9 * S}
      value={TOTAL}
    />
    <DimensionLine
      a={f.p(-FIRST, 1.2)}
      b={f.p(FIRST, 1.2)}
      offset={(1.2 + DEPTH + 0.6) * S + 10}
      value={m("first")}
    />
  </>
);

const BODY = [52, 46, 40, 34, 28];
const SWAY = [3, -7, 7, -7, 7];
const GROUND = 356;

function block(i: number, dx: number, className: string) {
  const bw = BODY[i];
  const base = GROUND - 14 - i * 58;
  const top = base - 30;
  const eave = bw + 36;
  const nextBase = base - 58;
  const nb = i < 4 ? BODY[i + 1] : 6;
  const x = (u: number) => 200 + dx + u;
  const shape: Point[] = [
    [x(-bw), base],
    [x(-bw), top],
    [x(-eave), top + 6],
    [x(-nb), nextBase],
    [x(nb), nextBase],
    [x(eave), top + 6],
    [x(bw), top],
    [x(bw), base],
  ];
  return (
    <path
      key={`${className}-${i}`}
      className={className}
      d={poly(shape, true)}
    />
  );
}

const detail = (
  <>
    <path
      className="cut poche stone"
      d={poly(
        [
          [170, GROUND],
          [230, GROUND],
          [230, GROUND + 16],
          [170, GROUND + 16],
        ],
        true,
      )}
    />
    <path
      className="cut"
      d={poly([
        [20, GROUND],
        [380, GROUND],
      ])}
    />
    <path
      className="profile"
      d={poly([
        [136, GROUND],
        [136, GROUND - 14],
        [264, GROUND - 14],
        [264, GROUND],
      ])}
    />
    {BODY.map((_, i) => block(i, 0, "fine dash"))}
    {BODY.map((_, i) => block(i, SWAY[i], "profile mask"))}
    <path
      className="idea"
      d={poly([
        [200, GROUND + 8],
        [200, 46],
      ])}
    />
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <path
        key={k}
        className="idea"
        d={poly([
          [193, 54 - k * 4],
          [207, 54 - k * 4],
        ])}
      />
    ))}
    {BODY.map((bw, i) => {
      const y = GROUND - 14 - i * 58 - 15;
      const dir = Math.sign(SWAY[i]);
      const x0 = 200 + bw + 44;
      return (
        <Arrow
          key={i}
          className="profile"
          points={[
            [x0, y],
            [x0 + dir * 14, y],
          ]}
        />
      );
    })}
  </>
);

export const horyuJi: Drawings = {
  main: {
    title: "Five-storey pagoda, elevation",
    caption:
      "Elevation of the pagoda. Each storey is smaller than the one below; the top is about half the width of the first. The red dashed line is the central pillar, hidden inside, running from a stone below ground up into the spire.",
    viewBox: [800, 502],
    art: main,
    labels: [
      { at: f.p(0.3, TOTAL - 0.3), to: [470, 30], text: "Tip of the spire" },
      {
        at: f.p(0.75, BODY_TOP + 3.2),
        to: [520, 76],
        text: "Spire with nine rings",
      },
      {
        at: f.p(FIFTH, STOREYS[4].v0 + 1),
        to: [560, 150],
        text: "Top storey half as wide",
      },
      {
        at: f.p(0, 16.6),
        to: [262, 150],
        text: "Central pillar, hidden",
        anchor: "end",
      },
      { at: f.p(6.8, STOREYS[0].ve), to: [580, 316], text: "Deep eaves" },
      {
        at: f.p(FIRST + 0.45, STOREYS[0].v0 + STOREYS[0].h + 0.45),
        to: [580, 384],
        text: "Brackets",
      },
    ],
  },
  detail: {
    title: "Why it sways and stands",
    caption:
      "Diagram, movement exaggerated. The storeys rest on each other without rigid joints. In an earthquake they swing in alternate directions, and the free central pillar knocks against them and calms the swing. This is the usual explanation; engineers still argue over how much each part does.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: [207, 120], to: [300, 70], text: "Free pillar" },
      {
        at: [200 + BODY[2] + 7 + 36, GROUND - 14 - 2 * 58 - 24],
        to: [300, 160],
        text: "Rest position",
      },
      {
        at: [200 - BODY[2] - 36 + 7, GROUND - 14 - 2 * 58 - 24],
        to: [24, 140],
        text: "Storeys sway",
      },
      {
        at: [200 + BODY[0] + 3, GROUND - 14 - 30],
        to: [300, 300],
        text: "Loose joints",
      },
      { at: [230, GROUND + 8], to: [300, 388], text: "Stone base" },
    ],
  },
};
