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
  cylinder,
  dome,
  gableX,
  grass,
  island,
  shadowBox,
  tone,
  windowBays,
  type Level,
} from "../engine/kit";

const BRICK: RGB = [166, 78, 60];
const TRIM: RGB = [238, 234, 222];
const GOLD: RGB = [228, 186, 76];
const PATH: RGB[] = [
  [200, 192, 174],
  [212, 204, 186],
];
const ELM: RGB[] = [
  [46, 74, 48],
  [82, 112, 62],
  [126, 150, 80],
];

const DOME = 1,
  LANTERN = 2,
  BRICKP = 3,
  ARCADE = 4,
  LOGGIA = 5,
  PEDIMENT = 6,
  COMMON = 7,
  TREE = 8;

const win = windowBays(0.9, 0.42, 1.6, 0.4, 8, 0.6, 3, 4.1);
const brickLevel: Level = (u, v) =>
  win.hit(u, v) >= 0
    ? (u % 0.9) % 0.14 < 0.03 || v % 0.4 < 0.04
      ? 0.7
      : -2
    : v > 4.2
      ? 0.8
      : v % 0.18 < 0.03
        ? -0.5
        : 0.1;

export const federal: Scene = {
  id: "federal",
  scale: 11,
  originY: 22,
  windowLight: [255, 208, 130],
  parts: [
    "",
    "gilded dome",
    "lantern",
    "red brick",
    "arcaded base",
    "Corinthian loggia",
    "pediment",
    "Boston Common",
    "elm tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.4, y, ix, iy, 8.6, 8.0);
    if (edge < 0) return 0;
    if (x > 3.0 && Math.abs(y) < 0.9) {
      setKind(i, 1);
      return tone(PATH, noise(x * 3, y * 3), ix, iy);
    }
    setGroundPart(i, COMMON);
    if (hash(ix, iy) > 0.99) return rgb(232, 226, 206);
    return grass(x, y, ix, iy, i, 0.3);
  },
  build() {
    box(-2.6, -4, 0, 1.4, 4, 4.4, BRICK, BRICKP, {
      sideX: brickLevel,
      sideY: brickLevel,
      glowX: win.glow,
      glowY: win.glow,
    });
    shadowBox(-2.6, -4, 1.4, 4, 0, 4.4);
    box(-2.7, -4.1, 4.4, 1.5, 4.1, 4.65, TRIM, BRICKP);
    box(1.4, -2.3, 0, 3.0, 2.3, 1.8, TRIM, ARCADE, {
      sideX: (u, v) => {
        const fu = u % (4.6 / 7);
        return fu > 0.1 &&
          fu < 0.56 &&
          (v < 1.1 || (fu - 0.33) ** 2 + (v - 1.1) ** 2 < 0.23 ** 2)
          ? -2.3
          : v > 1.65
            ? 0.9
            : 0.3;
      },
    });
    shadowBox(1.4, -2.3, 3.0, 2.3, 0, 1.8);
    for (let k = 0; k < 8; k++) {
      const y = -2.0 + k * (4.0 / 7);
      cylinder(2.75, y, 0.13, 0.12, 1.8, 4.4, TRIM, LOGGIA, {
        level: (a, t) => Math.cos(a * 12) * 0.3 - t * 0.1,
        top: false,
      });
      box(2.58, y - 0.17, 4.25, 2.92, y + 0.17, 4.4, TRIM, LOGGIA);
    }
    box(1.4, -2.35, 4.4, 3.05, 2.35, 4.85, TRIM, LOGGIA, {
      sideX: (u, v) => (v > 0.32 ? 0.9 : 0.3),
    });
    shadowBox(1.4, -2.3, 3.0, 2.3, 4.4, 4.85);
    gableX(1.3, 3.1, -2.4, 2.4, 4.85, 1.0, [120, 126, 136], PEDIMENT, {
      color: TRIM,
      part: PEDIMENT,
      level: (y, h) =>
        h < 0.1 ? 0.9 : Math.hypot(y, h - 0.4) < 0.22 ? -1.5 : 0.2,
    });
    cylinder(-0.6, 0, 1.6, 1.6, 4.65, 5.5, TRIM, DOME, {
      level: (a, t) =>
        ((((a / (Math.PI * 2)) * 16) % 1) + 1) % 1 < 0.4 && t > 0.2 && t < 0.8
          ? -2
          : 0.4,
      top: false,
    });
    dome(-0.6, 0, 5.5, 1.7, GOLD, DOME, {
      zScale: 0.62,
      level: (a, phi) =>
        (((((a / (Math.PI * 2)) * 20) % 1) + 1) % 1 < 0.08 ? -0.4 : 0.6) +
        (phi > 1.2 ? 0.6 : 0),
    });
    cylinder(-0.6, 0, 0.42, 0.42, 6.5, 7.2, TRIM, LANTERN, {
      level: (a) =>
        ((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1 < 0.35 ? -2 : 0.5,
    });
    dome(-0.6, 0, 7.2, 0.45, GOLD, LANTERN, { zScale: 0.9 });
    sphere(-0.6, 0, 7.75, 0.1, GOLD, LANTERN, "solid");
    growTree(6.4, -5.6, TREE, 0.55, 260, 17100, ELM);
    growTree(6.0, 5.2, TREE, 0.6, 260, 17500, ELM);
    growTree(-5.6, 6.0, TREE, 0.5, 240, 17900, ELM);
  },
};
