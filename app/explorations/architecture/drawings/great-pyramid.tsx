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

const m = measures("great-pyramid");
const HALF = m("base") / 2;
const HEIGHT = m("height");
const KING = m("kingFloor");
const KING_TOP = KING + m("kingHeight");
const QUEEN = m("queenFloor");
const SLOPE = HEIGHT / HALF;
const face = (v: number) => HALF - v / SLOPE;
const rad = (deg: number) => (deg * Math.PI) / 180;

const S = 2.4;
const f = frame(400, 400, S);

function band(points: Point[], width: number) {
  const left: Point[] = [];
  const right: Point[] = [];
  points.forEach(([u, v], i) => {
    const [u0, v0] = points[Math.max(0, i - 1)];
    const [u1, v1] = points[Math.min(points.length - 1, i + 1)];
    const len = Math.hypot(u1 - u0, v1 - v0);
    const nu = (-(v1 - v0) / len) * (width / 2);
    const nv = ((u1 - u0) / len) * (width / 2);
    left.push(f.p(u + nu, v + nv));
    right.push(f.p(u - nu, v - nv));
  });
  return poly([...left, ...right.reverse()], true);
}

function toFace(start: Point, angle: number, side: -1 | 1) {
  const c = Math.cos(rad(angle));
  const s = Math.sin(rad(angle));
  const t = (HALF - start[1] / SLOPE - side * start[0]) / (c + s / SLOPE);
  return [
    f.p(start[0], start[1]),
    f.p(start[0] + side * t * c, start[1] + t * s),
  ];
}

const ENTRANCE: Point = [-face(m("entrance")), m("entrance")];
const DOWN = [Math.cos(rad(m("descending"))), -Math.sin(rad(m("descending")))];
const along = (t: number): Point => [
  ENTRANCE[0] + DOWN[0] * t,
  ENTRANCE[1] + DOWN[1] * t,
];
const JUNCTION = along(28);
const PASSAGE_END = along(100);
const UP = [
  Math.cos(rad(m("ascendingAngle"))),
  Math.sin(rad(m("ascendingAngle"))),
];
const GALLERY_FOOT: Point = [
  JUNCTION[0] + UP[0] * m("ascending"),
  JUNCTION[1] + UP[1] * m("ascending"),
];
const GALLERY_HEAD: Point = [
  GALLERY_FOOT[0] + UP[0] * m("gallery"),
  GALLERY_FOOT[1] + UP[1] * m("gallery"),
];

const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

const courses = Array.from({ length: 17 }, (_, i) => 8 + i * 8);

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={20} count={2} />
    <path className="cut poche rock" d={box(-135, 135, -32, 0)} />
    <path className="cut" d={poly([f.p(-150, 0), f.p(150, 0)])} />
    <path
      className="profile"
      d={poly([f.p(-HALF, 0), f.p(0, HEIGHT), f.p(HALF, 0)])}
    />
    <path
      className="fine dash"
      d={poly([f.p(-face(138.5), 138.5), f.p(face(138.5), 138.5)])}
    />
    <g className="fine">
      {courses.map((v) => (
        <path key={v} d={poly([f.p(-face(v), v), f.p(face(v), v)])} />
      ))}
    </g>
    <path
      className="profile mask"
      d={band([ENTRANCE, PASSAGE_END, [-7.8, PASSAGE_END[1]]], 1.2)}
    />
    <path className="profile mask" d={box(-7.8, 6.2, -28.2, -24)} />
    <path className="profile mask" d={band([JUNCTION, GALLERY_FOOT], 1.2)} />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(...GALLERY_FOOT),
          f.p(GALLERY_FOOT[0], GALLERY_FOOT[1] + m("galleryHeight")),
          f.p(GALLERY_HEAD[0], GALLERY_HEAD[1] + m("galleryHeight")),
          f.p(...GALLERY_HEAD),
        ],
        true,
      )}
    />
    <path
      className="profile mask"
      d={band(
        [
          [GALLERY_FOOT[0], GALLERY_FOOT[1] + 0.6],
          [-6, GALLERY_FOOT[1] + 0.6],
          [-5, QUEEN + 0.6],
          [-2.6, QUEEN + 0.6],
        ],
        1.2,
      )}
    />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(-2.6, QUEEN),
          f.p(-2.6, QUEEN + 4.69),
          f.p(0, QUEEN + m("queenRidge")),
          f.p(2.6, QUEEN + 4.69),
          f.p(2.6, QUEEN),
        ],
        true,
      )}
    />
    <path
      className="profile mask"
      d={box(GALLERY_HEAD[0], 4.6, KING, KING + 1.1)}
    />
    <path
      className="profile mask"
      d={box(4.6, 4.6 + m("kingWidth"), KING, KING_TOP)}
    />
    <g className="fine">
      {[50.5, 52.9, 55.3, 57.7, 60.1].map((v) => (
        <path key={v} d={box(4.6, 9.84, v, v + 1)} />
      ))}
    </g>
    <path
      className="idea"
      d={poly([
        f.p(4.0, KING_TOP),
        f.p(4.0, 61.1),
        f.p(7.22, 66),
        f.p(10.44, 61.1),
        f.p(10.44, KING_TOP),
      ])}
    />
    <g className="fine dash">
      <path d={poly(toFace([4.6, KING + 1], m("shaftNorth"), -1))} />
      <path d={poly(toFace([9.84, KING + 1], m("shaftSouth"), 1))} />
      <path
        d={poly([
          f.p(-2.6, QUEEN + 1.6),
          f.p(
            -2.6 - 60 * Math.cos(rad(37.5)),
            QUEEN + 1.6 + 60 * Math.sin(rad(37.5)),
          ),
        ])}
      />
      <path
        d={poly([
          f.p(2.6, QUEEN + 1.6),
          f.p(
            2.6 + 60 * Math.cos(rad(38.5)),
            QUEEN + 1.6 + 60 * Math.sin(rad(38.5)),
          ),
        ])}
      />
    </g>
    <Person x={f.x(125)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={32 * S + 16}
      value={m("base")}
    />
    <DimensionLine
      a={f.p(0, HEIGHT)}
      b={f.p(0, 0)}
      offset={-360}
      value={HEIGHT}
    />
  </>
);

const D = 12;
const d = frame(160 - 7.22 * D, 350 + 43 * D, D);
const q = (u: number, v: number) => d.p(u, v);
const dbox = (u0: number, u1: number, v0: number, v1: number) =>
  poly([q(u0, v0), q(u0, v1), q(u1, v1), q(u1, v0)], true);

const GAPS = [50.5, 52.9, 55.3, 57.7, 60.1];
const BEAMS = [KING_TOP, 51.5, 53.9, 56.3, 58.7];

const detail = (
  <>
    <g className="fine">
      {Array.from({ length: 22 }, (_, i) => 41.2 + i * 1.2).map((v) => {
        if (v < 43) return <path key={v} d={poly([q(-1.2, v), q(15.6, v)])} />;
        if (v > 66.6)
          return <path key={v} d={poly([q(-1.2, v), q(15.6, v)])} />;
        const inset = v <= 61.1 ? 0 : ((v - 61.1) / 5.5) * 4.62;
        const a = (v <= 61.1 ? 3.0 : 2.6) + inset;
        const b = (v <= 61.1 ? 11.44 : 11.84) - inset;
        return (
          <g key={v}>
            <path d={poly([q(-1.2, v), q(a, v)])} />
            <path d={poly([q(b, v), q(15.6, v)])} />
          </g>
        );
      })}
    </g>
    <path className="cut poche rock" d={dbox(3.0, 4.6, 43, 61.1)} />
    <path className="cut poche rock" d={dbox(9.84, 11.44, 43, 61.1)} />
    <path className="profile mask" d={dbox(4.6, 9.84, KING, KING_TOP)} />
    {BEAMS.map((v) => (
      <path
        key={v}
        className="cut poche stone"
        d={dbox(3.6, 10.84, v, v === KING_TOP ? 50.5 : v + 1.4)}
      />
    ))}
    {GAPS.map((v) => (
      <path key={v} className="profile mask" d={dbox(4.6, 9.84, v, v + 1)} />
    ))}
    <path
      className="cut poche rock"
      d={poly(
        [
          q(2.6, 61.1),
          q(7.22, 66.6),
          q(11.84, 61.1),
          q(10.4, 61.1),
          q(7.22, 64.9),
          q(4.04, 61.1),
        ],
        true,
      )}
    />
    <path
      className="fine"
      d={poly([q(8.9, KING_TOP), q(8.6, 49.5), q(8.95, 50.0), q(8.7, 50.5)])}
    />
    <path className="profile" d={poly([q(-1.2, 43), q(15.6, 43)])} />
    <Arrow points={[q(7.22, 69.6), q(7.22, 67.2)]} />
    <Arrow points={[q(6.4, 66.4), q(3.4, 62.6)]} />
    <Arrow points={[q(8.04, 66.4), q(11.04, 62.6)]} />
    <Arrow points={[q(3.3, 60.6), q(3.3, 44)]} />
    <Arrow points={[q(11.14, 60.6), q(11.14, 44)]} />
    <Person x={d.x(6)} ground={d.y(43)} scale={D} />
  </>
);

export const greatPyramid: Drawings = {
  main: {
    title: "North–south section",
    caption:
      "Section looking west. Almost all of it is solid stone; the passages and chambers are drawn slightly wider than true so they read at this scale. The top 8 metres, above the dashed line, are now missing.",
    viewBox: [800, 520],
    art: main,
    labels: [
      { at: f.p(0, HEIGHT), to: [440, 30], text: "Apex, now missing" },
      { at: f.p(10.44, 58), to: [520, 150], text: "Relieving chambers" },
      { at: f.p(7.2, 46), to: [580, 226], text: "King's Chamber" },
      {
        at: f.p(-20, 36.5),
        to: [250, 230],
        text: "Grand Gallery",
        anchor: "end",
      },
      { at: f.p(1.5, QUEEN + 3), to: [620, 330], text: "Queen's Chamber" },
      { at: f.p(...ENTRANCE), to: [140, 320], text: "Entrance", anchor: "end" },
      {
        at: f.p(...along(14)),
        to: [150, 280],
        text: "Descending passage",
        anchor: "end",
      },
      { at: f.p(3, -26.5), to: [560, 512], text: "Rock-cut chamber" },
    ],
  },
  detail: {
    title: "Above the King's Chamber",
    caption:
      "Five low compartments and a gabled roof sit over the King's Chamber. The leaning blocks of the gable push the weight above out to the walls, so it goes round the room rather than onto its granite ceiling.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: q(7.6, 69), to: [276, 30], text: "Weight from above" },
      { at: q(9.6, 63.5), to: [276, 80], text: "Gabled roof" },
      { at: q(9.84, 58.2), to: [276, 136], text: "Relief chambers" },
      { at: q(10.4, 54.6), to: [276, 186], text: "Granite beams" },
      { at: q(8.8, 49.5), to: [276, 240], text: "Cracked beam" },
      { at: q(8.6, 46), to: [276, 300], text: "King's Chamber" },
      { at: q(3.3, 47), to: [24, 384], text: "Load goes round the room" },
    ],
  },
};
