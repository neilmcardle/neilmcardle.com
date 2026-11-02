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

const ms = measures("machu-picchu");
const HALF = ms("wall") / 2;
const HEIGHT = 3.5;
const LEAN = Math.tan((ms("batter") * Math.PI) / 180);
const THICK = 0.9;
const WINDOWS = [-3, 0, 3];
const SILL = 1.0;
const WIN_H = 1.5;
const WIN_BOTTOM = 0.55;
const WIN_TOP = 0.42;

const S = 44;
const f = frame(380, 300, S);

function random(seed: number) {
  let a = seed;
  return () => {
    a = (a * 9301 + 49297) % 233280;
    return a / 233280;
  };
}

function courses() {
  const rand = random(11);
  const lines: Point[][] = [];
  let v = 0;
  while (v < HEIGHT - 0.2) {
    const h = 0.38 + rand() * 0.24;
    const top = Math.min(HEIGHT, v + h);
    lines.push([f.p(-HALF, top), f.p(HALF, top)]);
    let u = -HALF + rand() * 0.6;
    while (u < HALF - 0.3) {
      lines.push([f.p(u, v), f.p(u, top)]);
      u += 0.6 + rand() * 0.8;
    }
    v = top;
  }
  return lines;
}

function rubble() {
  const rand = random(5);
  const lines: Point[][] = [];
  for (let v = -0.4; v > -3; v -= 0.35 + rand() * 0.15) {
    const pts: Point[] = [];
    for (let u = -7; u <= 7.01; u += 0.5)
      pts.push(f.p(u, v + (rand() - 0.5) * 0.12));
    lines.push(pts);
    for (let u = -7 + rand() * 0.5; u < 7; u += 0.35 + rand() * 0.6)
      lines.push([f.p(u, v), f.p(u + (rand() - 0.5) * 0.1, v + 0.3)]);
  }
  return lines;
}

const windowShape = (u: number): Point[] => [
  f.p(u - WIN_BOTTOM, SILL),
  f.p(u - WIN_TOP, SILL + WIN_H),
  f.p(u + WIN_TOP, SILL + WIN_H),
  f.p(u + WIN_BOTTOM, SILL),
];

const SECTION = 6.6;

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={1} count={3} />
    <path
      className="profile mask"
      d={poly([f.p(-7, -3), f.p(-7, 0), f.p(7, 0), f.p(7, -3)], true)}
    />
    <g className="fine">
      {rubble().map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
    </g>
    <path
      className="profile mask"
      d={poly(
        [f.p(-HALF, 0), f.p(-HALF, HEIGHT), f.p(HALF, HEIGHT), f.p(HALF, 0)],
        true,
      )}
    />
    <g className="fine">
      {courses().map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
    </g>
    {WINDOWS.map((u) => (
      <g key={u}>
        <path
          className="profile mask"
          d={poly(
            [
              f.p(u - WIN_TOP - 0.45, SILL + WIN_H),
              f.p(u - WIN_TOP - 0.45, SILL + WIN_H + 0.42),
              f.p(u + WIN_TOP + 0.45, SILL + WIN_H + 0.42),
              f.p(u + WIN_TOP + 0.45, SILL + WIN_H),
            ],
            true,
          )}
        />
        <path className="mask" d={poly(windowShape(u), true)} />
        <path className="tone" d={poly(windowShape(u), true)} />
        <path className="idea" d={poly(windowShape(u), true)} />
      </g>
    ))}
    <path
      className="cut poche stone"
      d={poly(
        [
          f.p(SECTION, 0),
          f.p(SECTION + LEAN * HEIGHT, HEIGHT),
          f.p(SECTION + THICK - LEAN * HEIGHT, HEIGHT),
          f.p(SECTION + THICK, 0),
        ],
        true,
      )}
    />
    <path
      className="idea dash"
      d={poly([f.p(SECTION, 0), f.p(SECTION, HEIGHT + 0.3)])}
    />
    <path
      className="cut"
      d={poly([f.p(-7.2, 0), f.p(SECTION + THICK + 0.6, 0)])}
    />
    <path className="cut" d={poly([f.p(-7.2, -3), f.p(7.2, -3)])} />
    <Person x={f.x(-4.4)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, HEIGHT)}
      b={f.p(HALF, HEIGHT)}
      offset={-16}
      value={ms("wall")}
    />
  </>
);

const COLS = 5;
const ROWS = 4;
const CELL_W = 64;
const CELL_H = 70;
const X0 = 40;
const Y0 = 50;

function jitter(key: string, amount: number): [number, number] {
  let h = 0;
  for (const c of key) h = (h * 31 + c.charCodeAt(0)) % 100003;
  const a = ((h % 997) / 997 - 0.5) * 2 * amount;
  const b = (((h * 7) % 991) / 991 - 0.5) * 2 * amount;
  return [a, b];
}

function corner(i: number, j: number): Point {
  const edgeX = j === 0 || j === COLS;
  const edgeY = i === 0 || i === ROWS;
  const [a, b] = jitter(`c${i}-${j}`, 18);
  return [X0 + j * CELL_W + (edgeX ? 0 : a), Y0 + i * CELL_H + (edgeY ? 0 : b)];
}

function bend(p: Point, q: Point, key: string, edge: boolean): Point[] {
  if (edge) return [];
  const [a, b] = jitter(`${key}a`, 11);
  const [c, e] = jitter(`${key}b`, 9);
  return [
    [p[0] + (q[0] - p[0]) * 0.35 + a, p[1] + (q[1] - p[1]) * 0.35 + b],
    [p[0] + (q[0] - p[0]) * 0.7 + c, p[1] + (q[1] - p[1]) * 0.7 + e],
  ];
}

function stone(i: number, j: number): Point[] {
  const tl = corner(i, j);
  const tr = corner(i, j + 1);
  const br = corner(i + 1, j + 1);
  const bl = corner(i + 1, j);
  const top = bend(tl, tr, `h${i}-${j}`, i === 0);
  const right = bend(tr, br, `v${i}-${j + 1}`, j + 1 === COLS);
  const bottom = bend(bl, br, `h${i + 1}-${j}`, i + 1 === ROWS).reverse();
  const left = bend(tl, bl, `v${i}-${j}`, j === 0).reverse();
  return [tl, ...top, tr, ...right, br, ...bottom, bl, ...left];
}

const STONES = Array.from({ length: ROWS }, (_, i) =>
  Array.from({ length: COLS }, (_, j) => stone(i, j)),
).flat();
const KEY = STONES[7];

const detail = (
  <>
    {STONES.map((pts, i) => (
      <path key={i} className="profile mask" d={poly(pts, true)} />
    ))}
    <path className="idea" d={poly(KEY, true)} />
  </>
);

export const machuPicchu: Drawings = {
  main: {
    title: "A temple wall and its section",
    caption:
      "Elevation of a fine stone wall with three trapezoidal windows, standing on a terrace of rougher stone; on the right, a section through the wall. The wall leans inward by about 4 degrees; the red dashed line is plumb. Wall, window and block sizes are estimates drawn from photographs.",
    viewBox: [800, 460],
    art: main,
    labels: [
      {
        at: f.p(-2, 3.0),
        to: [240, 66],
        text: "Dry-laid stone",
        anchor: "end",
      },
      { at: f.p(3.2, SILL + 0.9), to: [560, 66], text: "Trapezoidal windows" },
      { at: f.p(0, SILL + WIN_H + 0.3), to: [430, 120], text: "Single lintel" },
      {
        at: f.p(SECTION + THICK - LEAN * 2.6, 2.6),
        to: [730, 140],
        text: "Leans in",
      },
      { at: f.p(-6, -1.5), to: [60, 450], text: "Terrace wall" },
    ],
  },
  detail: {
    title: "Fitted stones",
    caption:
      "Close-fitted masonry. Each stone is cut to the shape of its neighbours, with joints too tight for mortar. In an earthquake the stones can shift against each other and settle back into place.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: [KEY[0][0] + 20, KEY[0][1] + 16],
        to: [40, 24],
        text: "Cut to fit its neighbours",
      },
      { at: corner(3, 2), to: [40, 380], text: "No mortar in the joints" },
    ],
  },
};
