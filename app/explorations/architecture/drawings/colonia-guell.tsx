import { measures } from "../sources";
import {
  Arrow,
  DimensionLine,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const ms = measures("colonia-guell");
const MODEL = ms("model");
const BOARD = 56;
const PX = 72;

function catenary(
  x0: number,
  x1: number,
  top: number,
  sag: number,
  steps = 40,
): Point[] {
  const span = x1 - x0;
  let lo = 0.01;
  let hi = 100000;
  for (let i = 0; i < 80; i++) {
    const a = (lo + hi) / 2;
    const h = a * (Math.cosh(span / (2 * a)) - 1);
    if (h > sag) lo = a;
    else hi = a;
  }
  const a = (lo + hi) / 2;
  const mid = (x0 + x1) / 2;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = x0 + (span * i) / steps;
    return [x, top + sag - a * (Math.cosh((x - mid) / a) - 1)] as Point;
  });
}

function at(curve: Point[], x: number): Point {
  let best = curve[0];
  for (const p of curve)
    if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
  return best;
}

function sack([x, y]: Point, key: string, drop = 16) {
  const top = y + drop;
  return (
    <g key={key}>
      <path
        className="fine"
        d={poly([
          [x, y],
          [x, top],
        ])}
      />
      <path
        className="profile mask"
        d={`M${x},${top}C${x - 7},${top + 3} ${x - 7},${top + 14} ${x},${top + 15}C${x + 7},${top + 14} ${x + 7},${top + 3} ${x},${top}Z`}
      />
    </g>
  );
}

const NAVE = catenary(196, 604, BOARD, MODEL * PX);
const INNER = catenary(262, 538, BOARD, 0.68 * MODEL * PX);
const TOWER = catenary(334, 466, BOARD, 0.38 * MODEL * PX);
const LEFT = catenary(118, 250, BOARD, 0.32 * MODEL * PX);
const RIGHT = catenary(550, 682, BOARD, 0.32 * MODEL * PX);
const LEAN_L: Point[] = [[150, BOARD], at(NAVE, 236)];
const LEAN_R: Point[] = [[650, BOARD], at(NAVE, 564)];
const SACKS: [Point[], number[]][] = [
  [NAVE, [262, 330, 400, 470, 538]],
  [INNER, [300, 400, 500]],
  [LEFT, [184]],
  [RIGHT, [616]],
];

const main = (
  <>
    <ScaleBar x={40} y={360} scale={PX} step={1} count={2} />
    <path
      className="profile mask"
      d={poly(
        [
          [96, BOARD - 14],
          [704, BOARD - 14],
          [704, BOARD],
          [96, BOARD],
        ],
        true,
      )}
    />
    <g className="fine">
      <path d={poly(INNER)} />
      <path d={poly(TOWER)} />
      <path d={poly(LEFT)} />
      <path d={poly(RIGHT)} />
      <path d={poly(LEAN_L)} />
      <path d={poly(LEAN_R)} />
    </g>
    <path className="idea" d={poly(NAVE)} />
    {SACKS.flatMap(([curve, xs]) =>
      xs.map((x) => sack(at(curve, x), `${x}-${curve.length}-${curve[0][0]}`)),
    )}
    <DimensionLine
      a={[760, BOARD]}
      b={[760, BOARD + MODEL * PX]}
      offset={-0.1}
      value={MODEL}
    />
  </>
);

const LEFT_CHAIN = catenary(50, 180, 90, 200);
const ARCH: Point[] = LEFT_CHAIN.map(([x, y]) => [x + 170, 380 - y] as Point);

const detail = (
  <>
    <path
      className="profile"
      d={poly([
        [40, 90],
        [190, 90],
      ])}
    />
    <circle className="profile mask" cx={50} cy={90} r={3} />
    <circle className="profile mask" cx={180} cy={90} r={3} />
    <path className="profile" d={poly(LEFT_CHAIN)} />
    <Arrow points={[LEFT_CHAIN[8], LEFT_CHAIN[2]]} />
    <Arrow points={[LEFT_CHAIN[32], LEFT_CHAIN[38]]} />
    <path
      className="cut"
      d={poly([
        [205, 290],
        [365, 290],
      ])}
    />
    <path className="profile" d={poly(ARCH)} />
    <Arrow points={[ARCH[2], ARCH[8]].reverse() as Point[]} />
    <Arrow points={[ARCH[34], ARCH[40]]} />
  </>
);

export const coloniaGuell: Drawings = {
  main: {
    title: "The hanging model",
    caption:
      "A reconstruction of the idea behind Gaudí's model, about 4 m deep at a scale of 1 to 10. Strings hang from a board on the ceiling and small bags of lead shot stand for the weight each part would carry. The main arch is in red. The string layout is simplified; the original was lost in the Spanish Civil War.",
    viewBox: [800, 400],
    art: main,
    labels: [
      {
        at: [400, BOARD - 7],
        to: [470, 22],
        text: "Board fixed to the ceiling",
      },
      {
        at: at(NAVE, 556),
        to: [720, 330],
        text: "Strings hang into arches",
        anchor: "end",
      },
      {
        at: [400, at(NAVE, 400)[1] + 24],
        to: [250, 380],
        text: "Bags of lead shot",
        anchor: "end",
      },
      {
        at: [193, 120],
        to: [120, 230],
        text: "Leaning strings",
        anchor: "end",
      },
    ],
  },
  detail: {
    title: "Turn it over",
    caption:
      "A hanging chain is pulled into a curve where every link is in pure tension. Turned upside down, the same curve stands as an arch in pure compression, with no bending at all. Gaudí's model found the shapes of his arches, vaults and leaning columns this way.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: LEFT_CHAIN[20], to: [40, 330], text: "Hanging: pulled" },
      { at: ARCH[20], to: [250, 40], text: "Turned over: pushed" },
    ],
  },
};
