import {
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
  cone,
  facadeX,
  facadeY,
  gableY,
  island,
  pyramid,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const STONE: RGB = [206, 184, 140];
const SLATE: RGB = [80, 86, 98];
const GOLD: RGB = [222, 184, 86];
const FACE: RGB = [232, 226, 206];
const GLASS: RGB = [54, 60, 70];
const RIVER: RGB[] = [
  [44, 72, 78],
  [56, 88, 92],
  [72, 104, 104],
];
const TERRACE_TONES: RGB[] = [
  [180, 170, 150],
  [192, 182, 162],
];

const ELIZABETH = 1,
  CLOCK = 2,
  VICTORIA = 3,
  TRACERY = 4,
  PINNACLES = 5,
  THAMES = 6,
  SPIRE = 7;

const stone = rampId(STONE),
  glass = rampId(GLASS),
  face = rampId(FACE),
  slate = rampId(SLATE);

function panelled(part: number, seed: number) {
  return (a: number, z: number): Cell => {
    const fa = a % 0.42,
      fz = z % 1.25;
    if (fa < 0.06) return [stone, 0.8, part, 0];
    if (fz < 0.08) return [stone, 0.6, part, 0];
    if (fa > 0.12 && fa < 0.36 && fz > 0.25 && fz < 1.0 && z < 4.8)
      return [
        glass,
        (fz * 10) % 1 < 0.15 ? 0.5 : -0.2,
        part,
        windowId(Math.floor(a / 0.42), Math.floor(z / 1.25), seed),
      ];
    return [stone, (noise(a * 3, z * 3) - 0.5) * 0.5 - 0.1, part, 0];
  };
}

function clockFace(a: number, z: number, ca: number): Cell | null {
  const d = Math.hypot(a - ca, z - 10.6);
  if (d > 0.62) return null;
  if (d > 0.54) return [rampId(GOLD), 0.8, CLOCK, 0];
  const hand =
    (Math.abs(a - ca) < 0.035 && z > 10.6 && z < 10.98) ||
    (Math.abs(z - 10.6) < 0.035 && a < ca && a > ca - 0.28);
  if (hand) return [slate, -1.8, CLOCK, 0];
  return [face, 1.0, CLOCK, 9];
}

function elizabeth(x0: number, y0: number, x1: number, y1: number) {
  const top = 12.4;
  box(x0, y0, 0, x1, y1, top, STONE, ELIZABETH);
  const fn =
    (ca: number) =>
    (a: number, z: number): Cell => {
      const c = z > 9.9 && z < 11.3 ? clockFace(a, z, ca) : null;
      if (c) return c;
      if (z > 11.4)
        return [rampId(GOLD), (a * 6) % 1 < 0.3 ? 0.8 : -0.8, ELIZABETH, 0];
      return panelled(ELIZABETH, 2)(a + 0.1, z * 1.7);
    };
  facadeX(x1 + 0.001, y0, y1, 0, top, fn((y1 - y0) / 2));
  facadeY(y1 + 0.001, x0, x1, 0, top, fn((x1 - x0) / 2));
  shadowBox(x0, y0, x1, y1, 0, top);
  pyramid(
    (x0 + x1) / 2,
    (y0 + y1) / 2,
    (x1 - x0) / 2 + 0.05,
    top,
    3.4,
    SLATE,
    ELIZABETH,
    (a, t) => (Math.floor(t * 14) % 3 === 0 ? 1.2 : 0),
  );
  for (const [px, py] of [
    [x1, y0],
    [x1, y1],
    [x0, y1],
  ] as const)
    pyramid(px, py, 0.16, top, 1.2, GOLD, PINNACLES);
  sphere(
    (x0 + x1) / 2,
    (y0 + y1) / 2,
    top + 3.5,
    0.1,
    GOLD,
    ELIZABETH,
    "solid",
  );
}

export const parliament: Scene = {
  id: "parliament",
  scale: 7.5,
  originY: 44,
  windowLight: [255, 200, 118],
  parts: [
    "",
    "Elizabeth Tower",
    "clock face",
    "Victoria Tower",
    "Perpendicular panels",
    "pinnacles",
    "River Thames",
    "central spire",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.2, y + 0.6, ix, iy, 9.6, 11.2);
    if (edge < 0) return 0;
    if (x > 4.4) {
      setGroundPart(i, THAMES);
      return tone(RIVER, 0.4 + (noise(x * 0.8, y * 0.3) - 0.5) * 0.8, ix, iy);
    }
    setKind(i, 1);
    if (hash(ix, iy) > 0.985) return rgb(150, 140, 124);
    return tone(TERRACE_TONES, noise(x * 3, y * 3), ix, iy);
  },
  build() {
    box(-2.4, -7.2, 0, 3.4, 7.0, 5.0, STONE, TRACERY);
    facadeX(3.401, -7.2, 7.0, 0, 5.0, panelled(TRACERY, 1));
    shadowBox(-2.4, -7.2, 3.4, 7.0, 0, 5.0);
    gableY(-7.2, 7.0, -2.5, 3.5, 5.0, 1.8, SLATE, TRACERY);
    for (let y = -7.0; y <= 7.0; y += 0.84)
      pyramid(3.3, y, 0.12, 5.0, 0.8, STONE, PINNACLES);
    for (let x = -2.2; x <= 3.2; x += 0.84)
      pyramid(x, 6.9, 0.12, 5.0, 0.8, STONE, PINNACLES);
    elizabeth(1.4, -9.4, 3.2, -7.6);
    box(-1.6, 7.0, 0, 1.6, 10.2, 13.6, STONE, VICTORIA);
    facadeX(1.601, 7.0, 10.2, 0, 13.6, panelled(VICTORIA, 3));
    facadeY(10.201, -1.6, 1.6, 0, 13.6, panelled(VICTORIA, 4));
    shadowBox(-1.6, 7.0, 1.6, 10.2, 0, 13.6);
    for (const [px, py] of [
      [1.5, 7.1],
      [1.5, 10.1],
      [-1.5, 10.1],
    ] as const) {
      box(
        px - 0.22,
        py - 0.22,
        13.6,
        px + 0.22,
        py + 0.22,
        14.6,
        STONE,
        PINNACLES,
      );
      pyramid(px, py, 0.22, 14.6, 0.9, GOLD, PINNACLES);
    }
    box(-0.5, -1.7, 5.0, 0.7, -0.5, 7.8, STONE, SPIRE, {
      sideX: (u) => (u % 0.3 < 0.08 ? 0.8 : -0.4),
      sideY: (u) => (u % 0.3 < 0.08 ? 0.8 : -0.4),
    });
    cone(0.1, -1.1, 0.75, 7.8, 3.0, STONE, SPIRE, (a, t) =>
      Math.floor(t * 12) % 2 ? 0.4 : -0.2,
    );
  },
};
