import {
  caster,
  hash,
  noise,
  rgb,
  setGroundPart,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type BoxOptions,
} from "../engine/kit";

const FACADE: RGB = [214, 208, 196];
const SLAB: RGB = [84, 78, 72];
const PATH: RGB[] = [
  [196, 190, 178],
  [208, 202, 190],
];
const LEAVES: RGB[] = [
  [44, 76, 44],
  [70, 106, 56],
  [108, 138, 70],
  [150, 160, 82],
];

const PLANTED = 1,
  TOWER = 2,
  BALCONY = 3,
  PARK = 4;

const FLOOR = 0.9;

function facade(seed: number): BoxOptions {
  const level = (u: number, v: number) =>
    v % FLOOR < 0.5 && u % 0.6 > 0.12 ? -2 : (noise(u, v) - 0.5) * 0.3;
  const glow = (u: number, v: number) =>
    v % FLOOR < 0.5 && u % 0.6 > 0.12
      ? windowId(Math.floor(u / 0.6), Math.floor(v / FLOOR), seed)
      : 0;
  return { sideX: level, sideY: level, glowX: glow, glowY: glow };
}

function shrub(x: number, y: number, z: number, size: number, seed: number) {
  for (let k = 0; k < 3; k++) {
    const r = size * (0.5 + hash(seed, k) * 0.5);
    sphere(
      x + (hash(seed, k + 3) - 0.5) * size,
      y + (hash(seed, k + 6) - 0.5) * size,
      z + r * 0.7 + k * size * 0.25,
      r,
      LEAVES[Math.floor(hash(seed, k + 9) * 4)],
      PLANTED,
      "rough",
    );
  }
  caster(x, y, z + size, size);
}

function tower(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  top: number,
  seed: number,
) {
  box(x0, y0, 0, x1, y1, top, FACADE, TOWER, facade(seed));
  shadowBox(x0, y0, x1, y1, 0, top);
  let n = 0;
  for (let z = 1.4; z < top; z += FLOOR) {
    const f = Math.round(z / FLOOR);
    for (const side of ["x", "y"] as const) {
      const len = side === "x" ? y1 - y0 : x1 - x0;
      for (let k = 0; k < 3; k++) {
        const off = ((k + (f % 2) * 0.5) / 3) * len + 0.3;
        if (off > len - 0.3) continue;
        const w = 0.9;
        if (side === "x") {
          box(
            x1,
            y0 + off - w / 2,
            z - 0.1,
            x1 + 0.7,
            y0 + off + w / 2,
            z,
            SLAB,
            BALCONY,
            { top: () => -0.4, sideX: () => 0.3 },
          );
          shrub(
            x1 + 0.35,
            y0 + off,
            z,
            0.28 + hash(n++, seed) * 0.16,
            n + seed * 100,
          );
        } else {
          box(
            x0 + off - w / 2,
            y1,
            z - 0.1,
            x0 + off + w / 2,
            y1 + 0.7,
            z,
            SLAB,
            BALCONY,
            { top: () => -0.4, sideY: () => 0.3 },
          );
          shrub(
            x0 + off,
            y1 + 0.35,
            z,
            0.28 + hash(n++, seed) * 0.16,
            n + seed * 100,
          );
        }
      }
    }
  }
  for (let k = 0; k < 6; k++)
    shrub(
      x0 + 0.4 + (k % 3) * ((x1 - x0 - 0.8) / 2),
      y0 + 0.5 + Math.floor(k / 3) * (y1 - y0 - 1),
      top,
      0.42,
      seed * 50 + k,
    );
}

export const bosco: Scene = {
  id: "bosco",
  scale: 7.5,
  originY: 50,
  windowLight: [255, 216, 150],
  parts: [
    "",
    "planted balconies",
    "tower facade",
    "balcony slab",
    "Biblioteca park",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x + 0.8, y - 0.6, ix, iy, 9.4, 9.4);
    if (edge < 0) return 0;
    if (Math.abs(x - y * 0.6 - 3.4) < 0.5 || Math.abs(y + 4.4) < 0.4) {
      setKind(i, 1);
      return tone(PATH, noise(x * 3, y * 3), ix, iy);
    }
    setGroundPart(i, PARK);
    if (hash(ix, iy) > 0.985) return rgb(236, 220, 130);
    return grass(x, y, ix, iy, i, 0.3);
  },
  build() {
    tower(-1.6, -1.8, 1.4, 1.4, 17.6, 1);
    tower(-5.6, 2.6, -3.0, 5.2, 12.6, 2);
    for (let k = 0; k < 6; k++)
      shrub(
        3.4 + hash(k, 1) * 3,
        -6 + hash(k, 2) * 10,
        0,
        0.5 + hash(k, 3) * 0.4,
        900 + k,
      );
  },
};
