import {
  clip,
  growTree,
  hash,
  noise,
  rampId,
  rgb,
  setKind,
  step,
  surf,
  TOP,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  facadeX,
  island,
  orientedBox,
  shadowBox,
  tone,
  type Cell,
  type Level,
} from "../engine/kit";

const CONCRETE: RGB = [184, 182, 176];
const TIMBER: RGB = [74, 58, 46];
const LIGHT: RGB = [255, 244, 214];
const FLOOR: RGB = [46, 44, 44];
const PAVE: RGB[] = [
  [170, 168, 162],
  [182, 180, 174],
  [192, 190, 184],
];
const GRAVEL: RGB[] = [
  [150, 146, 138],
  [164, 160, 152],
];
const MAPLE: RGB[] = [
  [70, 90, 50],
  [116, 128, 60],
  [168, 150, 70],
];

const CONCRETE_PART = 1,
  CROSS = 2,
  WALL = 3,
  PEWS = 4,
  FLOOR_LIGHT = 5,
  TREE = 6;

const concrete = rampId(CONCRETE),
  light = rampId(LIGHT),
  floor = rampId(FLOOR);
const L = 3,
  HW = 1.5,
  H = 4.5;

const ties: Level = (u, v) => {
  const pu = u % 0.9,
    pv = v % 0.6;
  if (pu < 0.035 || pv < 0.035) return -0.5;
  const hole =
    (Math.abs(pu - 0.22) < 0.035 || Math.abs(pu - 0.68) < 0.035) &&
    (Math.abs(pv - 0.15) < 0.035 || Math.abs(pv - 0.45) < 0.035);
  return hole ? -1.7 : 0.45 + (noise(u * 0.6, v * 0.6) - 0.5) * 0.3;
};

function crossFace(a: number, z: number): Cell {
  const c = a - HW;
  const slot =
    (Math.abs(c) < 0.07 && z > 0.3 && z < 4.2) ||
    (Math.abs(z - 2.7) < 0.07 && Math.abs(c) < 1.42);
  if (slot) return [rampId(CONCRETE), -2.7, CROSS, 44];
  return [concrete, ties(a, z), CONCRETE_PART, 0];
}

const floorZ = (x: number) =>
  0.6 - Math.min(7, Math.floor((x + L) / 0.55)) * 0.075;

function interior() {
  box(-L, -HW, 0, L, -HW + 0.25, H, CONCRETE, CONCRETE_PART, { sideY: ties });
  box(-L, -HW + 0.25, 0, -L + 0.25, 0, H, CONCRETE, CONCRETE_PART, {
    sideX: ties,
  });
  box(L - 0.25, -HW + 0.25, 0, L, 0, H, CONCRETE, CONCRETE_PART, {
    sideX: ties,
  });
  facadeX(L + 0.001, -HW, 0, 0, H, crossFace);
  shadowBox(-L, -HW, L, -HW + 0.25, 0, H);
  const st = step();
  for (let x = -L + 0.25; x < L - 0.25; x += st)
    for (let y = -HW + 0.25; y < 0; y += st) {
      const z = floorZ(x);
      const beam =
        (Math.abs(y) < 0.3 && x > 0.2) ||
        (Math.abs(x - 1.9) < 0.18 && y > -1.2);
      surf(
        x,
        y,
        z,
        beam ? light : floor,
        beam ? 1.4 : hash(Math.floor(x * 9), 1) > 0.5 ? 0.2 : -0.2,
        TOP,
        beam ? FLOOR_LIGHT : PEWS,
        beam ? 61 : 0,
      );
      if ((x + L) % 0.55 < st)
        for (let h = 0; h < 0.08; h += st)
          surf(x, y, z - h, floor, -0.6, 1, PEWS);
    }
  for (let k = 0; k < 6; k++) {
    const x = -L + 0.5 + k * 0.55,
      z = floorZ(x + 0.05);
    box(x, -HW + 0.4, z, x + 0.34, -0.38, z + 0.24, TIMBER, PEWS, {
      top: (u) => (u % 0.1 < 0.03 ? -0.5 : 0.3),
      sideX: () => -0.2,
    });
  }
}

export const churchOfLight: Scene = {
  id: "churchoflight",
  scale: 14,
  originY: 18,
  windowLight: [255, 236, 190],
  parts: [
    "",
    "fair-faced concrete",
    "cross of light",
    "slicing wall",
    "timber pews",
    "light on the floor",
    "maple tree",
  ],
  cutaway: { inside: [PEWS, FLOOR_LIGHT], removes: [] },
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 7.0, 6.0);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (Math.abs(y) < 2.4 && x > -4.6 && x < 4.4) {
      const slab = (Math.floor(x / 0.9) + Math.floor(y / 0.6)) % 2;
      return tone(
        PAVE,
        0.3 + slab * 0.15 + (noise(x * 3, y * 3) - 0.5) * 0.2,
        ix,
        iy,
      );
    }
    if (hash(ix, iy) > 0.985) return rgb(200, 196, 186);
    return tone(GRAVEL, noise(x * 5, y * 5), ix, iy);
  },
  build(cut) {
    if (cut) {
      clip((_x, y) => y > 0.02);
      interior();
    } else {
      box(-L, -HW, 0, L, HW, H, CONCRETE, CONCRETE_PART, {
        sideX: ties,
        sideY: ties,
        top: (u, v) => (noise(u, v) - 0.5) * 0.4,
      });
      facadeX(L + 0.001, -HW, HW, 0, H, crossFace);
      shadowBox(-L, -HW, L, HW, 0, H);
    }
    orientedBox(-1.7, 0.6, 3.5, 0.12, 0, H, 0.26, CONCRETE, WALL, {
      level: ties,
    });
    if (cut) clip(null);
    growTree(4.8, 3.2, TREE, 0.42, 200, 12100, MAPLE);
    growTree(-4.6, -3.6, TREE, 0.4, 200, 12500, MAPLE);
  },
};
