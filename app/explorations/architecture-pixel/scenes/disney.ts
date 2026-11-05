import {
  growTree,
  hash,
  noise,
  rgb,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import { box, island, sheet, shadowBox, tone, type V3 } from "../engine/kit";

const STEEL: RGB = [214, 220, 228];
const GLASS: RGB = [58, 72, 90];
const PODIUM: RGB = [196, 170, 150];
const ROAD: RGB[] = [
  [64, 64, 72],
  [72, 72, 80],
  [80, 80, 88],
];
const PAVE: RGB[] = [
  [184, 172, 160],
  [196, 184, 172],
  [206, 194, 182],
];
const JACARANDA: RGB[] = [
  [92, 70, 128],
  [130, 104, 172],
  [168, 142, 204],
];

const SAILS = 1,
  LOBBY = 2,
  PODIUM_PART = 3,
  CORE = 4,
  TREE = 5;
const BASE = 0.8;

type Sail = {
  a: [number, number];
  b: [number, number];
  h: number;
  bulge: number;
  lean: number;
  curl: number;
};
const SAIL_LIST: Sail[] = [
  {
    a: [-4.4, -4.6],
    b: [3.6, -4.4],
    h: 8.6,
    bulge: 1.4,
    lean: -0.1,
    curl: 0.6,
  },
  { a: [-4.8, 3.8], b: [-4.4, -4.2], h: 7.4, bulge: 1.2, lean: 0.1, curl: 0.5 },
  { a: [-0.6, -3.4], b: [0.4, 3.4], h: 9.4, bulge: 1.6, lean: 0.05, curl: 0.9 },
  { a: [2.4, -4.4], b: [4.8, 1.0], h: 7.0, bulge: 1.3, lean: 0.25, curl: 0.6 },
  { a: [4.6, 0.4], b: [0.6, 5.0], h: 7.8, bulge: 1.6, lean: 0.2, curl: 0.8 },
  { a: [1.4, 5.0], b: [-4.6, 5.0], h: 6.0, bulge: 1.1, lean: 0.35, curl: 0.4 },
];

function sail(s: Sail) {
  const dx = s.b[0] - s.a[0],
    dy = s.b[1] - s.a[1],
    len = Math.hypot(dx, dy);
  let nx = dy / len,
    ny = -dx / len;
  const mx = (s.a[0] + s.b[0]) / 2,
    my = (s.a[1] + s.b[1]) / 2;
  if (nx * mx + ny * my < 0) {
    nx = -nx;
    ny = -ny;
  }
  const at = (t: number, v: number): V3 => {
    const off =
      Math.sin(Math.PI * t) * s.bulge * (1 - v * 0.3) +
      s.lean * v * s.h * 0.3 * (0.5 + t) +
      s.curl * v * v * s.h * 0.18;
    const z = BASE + v * s.h * (1 - 0.32 * (2 * t - 1) ** 2);
    return [s.a[0] + dx * t + nx * off, s.a[1] + dy * t + ny * off, z];
  };
  sheet(at, STEEL, SAILS, (u, v) =>
    u % 0.8 < 0.06 || v % 0.62 < 0.06
      ? -0.7
      : 0.5 + (noise(u * 0.4, v * 0.4) - 0.5) * 0.6,
  );
}

export const disney: Scene = {
  id: "disney",
  scale: 10,
  originY: 34,
  windowLight: [255, 214, 150],
  parts: [
    "",
    "stainless steel sails",
    "glass lobby",
    "stone podium",
    "concert hall core",
    "jacaranda tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 9.8, 9.8);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (x > 7.2 || y > 7.4) {
      if (
        (Math.abs(x - 8.4) < 0.06 && y < 7.4) ||
        (Math.abs(y - 8.6) < 0.06 && x < 7.2)
      )
        return rgb(226, 198, 80);
      if (hash(ix, iy) > 0.985) return rgb(96, 96, 104);
      return tone(ROAD, noise(x * 2, y * 2), ix, iy);
    }
    return tone(
      PAVE,
      0.3 +
        ((Math.floor(x * 1.2) + Math.floor(y * 1.2)) % 2) * 0.2 +
        (noise(x * 3, y * 3) - 0.5) * 0.3,
      ix,
      iy,
    );
  },
  build() {
    box(-6, -6, 0, 6.6, 6.4, BASE, PODIUM, PODIUM_PART, {
      sideX: (u, v) => (v % 0.2 < 0.04 ? -0.5 : 0.2),
      sideY: (u, v) => (v % 0.2 < 0.04 ? -0.5 : 0.2),
    });
    shadowBox(-6, -6, 6.6, 6.4, 0, BASE);
    box(-3.2, -3.4, BASE, 0.8, 3.6, 4.6, STEEL, CORE, {
      sideX: (u, v) => (u % 0.8 < 0.06 || v % 0.62 < 0.06 ? -0.7 : 0.3),
      sideY: (u, v) => (u % 0.8 < 0.06 || v % 0.62 < 0.06 ? -0.7 : 0.3),
    });
    shadowBox(-3.1, -3.3, 0.7, 3.5, BASE, 4.6);
    box(4.0, -0.6, BASE, 6.2, 2.4, 3.0, GLASS, LOBBY, {
      sideX: (u, v) => (u % 0.4 < 0.05 || v % 0.55 < 0.05 ? 0.8 : -0.3),
      sideY: (u, v) => (u % 0.4 < 0.05 || v % 0.55 < 0.05 ? 0.8 : -0.3),
      glowX: (u, v) =>
        u % 0.4 < 0.05 || v % 0.55 < 0.05
          ? 0
          : 1 + ((Math.floor(u / 0.4) * 31 + Math.floor(v / 0.55) * 7) % 200),
      glowY: (u, v) =>
        u % 0.4 < 0.05 || v % 0.55 < 0.05
          ? 0
          : 1 + ((Math.floor(u / 0.4) * 17 + Math.floor(v / 0.55) * 11) % 200),
    });
    for (const s of SAIL_LIST) sail(s);
    growTree(6.2, -5.4, TREE, 0.46, 240, 9100, JACARANDA);
    growTree(-5.2, 6.0, TREE, 0.5, 240, 9500, JACARANDA);
    growTree(6.0, 5.6, TREE, 0.42, 220, 9900, JACARANDA);
  },
};
