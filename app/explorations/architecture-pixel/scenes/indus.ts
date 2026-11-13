import {
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
  cylinder,
  island,
  shadowBox,
  tone,
  type Level,
} from "../engine/kit";

const BRICK: RGB = [178, 120, 86];
const DARK_BRICK: RGB = [140, 92, 66];
const WATER: RGB = [56, 98, 118];
const STREET: RGB[] = [
  [180, 150, 116],
  [192, 162, 128],
  [204, 174, 140],
];
const DRAIN: RGB[] = [
  [120, 96, 76],
  [136, 110, 88],
];

const BATH = 1,
  HOUSE = 2,
  DRAIN_PART = 3,
  STREET_PART = 4,
  GRANARY = 5,
  POOL = 6,
  WELL = 7;

const bricks: Level = (u, v) =>
  ((v * 8) % 1 < 0.18 ? -0.6 : 0.2) +
  (hash(Math.floor(u * 4 + Math.floor(v * 8) * 0.5), Math.floor(v * 8)) - 0.5) *
    0.6;

const BLOCKS: [number, number, number, number, number][] = [
  [-7.2, -6.6, -4.4, -3.6, 1.5],
  [-7.2, -2.4, -4.4, 0.6, 1.2],
  [-7.2, 1.6, -4.4, 4.8, 1.6],
  [-3.4, 1.6, -0.6, 4.8, 1.3],
  [0.4, 1.6, 3.2, 4.8, 1.5],
  [4.2, 1.6, 6.8, 4.8, 1.2],
  [4.2, -6.6, 6.8, -3.6, 1.4],
  [4.2, -2.6, 6.8, 0.6, 1.0],
];

function house(x0: number, y0: number, x1: number, y1: number, h: number) {
  const cx0 = x0 + (x1 - x0) * 0.35,
    cx1 = x0 + (x1 - x0) * 0.7,
    cy0 = y0 + (y1 - y0) * 0.35,
    cy1 = y0 + (y1 - y0) * 0.7;
  box(x0, y0, 0, x1, y1, h, BRICK, HOUSE, {
    sideX: (u, v) =>
      Math.abs(u - (y1 - y0) * 0.5) < 0.22 && v < 0.85 ? -2.2 : bricks(u, v),
    sideY: (u, v) =>
      Math.abs(u - (x1 - x0) * 0.3) < 0.14 && v > 0.6 && v < 0.9
        ? -2
        : bricks(u, v),
    top: (u, v) => {
      const x = x0 + u,
        y = y0 + v;
      if (x > cx0 && x < cx1 && y > cy0 && y < cy1) return -2.2;
      return (noise(u * 3, v * 3) - 0.5) * 0.5 - 0.2;
    },
  });
  shadowBox(x0, y0, x1, y1, 0, h);
}

export const indus: Scene = {
  id: "indus",
  scale: 11,
  originY: 4,
  parts: [
    "",
    "Great Bath",
    "fired-brick house",
    "covered drain",
    "grid street",
    "granary",
    "bathing pool",
    "brick well",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y + 0.9, ix, iy, 8.6, 7.6);
    if (edge < 0) return 0;
    setKind(i, 1);
    const streetY = Math.abs(y - 1.1) < 0.5,
      streetX = Math.abs(x + 3.9) < 0.5 || Math.abs(x - 3.7) < 0.5;
    if (
      (streetY && Math.abs(y - 1.1) < 0.12) ||
      (streetX && (Math.abs(x + 3.9) < 0.12 || Math.abs(x - 3.7) < 0.12))
    ) {
      setGroundPart(i, DRAIN_PART);
      return tone(DRAIN, ((x + y) * 3) % 1 < 0.15 ? 0 : 0.8, ix, iy);
    }
    setGroundPart(i, STREET_PART);
    if (hash(ix, iy) > 0.985) return rgb(150, 120, 92);
    return tone(STREET, 0.4 + (noise(x * 1.2, y * 1.2) - 0.5) * 0.6, ix, iy);
  },
  build() {
    for (const b of BLOCKS) house(b[0], b[1], b[2], b[3], b[4]);
    box(-2.9, -5.6, 0, 2.9, 0.2, 0.7, BRICK, BATH, {
      sideX: bricks,
      sideY: bricks,
      top: (u, v) => ((Math.floor(u * 2) + Math.floor(v * 2)) % 2 ? 0.3 : -0.1),
    });
    shadowBox(-2.9, -5.6, 2.9, 0.2, 0, 0.7);
    box(-1.6, -4.0, 0.4, 1.6, -1.4, 0.71, WATER, POOL, {
      top: (u, v) =>
        u < 0.3 || u > 2.9
          ? Math.floor(u * 10) % 2
            ? 1.2
            : 0.4
          : hash(Math.floor(u * 6), Math.floor(v * 6)) > 0.85
            ? 1.4
            : (noise(u * 2, v * 2) - 0.5) * 0.6,
    });
    for (let k = 0; k < 8; k++) {
      const x = -2.5 + k * 0.72;
      for (const y of [-5.25, -0.15])
        box(
          x - 0.12,
          y - 0.12,
          0.7,
          x + 0.12,
          y + 0.12,
          1.6,
          DARK_BRICK,
          BATH,
          { sideX: bricks, sideY: bricks },
        );
    }
    box(-6.6, -6.4, 0, -4.8, -4.2, 0.9, BRICK, GRANARY, {
      sideX: bricks,
      sideY: bricks,
    });
    for (let k = 0; k < 4; k++)
      for (let j = 0; j < 3; j++)
        box(
          -6.5 + k * 0.45,
          -6.3 + j * 0.72,
          0.9,
          -6.2 + k * 0.45,
          -5.8 + j * 0.72,
          1.6,
          BRICK,
          GRANARY,
          { sideX: bricks, sideY: bricks },
        );
    shadowBox(-6.6, -6.4, -4.8, -4.2, 0, 1.6);
    cylinder(5.4, -1.0, 0.4, 0.4, 1.0, 1.4, DARK_BRICK, WELL, {
      level: () => 0.3,
    });
  },
};
