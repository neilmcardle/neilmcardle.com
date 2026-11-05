import {
  hash,
  noise,
  rgb,
  setGroundPart,
  type RGB,
  type Scene,
} from "../engine/engine";
import { grass, island, orientedBox, tone } from "../engine/kit";

const SARSEN: RGB = [178, 172, 154];
const BLUESTONE: RGB = [126, 132, 142];
const CHALK: RGB[] = [
  [204, 200, 184],
  [216, 212, 196],
  [228, 224, 208],
  [238, 234, 220],
];

const UPRIGHT = 1,
  LINTEL = 2,
  TRILITHON = 3,
  BLUE = 4,
  HEEL = 5,
  DITCH = 6,
  ALTAR = 7,
  FALLEN = 8,
  AVENUE = 9;

const RING = 4.6;
const MISSING = new Set([2, 3, 5, 7, 9, 10, 12, 13, 14, 16, 26]);
const LINTELLED = new Set([17, 18, 19, 20, 21, 22, 23, 27, 28, 29, 0]);
const SARSEN_H = 1.75;

const weathered = (seed: number) => (u: number, v: number) =>
  (noise(u * 1.6 + seed, v * 1.1) - 0.5) * 1.6 +
  (hash((u * 9) | 0, (v * 9 + seed) | 0) > 0.9 ? -0.7 : 0);

const avenueDistance = (x: number, y: number) => {
  const along = (x + y) / Math.SQRT2,
    across = (x - y) / Math.SQRT2;
  return { along, across };
};

export const stonehenge: Scene = {
  id: "stonehenge",
  scale: 13,
  originY: 22,
  parts: [
    "",
    "sarsen upright",
    "lintel",
    "trilithon",
    "bluestone",
    "heel stone",
    "henge ditch and bank",
    "altar stone",
    "fallen sarsen",
    "the avenue",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 9.8, 9.4);
    if (edge < 0) return 0;
    const r = Math.hypot(x, y) + (noise(x * 0.7, y * 0.7) - 0.5) * 0.5;
    const { along, across } = avenueDistance(x, y);
    if (r > 7.2 && r < 7.9) {
      setGroundPart(i, DITCH);
      return grass(x, y, ix, iy, i, -0.35);
    }
    if (r > 7.9 && r < 8.6) {
      setGroundPart(i, DITCH);
      return grass(x, y, ix, iy, i, 0.35);
    }
    if (along > 8.4 && Math.abs(Math.abs(across) - 1.3) < 0.28) {
      setGroundPart(i, AVENUE);
      return grass(x, y, ix, iy, i, 0.4);
    }
    if (r < 5.2 && noise(x * 2.4, y * 2.4) > 0.8)
      return tone(CHALK, noise(x * 3, y * 3), ix, iy);
    if (hash(ix, iy) > 0.985) return rgb(236, 232, 214);
    return grass(x, y, ix, iy, i);
  },
  build() {
    const stones: { a: number; k: number }[] = [];
    for (let k = 0; k < 30; k++) {
      if (MISSING.has(k)) continue;
      const a = (k / 30) * Math.PI * 2 + 0.05;
      stones.push({ a, k });
      const lean = (hash(k, 3) - 0.5) * 0.12;
      orientedBox(
        Math.cos(a) * RING,
        Math.sin(a) * RING,
        0.31,
        0.24,
        0,
        SARSEN_H - hash(k, 5) * 0.15,
        a + Math.PI / 2 + lean,
        SARSEN,
        UPRIGHT,
        { taper: 0.12, level: weathered(k) },
      );
    }
    for (let k = 0; k < 30; k++) {
      const next = (k + 1) % 30;
      if (!LINTELLED.has(k) || MISSING.has(k) || MISSING.has(next)) continue;
      const a = ((k + 0.5) / 30) * Math.PI * 2 + 0.05;
      orientedBox(
        Math.cos(a) * RING,
        Math.sin(a) * RING,
        0.5,
        0.22,
        SARSEN_H - 0.02,
        SARSEN_H + 0.32,
        a + Math.PI / 2,
        SARSEN,
        LINTEL,
        { level: weathered(k + 40) },
      );
    }
    const horseshoe = [
      { a: 2.2, h: 2.2, lintel: true },
      { a: 3.0, h: 2.5, lintel: true },
      { a: 3.93, h: 2.9, lintel: false },
      { a: 4.85, h: 2.5, lintel: true },
      { a: 5.66, h: 2.2, lintel: false },
    ];
    horseshoe.forEach(({ a, h, lintel }, n) => {
      const cx = Math.cos(a) * 2.5,
        cy = Math.sin(a) * 2.5,
        t = a + Math.PI / 2;
      for (const side of [-1, 1]) {
        const ox = Math.cos(t) * 0.42 * side,
          oy = Math.sin(t) * 0.42 * side;
        const tall = n === 2 && side > 0 ? h : n === 2 ? h * 0.55 : h;
        orientedBox(
          cx + ox,
          cy + oy,
          0.3,
          0.26,
          0,
          tall,
          t,
          SARSEN,
          TRILITHON,
          { taper: 0.1, level: weathered(n * 7 + side) },
        );
      }
      if (lintel)
        orientedBox(cx, cy, 0.78, 0.25, h - 0.02, h + 0.34, t, SARSEN, LINTEL, {
          level: weathered(n + 70),
        });
    });
    orientedBox(1.9, 2.3, 0.85, 0.28, 0, 0.42, 0.4, SARSEN, FALLEN, {
      level: weathered(90),
    });
    orientedBox(-0.4, -0.2, 0.7, 0.2, 0, 0.16, 2.4, [150, 132, 118], ALTAR, {
      level: weathered(91),
    });
    for (let k = 0; k < 40; k++) {
      if (hash(k, 11) < 0.4) continue;
      const a = (k / 40) * Math.PI * 2;
      const r = 3.75 + (hash(k, 12) - 0.5) * 0.15;
      orientedBox(
        Math.cos(a) * r,
        Math.sin(a) * r,
        0.13,
        0.11,
        0,
        0.6 + hash(k, 13) * 0.35,
        a + Math.PI / 2,
        BLUESTONE,
        BLUE,
        { taper: 0.25, level: weathered(k + 100) },
      );
    }
    for (let k = 0; k < 12; k++) {
      if (hash(k, 14) < 0.3) continue;
      const a = 2.2 + (k / 11) * 3.46;
      orientedBox(
        Math.cos(a) * 1.5,
        Math.sin(a) * 1.5,
        0.12,
        0.1,
        0,
        0.8 + hash(k, 15) * 0.4,
        a,
        BLUESTONE,
        BLUE,
        { taper: 0.3, level: weathered(k + 140) },
      );
    }
    orientedBox(6.9, 6.7, 0.34, 0.3, 0, 1.6, 0.3, SARSEN, HEEL, {
      taper: 0.3,
      level: weathered(160),
    });
  },
};
