import {
  growTree,
  hash,
  noise,
  rampId,
  rgb,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  facadeX,
  facadeY,
  gableY,
  grass,
  island,
  pyramid,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const STONE: RGB = [216, 198, 162];
const PAINT: RGB = [238, 236, 228];
const GLASS: RGB = [50, 58, 70];
const DOOR: RGB = [44, 58, 54];
const SLATE: RGB = [92, 96, 108];
const IRON: RGB = [38, 38, 44];
const GRAVEL: RGB[] = [
  [196, 188, 168],
  [208, 200, 180],
  [218, 210, 190],
];
const CEDAR: RGB[] = [
  [34, 58, 50],
  [56, 84, 64],
  [86, 112, 80],
];

const SASH = 1,
  FANLIGHT = 2,
  QUOINS = 3,
  STRING = 4,
  DORMER = 5,
  CHIMNEY = 6,
  RAILINGS = 7,
  FRONT = 8,
  ROOF = 9,
  TREE = 10;

const stone = rampId(STONE),
  paint = rampId(PAINT),
  glass = rampId(GLASS),
  door = rampId(DOOR);
const LEN = 8.8,
  PITCH = LEN / 7,
  TOP = 5.4;

function sash(fa: number, fz: number, w: number, h: number, id: number): Cell {
  if (fa < 0.05 || fa > w - 0.05 || fz < 0.05 || fz > h - 0.05)
    return [paint, 0.5, SASH, 0];
  if (Math.abs(fz - h / 2) < 0.035) return [paint, 0.4, SASH, 0];
  if (((fa / w) * 3) % 1 < 0.1 || ((fz / h) * 6) % 1 < 0.1)
    return [paint, 0.2, SASH, 0];
  return [glass, (noise(fa * 4, fz * 4) - 0.5) * 0.6, SASH, id];
}

function front(a: number, z: number): Cell {
  if (a < 0.38 || a > LEN - 0.38)
    return [stone, Math.floor(z / 0.32) % 2 ? 0.8 : 0.2, QUOINS, 0];
  if (z < 0.5) return [stone, z % 0.25 < 0.04 ? -0.7 : -0.1, FRONT, 0];
  if (z > 2.72 && z < 2.86) return [stone, 0.9, STRING, 0];
  if (z > 4.9 && z < 5.06) return [stone, 1.0, STRING, 0];
  if (z > TOP - 0.06) return [stone, 0.8, STRING, 0];
  const bay = Math.floor(a / PITCH),
    fa = a - bay * PITCH - (PITCH - 0.58) / 2;
  if (bay === 3 && z < 2.7) {
    const c = a - 3.5 * PITCH;
    if (Math.abs(c) < 0.32 && z < 2.0)
      return [
        door,
        Math.abs(c) < 0.02 || z % 0.5 < 0.04 ? -0.6 : 0.2,
        FANLIGHT,
        0,
      ];
    if (Math.abs(c) < 0.32 && z < 2.0 + Math.sqrt(Math.max(0, 0.1 - c * c)))
      return [
        glass,
        Math.floor(Math.atan2(z - 2, c) * 3) % 2 ? 0.6 : -0.3,
        FANLIGHT,
        windowId(3, 0, 9),
      ];
    if (Math.abs(c) < 0.48 && z > 2.3 && z < 2.72 - Math.abs(c) * 0.7)
      return [stone, 0.9, FANLIGHT, 0];
    if (Math.abs(Math.abs(c) - 0.42) < 0.06 && z < 2.3)
      return [stone, 0.8, FANLIGHT, 0];
  }
  if (fa > 0 && fa < 0.58) {
    if (z > 0.9 && z < 2.35)
      return sash(fa, z - 0.9, 0.58, 1.45, windowId(bay, 1, 7));
    if (z > 3.2 && z < 4.7)
      return sash(fa, z - 3.2, 0.58, 1.5, windowId(bay, 2, 7));
    if (z > 0.82 && z < 0.9) return [stone, 0.8, SASH, 0];
  }
  return [
    stone,
    (noise(a * 2, z * 2) - 0.5) * 0.45 +
      (Math.floor(z / 0.32) % 2 ? 0.08 : -0.08),
    FRONT,
    0,
  ];
}

function end(a: number, z: number): Cell {
  if (a > 3.2 - 0.38)
    return [stone, Math.floor(z / 0.32) % 2 ? 0.8 : 0.2, QUOINS, 0];
  if (z < 0.5) return [stone, -0.1, FRONT, 0];
  if ((z > 2.72 && z < 2.86) || (z > 4.9 && z < 5.06))
    return [stone, 0.9, STRING, 0];
  const fa = a - 1.3;
  if (fa > 0 && fa < 0.58) {
    if (z > 0.9 && z < 2.35)
      return sash(fa, z - 0.9, 0.58, 1.45, windowId(9, 1, 8));
    if (z > 3.2 && z < 4.7)
      return sash(fa, z - 3.2, 0.58, 1.5, windowId(9, 2, 8));
  }
  return [stone, (noise(a * 2, z * 2) - 0.5) * 0.45, FRONT, 0];
}

export const georgian: Scene = {
  id: "georgian",
  scale: 12,
  originY: 22,
  windowLight: [255, 206, 128],
  parts: [
    "",
    "sash windows",
    "fanlight door",
    "quoins",
    "string course",
    "dormer",
    "chimney stack",
    "iron railings",
    "stone front",
    "slate roof",
    "cedar tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 2.6, y, ix, iy, 8.6, 7.6);
    if (edge < 0) return 0;
    if ((x > 3.2 && Math.abs(y) < 0.55) || (x > 3.2 && x < 3.9)) {
      setKind(i, 1);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(236, 232, 214);
    return grass(x, y, ix, iy, i, 0.3);
  },
  build() {
    box(0, -LEN / 2, 0, 3.2, LEN / 2, TOP, STONE, FRONT);
    facadeX(3.201, -LEN / 2, LEN / 2, 0, TOP, front);
    facadeY(LEN / 2 + 0.001, 0, 3.2, 0, TOP, end);
    shadowBox(0, -LEN / 2, 3.2, LEN / 2, 0, TOP);
    gableY(-LEN / 2, LEN / 2, 0.1, 3.1, TOP - 0.1, 1.5, SLATE, ROOF);
    for (const y of [-2.5, 0, 2.5]) {
      box(2.2, y - 0.34, 5.5, 2.7, y + 0.34, 6.25, PAINT, DORMER, {
        sideX: (u, v) =>
          u > 0.12 && u < 0.56 && v > 0.12 && v < 0.62
            ? u % 0.15 < 0.03
              ? 0.3
              : -2
            : 0.5,
        glowX: (u, v) =>
          u > 0.12 && u < 0.56 && v > 0.12 && v < 0.62 && u % 0.15 >= 0.03
            ? windowId(y * 3, 5, 6)
            : 0,
      });
      pyramid(2.45, y, 0.38, 6.25, 0.4, SLATE, DORMER);
    }
    for (const y of [-LEN / 2 + 0.5, LEN / 2 - 0.5]) {
      box(1.0, y - 0.35, 5.6, 2.2, y + 0.35, 7.3, STONE, CHIMNEY, {
        sideX: (u, v) => (v > 1.55 ? 0.8 : 0),
        sideY: (u, v) => (v > 1.55 ? 0.8 : 0),
      });
      shadowBox(1.0, y - 0.35, 2.2, y + 0.35, 5.6, 7.3, 0.4);
      for (const x of [1.3, 1.6, 1.9])
        box(
          x - 0.08,
          y - 0.08,
          7.3,
          x + 0.08,
          y + 0.08,
          7.6,
          [176, 104, 76],
          CHIMNEY,
        );
    }
    box(5.5, -LEN / 2, 0, 5.75, LEN / 2, 0.28, STONE, RAILINGS, {
      top: () => 0.6,
    });
    for (let y = -LEN / 2 + 0.1; y <= LEN / 2 - 0.1; y += 0.22) {
      if (Math.abs(y) < 0.6) continue;
      box(5.6, y - 0.025, 0.28, 5.65, y + 0.025, 1.15, IRON, RAILINGS);
      sphere(5.625, y, 1.18, 0.04, IRON, RAILINGS, "solid");
    }
    box(5.6, -LEN / 2, 1.0, 5.65, LEN / 2, 1.05, IRON, RAILINGS);
    growTree(7.6, 5.0, TREE, 0.6, 280, 10100, CEDAR);
    growTree(-2.6, -5.6, TREE, 0.5, 240, 10500, CEDAR);
  },
};
