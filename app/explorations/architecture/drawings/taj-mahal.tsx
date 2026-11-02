import { measures } from "../sources";
import {
  DimensionLine,
  frame,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

type Frame = ReturnType<typeof frame>;

const ms = measures("taj-mahal");
const TOTAL = ms("total");
const HALF = ms("width") / 2;
const PLINTH = ms("plinth");
const CHAMBER = (ms("chamber") * (1 + Math.SQRT2)) / 2;
const IWAN = ms("iwan");
const DOME_TOP = TOTAL - ms("finial");
const ROOF = 27;
const DRUM_TOP = 40.4;
const DRUM_R = 7.8;
const INNER_SPRING = 15.6;
const rad = (deg: number) => (deg * Math.PI) / 180;

const ONION: [number, number][] = [
  [DRUM_R, DRUM_TOP],
  [8.6, 43.5],
  [8.85, 46.5],
  [8.4, 50],
  [7.1, 53.5],
  [5.0, 56.8],
  [2.6, 59.6],
  [1.1, 61.8],
  [0.6, 62.8],
  [0, DOME_TOP],
];

function curve(m: Frame, side: 1 | -1, inset = 0) {
  return ONION.map(([r, v]) =>
    m.p(side * Math.max(0, r - inset), v - (v === DOME_TOP ? inset : 0)),
  );
}

function outerDome(m: Frame) {
  const left = curve(m, -1);
  const right = curve(m, 1);
  const innerLeft = curve(m, -1, 1.2);
  const innerRight = curve(m, 1, 1.2);
  return {
    shell: poly(
      [
        ...left,
        ...[...right].reverse(),
        ...innerRight,
        ...[...innerLeft].reverse(),
      ],
      true,
    ),
    outline: poly([...left, ...[...right].reverse()]),
  };
}

function innerDome(m: Frame, r = CHAMBER) {
  return Array.from({ length: 25 }, (_, i) => {
    const a = rad(180 - (180 * i) / 24);
    return m.p(r * Math.cos(a), INNER_SPRING + r * Math.sin(a));
  });
}

function domes(m: Frame) {
  const outer = outerDome(m);
  return (
    <>
      <path
        className="cut poche rock"
        d={poly(
          [...innerDome(m), ...innerDome(m, CHAMBER + 0.9).reverse()],
          true,
        )}
      />
      <path
        className="cut poche rock"
        d={poly(
          [
            m.p(-CHAMBER - 0.9, INNER_SPRING),
            m.p(-CHAMBER - 0.9, ROOF),
            m.p(-DRUM_R + 1.2, ROOF),
            m.p(-DRUM_R + 1.2, ROOF + 1),
            m.p(DRUM_R - 1.2, ROOF + 1),
            m.p(DRUM_R - 1.2, ROOF),
            m.p(CHAMBER + 0.9, ROOF),
            m.p(CHAMBER + 0.9, INNER_SPRING),
            ...innerDome(m, CHAMBER + 0.9)
              .slice(1, -1)
              .reverse(),
          ],
          true,
        )}
      />
      <path
        className="cut poche rock"
        d={poly(
          [
            m.p(-DRUM_R, ROOF),
            m.p(-DRUM_R, DRUM_TOP),
            m.p(-DRUM_R + 1.2, DRUM_TOP),
            m.p(-DRUM_R + 1.2, ROOF),
          ],
          true,
        )}
      />
      <path
        className="cut poche rock"
        d={poly(
          [
            m.p(DRUM_R - 1.2, ROOF),
            m.p(DRUM_R - 1.2, DRUM_TOP),
            m.p(DRUM_R, DRUM_TOP),
            m.p(DRUM_R, ROOF),
          ],
          true,
        )}
      />
      <path className="cut poche rock" d={outer.shell} />
      <path className="idea" d={outer.outline} />
      <path className="idea" d={poly(innerDome(m))} />
      <g className="profile">
        <path d={poly([m.p(0, DOME_TOP), m.p(0, TOTAL - 0.8)])} />
        {[DOME_TOP + 1.6, DOME_TOP + 3.4, DOME_TOP + 5.4].map((v, i) => (
          <circle
            key={v}
            className="mask"
            cx={m.x(0)}
            cy={m.y(v)}
            r={(0.75 - i * 0.12) * (m.x(1) - m.x(0))}
          />
        ))}
        <path
          d={`M${m.x(-0.8)},${m.y(TOTAL - 1.2)}Q${m.x(0)},${m.y(TOTAL - 2.4)} ${m.x(0.8)},${m.y(TOTAL - 1.2)}`}
        />
      </g>
    </>
  );
}

const S = 5;
const f = frame(400, 410, S);
const box = (u0: number, u1: number, v0: number, v1: number) =>
  poly([f.p(u0, v0), f.p(u0, v1), f.p(u1, v1), f.p(u1, v0)], true);

function pointedArch(
  cu: number,
  half: number,
  spring: number,
  rise: number,
  base = 0,
): Point[] {
  const r = (half * half + rise * rise) / (2 * half);
  const apex = Math.atan2(rise, half - r);
  const arc = Array.from(
    { length: 13 },
    (_, i) => Math.PI - (Math.PI - apex) * (i / 12),
  );
  return [
    f.p(cu - half, base),
    ...arc.map((a) =>
      f.p(cu - half + r + r * Math.cos(a), spring + r * Math.sin(a)),
    ),
    ...[...arc]
      .reverse()
      .map((a) =>
        f.p(cu + half - r - r * Math.cos(a), spring + r * Math.sin(a)),
      ),
    f.p(cu + half, base),
  ];
}

function half(side: 1 | -1) {
  const u = (x: number) => side * x;
  const mass = poly(
    [
      f.p(u(CHAMBER), 0),
      f.p(u(CHAMBER), INNER_SPRING),
      f.p(u(CHAMBER + 0.9), INNER_SPRING),
      f.p(u(CHAMBER + 0.9), ROOF),
      f.p(u(HALF - 2.6), ROOF),
      f.p(u(HALF - 2.6), IWAN),
      f.p(u(HALF), IWAN),
      f.p(u(HALF), 0),
    ],
    true,
  );
  return (
    <g key={side}>
      <path className="cut poche rock" d={mass} />
      <path
        className="profile mask"
        d={poly(pointedArch(u(HALF - 3.6), 3.6, 17, 7), true)}
      />
      <path
        className="profile mask"
        d={poly(pointedArch(u(CHAMBER + 5.2), 2.6, 7, 3), true)}
      />
      <path
        className="profile mask"
        d={poly(pointedArch(u(CHAMBER + 5.2), 2.2, 16, 2.6, 12), true)}
      />
    </g>
  );
}

function minaret(u: number) {
  const balconies = [12, 24, 33];
  return (
    <g key={u}>
      <path
        className="profile mask"
        d={poly(
          [
            f.p(u - 2.2, 0),
            f.p(u - 1.6, 36),
            f.p(u + 1.6, 36),
            f.p(u + 2.2, 0),
          ],
          true,
        )}
      />
      {balconies.map((v) => (
        <path
          key={v}
          className="profile mask"
          d={box(u - 2.6, u + 2.6, v, v + 0.8)}
        />
      ))}
      <path className="profile mask" d={box(u - 2.1, u + 2.1, 36, 37.2)} />
      <path
        className="profile mask"
        d={`M${f.x(u - 2)},${f.y(37.2)}Q${f.x(u - 2)},${f.y(39.6)} ${f.x(u)},${f.y(ms("minaret"))}Q${f.x(u + 2)},${f.y(39.6)} ${f.x(u + 2)},${f.y(37.2)}Z`}
      />
    </g>
  );
}

function chhatri(u: number) {
  return (
    <g key={u}>
      <path className="profile mask" d={box(u - 3, u + 3, ROOF, ROOF + 4.5)} />
      <path
        className="profile mask"
        d={`M${f.x(u - 3.2)},${f.y(ROOF + 4.5)}Q${f.x(u - 3.2)},${f.y(ROOF + 8.5)} ${f.x(u)},${f.y(ROOF + 9.5)}Q${f.x(u + 3.2)},${f.y(ROOF + 8.5)} ${f.x(u + 3.2)},${f.y(ROOF + 4.5)}Z`}
      />
      <path
        className="fine"
        d={poly([f.p(u - 1, ROOF), f.p(u - 1, ROOF + 3.6)])}
      />
      <path
        className="fine"
        d={poly([f.p(u + 1, ROOF), f.p(u + 1, ROOF + 3.6)])}
      />
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={10} count={2} />
    {minaret(-44)}
    {minaret(44)}
    {chhatri(-17)}
    {chhatri(17)}
    <path className="profile mask" d={box(-47.75, 47.75, -PLINTH, 0)} />
    <g className="fine">
      {Array.from({ length: 19 }, (_, i) => -45 + i * 5).map((x) => (
        <path
          key={x}
          d={poly([
            f.p(x - 1.5, -PLINTH + 0.6),
            f.p(x - 1.5, -2),
            f.p(x + 1.5, -2),
            f.p(x + 1.5, -PLINTH + 0.6),
          ])}
        />
      ))}
    </g>
    {half(-1)}
    {half(1)}
    {domes(f)}
    <path className="cut" d={poly([f.p(-56, -PLINTH), f.p(56, -PLINTH)])} />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={PLINTH * S + 14}
      value={ms("width")}
    />
    <DimensionLine
      a={f.p(-47.75, 0)}
      b={f.p(-47.75, -PLINTH)}
      offset={12}
      value={PLINTH}
    />
    <DimensionLine
      a={f.p(0, TOTAL)}
      b={f.p(0, 0)}
      offset={-52 * S}
      value={TOTAL}
    />
  </>
);

const D = 6;
const d = frame(150, 380 + 15 * D, D);

const detail = (
  <>
    <path
      className="cut poche rock"
      d={poly(
        [
          d.p(-CHAMBER - 0.9, 15),
          d.p(-CHAMBER - 0.9, INNER_SPRING),
          d.p(-CHAMBER, INNER_SPRING),
          d.p(-CHAMBER, 15),
        ],
        true,
      )}
    />
    <path
      className="cut poche rock"
      d={poly(
        [
          d.p(CHAMBER, 15),
          d.p(CHAMBER, INNER_SPRING),
          d.p(CHAMBER + 0.9, INNER_SPRING),
          d.p(CHAMBER + 0.9, 15),
        ],
        true,
      )}
    />
    {domes(d)}
  </>
);

export const tajMahal: Drawings = {
  main: {
    title: "Section through the tomb",
    caption:
      "Section through the mausoleum on its plinth, with two minarets beyond. The two domes are in red. The overall height, width, plinth and arch frame are from published figures; the dome profiles, drum and the void between them are drawn from photographs because the sources disagree.",
    viewBox: [800, 480],
    art: main,
    labels: [
      {
        at: f.p(-0.4, TOTAL - 4),
        to: [330, 60],
        text: "Finial",
        anchor: "end",
      },
      { at: f.p(-8.6, 47), to: [230, 80], text: "Outer dome", anchor: "end" },
      {
        at: f.p(-3, 34),
        to: [230, 150],
        text: "Hollow between",
        anchor: "end",
      },
      {
        at: f.p(-5.5, 22.2),
        to: [230, 210],
        text: "Inner dome",
        anchor: "end",
      },
      { at: f.p(HALF - 1.3, 30), to: [620, 200], text: "Main arch frame" },
      { at: f.p(44, 20), to: [700, 260], text: "Minaret" },
    ],
  },
  detail: {
    title: "One dome for the room, one for the skyline",
    caption:
      "The two domes drawn larger. The inner dome is sized to the tomb chamber below it. The outer dome stands on a tall drum above an empty space, high enough to read across the river and the garden.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: d.p(7.6, 50), to: [250, 70], text: "Outer dome" },
      { at: d.p(5.8, 35), to: [250, 180], text: "Empty space" },
      { at: d.p(DRUM_R, 32), to: [250, 250], text: "Drum" },
      { at: d.p(5.5, 22), to: [250, 330], text: "Inner dome" },
    ],
  },
};
