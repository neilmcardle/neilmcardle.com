import {
  capsule,
  caster,
  hash,
  noise,
  normalOf,
  PX,
  PY,
  rampId,
  rgb,
  setKind,
  step,
  surf,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  gableY,
  island,
  pointed,
  pyramid,
  shadowBox,
  tone,
  windowId,
} from "../engine/kit";

const BRICK: RGB = [170, 74, 56];
const BAND: RGB = [224, 208, 172];
const SLATE: RGB = [88, 92, 106];
const GLASS: RGB = [46, 54, 72];
const IRON: RGB = [104, 146, 184];
const SKYLIGHT: RGB = [150, 170, 186];
const CAB_BODY: RGB = [44, 64, 52];
const HORSE: RGB = [96, 68, 48];
const ROAD: RGB[] = [
  [64, 64, 72],
  [72, 72, 80],
  [80, 80, 88],
];
const PAVE: RGB[] = [
  [176, 172, 164],
  [188, 184, 176],
  [198, 194, 186],
];

const TOWER = 1,
  CLOCK = 2,
  BRICKWORK = 3,
  WINDOW = 4,
  ROOF = 5,
  DORMER = 6,
  SHED = 7,
  BUS_PART = 8,
  HORSE_PART = 9;

const HX0 = 1,
  HX1 = 3.2,
  HY0 = -7.4,
  HY1 = 0.8,
  WALL = 6.2;
const SY0 = 1.2,
  SY1 = 9.4,
  SX0 = -9,
  SX1 = 1.6;
const SC = (SY0 + SY1) / 2,
  SH = (SY1 - SY0) / 2;
const shedZ = (y: number) =>
  1.8 +
  5.6 * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(y - SC) / SH, 1.7)), 0.6);

const brick = rampId(BRICK),
  band = rampId(BAND),
  glass = rampId(GLASS),
  iron = rampId(IRON),
  sky = rampId(SKYLIGHT);

type Cell = [number, number, number, number];

function hotelFace(a: number, z: number, seed: number): Cell {
  const floor = Math.floor((z - 0.4) / 1.15),
    fz = (z - 0.4) % 1.15;
  if (z < 0.4) return [band, 0.2, BRICKWORK, 0];
  if (fz < 0.1 || (fz > 0.62 && fz < 0.7)) return [band, 0.5, BRICKWORK, 0];
  const bay = 0.95,
    k = Math.floor(a / bay),
    c = k * bay + bay / 2;
  if (floor === 0 && k % 3 === 1 && pointed(a, z, c, 0.36, 0.95, 1.4))
    return [brick, -2.6, BRICKWORK, 0];
  for (const o of [-0.15, 0.15]) {
    if (pointed(a, fz, c + o, 0.1, 0.5, 0.62) && fz > 0.18)
      return [
        glass,
        -0.3,
        WINDOW,
        windowId(k * 2 + (o > 0 ? 1 : 0), floor, seed),
      ];
    if (pointed(a, fz, c + o, 0.15, 0.5, 0.66) && fz > 0.15)
      return [band, 0.6, WINDOW, 0];
  }
  return [
    brick,
    (hash(Math.floor(a * 9), Math.floor(z * 14)) - 0.5) * 0.8,
    BRICKWORK,
    0,
  ];
}

function paint(
  x: number | null,
  y: number | null,
  a0: number,
  a1: number,
  z0: number,
  z1: number,
  fn: (a: number, z: number) => Cell | null,
) {
  const st = step();
  for (let a = a0; a <= a1; a += st)
    for (let z = z0; z <= z1; z += st) {
      const c = fn(a, z);
      if (!c) continue;
      if (x !== null) surf(x, a, z, c[0], c[1], PX, c[2], c[3]);
      else if (y !== null) surf(a, y, z, c[0], c[1], PY, c[2], c[3]);
    }
}

function clockFace(a: number, z: number, ca: number, cz: number): Cell | null {
  const d = Math.hypot(a - ca, z - cz);
  if (d > 0.62) return null;
  if (d > 0.52) return [band, 0.9, CLOCK, 0];
  const ang = Math.atan2(z - cz, a - ca);
  const hand =
    (Math.abs(a - ca) < 0.04 && z > cz && z < cz + 0.4) ||
    (Math.abs(z - cz) < 0.04 && a > ca && a < ca + 0.3);
  if (hand) return [rampId(SLATE), -1.6, CLOCK, 0];
  const tick = d > 0.42 && ((ang / (Math.PI * 2)) * 12 + 12.5) % 1 < 0.2;
  return [band, tick ? -1 : 1.1, CLOCK, 9];
}

function towerFace(a: number, z: number, ca: number): Cell {
  const c = clockFace(a, z, ca, 8.9);
  if (c) return c;
  if (z > 9.8 && pointed(a, z, ca - 0.42, 0.2, 10.2, 10.45))
    return [brick, -2.4, TOWER, 0];
  if (z > 9.8 && pointed(a, z, ca + 0.42, 0.2, 10.2, 10.45))
    return [brick, -2.4, TOWER, 0];
  const f = hotelFace(a + 0.3, Math.min(z, 7.6), 2);
  return [f[0], f[1], TOWER, f[3]];
}

export const stPancras: Scene = {
  id: "stpancras",
  scale: 8,
  originY: 36,
  windowLight: [255, 200, 120],
  parts: [
    "",
    "clock tower",
    "station clock",
    "polychrome brick",
    "pointed window",
    "slate roof",
    "dormer",
    "iron and glass shed",
    "hansom cab",
    "cab horse",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x + 1.6, y, ix, iy, 9.8, 10.8);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (x > 3.4 && x < 4.6) return tone(PAVE, noise(x * 3, y * 3), ix, iy);
    if (x >= 4.6) {
      if (Math.abs(x - 6.6) < 0.06 && Math.floor(y * 0.8) % 2 === 0)
        return rgb(230, 228, 218);
      if (hash(ix, iy) > 0.985) return rgb(96, 96, 102);
      return tone(ROAD, noise(x * 2, y * 2), ix, iy);
    }
    return tone(PAVE, 0.2 + noise(x * 2, y * 2) * 0.5, ix, iy);
  },
  build() {
    box(HX0, HY0, 0, HX1, HY1, WALL, BRICK, BRICKWORK, { top: () => -0.4 });
    paint(HX1 + 0.001, null, HY0, HY1, 0, WALL, (a, z) =>
      hotelFace(a - HY0, z, 1),
    );
    paint(null, HY1 + 0.001, HX0, HX1, 0, WALL, (a, z) =>
      hotelFace(a - HX0 + 0.2, z, 4),
    );
    shadowBox(HX0, HY0, HX1, HY1, 0, WALL);
    gableY(HY0, HY1, HX0 - 0.1, HX1 + 0.1, WALL, 2.3, SLATE, ROOF, {
      color: BRICK,
      part: BRICKWORK,
      level: (a, h) => (Math.floor(h * 3) % 3 === 0 ? 0.6 : 0),
    });
    for (let k = 0; k < 7; k++) {
      const y = HY0 + 0.8 + k * 1.15;
      box(
        2.45,
        y - 0.24,
        WALL + 0.5,
        2.85,
        y + 0.24,
        WALL + 1.25,
        BAND,
        DORMER,
        {
          sideX: (u, v) =>
            Math.abs(u - 0.24) < 0.12 && v > 0.12 && v < 0.6 ? -2.2 : 0.4,
          glowX: (u, v) =>
            Math.abs(u - 0.24) < 0.12 && v > 0.12 && v < 0.6
              ? windowId(k, 9, 6)
              : 0,
        },
      );
      pyramid(2.65, y, 0.3, WALL + 1.25, 0.55, SLATE, DORMER);
    }

    const TX0 = 0.8,
      TX1 = 3.6,
      TY0 = -9.8,
      TY1 = HY0,
      TOP = 10.8;
    box(TX0, TY0, 0, TX1, TY1, TOP, BRICK, TOWER);
    paint(TX1 + 0.001, null, TY0, TY1, 0, TOP, (a, z) =>
      towerFace(a, z, (TY0 + TY1) / 2),
    );
    paint(null, TY1 + 0.001, TX0, TX1, 0, TOP, (a, z) =>
      towerFace(a, z, (TX0 + TX1) / 2),
    );
    shadowBox(TX0, TY0, TX1, TY1, 0, TOP);
    pyramid(
      (TX0 + TX1) / 2,
      (TY0 + TY1) / 2,
      1.5,
      TOP,
      4.2,
      SLATE,
      TOWER,
      (a, t) => (Math.floor(t * 16) % 2 ? 0.3 : -0.2),
    );
    for (const [x, y] of [
      [TX1 - 0.1, TY0 + 0.1],
      [TX1 - 0.1, TY1 - 0.1],
      [TX0 + 0.1, TY1 - 0.1],
    ] as const)
      pyramid(x, y, 0.2, TOP, 1.2, BAND, TOWER);

    const st = step();
    for (let x = SX0; x <= SX1; x += st)
      for (let y = SY0; y <= SY1; y += st) {
        const z = shedZ(y),
          dz = (shedZ(y + 0.05) - shedZ(y - 0.05)) / 0.1;
        const rib = (x - SX0) % 0.9 < 0.1;
        const glazed = Math.abs(y - SC) < SH * 0.62;
        surf(
          x,
          y,
          z,
          rib ? iron : glazed ? sky : rampId(SLATE),
          rib ? 0.4 : glazed ? (Math.floor(y * 4) % 2 ? 0.3 : -0.1) : 0,
          normalOf(0, -dz, 1),
          SHED,
        );
      }
    for (let y = SY0; y <= SY1; y += st) {
      const top = shedZ(y);
      for (let z = 0; z <= top; z += st) {
        const rim = top - z < 0.22;
        const mullion = (y - SY0) % 0.55 < 0.06 || z % 0.8 < 0.06;
        surf(
          SX1 + 0.001,
          y,
          z,
          rim || mullion ? iron : glass,
          rim ? 0.8 : mullion ? 0.2 : -0.2,
          PX,
          SHED,
          rim || mullion
            ? 0
            : windowId(Math.floor(y / 0.55), Math.floor(z / 0.8), 8),
        );
      }
    }
    box(SX0, SY1 - 0.3, 0, SX1, SY1, 1.8, BRICK, SHED, {
      sideY: (u, v) =>
        pointed(u % 1.2, v, 0.6, 0.3, 1.1, 1.5)
          ? -2.3
          : (hash((u * 9) | 0, (v * 14) | 0) - 0.5) * 0.7,
    });
    for (let x = SX0; x <= SX1; x += 0.6)
      for (let y = SY0 + 0.4; y <= SY1 - 0.4; y += 0.8)
        for (let z = 1; z <= shedZ(y); z += 1.2) caster(x, y, z, 0.6);

    box(5.2, -2.4, 0.45, 5.9, -1.5, 1.4, CAB_BODY, BUS_PART, {
      sideX: (u, v) =>
        v > 0.45 && v < 0.75 && u > 0.15 && u < 0.75 ? -1.8 : 0.3,
      sideY: (u, v) =>
        v > 0.45 && v < 0.75 && u > 0.12 && u < 0.6 ? -1.8 : 0.3,
      top: () => 0.5,
    });
    box(5.15, -2.45, 1.4, 5.95, -1.45, 1.5, CAB_BODY, BUS_PART, {
      top: () => 0.7,
    });
    box(5.1, -2.5, 0.0, 5.2, -1.4, 0.9, [40, 36, 34], BUS_PART, {
      sideX: (u, v) =>
        Math.hypot(u - 0.55, v - 0.45) < 0.44 &&
        Math.hypot(u - 0.55, v - 0.45) > 0.34
          ? 0.6
          : Math.abs(u - 0.55) < 0.03 || Math.abs(v - 0.45) < 0.03
            ? 0.4
            : -3,
    });
    capsule(
      [5.55, -1.3, 0.85],
      [5.55, -0.3, 0.85],
      0.22,
      0.2,
      HORSE,
      HORSE_PART,
      "solid",
    );
    capsule(
      [5.55, -0.25, 0.95],
      [5.55, 0.05, 1.3],
      0.1,
      0.09,
      HORSE,
      HORSE_PART,
      "solid",
    );
    for (const [dx, dy] of [
      [-0.12, -1.15],
      [0.12, -1.15],
      [-0.12, -0.45],
      [0.12, -0.45],
    ] as const)
      capsule(
        [5.55 + dx, dy, 0],
        [5.55 + dx, dy, 0.75],
        0.05,
        0.05,
        HORSE,
        HORSE_PART,
        "solid",
      );
    shadowBox(5.2, -2.4, 5.9, -0.2, 0, 1.4, 0.35);
  },
};
