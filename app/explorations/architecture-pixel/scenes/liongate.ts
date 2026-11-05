import {
  growTree,
  hash,
  noise,
  rampId,
  rgb,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  facadeX,
  island,
  shadowBox,
  tone,
  type Cell,
  type Level,
} from "../engine/kit";

const LIMESTONE: RGB = [184, 168, 140];
const GATE_STONE: RGB = [196, 186, 164];
const DARK: RGB = [44, 40, 40];
const EARTH: RGB[] = [
  [170, 146, 110],
  [182, 158, 122],
  [194, 170, 134],
  [204, 182, 146],
];
const PATH: RGB[] = [
  [206, 190, 160],
  [216, 200, 170],
];
const OLIVE: RGB[] = [
  [70, 88, 66],
  [112, 128, 92],
  [158, 168, 128],
];

const WALL = 1,
  LIONS = 2,
  LINTEL = 3,
  TRIANGLE = 4,
  JAMBS = 5,
  BASTION = 6,
  TREE = 7;

const lime = rampId(LIMESTONE),
  gate = rampId(GATE_STONE),
  dark = rampId(DARK);

function cyclopean(a: number, z: number, seed: number) {
  const s = 0.72,
    gx = Math.floor(a / s),
    gz = Math.floor(z / (s * 0.8));
  let d1 = 9,
    d2 = 9,
    id = 0;
  for (let dx = -1; dx <= 1; dx++)
    for (let dz = -1; dz <= 1; dz++) {
      const cx = (gx + dx + 0.15 + hash(gx + dx, gz + dz + seed) * 0.7) * s;
      const cz =
        (gz + dz + 0.15 + hash(gz + dz + 7, gx + dx + seed) * 0.7) * s * 0.8;
      const d = Math.hypot(a - cx, (z - cz) * 1.25);
      if (d < d1) {
        d2 = d1;
        d1 = d;
        id = (gx + dx) * 31 + (gz + dz);
      } else if (d < d2) d2 = d;
    }
  if (d2 - d1 < 0.06) return -1.3;
  return (
    (hash(id, seed) - 0.5) * 0.9 +
    (noise(a * 3, z * 3) - 0.5) * 0.5 +
    (d2 - d1 < 0.12 ? -0.3 : 0.1)
  );
}
const wallLevel =
  (seed: number): Level =>
  (u, v) =>
    cyclopean(u, v, seed);

function gateFace(a: number, z: number): Cell {
  const y = a - 3.6;
  if (Math.abs(y) < 0.7 && z < 2.35)
    return [dark, -1 + (z < 0.1 ? 0.6 : 0), JAMBS, 0];
  if (Math.abs(y) < 1.05 && z < 2.35)
    return [gate, 0.4 + (noise(a * 4, z * 2) - 0.5) * 0.3, JAMBS, 0];
  if (Math.abs(y) < 1.4 && z >= 2.35 && z < 2.95)
    return [gate, 0.6 + (z > 2.85 ? 0.3 : 0), LINTEL, 0];
  const h = z - 2.95,
    half = 1.05 * (1 - h / 1.25);
  if (h > 0 && h < 1.25 && Math.abs(y) < half) {
    if (Math.abs(y) > half - 0.08) return [gate, 0.8, TRIANGLE, 0];
    const column = Math.abs(y) < 0.08 + (h < 0.12 ? 0.08 : 0) && h < 0.85;
    const lion =
      Math.hypot((Math.abs(y) - 0.42) / 0.26, (h - 0.38) / 0.36) < 1 ||
      Math.hypot((Math.abs(y) - 0.24) / 0.12, (h - 0.78) / 0.12) < 1;
    if (column || lion) return [gate, 0.9, LIONS, 0];
    return [gate, -0.5, TRIANGLE, 0];
  }
  return [lime, cyclopean(a, z, 3), WALL, 0];
}

export const lionGate: Scene = {
  id: "liongate",
  scale: 14,
  originY: 14,
  parts: [
    "",
    "Cyclopean wall",
    "lion relief",
    "lintel",
    "relieving triangle",
    "gate jambs",
    "bastion",
    "olive tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.4, y, ix, iy, 7.8, 6.6);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (Math.abs(y + 0.0) < 0.8 + (x > 6 ? (x - 6) * 0.4 : 0) && x > 1.6)
      return tone(PATH, noise(x * 3, y * 3), ix, iy);
    if (hash(ix, iy) > 0.98) return rgb(140, 122, 96);
    return tone(EARTH, 0.4 + (noise(x * 0.8, y * 0.8) - 0.5) * 0.7, ix, iy);
  },
  build() {
    box(-1.0, -3.6, 0, 2, 3.2, 4.2, LIMESTONE, WALL, {
      sideY: wallLevel(1),
      top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.8 - 0.2,
    });
    facadeX(2.001, -3.6, 3.2, 0, 4.2, gateFace);
    box(2, -3.6, 0, 7.2, -1.9, 4.0, LIMESTONE, BASTION, {
      sideX: wallLevel(2),
      sideY: wallLevel(3),
      top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.8 - 0.2,
    });
    box(2, 1.9, 0, 6.0, 3.2, 3.2, LIMESTONE, WALL, {
      sideX: wallLevel(4),
      sideY: wallLevel(5),
      top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.8 - 0.2,
    });
    box(-4.6, -4.6, 0, -1.0, 4.2, 5.6, LIMESTONE, WALL, {
      sideX: wallLevel(6),
      sideY: wallLevel(7),
      top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.8 - 0.3,
    });
    shadowBox(-4.6, -4.6, -1.0, 4.2, 0, 5.6);
    shadowBox(-1.0, -3.6, 2, 3.2, 0, 4.2);
    shadowBox(2, -3.6, 7.2, -1.9, 0, 4.0);
    shadowBox(2, 1.9, 6.0, 3.2, 0, 3.2);
    growTree(6.2, 4.2, TREE, 0.5, 260, 13100, OLIVE);
    growTree(-1.0, -5.2, TREE, 0.44, 220, 13500, OLIVE);
  },
};
