import {
  growTree,
  hash,
  noise,
  rgb,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  dome,
  gableX,
  gableY,
  grass,
  island,
  pyramid,
  shadowBox,
  tone,
  windowBays,
  type Level,
} from "../engine/kit";

const STUCCO: RGB = [230, 222, 202];
const STONE: RGB = [214, 204, 182];
const TERRACOTTA: RGB = [178, 102, 72];
const LEAD: RGB = [150, 140, 128];
const GRAVEL: RGB[] = [
  [200, 192, 172],
  [212, 204, 184],
  [222, 214, 194],
];

const PORTICO = 1,
  PEDIMENT = 2,
  DOME = 3,
  NOBILE = 4,
  BASEMENT = 5,
  STAIR = 6,
  ROOF = 7,
  STATUE = 8,
  TREE = 9;

const HB = 4.0,
  BASE_TOP = 1.5,
  NOBILE_TOP = 5.2,
  ATTIC_TOP = 6.0;

const win = windowBays(1.6, 0.5, 1.9, 0.55, HB * 2, 2.1, 3, NOBILE_TOP - 0.3);
const facade: Level = (u, v) => {
  if (v < BASE_TOP)
    return (v % 0.3 < 0.06 ? -0.9 : 0.2) + (noise(u * 2, v * 4) - 0.5) * 0.4;
  if (v > NOBILE_TOP - 0.12 && v < NOBILE_TOP + 0.05) return 0.9;
  if (v > ATTIC_TOP - 0.18) return 0.8;
  if (v > NOBILE_TOP)
    return Math.abs(((u + 0.4) % 1.6) - 0.8) < 0.22 && v > 5.4 && v < 5.75
      ? -2
      : 0.1;
  return win.hit(u, v) >= 0 ? -2.3 : (noise(u * 2, v * 2) - 0.5) * 0.35;
};

function stair(axis: "x" | "y", sign: number) {
  for (let k = 0; k < 8; k++) {
    const a0 = 6.6 + k * 0.26,
      top = BASE_TOP - k * 0.19;
    if (axis === "x") {
      const x0 = sign > 0 ? a0 : -a0 - 0.26;
      box(x0, -1.8, 0, x0 + 0.26, 1.8, top, STONE, STAIR, {
        top: () => 0.5,
        sideX: () => -0.2,
      });
    } else {
      const y0 = sign > 0 ? a0 : -a0 - 0.26;
      box(-1.8, y0, 0, 1.8, y0 + 0.26, top, STONE, STAIR, {
        top: () => 0.5,
        sideY: () => -0.2,
      });
    }
  }
  for (const side of [-1, 1]) {
    const x = axis === "x" ? sign * 8.5 : side * 2.15,
      y = axis === "x" ? side * 2.15 : sign * 8.5;
    box(x - 0.3, y - 0.3, 0, x + 0.3, y + 0.3, 0.7, STONE, STAIR);
    statue(x, y, 0.7);
  }
}

function statue(x: number, y: number, z: number) {
  sphere(x, y, z + 0.25, 0.18, STUCCO, STATUE, "solid");
  sphere(x, y, z + 0.55, 0.15, STUCCO, STATUE, "solid");
  sphere(x, y, z + 0.82, 0.1, STUCCO, STATUE, "solid");
}

function portico(axis: "x" | "y", sign: number, front: boolean) {
  const along = (a: number, w: number, z0: number, z1: number) =>
    axis === "x"
      ? sign > 0
        ? [HB, -w, z0, a, w, z1]
        : [-a, -w, z0, -HB, w, z1]
      : sign > 0
        ? [-w, HB, z0, w, a, z1]
        : [-w, -a, z0, w, -HB, z1];
  const [px0, py0, pz0, px1, py1, pz1] = along(6.6, 2.5, 0, BASE_TOP);
  box(px0, py0, pz0, px1, py1, pz1, STONE, BASEMENT, {
    sideX: facade,
    sideY: facade,
  });
  shadowBox(px0, py0, px1, py1, 0, BASE_TOP);
  stair(axis, sign);
  if (front) {
    for (let j = 0; j < 6; j++) {
      const c = -2.2 + j * 0.88;
      const x = axis === "x" ? sign * 6.25 : c,
        y = axis === "x" ? c : sign * 6.25;
      cylinder(x, y, 0.21, 0.18, BASE_TOP, 4.5, STUCCO, PORTICO, {
        level: (a, t) => Math.cos(a * 12) * 0.25 - t * 0.2,
        top: false,
      });
      box(x - 0.3, y - 0.3, 4.5, x + 0.3, y + 0.3, 4.62, STONE, PORTICO, {
        sideX: (u) => (u < 0.12 || u > 0.48 ? 0.9 : -0.3),
        sideY: (u) => (u < 0.12 || u > 0.48 ? 0.9 : -0.3),
      });
    }
  }
  const [ex0, ey0, ez0, ex1, ey1, ez1] = along(6.62, 2.55, 4.62, 5.2);
  box(ex0, ey0, ez0, ex1, ey1, ez1, STUCCO, PORTICO, {
    sideX: (u, v) => (v > 0.42 ? 0.8 : v < 0.2 ? 0.3 : -0.2),
    sideY: (u, v) => (v > 0.42 ? 0.8 : v < 0.2 ? 0.3 : -0.2),
  });
  shadowBox(ex0, ey0, ex1, ey1, ez0, ez1);
  const tympanum: Level = (a, h) =>
    h < 0.12 ? 0.8 : -0.6 + (noise(a * 3, h * 5) > 0.6 ? 0.8 : 0);
  if (axis === "x")
    gableX(
      Math.min(ex0, ex1),
      Math.max(ex0, ex1),
      -2.6,
      2.6,
      5.2,
      1.05,
      TERRACOTTA,
      ROOF,
      sign > 0 ? { color: STUCCO, part: PEDIMENT, level: tympanum } : undefined,
    );
  else
    gableY(
      Math.min(ey0, ey1),
      Math.max(ey0, ey1),
      -2.6,
      2.6,
      5.2,
      1.05,
      TERRACOTTA,
      ROOF,
      sign > 0 ? { color: STUCCO, part: PEDIMENT, level: tympanum } : undefined,
    );
  if (front) {
    const tip = 6.66 * sign;
    statue(axis === "x" ? tip : 0, axis === "x" ? 0 : tip, 6.2);
    statue(axis === "x" ? tip : 2.45, axis === "x" ? 2.45 : tip, 5.2);
    statue(axis === "x" ? tip : -2.45, axis === "x" ? -2.45 : tip, 5.2);
  }
}

export const rotonda: Scene = {
  id: "rotonda",
  scale: 11,
  originY: 16,
  windowLight: [255, 206, 128],
  parts: [
    "",
    "Ionic portico",
    "pediment",
    "saucer dome",
    "piano nobile",
    "rusticated base",
    "grand stair",
    "terracotta roof",
    "garden statue",
    "garden tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 11.2, 11.2);
    if (edge < 0) return 0;
    const path =
      (Math.abs(y) < 1.9 && Math.abs(x) > 8) ||
      (Math.abs(x) < 1.9 && Math.abs(y) > 8) ||
      (Math.max(Math.abs(x), Math.abs(y)) < 8.9 &&
        Math.min(Math.abs(x), Math.abs(y)) > 2.6 &&
        Math.max(Math.abs(x), Math.abs(y)) > 4.2);
    if (path) {
      setKind(i, 1);
      if (hash(ix, iy) > 0.96) return rgb(232, 226, 210);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    return grass(x, y, ix, iy, i, 0.25);
  },
  build() {
    box(-HB, -HB, 0, HB, HB, ATTIC_TOP, STUCCO, NOBILE, {
      sideX: facade,
      sideY: facade,
      glowX: win.glow,
      glowY: win.glow,
    });
    box(
      -HB - 0.01,
      -HB - 0.01,
      0,
      HB + 0.01,
      HB + 0.01,
      BASE_TOP,
      STONE,
      BASEMENT,
      { sideX: facade, sideY: facade },
    );
    shadowBox(-HB, -HB, HB, HB, 0, ATTIC_TOP);
    pyramid(
      0,
      0,
      HB + 0.15,
      ATTIC_TOP,
      1.35,
      TERRACOTTA,
      ROOF,
      (a, t) =>
        (Math.floor(t * 18) % 2 ? 0.4 : -0.1) +
        (hash((a * 6) | 0, (t * 18) | 0) > 0.85 ? -0.5 : 0),
    );
    cylinder(0, 0, 1.7, 1.7, 6.9, 7.6, STUCCO, DOME, {
      top: false,
      level: (a, t) => (t > 0.75 ? 0.7 : 0),
    });
    dome(0, 0, 7.6, 1.78, LEAD, DOME, {
      zScale: 0.42,
      level: (a, phi) => (Math.floor(phi * 10) % 2 ? 0.3 : -0.1),
    });
    cylinder(0, 0, 0.24, 0.2, 8.3, 8.75, STUCCO, DOME);

    portico("x", -1, false);
    portico("y", -1, false);
    portico("x", 1, true);
    portico("y", 1, true);

    growTree(-8.6, 8.4, TREE, 0.5, 240, 5100);
    growTree(8.4, -8.8, TREE, 0.48, 240, 5600);
    growTree(-9.2, -5, TREE, 0.44, 220, 6100);
  },
};
