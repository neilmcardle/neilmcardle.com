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

const ms = measures("great-zimbabwe");
const HEIGHT = ms("wall");
const BASE = ms("base");
const BREAK = 4;
const tan = (deg: number) => Math.tan((deg * Math.PI) / 180);
const LOW = BREAK * tan(ms("batterLow"));
const HIGH = (HEIGHT - BREAK) * tan(ms("batterHigh"));
const TOWER = ms("tower");
const TOWER_R = ms("towerBase") / 2;
const TOWER_U = 14.5;

const S = 24;
const f = frame(160, 330, S);

const OUTER: Point[] = [
  f.p(0, 0),
  f.p(LOW, BREAK),
  f.p(LOW + HIGH, HEIGHT),
  f.p(BASE - LOW - HIGH, HEIGHT),
  f.p(BASE - LOW, BREAK),
  f.p(BASE, 0),
];

const INNER_A = BASE + 1.2;
const INNER_B = INNER_A + 2;
const INNER_H = 6;
const INNER: Point[] = [
  f.p(INNER_A, 0),
  f.p(INNER_A + INNER_H * tan(5), INNER_H),
  f.p(INNER_B - INNER_H * tan(5), INNER_H),
  f.p(INNER_B, 0),
];

function tower() {
  const top = TOWER_R * 0.45;
  const courses = Array.from({ length: 14 }, (_, i) => 0.6 + i * 0.6).filter(
    (v) => v < TOWER,
  );
  const half = (v: number) =>
    TOWER_R - (TOWER_R - top) * Math.pow(v / TOWER, 1.15);
  return (
    <g>
      <path
        className="profile mask"
        d={poly(
          [
            ...Array.from({ length: 13 }, (_, i) =>
              f.p(TOWER_U - half((TOWER * i) / 12), (TOWER * i) / 12),
            ),
            ...Array.from({ length: 13 }, (_, i) =>
              f.p(
                TOWER_U + half((TOWER * (12 - i)) / 12),
                (TOWER * (12 - i)) / 12,
              ),
            ),
          ],
          true,
        )}
      />
      <g className="fine">
        {courses.map((v) => (
          <path
            key={v}
            d={poly([f.p(TOWER_U - half(v), v), f.p(TOWER_U + half(v), v)])}
          />
        ))}
      </g>
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={1} count={5} />
    <path
      className="cut poche earth"
      d={poly([f.p(-5, 0), f.p(20.5, 0), f.p(20.5, -0.8), f.p(-5, -0.8)], true)}
    />
    {tower()}
    <path className="cut poche stone" d={poly(OUTER, true)} />
    <path className="cut poche stone" d={poly(INNER, true)} />
    <path className="cut" d={poly([f.p(-5, 0), f.p(20.5, 0)])} />
    <path className="idea dash" d={poly([f.p(0, 0), f.p(0, HEIGHT)])} />
    <path className="idea dash" d={poly([f.p(BASE, 0), f.p(BASE, HEIGHT)])} />
    <Person x={f.x(BASE + 0.6)} ground={f.y(0)} scale={S} />
    <DimensionLine
      a={f.p(0, HEIGHT)}
      b={f.p(0, 0)}
      offset={40}
      value={HEIGHT}
    />
    <DimensionLine
      a={f.p(0, 0)}
      b={f.p(BASE, 0)}
      offset={0.8 * S + 14}
      value={BASE}
    />
    <DimensionLine
      a={f.p(TOWER_U, TOWER)}
      b={f.p(TOWER_U, 0)}
      offset={-(TOWER_R * S + 18)}
      value={TOWER}
    />
  </>
);

const COURSE = 14;
const TOP_Y = 60;
const BAND: [number, number] = [118, 162];

function courseRows() {
  const rows: { y: number; joints: number[] }[] = [];
  let seed = 3;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let y = TOP_Y + COURSE; y < 340; y += COURSE) {
    if (y > BAND[0] && y <= BAND[1] + 1) continue;
    const joints: number[] = [];
    let x = 40 + rand() * 30;
    while (x < 352) {
      joints.push(x);
      x += 26 + rand() * 30;
    }
    rows.push({ y, joints });
  }
  return rows;
}

const ROWS = courseRows();

function courses() {
  return ROWS.flatMap(({ y, joints }) => [
    [
      [40, y],
      [360, y],
    ] as Point[],
    ...joints.map(
      (x) =>
        [
          [x, y - COURSE],
          [x, y],
        ] as Point[],
    ),
  ]);
}

const PICK = (() => {
  const r = ROWS.findIndex((row) => row.y > 220);
  const row = ROWS[r];
  const below = ROWS[r + 1];
  for (let i = 1; i < row.joints.length - 1; i++) {
    const [x1, x2] = [row.joints[i], row.joints[i + 1]];
    const under = below.joints.find((x) => x > x1 + 6 && x < x2 - 6);
    if (under) return { x1, x2, y: row.y, under };
  }
  return {
    x1: row.joints[1],
    x2: row.joints[2],
    y: row.y,
    under: below.joints[1],
  };
})();

function chevrons(y0: number, y1: number) {
  const pts: Point[] = [];
  for (let x = 40, i = 0; x <= 360; x += 12, i++)
    pts.push([x, i % 2 ? y0 + 2 : y1 - 2]);
  return pts;
}

const detail = (
  <>
    <path
      className="profile mask"
      d={poly([
        [40, 340],
        [40, TOP_Y + 4],
        [80, TOP_Y],
        [140, TOP_Y + 5],
        [220, TOP_Y - 2],
        [300, TOP_Y + 3],
        [360, TOP_Y],
        [360, 340],
      ])}
    />
    <g className="fine">
      {courses().map((line, i) => (
        <path key={i} d={poly(line)} />
      ))}
    </g>
    <path
      className="profile"
      d={poly([
        [40, BAND[0]],
        [360, BAND[0]],
      ])}
    />
    <path
      className="profile"
      d={poly([
        [40, BAND[1]],
        [360, BAND[1]],
      ])}
    />
    <path
      className="profile"
      d={poly([
        [40, (BAND[0] + BAND[1]) / 2],
        [360, (BAND[0] + BAND[1]) / 2],
      ])}
    />
    <path
      className="profile"
      d={poly(chevrons(BAND[0], (BAND[0] + BAND[1]) / 2))}
    />
    <path
      className="profile"
      d={poly(chevrons((BAND[0] + BAND[1]) / 2, BAND[1]))}
    />
    <path
      className="idea"
      d={poly(
        [
          [PICK.x1, PICK.y - COURSE],
          [PICK.x2, PICK.y - COURSE],
          [PICK.x2, PICK.y],
          [PICK.x1, PICK.y],
        ],
        true,
      )}
    />
    <path
      className="idea"
      d={poly([
        [PICK.under, PICK.y],
        [PICK.under, PICK.y + COURSE],
      ])}
    />
  </>
);

export const greatZimbabwe: Drawings = {
  main: {
    title: "Section through the Great Enclosure wall",
    caption:
      "Section through the outer wall where it runs beside the conical tower. Both faces lean inward, more steeply above about 4 m, which narrows the wall from 5 m at the base to under 2 m at the top; the red dashed lines are plumb. The inner wall and passage are estimates.",
    viewBox: [800, 396],
    art: main,
    labels: [
      {
        at: f.p(BASE / 2, 7),
        to: [330, 46],
        text: "Granite blocks, no mortar",
      },
      { at: f.p(BASE + 0.6, 3.4), to: [380, 110], text: "Narrow passage" },
      {
        at: f.p(TOWER_U + 1.2, 6),
        to: [640, 130],
        text: "Solid conical tower",
      },
    ],
  },
  detail: {
    title: "The top of the wall",
    caption:
      "The outer face near the top, with its band of chevrons. Every block rests across a joint in the course below, and the wall stands by weight and fit alone.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: [96, (BAND[0] + BAND[1]) / 2 - 8],
        to: [40, 30],
        text: "Double chevron band",
      },
      {
        at: [PICK.x2, PICK.y - COURSE / 2],
        to: [250, 380],
        text: "Block bridges a joint",
      },
      { at: [80, 300], to: [40, 380], text: "Dry courses" },
    ],
  },
};
