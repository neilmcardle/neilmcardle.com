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
  dome,
  facadeX,
  gableY,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const BRICK: RGB = [168, 80, 60];
const STONE: RGB = [214, 200, 172];
const LEAD: RGB = [96, 104, 116];
const GLASS: RGB = [50, 58, 68];
const YEW: RGB = [36, 60, 42];
const GRAVEL: RGB[] = [
  [196, 188, 168],
  [208, 200, 180],
  [218, 210, 190],
];

const GABLE = 1,
  TURRET = 2,
  CUPOLA = 3,
  BRICKP = 4,
  WINDOWS = 5,
  HEDGE = 6,
  ROOF = 7;

const brick = rampId(BRICK),
  stone = rampId(STONE),
  glass = rampId(GLASS);
const LEN = 9.2,
  EAVE = 5.0;

function gableWidth(h: number) {
  if (h < 0.5) return 0.95;
  if (h < 0.75) return 0.95 - (h - 0.5) * 1.4 + Math.sin((h - 0.5) * 12) * 0.08;
  if (h < 1.4)
    return 0.58 + Math.cos((h - 0.75) * 4.8) * 0.12 - (h - 0.75) * 0.25;
  if (h < 1.9) return 0.32 - (h - 1.4) * 0.3;
  return -1;
}

function front(a: number, z: number): Cell | null {
  if (z > EAVE) {
    for (const c of [1.6, LEN / 2, LEN - 1.6]) {
      const h = z - EAVE,
        w = gableWidth(h) * (c === LEN / 2 ? 1.15 : 1);
      if (w > 0 && Math.abs(a - c) < w) {
        if (Math.abs(a - c) > w - 0.1) return [stone, 0.8, GABLE, 0];
        if (Math.abs(a - c) < 0.22 && h > 0.25 && h < 0.85)
          return [
            glass,
            (a * 12) % 1 < 0.2 ? 0.8 : -0.2,
            WINDOWS,
            windowId(Math.floor(c), 9, 3),
          ];
        return [brick, (z * 7) % 1 < 0.15 ? -0.6 : 0.1, GABLE, 0];
      }
    }
    return null;
  }
  if (z < 0.4) return [stone, 0.3, BRICKP, 0];
  if (Math.abs(z - 2.5) < 0.08 || z > EAVE - 0.12)
    return [stone, 0.8, BRICKP, 0];
  const bay = Math.floor(a / 1.15),
    fa = a % 1.15;
  if (fa > 0.25 && fa < 0.9 && ((z > 0.8 && z < 2.2) || (z > 3.0 && z < 4.6))) {
    if (
      Math.abs(fa - 0.575) < 0.04 ||
      Math.abs(z - (z < 2.5 ? 1.6 : 3.9)) < 0.04 ||
      fa < 0.31 ||
      fa > 0.84
    )
      return [stone, 0.7, WINDOWS, 0];
    return [
      glass,
      (Math.floor(fa * 14) + Math.floor(z * 14)) % 2 ? 0.2 : -0.3,
      WINDOWS,
      windowId(bay, z < 2.5 ? 1 : 2, 4),
    ];
  }
  if (Math.abs(a - LEN / 2) < 0.55 && z < 2.1)
    return [rampId([60, 44, 36]), z % 0.4 < 0.05 ? -0.4 : 0.2, BRICKP, 0];
  return [
    brick,
    ((z * 7) % 1 < 0.15 ? -0.6 : 0.1) +
      (hash(Math.floor(a * 4 + Math.floor(z * 7) * 0.5), Math.floor(z * 7)) -
        0.5) *
        0.5,
    BRICKP,
    0,
  ];
}

function turret(x: number, y: number) {
  box(x - 0.6, y - 0.6, 0, x + 0.6, y + 0.6, 6.4, BRICK, TURRET, {
    sideX: (u, v) =>
      Math.abs(u - 0.6) < 0.18 && v > 3.4 && v < 4.4
        ? -2
        : (v * 7) % 1 < 0.15
          ? -0.6
          : 0.1,
    sideY: (u, v) =>
      Math.abs(u - 0.6) < 0.18 && v > 3.4 && v < 4.4
        ? -2
        : (v * 7) % 1 < 0.15
          ? -0.6
          : 0.1,
    glowX: (u, v) =>
      Math.abs(u - 0.6) < 0.18 && v > 3.4 && v < 4.4 ? windowId(x, y, 7) : 0,
  });
  shadowBox(x - 0.6, y - 0.6, x + 0.6, y + 0.6, 0, 6.4);
  dome(x, y, 6.4, 0.62, LEAD, TURRET, { zScale: 0.9 });
  cone(x, y, 0.28, 6.9, 0.9, LEAD, TURRET);
}

export const jacobean: Scene = {
  id: "jacobean",
  scale: 10,
  originY: 22,
  windowLight: [255, 200, 116],
  parts: [
    "",
    "Dutch gable",
    "corner turret",
    "clock cupola",
    "red brick",
    "mullioned windows",
    "yew hedge",
    "lead roof",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 2.6, y, ix, iy, 9.6, 8.4);
    if (edge < 0) return 0;
    if (x > 2.2 && Math.abs(y) < 1.4) {
      setKind(i, 1);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(232, 226, 206);
    return grass(x, y, ix, iy, i, 0.25);
  },
  build() {
    box(-2, -LEN / 2, 0, 2, LEN / 2, EAVE, BRICK, BRICKP, {
      sideY: (u, v) => ((v * 7) % 1 < 0.15 ? -0.6 : 0.1),
    });
    facadeX(2.001, -LEN / 2, LEN / 2, 0, EAVE + 2.2, front);
    shadowBox(-2, -LEN / 2, 2, LEN / 2, 0, EAVE + 1.4);
    gableY(-LEN / 2, LEN / 2, -2.1, 2.1, EAVE, 2.0, LEAD, ROOF);
    turret(2.0, -LEN / 2);
    turret(2.0, LEN / 2);
    turret(-2.0, LEN / 2);
    box(-0.5, -0.5, EAVE + 1.8, 0.5, 0.5, EAVE + 2.8, STONE, CUPOLA, {
      sideX: (u, v) =>
        Math.hypot(u - 0.5, v - 0.55) < 0.28
          ? Math.hypot(u - 0.5, v - 0.55) < 0.22
            ? 1.2
            : -1.2
          : 0.3,
      sideY: (u, v) =>
        Math.hypot(u - 0.5, v - 0.55) < 0.28
          ? Math.hypot(u - 0.5, v - 0.55) < 0.22
            ? 1.2
            : -1.2
          : 0.3,
    });
    dome(0, 0, EAVE + 2.8, 0.55, LEAD, CUPOLA, { zScale: 1.1 });
    cone(0, 0, 0.12, EAVE + 3.4, 0.8, LEAD, CUPOLA);
    for (const s of [-1, 1]) {
      const y0 = s > 0 ? 5.6 : -7.0,
        y1 = y0 + 1.4;
      box(2.6, y0, 0, 9.0, y1, 1.7, YEW, HEDGE, {
        top: (u, v) => (noise(u * 3, v * 3) - 0.5) * 1.2,
        sideX: (u, v) => (noise(u * 4, v * 4) - 0.5) * 1.2,
        sideY: (u, v) => (noise(u * 4, v * 4) - 0.5) * 1.2,
      });
      shadowBox(2.6, y0, 9.0, y1, 0, 1.7);
    }
  },
};
