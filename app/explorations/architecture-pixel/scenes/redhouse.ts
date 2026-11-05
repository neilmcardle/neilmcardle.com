import {
  growTree,
  hash,
  noise,
  rgb,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cone,
  cylinder,
  gableX,
  gableY,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type BoxOptions,
} from "../engine/kit";

const BRICK: RGB = [170, 70, 52];
const TILE: RGB = [156, 72, 54];
const OAK: RGB = [110, 84, 62];
const PATH: RGB[] = [
  [196, 186, 164],
  [208, 198, 176],
];
const APPLE: RGB[] = [
  [50, 80, 46],
  [92, 120, 58],
  [150, 160, 76],
];

const BRICKP = 1,
  ROOF = 2,
  WELL = 3,
  PORCH = 4,
  CHIMNEY = 5,
  ORCHARD = 6;

function walls(
  seed: number,
  wins: [number, number, number, number, boolean][],
): BoxOptions {
  const hit = (u: number, v: number) =>
    wins.some(
      ([c, w, z0, z1, round]) =>
        Math.abs(u - c) < w &&
        v > z0 &&
        (v < z1 - (round ? w : 0) ||
          (round && (u - c) ** 2 + (v - (z1 - w)) ** 2 < w * w)),
    );
  const level = (u: number, v: number) => {
    if (hit(u, v)) return (u * 8) % 1 < 0.15 || (v * 6) % 1 < 0.12 ? 0.9 : -2.2;
    return (
      ((v * 8) % 1 < 0.16 ? -0.6 : 0.1) +
      (hash(Math.floor(u * 4 + Math.floor(v * 8) * 0.5), Math.floor(v * 8)) -
        0.5) *
        0.5
    );
  };
  const glow = (u: number, v: number) =>
    hit(u, v) ? windowId(Math.floor(u * 2), Math.floor(v), seed) : 0;
  return { sideX: level, sideY: level, glowX: glow, glowY: glow };
}

export const redHouse: Scene = {
  id: "redhouse",
  scale: 13,
  originY: 18,
  windowLight: [255, 200, 120],
  parts: [
    "",
    "red brick",
    "steep tile roof",
    "well-house",
    "pointed porch",
    "tall chimneys",
    "orchard",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y - 0.8, ix, iy, 7.8, 7.6);
    if (edge < 0) return 0;
    if (
      (x > 1.0 && Math.abs(y + 0.2) < 0.45) ||
      (Math.abs(x - 2.4) < 0.4 && y > 0 && y < 3.2)
    ) {
      setKind(i, 1);
      return tone(PATH, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.985) return rgb(236, 226, 196);
    return grass(x, y, ix, iy, i, 0.3);
  },
  build() {
    box(
      -3.4,
      -1.6,
      0,
      1.0,
      1.6,
      3.0,
      BRICK,
      BRICKP,
      walls(1, [
        [0.8, 0.3, 0.6, 1.8, true],
        [2.6, 0.38, 0.6, 1.9, false],
        [3.9, 0.3, 1.9, 2.6, true],
      ]),
    );
    shadowBox(-3.4, -1.6, 1.0, 1.6, 0, 3.0);
    gableX(-3.5, 1.1, -1.75, 1.75, 3.0, 2.3, TILE, ROOF, {
      color: BRICK,
      part: BRICKP,
      level: (y, h) =>
        Math.abs(y) < 0.3 && h > 0.6 && h < 1.4
          ? Math.hypot(y, h - 1.0) < 0.28
            ? -2
            : 0.6
          : (h * 8) % 1 < 0.16
            ? -0.6
            : 0.1,
    });
    box(
      -1.2,
      1.6,
      0,
      1.0,
      5.6,
      3.0,
      BRICK,
      BRICKP,
      walls(2, [
        [0.9, 0.42, 0.5, 2.0, true],
        [2.4, 0.28, 1.6, 2.5, true],
        [3.2, 0.3, 0.5, 1.6, false],
      ]),
    );
    shadowBox(-1.2, 1.6, 1.0, 5.6, 0, 3.0);
    gableY(1.6, 5.7, -1.3, 1.1, 3.0, 2.1, TILE, ROOF, {
      color: BRICK,
      part: BRICKP,
      level: (x, h) => ((h * 8) % 1 < 0.16 ? -0.6 : 0.1),
    });
    box(1.0, -0.65, 0, 2.0, 0.25, 2.3, BRICK, PORCH, {
      sideX: (u, v) =>
        Math.abs(u - 0.45) < 0.32 &&
        (v < 1.4 ||
          (Math.hypot(u - 0.13, v - 1.4) < 0.64 &&
            Math.hypot(u - 0.77, v - 1.4) < 0.64))
          ? -2.4
          : (v * 8) % 1 < 0.16
            ? -0.6
            : 0.1,
    });
    gableX(1.0, 2.1, -0.75, 0.35, 2.3, 0.8, TILE, ROOF, {
      color: BRICK,
      part: PORCH,
    });
    for (const [x, y, h] of [
      [-2.4, 0, 6.6],
      [0, 4.2, 6.4],
      [-0.4, -1.2, 6.0],
    ] as const) {
      box(x - 0.28, y - 0.4, 2.8, x + 0.28, y + 0.4, h, BRICK, CHIMNEY, {
        sideX: (u, v) => (v > h - 3.0 ? 0.6 : (v * 8) % 1 < 0.16 ? -0.6 : 0.1),
        sideY: (u, v) => ((v * 8) % 1 < 0.16 ? -0.6 : 0.1),
      });
      shadowBox(x - 0.28, y - 0.4, x + 0.28, y + 0.4, 2.8, h, 0.35);
    }
    cylinder(2.4, 2.8, 0.5, 0.5, 0, 0.6, BRICK, WELL, {
      level: (a, t) => ((t * 4) % 1 < 0.2 ? -0.6 : 0.2),
    });
    for (const [dx, dy] of [
      [0.38, 0.38],
      [-0.38, 0.38],
      [0.38, -0.38],
      [-0.38, -0.38],
    ] as const)
      box(
        2.4 + dx - 0.05,
        2.8 + dy - 0.05,
        0.6,
        2.4 + dx + 0.05,
        2.8 + dy + 0.05,
        1.6,
        OAK,
        WELL,
      );
    cone(2.4, 2.8, 0.85, 1.6, 1.3, TILE, WELL, (a, t) =>
      Math.floor(t * 10) % 2 ? 0.4 : -0.1,
    );
    growTree(4.6, -3.8, ORCHARD, 0.42, 200, 19100, APPLE);
    growTree(-5.0, 4.6, ORCHARD, 0.44, 200, 19500, APPLE);
    growTree(4.4, 5.6, ORCHARD, 0.4, 200, 19900, APPLE);
  },
};
