import {
  growTree,
  hash,
  noise,
  rampId,
  rgb,
  setGroundPart,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  facadeX,
  gableX,
  gableY,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const STUCCO: RGB = [238, 234, 224];
const IRON: RGB = [40, 40, 46];
const GLASS: RGB = [56, 64, 74];
const SLATE: RGB = [100, 104, 116];
const WEDGWOOD: RGB = [104, 138, 176];
const ROAD: RGB[] = [
  [96, 94, 90],
  [106, 104, 100],
];
const PLANE: RGB[] = [
  [50, 74, 52],
  [84, 112, 66],
  [128, 150, 84],
];

const TERRACE = 1,
  PORTICO = 2,
  BALCONY = 3,
  WINDOWS = 4,
  PEDIMENT = 5,
  STATUES = 6,
  PARK = 7,
  TREE = 8;

const stucco = rampId(STUCCO),
  iron = rampId(IRON),
  glass = rampId(GLASS);
const LEN = 16,
  TOP = 5.6;

function front(a: number, z: number): Cell {
  if (z < 1.1) return [stucco, z % 0.28 < 0.05 ? -0.5 : 0.1, TERRACE, 0];
  if (z > TOP - 0.3) return [stucco, 0.8, TERRACE, 0];
  if (z > 1.75 && z < 2.05)
    return a % 0.14 < 0.04 || z > 1.98
      ? [iron, 0.2, BALCONY, 0]
      : [stucco, 0, TERRACE, 0];
  const bay = Math.floor(a / 0.8),
    fa = a % 0.8;
  if (fa > 0.2 && fa < 0.6) {
    const rows: [number, number][] = [
      [1.3, 1.0],
      [2.15, 1.3],
      [3.65, 0.9],
      [4.75, 0.5],
    ];
    for (let r = 0; r < rows.length; r++) {
      const [z0, h] = rows[r];
      if (z > z0 && z < z0 + h)
        return (fa - 0.2) % 0.13 < 0.03 || (z - z0) % 0.32 < 0.03
          ? [stucco, 0.7, WINDOWS, 0]
          : [glass, -0.2, WINDOWS, windowId(bay, r, 5)];
    }
  }
  return [
    stucco,
    (noise(a, z) - 0.5) * 0.25 + (Math.abs(z - 3.5) < 0.06 ? 0.8 : 0),
    TERRACE,
    0,
  ];
}

export const regency: Scene = {
  id: "regency",
  scale: 9,
  originY: 22,
  windowLight: [255, 210, 136],
  parts: [
    "",
    "stucco terrace",
    "Ionic portico",
    "iron balconies",
    "sash windows",
    "Wedgwood pediment",
    "rooftop statues",
    "Regent's Park",
    "plane tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 2.6, y, ix, iy, 9.8, 10.2);
    if (edge < 0) return 0;
    if (x > 3.4 && x < 4.8) {
      setKind(i, 1);
      return tone(ROAD, noise(x * 2, y * 2), ix, iy);
    }
    setGroundPart(i, PARK);
    if (hash(ix, iy) > 0.99) return rgb(232, 226, 206);
    return grass(x, y, ix, iy, i, 0.3);
  },
  build() {
    box(-1.6, -LEN / 2, 0, 1.6, LEN / 2, TOP, STUCCO, TERRACE);
    facadeX(1.601, -LEN / 2, LEN / 2, 0, TOP, front);
    shadowBox(-1.6, -LEN / 2, 1.6, LEN / 2, 0, TOP);
    gableY(-LEN / 2, LEN / 2, -1.5, 1.5, TOP, 1.0, SLATE, TERRACE, {
      color: STUCCO,
      part: TERRACE,
    });
    for (const [y0, y1, cols] of [
      [-2.6, 2.6, 10],
      [-7.8, -5.4, 4],
      [5.4, 7.8, 4],
    ] as const) {
      box(1.6, y0, 0, 2.7, y1, 1.1, STUCCO, PORTICO, {
        sideX: (u, v) => (v % 0.28 < 0.05 ? -0.5 : 0.2),
      });
      for (let k = 0; k < cols; k++) {
        const y = y0 + 0.2 + (k * (y1 - y0 - 0.4)) / (cols - 1);
        cylinder(2.45, y, 0.13, 0.12, 1.1, 4.6, STUCCO, PORTICO, {
          level: (a, t) => Math.cos(a * 12) * 0.3 - t * 0.1,
          top: false,
        });
        box(2.28, y - 0.18, 4.6, 2.62, y + 0.18, 4.72, STUCCO, PORTICO, {
          sideX: (u) => (Math.sin(u * 40) > 0 ? 0.9 : 0.2),
        });
      }
      box(1.6, y0 - 0.05, 4.72, 2.75, y1 + 0.05, 5.2, STUCCO, PORTICO, {
        sideX: (u, v) => (v > 0.36 ? 0.9 : 0.3),
      });
      shadowBox(1.6, y0, 2.7, y1, 0, 5.2);
      const tall = y1 - y0 > 3;
      gableX(
        1.6,
        2.8,
        y0 - 0.1,
        y1 + 0.1,
        5.2,
        tall ? 1.1 : 0.7,
        SLATE,
        PEDIMENT,
        {
          color: tall ? WEDGWOOD : STUCCO,
          part: PEDIMENT,
          level: (y, h) =>
            h < 0.1 ||
            Math.abs(
              Math.abs(y - (y0 + y1) / 2) -
                ((y1 - y0) / 2 + 0.1) * (1 - h / (tall ? 1.1 : 0.7)),
            ) < 0.1
              ? 1.6
              : noise(y * 5, h * 6) > 0.62
                ? 2.2
                : 0,
        },
      );
      if (tall)
        for (const y of [y0, (y0 + y1) / 2, y1]) {
          sphere(
            2.7,
            y,
            5.4 + (y === (y0 + y1) / 2 ? 1.1 : 0),
            0.14,
            STUCCO,
            STATUES,
            "solid",
          );
          sphere(
            2.7,
            y,
            5.62 + (y === (y0 + y1) / 2 ? 1.1 : 0),
            0.1,
            STUCCO,
            STATUES,
            "solid",
          );
        }
    }
    for (let y = -7.6; y <= 7.6; y += 1.6)
      if (Math.abs(y) > 2.8)
        sphere(1.5, y, TOP + 0.15, 0.12, STUCCO, STATUES, "solid");
    growTree(6.4, -6.4, TREE, 0.6, 260, 18100, PLANE);
    growTree(6.8, 1.4, TREE, 0.62, 260, 18500, PLANE);
    growTree(6.2, 7.6, TREE, 0.56, 240, 18900, PLANE);
  },
};
