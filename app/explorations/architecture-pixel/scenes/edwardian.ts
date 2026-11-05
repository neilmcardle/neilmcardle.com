import {
  growTree,
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
  cone,
  cylinder,
  dome,
  gableX,
  grass,
  island,
  shadowBox,
  tone,
  windowBays,
  type BoxOptions,
} from "../engine/kit";

const PORTLAND: RGB = [224, 218, 202];
const COPPER: RGB = [100, 158, 132];
const BRONZE: RGB = [90, 96, 84];
const PATH: RGB[] = [
  [198, 190, 172],
  [210, 202, 184],
];
const LIME: RGB[] = [
  [48, 76, 50],
  [84, 112, 64],
  [128, 150, 82],
];

const DOME = 1,
  TOWERS = 2,
  STONE = 3,
  PORTICO = 4,
  STATUE = 5,
  LAWNS = 6,
  TREE = 7;

function range(seed: number, len: number, top: number): BoxOptions {
  const w = windowBays(0.8, 0.36, 1.5, 0.4, len, 0.8, seed, top - 0.5);
  const level = (u: number, v: number) => {
    if (w.hit(u, v) >= 0) return v % 0.5 < 0.05 ? 0.6 : -2;
    if (v > top - 0.45)
      return Math.floor(u * 6) % 2 && v > top - 0.25 ? -0.6 : 0.8;
    if (v < 0.6) return v % 0.2 < 0.04 ? -0.5 : 0.2;
    return (noise(u * 2, v * 2) - 0.5) * 0.3 + (u % 0.8 < 0.08 ? 0.5 : 0);
  };
  return { sideX: level, sideY: level, glowX: w.glow, glowY: w.glow };
}

function tower(x: number, y: number) {
  box(
    x - 0.8,
    y - 0.8,
    0,
    x + 0.8,
    y + 0.8,
    6.2,
    PORTLAND,
    TOWERS,
    range(5 + x + y, 1.6, 6.2),
  );
  shadowBox(x - 0.8, y - 0.8, x + 0.8, y + 0.8, 0, 6.2);
  cylinder(x, y, 0.62, 0.62, 6.2, 6.9, PORTLAND, TOWERS, {
    level: (a) => (((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1 < 0.3 ? -2 : 0.5),
    top: false,
  });
  dome(x, y, 6.9, 0.66, COPPER, TOWERS, {
    level: (a) => (((((a / (Math.PI * 2)) * 10) % 1) + 1) % 1 < 0.1 ? 0.7 : 0),
  });
  cone(x, y, 0.12, 7.5, 0.6, COPPER, TOWERS);
}

export const edwardian: Scene = {
  id: "edwardian",
  scale: 9,
  originY: 28,
  windowLight: [255, 208, 130],
  parts: [
    "",
    "copper dome",
    "corner towers",
    "Portland stone",
    "portico",
    "Victoria statue",
    "lawns",
    "lime tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.6, y, ix, iy, 9.8, 9.2);
    if (edge < 0) return 0;
    if (
      (x > 5.2 && Math.abs(y) < 0.9) ||
      Math.abs(Math.hypot(x - 8.2, y) - 1.4) < 0.3
    ) {
      setKind(i, 1);
      return tone(PATH, noise(x * 3, y * 3), ix, iy);
    }
    setGroundPart(i, LAWNS);
    if (hash(ix, iy) > 0.99) return rgb(232, 226, 206);
    return grass(x, y, ix, iy, i, 0.35);
  },
  build() {
    box(2.6, -5, 0, 4.6, 5, 4.6, PORTLAND, STONE, range(1, 10, 4.6));
    shadowBox(2.6, -5, 4.6, 5, 0, 4.6);
    for (const s of [-1, 1]) {
      const y0 = s > 0 ? 3.0 : -5,
        y1 = y0 + 2;
      box(-5, y0, 0, 2.6, y1, 4.6, PORTLAND, STONE, range(2 + s, 7.6, 4.6));
      shadowBox(-5, y0, 2.6, y1, 0, 4.6);
    }
    tower(4.0, -4.4);
    tower(4.0, 4.4);
    tower(-4.4, 4.4);
    box(4.6, -1.7, 0, 5.8, 1.7, 0.6, PORTLAND, PORTICO, { top: () => 0.4 });
    for (let k = 0; k < 6; k++)
      cylinder(5.5, -1.45 + k * 0.58, 0.14, 0.13, 0.6, 3.8, PORTLAND, PORTICO, {
        level: (a, t) => Math.cos(a * 12) * 0.3 - t * 0.1,
        top: false,
      });
    box(4.6, -1.75, 3.8, 5.75, 1.75, 4.3, PORTLAND, PORTICO, {
      sideX: (u, v) => (v > 0.36 ? 0.9 : 0.3),
    });
    gableX(4.6, 5.8, -1.85, 1.85, 4.3, 0.9, PORTLAND, PORTICO, {
      color: PORTLAND,
      part: PORTICO,
      level: (y, h) => (h < 0.1 ? 0.9 : noise(y * 5, h * 6) > 0.6 ? 0.6 : -0.6),
    });
    shadowBox(4.6, -1.7, 5.8, 1.7, 0.6, 4.3);
    cylinder(3.6, 0, 1.7, 1.7, 4.6, 6.6, PORTLAND, DOME, {
      level: (a, t) =>
        ((((a / (Math.PI * 2)) * 16) % 1) + 1) % 1 < 0.14
          ? 0.8
          : t > 0.25 && t < 0.75
            ? -1.8
            : 0.4,
      top: false,
    });
    dome(3.6, 0, 6.6, 1.8, COPPER, DOME, {
      zScale: 1.05,
      level: (a, phi) =>
        (((((a / (Math.PI * 2)) * 16) % 1) + 1) % 1 < 0.1 ? 0.8 : 0) +
        (noise(a * 8, phi * 8) - 0.5) * 0.6,
    });
    cylinder(3.6, 0, 0.42, 0.4, 8.5, 9.3, PORTLAND, DOME, {
      level: (a) =>
        ((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1 < 0.35 ? -2 : 0.5,
    });
    dome(3.6, 0, 9.3, 0.44, COPPER, DOME);
    cone(3.6, 0, 0.1, 9.7, 0.6, COPPER, DOME);
    box(7.9, -0.35, 0, 8.5, 0.35, 1.2, PORTLAND, STATUE, {
      sideX: (u, v) => (v > 1.05 ? 0.8 : 0.2),
    });
    for (let k = 0; k < 5; k++)
      sphere(8.2, 0, 1.4 + k * 0.22, 0.26 - k * 0.04, BRONZE, STATUE, "solid");
    sphere(8.2, 0, 2.5, 0.12, BRONZE, STATUE, "solid");
    growTree(7.6, -6.0, TREE, 0.56, 240, 20100, LIME);
    growTree(7.4, 5.8, TREE, 0.58, 240, 20500, LIME);
  },
};
