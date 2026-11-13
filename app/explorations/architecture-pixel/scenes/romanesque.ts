import {
  growTree,
  hash,
  noise,
  rgb,
  setGroundPart,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  courses,
  gableX,
  gableY,
  grass,
  island,
  pyramid,
  quad,
  shadowBox,
  tone,
  windowId,
  type BoxOptions,
} from "../engine/kit";

const SANDSTONE: RGB = [196, 164, 122];
const LEAD: RGB = [104, 112, 126];
const RIVER: RGB[] = [
  [40, 70, 70],
  [52, 88, 84],
  [70, 108, 98],
];
const WOOD: RGB[] = [
  [40, 70, 46],
  [70, 102, 60],
  [108, 134, 74],
];

const CROSSING = 1,
  WEST = 2,
  CRENELLATIONS = 3,
  NAVE = 4,
  TRANSEPT = 5,
  ROOF = 6,
  RIVER_PART = 7,
  WOODS = 8;

const round = (
  u: number,
  v: number,
  pitch: number,
  w: number,
  z0: number,
  z1: number,
) => {
  const fu = (((u % pitch) + pitch) % pitch) - pitch / 2;
  if (Math.abs(fu) > w || v < z0 || v > z1) return false;
  const spring = z1 - w;
  return v < spring || fu * fu + (v - spring) ** 2 < w * w;
};

function walls(
  seed: number,
  bands: [number, number, number][],
  pitch: number,
  strip = true,
): BoxOptions {
  const hit = (u: number, v: number) =>
    bands.some(([w, z0, z1]) => round(u, v, pitch, w, z0, z1));
  const level = (u: number, v: number) => {
    if (hit(u, v)) return -2.3;
    for (const [w, z0, z1] of bands)
      if (round(u, v, pitch, w + 0.1, z0 - 0.06, z1 + 0.1)) return 0.8;
    if (
      strip &&
      (((u % pitch) + pitch) % pitch < 0.16 ||
        ((u % pitch) + pitch) % pitch > pitch - 0.02)
    )
      return 0.5;
    return courses(u, v, 0.3, 0.55) * 0.7 + (noise(u + seed, v) - 0.5) * 0.4;
  };
  const glow = (u: number, v: number) =>
    hit(u, v) ? windowId(Math.floor(u / pitch), Math.floor(v), seed) : 0;
  return { sideX: level, sideY: level, glowX: glow, glowY: glow };
}

export const romanesque: Scene = {
  id: "romanesque",
  scale: 9,
  originY: 28,
  windowLight: [255, 192, 106],
  parts: [
    "",
    "crossing tower",
    "west towers",
    "crenellations",
    "thick nave walls",
    "transept",
    "lead roof",
    "River Wear",
    "riverside woods",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x + 0.6, y, ix, iy, 10.4, 9.4);
    if (edge < 0) return 0;
    const bend = 7.6 + Math.sin(y * 0.35) * 1.4;
    if (x > bend && x < bend + 1.8) {
      setGroundPart(i, RIVER_PART);
      setKind(i, 0);
      return tone(RIVER, 0.4 + (noise(x * 1.2, y * 0.4) - 0.5) * 0.8, ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(230, 224, 200);
    return grass(x, y, ix, iy, i, 0.1);
  },
  build() {
    box(
      -6.5,
      -1.9,
      0,
      4,
      1.9,
      6.0,
      SANDSTONE,
      NAVE,
      walls(
        1,
        [
          [0.3, 4.3, 5.5],
          [0.36, 2.0, 3.2],
        ],
        1.6,
      ),
    );
    shadowBox(-6.5, -1.9, 4, 1.9, 0, 6.0);
    gableX(-6.6, 4.1, -2.0, 2.0, 6.0, 1.7, LEAD, ROOF);
    box(
      -6.5,
      1.9,
      0,
      4,
      3.1,
      3.4,
      SANDSTONE,
      NAVE,
      walls(2, [[0.32, 1.1, 2.6]], 1.6),
    );
    quad(
      [-6.5, 1.9, 4.1],
      [10.5, 0, 0],
      [0, 1.25, -0.7],
      LEAD,
      ROOF,
      (u) => (Math.floor(u * 2) % 2) * 0.3,
    );
    shadowBox(-6.5, 1.9, 4, 3.1, 0, 3.8);

    box(
      -1.4,
      -5.4,
      0,
      1.4,
      5.4,
      6.0,
      SANDSTONE,
      TRANSEPT,
      walls(
        3,
        [
          [0.34, 1.4, 3.0],
          [0.34, 3.8, 5.3],
        ],
        1.4,
      ),
    );
    shadowBox(-1.4, -5.4, 1.4, 5.4, 0, 6.0);
    gableY(-5.5, 5.5, -1.5, 1.5, 6.0, 1.7, LEAD, ROOF, {
      color: SANDSTONE,
      part: TRANSEPT,
    });

    box(
      -1.5,
      -1.5,
      6.0,
      1.5,
      1.5,
      11.0,
      SANDSTONE,
      CROSSING,
      walls(
        4,
        [
          [0.22, 7.6, 9.0],
          [0.22, 9.4, 10.5],
        ],
        0.75,
      ),
    );
    shadowBox(-1.5, -1.5, 1.5, 1.5, 6.0, 11.0);
    box(-1.6, -1.6, 10.9, 1.6, 1.6, 11.2, SANDSTONE, CRENELLATIONS, {
      sideX: (u) => (u % 0.3 < 0.15 ? 0.8 : -0.6),
      sideY: (u) => (u % 0.3 < 0.15 ? 0.8 : -0.6),
    });

    for (const side of [-1, 1]) {
      const y0 = side > 0 ? 1.1 : -3.2,
        y1 = y0 + 2.1;
      box(
        4,
        y0,
        0,
        5.8,
        y1,
        9.6,
        SANDSTONE,
        WEST,
        walls(
          5 + side,
          [
            [0.24, 3.6, 4.8],
            [0.24, 6.2, 7.6],
            [0.2, 8.2, 9.1],
          ],
          0.7,
          false,
        ),
      );
      shadowBox(4, y0, 5.8, y1, 0, 9.6);
      box(3.9, y0 - 0.1, 9.5, 5.9, y1 + 0.1, 9.8, SANDSTONE, CRENELLATIONS, {
        sideX: (u) => (u % 0.3 < 0.15 ? 0.8 : -0.6),
        sideY: (u) => (u % 0.3 < 0.15 ? 0.8 : -0.6),
      });
      for (const [px, py] of [
        [5.7, y0 + 0.1],
        [5.7, y1 - 0.1],
        [4.1, y1 - 0.1],
      ] as const)
        pyramid(px, py, 0.14, 9.8, 0.8, SANDSTONE, WEST);
    }
    box(
      4,
      -1.1,
      0,
      5.6,
      1.1,
      6.6,
      SANDSTONE,
      WEST,
      walls(
        7,
        [
          [0.62, 0.3, 2.6],
          [0.34, 3.6, 5.4],
        ],
        2.2,
        false,
      ),
    );
    shadowBox(4, -1.1, 5.6, 1.1, 0, 6.6);

    const trees: [number, number, number][] = [
      [9.8, -6.0, 0.5],
      [10.4, 2.6, 0.55],
      [6.6, -6.8, 0.45],
      [9.6, 6.6, 0.5],
      [-5.2, 6.4, 0.48],
      [-7.6, -4.4, 0.5],
    ];
    trees.forEach(([x, y, s], k) =>
      growTree(x, y, WOODS, s, 220, 14100 + k * 300, WOOD),
    );
  },
};
