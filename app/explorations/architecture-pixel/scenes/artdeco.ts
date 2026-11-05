import {
  caster,
  growTree,
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
  cone,
  island,
  orientedBox,
  shadowBox,
  tone,
  windowId,
  type Glow,
  type Level,
} from "../engine/kit";

const BRICK: RGB = [224, 220, 210];
const DARK_BRICK: RGB = [96, 96, 106];
const STEEL: RGB = [198, 206, 218];
const GLASS: RGB = [44, 50, 66];
const GRANITE: RGB = [58, 54, 62];
const CAB: RGB = [236, 186, 40];
const PAVING: RGB[] = [
  [190, 186, 176],
  [202, 198, 188],
  [212, 208, 198],
];
const ROAD: RGB[] = [
  [66, 66, 74],
  [74, 74, 82],
  [82, 82, 90],
];
const PLANE: RGB[] = [
  [50, 74, 52],
  [84, 112, 66],
  [128, 150, 84],
];

const SETBACK = 1,
  CROWN = 2,
  SPIRE = 3,
  EAGLE = 4,
  SHAFT = 5,
  PODIUM = 6,
  ENTRANCE = 7,
  TREE = 8,
  TAXI = 9,
  FRIEZE = 10;

const glass = rampId(GLASS),
  steel = rampId(STEEL),
  granite = rampId(GRANITE);

function bays(
  pitch: number,
  w: number,
  floor: number,
  margin: number,
  len: number,
  z0: number,
  seed: number,
) {
  const hit = (u: number, v: number) => {
    if (u < margin || u > len - margin || v < z0) return -1;
    const col = Math.floor((u - margin) / pitch),
      inCol = (u - margin) % pitch < w;
    const f = (v - z0) % floor;
    if (!inCol || f < 0.07 || f > floor - 0.05) return -1;
    return windowId(col, Math.floor((v - z0) / floor), seed);
  };
  const level: Level = (u, v) =>
    hit(u, v) >= 0 ? -2.4 : (noise(u * 6, v * 2) - 0.5) * 0.4;
  const glow: Glow = (u, v) => Math.max(0, hit(u, v));
  return { level, glow };
}

function block(
  h: number,
  z0: number,
  z1: number,
  c: RGB,
  part: number,
  seed: number,
) {
  const { level, glow } = bays(0.72, 0.4, 0.5, 0.36, h * 2, z0 + 0.25, seed);
  const parapet: Level = (u, v) =>
    v > z1 - z0 - 0.16 ? 0.8 : level(u, v + z0);
  box(-h, -h, z0, h, h, z1, c, part, {
    sideX: (u, v) => parapet(u, v),
    sideY: (u, v) => parapet(u, v),
    glowX: (u, v) => (v > z1 - z0 - 0.16 ? 0 : glow(u, v + z0)),
    glowY: (u, v) => (v > z1 - z0 - 0.16 ? 0 : glow(u, v + z0)),
    top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.5 - 0.3,
  });
  shadowBox(-h + 0.25, -h + 0.25, h - 0.25, h - 0.25, z0, z1);
}

const CROWN_BASE = 15.4;
const STAGES = 6;
const stageH = (k: number) => 2.3 - k * 0.3;
const stageBase = (k: number) => CROWN_BASE + k * 0.72;
const arch = (k: number, a: number) =>
  stageBase(k) + 0.35 + 0.8 * Math.sqrt(Math.max(0, stageH(k) ** 2 - a * a));

function crownFace(k: number, a: number, z: number) {
  const h = stageH(k),
    b = stageBase(k) + 0.35;
  if (z < b)
    return { level: 0.3 + (Math.floor(a * 4) % 2 ? 0.4 : -0.2), glow: 0 };
  const rx = a / h,
    rz = (z - b) / (0.8 * h),
    rho = Math.hypot(rx, rz);
  if (rho > 0.9) return { level: 1.2, glow: 0 };
  if (rho > 0.52) {
    const phi = Math.atan2(rz, rx),
      sectors = 7 + (k > 3 ? -2 : 0);
    const f = (((phi / (Math.PI / sectors)) % 1) + 1) % 1;
    if (Math.abs(f - 0.5) < ((rho - 0.52) / 0.38) * 0.38)
      return { level: -2.6, glow: windowId(k, Math.floor(phi * 9), 7) };
    return { level: 0.9, glow: 0 };
  }
  return { level: 0.4 + (rho > 0.46 ? 0.6 : 0), glow: 0 };
}

function crown() {
  const st = step();
  for (let k = 0; k < STAGES; k++) {
    const h = stageH(k),
      z0 = stageBase(k);
    for (let a = -h; a <= h; a += st) {
      const top = arch(k, a);
      for (let z = z0; z <= top; z += st) {
        const f = crownFace(k, a, z);
        surf(h, a, z, steel, f.level, PX, CROWN, f.glow);
        surf(a, h, z, steel, f.level + 0.1, PY, CROWN, f.glow);
      }
    }
    for (let x = -h; x <= h; x += st)
      for (let y = -h; y <= h; y += st) {
        const m = Math.abs(x) > Math.abs(y) ? y : x;
        const z = arch(k, m);
        const nm = normalOf(
          Math.abs(x) > Math.abs(y) ? Math.sign(x) : 0,
          Math.abs(x) > Math.abs(y) ? 0 : Math.sign(y),
          1.2,
        );
        surf(
          x,
          y,
          z,
          steel,
          0.5 + (Math.floor(Math.hypot(x, y) * 6) % 2 ? 0.5 : 0),
          nm,
          CROWN,
        );
      }
    for (let z = z0 + 0.3; z <= arch(k, 0); z += 0.5)
      for (const o of [-0.6, 0, 0.6]) caster(o * h, o * h, z, h * 0.8);
  }
}

export const artdeco: Scene = {
  id: "artdeco",
  scale: 8,
  originY: 58,
  windowLight: [255, 214, 140],
  parts: [
    "",
    "setback",
    "sunburst crown",
    "steel spire",
    "eagle gargoyle",
    "white brick shaft",
    "street podium",
    "entrance portal",
    "London plane tree",
    "yellow cab",
    "hubcap frieze",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 9.8, 9.8);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (Math.abs(x) < 6 && Math.abs(y) < 6) {
      const slab = (Math.floor(x * 1.4) + Math.floor(y * 1.4)) % 2 === 0;
      if (Math.abs(x) > 5.8 || Math.abs(y) > 5.8) return rgb(222, 218, 206);
      return tone(
        PAVING,
        0.3 + (slab ? 0.25 : 0) + (noise(x * 3, y * 3) - 0.5) * 0.4,
        ix,
        iy,
      );
    }
    const zebra =
      x > 6 && x < 8.4 && Math.abs(y) < 1.6 && Math.floor(y * 3) % 2 === 0;
    if (zebra) return rgb(226, 224, 216);
    const dash =
      (Math.abs(x - 7.9) < 0.07 &&
        Math.abs(y) > 2 &&
        Math.floor(y) % 2 === 0) ||
      (Math.abs(y - 7.9) < 0.07 && Math.floor(x) % 2 === 0);
    if (dash) return rgb(228, 196, 70);
    if (hash(ix, iy) > 0.98) return rgb(98, 98, 104);
    return tone(ROAD, noise(x * 2, y * 2), ix, iy);
  },
  build() {
    const pod = bays(0.8, 0.46, 0.56, 0.4, 8.8, 1.2, 1);
    box(-4.4, -4.4, 0, 4.4, 4.4, 3.0, BRICK, PODIUM, {
      sideX: (u, v) =>
        v < 1.05
          ? v > 0.15 && u % 1.1 > 0.12
            ? -2.4
            : 0.6
          : v > 2.86
            ? 0.9
            : pod.level(u, v),
      sideY: (u, v) =>
        v < 1.05
          ? v > 0.15 && u % 1.1 > 0.12
            ? -2.4
            : 0.6
          : v > 2.86
            ? 0.9
            : pod.level(u, v),
      glowX: (u, v) =>
        v < 1.05 && v > 0.15 && u % 1.1 > 0.12
          ? windowId(Math.floor(u / 1.1), 0, 2)
          : v < 2.86
            ? pod.glow(u, v)
            : 0,
      glowY: (u, v) =>
        v < 1.05 && v > 0.15 && u % 1.1 > 0.12
          ? windowId(Math.floor(u / 1.1), 1, 2)
          : v < 2.86
            ? pod.glow(u, v)
            : 0,
    });
    shadowBox(-4.1, -4.1, 4.1, 4.1, 0, 3.0);
    const st = step();
    for (let a = -0.8; a <= 0.8; a += st)
      for (let z = 0; z <= 2.5 - Math.abs(a) * 0.4; z += st) {
        const inner = Math.abs(a) < 0.48 && z < 2.0 - Math.abs(a) * 0.4;
        surf(
          4.42,
          a,
          z,
          inner ? glass : granite,
          inner
            ? Math.abs(a) < 0.03
              ? 1
              : -0.4
            : 0.4 + (z > 2.3 - Math.abs(a) * 0.4 ? 0.8 : 0),
          PX,
          ENTRANCE,
          inner ? 9 : 0,
        );
      }

    block(3.7, 3.0, 5.0, BRICK, SETBACK, 3);
    block(3.1, 5.0, 6.6, BRICK, SETBACK, 4);
    block(2.5, 6.6, 15.4, BRICK, SHAFT, 5);
    for (const z of [6.6, 9.8]) {
      const fr = rampId(DARK_BRICK);
      for (let a = -2.52; a <= 2.52; a += st)
        for (let v = z; v <= z + 0.34; v += st) {
          const cap =
            Math.hypot(((a + 2.52) % 0.42) - 0.21, v - z - 0.17) < 0.11;
          surf(2.52, a, v, cap ? steel : fr, cap ? 1.3 : 0, PX, FRIEZE);
          surf(a, 2.52, v, cap ? steel : fr, cap ? 1.3 : 0, PY, FRIEZE);
        }
    }
    for (let a = -2.54; a <= 2.54; a += st)
      for (let v = 15.0; v <= 15.4; v += st) {
        surf(
          2.54,
          a,
          v,
          steel,
          0.5 + (Math.floor(a * 5) % 2 ? 0.5 : 0),
          PX,
          CROWN,
        );
        surf(
          a,
          2.54,
          v,
          steel,
          0.6 + (Math.floor(a * 5) % 2 ? 0.5 : 0),
          PY,
          CROWN,
        );
      }
    for (const [x, y, ang] of [
      [2.85, 2.85, Math.PI / 4],
      [2.85, -2.85, -Math.PI / 4],
      [-2.85, 2.85, (3 * Math.PI) / 4],
    ] as const) {
      orientedBox(x, y, 0.55, 0.13, 15.08, 15.3, ang, STEEL, EAGLE, {
        level: (u) => (Math.floor(u * 5) % 2 ? 0.6 : 1.2),
      });
      orientedBox(
        x + Math.cos(ang) * 0.42,
        y + Math.sin(ang) * 0.42,
        0.14,
        0.12,
        15.3,
        15.5,
        ang,
        STEEL,
        EAGLE,
        { level: () => 1.3 },
      );
    }
    crown();
    const spireBase = arch(STAGES - 1, 0) - 0.1;
    cone(
      0,
      0,
      0.32,
      spireBase,
      4.6,
      STEEL,
      SPIRE,
      (a, t) => 0.9 + (Math.floor(t * 30) % 3 === 0 ? 0.6 : 0),
    );

    growTree(5.2, -3.3, TREE, 0.42, 200, 3100, PLANE);
    growTree(-3.0, 5.2, TREE, 0.42, 200, 3500, PLANE);
    growTree(5.2, 3.0, TREE, 0.4, 200, 3900, PLANE);
    box(6.6, 3.2, 0.12, 8.2, 3.95, 0.62, CAB, TAXI, { top: () => 0.3 });
    box(7.0, 3.3, 0.62, 7.9, 3.85, 0.95, CAB, TAXI);
    shadowBox(6.6, 3.2, 8.2, 3.95, 0, 0.9, 0.35);
  },
};
