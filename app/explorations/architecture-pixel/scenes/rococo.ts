import {
  caster,
  hash,
  noise,
  normalOf,
  rampId,
  rgb,
  setGroundPart,
  setKind,
  sphere,
  step,
  surf,
  TOP,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  dome,
  gableY,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Level,
} from "../engine/kit";

const STUCCO: RGB = [236, 214, 160];
const WHITE: RGB = [240, 236, 226];
const SLATE: RGB = [120, 124, 134];
const MIRROR_BLUE: RGB = [170, 196, 214];
const SILVER: RGB = [222, 226, 232];
const PARQUET: RGB = [150, 104, 66];
const GOLD: RGB = [222, 184, 86];
const GRAVEL: RGB[] = [
  [206, 198, 180],
  [216, 208, 190],
  [226, 218, 200],
];
const BOX: RGB[] = [
  [40, 72, 46],
  [56, 92, 56],
];

const SALON = 1,
  WINGS = 2,
  ROOF = 3,
  MIRRORS = 4,
  CHANDELIER = 5,
  FLOOR = 6,
  PARTERRE = 7;

const blue = rampId(MIRROR_BLUE),
  silver = rampId(SILVER),
  parquet = rampId(PARQUET);
const CX = 0.6,
  R = 1.95,
  WALL = 3.0;

const wing: Level = (u, v) => {
  const fu = u % 1.1;
  if (fu < 0.14) return 0.9;
  if (fu > 0.3 && fu < 0.86 && v > 0.4 && v < 2.0) return -2.2;
  if (fu > 0.24 && fu < 0.92 && v > 2.0 && v < 2.35)
    return Math.sin(fu * 22) > 0 ? 0.9 : 0.2;
  return v > 2.45 ? 0.8 : (noise(u * 2, v * 2) - 0.5) * 0.3;
};
const wingGlow = (u: number, v: number) => {
  const fu = u % 1.1;
  return fu > 0.3 && fu < 0.86 && v > 0.4 && v < 2.0
    ? windowId(Math.floor(u / 1.1), 1, 5)
    : 0;
};

const salonLevel = (a: number, t: number) => {
  const z = t * WALL,
    f = ((((a / (Math.PI * 2)) * 12) % 1) + 1) % 1;
  if (f < 0.1) return 0.9;
  if (f > 0.25 && f < 0.85 && z > 0.3 && z < 2.3) return -2.2;
  if (f > 0.2 && f < 0.9 && z > 2.3 && z < 2.65)
    return Math.sin(f * 30) > 0 ? 1.0 : 0.3;
  return z > 2.75 ? 0.8 : 0.1;
};
const salonGlow = (a: number, t: number) => {
  const z = t * WALL,
    f = ((((a / (Math.PI * 2)) * 12) % 1) + 1) % 1;
  return f > 0.25 && f < 0.85 && z > 0.3 && z < 2.3
    ? windowId(Math.floor(a * 2), 3, 6)
    : 0;
};

function hallOfMirrors() {
  const st = step();
  for (let a = 0; a < Math.PI * 2; a += st / R) {
    const nx = Math.cos(a),
      ny = Math.sin(a);
    const front = nx + ny > 0;
    const x = CX + nx * R,
      y = ny * R;
    if (front) {
      for (let z = 0; z <= 0.55; z += st)
        surf(
          x,
          y,
          z,
          rampId(STUCCO),
          z > 0.48 ? 0.9 : 0.1,
          normalOf(nx, ny, 0),
          SALON,
        );
      continue;
    }
    const f = ((((a / (Math.PI * 2)) * 12) % 1) + 1) % 1;
    for (let z = 0; z <= WALL; z += st) {
      const mirror = f > 0.22 && f < 0.78 && z > 0.5 && z < 2.3;
      const scroll = Math.sin(f * 40 + z * 9) * Math.cos(z * 7 - f * 12) > 0.45;
      surf(
        x * 0.999 + CX * 0.001,
        y,
        z,
        mirror ? silver : scroll ? silver : blue,
        mirror
          ? hash(Math.floor(z * 10), Math.floor(a * 30)) > 0.7
            ? 1.6
            : 0.8
          : scroll
            ? 0.9
            : 0,
        normalOf(-nx, -ny, 0),
        MIRRORS,
      );
    }
    caster(x, y, 1.5, 0.3);
  }
  for (let x = -R; x <= R; x += st)
    for (let y = -R; y <= R; y += st) {
      if (x * x + y * y > R * R) continue;
      const herring = (Math.floor((x + y) * 3) + Math.floor((x - y) * 3)) % 2;
      surf(CX + x, y, 0.02, parquet, herring ? 0.4 : -0.2, TOP, FLOOR);
    }
  for (let k = 0; k < 10; k++) {
    const t = k / 9;
    sphere(
      CX,
      0,
      2.5 - t * 0.6,
      0.32 - Math.abs(t - 0.4) * 0.3,
      GOLD,
      CHANDELIER,
      "solid",
    );
  }
  for (let k = 0; k < 8; k++)
    sphere(
      CX + Math.cos(k * 0.785) * 0.38,
      Math.sin(k * 0.785) * 0.38,
      2.05,
      0.06,
      [255, 240, 200],
      CHANDELIER,
      "solid",
    );
}

export const rococo: Scene = {
  id: "rococo",
  scale: 13,
  originY: 18,
  windowLight: [255, 222, 160],
  parts: [
    "",
    "bowed salon",
    "pastel wings",
    "slate roof",
    "hall of mirrors",
    "chandelier",
    "parquet floor",
    "parterre",
  ],
  cutaway: { inside: [MIRRORS, CHANDELIER, FLOOR], removes: [] },
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.2, y, ix, iy, 7.8, 7.4);
    if (edge < 0) return 0;
    if (x > 3.2 && x < 7.6 && Math.abs(y) < 4.6) {
      setKind(i, 1);
      setGroundPart(i, PARTERRE);
      const dx = x - 5.4,
        dy = y;
      const scroll =
        Math.abs(
          Math.sin(dx * 2.2 + Math.cos(dy * 1.4) * 1.6) * 1.2 -
            Math.sin(dy * 1.3),
        ) < 0.22 || Math.abs(Math.hypot(dx, dy * 0.8) - 1.4) < 0.12;
      if (scroll && Math.abs(dy) > 0.5)
        return tone(BOX, noise(x * 4, y * 4), ix, iy);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(236, 230, 210);
    return grass(x, y, ix, iy, i, 0.25);
  },
  build(cut) {
    for (const s of [-1, 1]) {
      const y0 = s > 0 ? 1.4 : -5.2,
        y1 = y0 + 3.8;
      box(-1.6, y0, 0, 1.6, y1, 2.6, STUCCO, WINGS, {
        sideX: wing,
        sideY: wing,
        glowX: wingGlow,
        glowY: wingGlow,
      });
      shadowBox(-1.6, y0, 1.6, y1, 0, 2.6);
      gableY(y0 - 0.1, y1 + 0.1, -1.7, 1.7, 2.6, 1.1, SLATE, ROOF, {
        color: WHITE,
        part: WINGS,
      });
    }
    if (cut) hallOfMirrors();
    else {
      cylinder(CX, 0, R, R, 0, WALL, STUCCO, SALON, {
        level: salonLevel,
        glow: salonGlow,
      });
      dome(CX, 0, WALL, R + 0.1, SLATE, ROOF, {
        zScale: 0.5,
        level: (a, phi) => (Math.floor(phi * 9) % 2 ? 0.3 : -0.1),
      });
      sphere(CX, 0, WALL + R * 0.5 + 0.15, 0.16, GOLD, ROOF, "solid");
    }
  },
};
