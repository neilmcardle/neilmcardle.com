import {
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
  cone,
  cylinder,
  facadeX,
  facadeY,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const STONE: RGB = [226, 214, 190];
const GLASS: RGB = [56, 64, 74];
const GRAVEL: RGB[] = [
  [204, 196, 176],
  [214, 206, 186],
  [224, 216, 196],
];
const TOPIARY: RGB = [44, 80, 50];

const COLUMNS = 1,
  BALUSTRADE = 2,
  FRONT = 3,
  WINDOWS = 4,
  TERRACE = 5,
  TOPIARY_PART = 6;

const stone = rampId(STONE),
  glass = rampId(GLASS);
const HALF = 2.6,
  TOP = 4.6,
  PITCH = (HALF * 2) / 5;

function face(seed: number, pilasters: boolean) {
  return (a: number, z: number): Cell => {
    if (z > TOP - 0.42)
      return [
        stone,
        z > TOP - 0.12 ? 0.9 : z > TOP - 0.3 ? 0.2 : 0.7,
        FRONT,
        0,
      ];
    if (z < 0.9) return [stone, z % 0.3 < 0.05 ? -0.6 : 0.1, FRONT, 0];
    if (Math.abs(z - 2.6) < 0.06) return [stone, 0.8, FRONT, 0];
    const bay = Math.floor(a / PITCH),
      fa = a % PITCH;
    if (pilasters && bay >= 1 && bay <= 4 && fa < 0.16)
      return [stone, 0.9 - (z > TOP - 0.7 ? 0 : 0.1), COLUMNS, 0];
    if (fa > 0.3 && fa < PITCH - 0.3) {
      if (z > 1.1 && z < 2.45)
        return (fa - 0.3) % 0.15 < 0.03 || (z * 4) % 1 < 0.08
          ? [stone, 0.7, WINDOWS, 0]
          : [glass, -0.2, WINDOWS, windowId(bay, 1, seed)];
      if (z > 2.9 && z < 3.9)
        return (fa - 0.3) % 0.15 < 0.03 || (z * 4) % 1 < 0.08
          ? [stone, 0.7, WINDOWS, 0]
          : [glass, -0.2, WINDOWS, windowId(bay, 2, seed)];
    }
    return [
      stone,
      (noise(a * 2, z * 2) - 0.5) * 0.3 +
        (Math.floor(z / 0.3) % 2 ? 0.05 : -0.05),
      FRONT,
      0,
    ];
  };
}

function balustrade(a: number, z: number): Cell | null {
  if (z < 0.08 || z > 0.42) return [stone, 0.8, BALUSTRADE, 0];
  return a % 0.16 < 0.09
    ? [stone, 0.5 + Math.sin((z - 0.08) * 18) * 0.3, BALUSTRADE, 0]
    : null;
}

export const neoclassical: Scene = {
  id: "neoclassical",
  scale: 13,
  originY: 18,
  windowLight: [255, 212, 140],
  parts: [
    "",
    "Corinthian columns",
    "balustrade",
    "flat front",
    "tall windows",
    "terrace steps",
    "clipped topiary",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.4, y, ix, iy, 7.6, 7.0);
    if (edge < 0) return 0;
    if (
      (x > 4.8 && Math.abs(y) < 1.3) ||
      (x > 4.8 && Math.abs(Math.abs(y) - 3.4) < 0.4)
    ) {
      setKind(i, 1);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(236, 230, 210);
    return grass(x, y, ix, iy, i, 0.3);
  },
  build() {
    box(-HALF, -HALF, 0, HALF, HALF, TOP, STONE, FRONT);
    facadeX(HALF + 0.001, -HALF, HALF, 0, TOP, face(1, false));
    facadeY(HALF + 0.001, -HALF, HALF, 0, TOP, face(2, true));
    shadowBox(-HALF, -HALF, HALF, HALF, 0, TOP);
    facadeX(HALF + 0.05, -HALF, HALF, TOP, TOP + 0.5, balustrade);
    facadeY(HALF + 0.05, -HALF, HALF, TOP, TOP + 0.5, balustrade);
    box(HALF, -HALF, 0, 4.0, HALF, 0.9, STONE, TERRACE, {
      sideX: (u, v) => (v > 0.8 ? 0.8 : v % 0.3 < 0.05 ? -0.5 : 0.1),
      top: (u, v) => ((Math.floor(u * 2) + Math.floor(v * 2)) % 2 ? 0.3 : -0.1),
    });
    for (let k = 0; k < 4; k++)
      box(
        4.0 + k * 0.25,
        -1.3,
        0,
        4.25 + k * 0.25,
        1.3,
        0.9 - (k + 1) * 0.22,
        STONE,
        TERRACE,
        { top: () => 0.5 },
      );
    shadowBox(HALF, -HALF, 4.0, HALF, 0, 0.9);
    for (const y of [-1.56, -0.52, 0.52, 1.56]) {
      cylinder(3.05, y, 0.17, 0.15, 0.9, 4.0, STONE, COLUMNS, {
        level: (a, t) => Math.cos(a * 14) * 0.35 - t * 0.1,
        top: false,
      });
      box(2.83, y - 0.24, 4.0, 3.27, y + 0.24, 4.22, STONE, COLUMNS, {
        sideX: (u) => (Math.sin(u * 30) > 0 ? 0.9 : 0.1),
        sideY: (u) => (Math.sin(u * 30) > 0 ? 0.9 : 0.1),
      });
    }
    box(HALF, -1.9, 4.22, 3.35, 1.9, TOP, STONE, COLUMNS, {
      sideX: (u, v) => (v > 0.26 ? 0.8 : 0.3),
    });
    shadowBox(HALF, -1.9, 3.35, 1.9, 4.22, TOP);
    for (const [x, y] of [
      [5.6, -2.2],
      [5.6, 2.2],
      [7.0, -2.2],
      [7.0, 2.2],
      [-4.2, 4.0],
      [3.8, 4.4],
    ] as const) {
      cylinder(x, y, 0.12, 0.12, 0, 0.3, [176, 130, 96], TOPIARY_PART, {
        top: false,
      });
      cone(
        x,
        y,
        0.42,
        0.3,
        1.5,
        TOPIARY,
        TOPIARY_PART,
        (a, t) => (noise(a * 4, t * 6) - 0.5) * 1.2,
      );
    }
  },
};
