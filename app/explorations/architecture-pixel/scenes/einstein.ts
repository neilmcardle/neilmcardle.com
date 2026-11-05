import {
  growTree,
  hash,
  noise,
  rgb,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  dome,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
} from "../engine/kit";

const RENDER: RGB = [228, 222, 206];
const METAL: RGB = [176, 180, 188];
const PATH: RGB[] = [
  [188, 180, 164],
  [200, 192, 176],
];
const PINE: RGB[] = [
  [34, 58, 44],
  [56, 84, 58],
  [88, 112, 72],
];

const STUCCO = 1,
  DOME = 2,
  TOWER = 3,
  ENTRANCE = 5,
  WOODS = 6;

const slot = (u: number, v: number) => {
  const fu = u % 1.5;
  if (fu < 0.35 || fu > 1.2 || v < 0.9 || v > 1.55) return false;
  const e = Math.min(fu - 0.35, 1.2 - fu);
  return e > 0.16 || Math.hypot(0.16 - e, v - 1.22) < 0.33;
};

const bodyLevel = (u: number, v: number) =>
  slot(u, v)
    ? -2.4
    : v > 2.2
      ? 0.7
      : v < 0.2
        ? -0.3
        : (noise(u * 1.5, v * 1.5) - 0.5) * 0.35;
const bodyGlow = (u: number, v: number) =>
  slot(u, v) ? windowId(Math.floor(u / 1.5), 1, 2) : 0;

export const einstein: Scene = {
  id: "einstein",
  scale: 13,
  originY: 24,
  windowLight: [255, 214, 150],
  parts: [
    "",
    "moulded stucco",
    "observatory dome",
    "tower shaft",
    "",
    "rounded entrance",
    "pine woods",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 8.4, 7.2);
    if (edge < 0) return 0;
    if (x > 3.2 && Math.abs(y) < 0.7 + (x - 3.2) * 0.25) {
      setKind(i, 1);
      return tone(PATH, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(226, 220, 200);
    return grass(x, y, ix, iy, i, 0.1);
  },
  build() {
    box(-2.6, -1.45, 0, 1.4, 1.45, 2.4, RENDER, STUCCO, {
      sideX: bodyLevel,
      sideY: bodyLevel,
      glowX: bodyGlow,
      glowY: bodyGlow,
      top: (u, v) => (noise(u, v) - 0.5) * 0.4 + 0.2,
    });
    shadowBox(-2.6, -1.45, 1.4, 1.45, 0, 2.4);
    cylinder(-2.6, 0, 1.45, 1.38, 0, 2.4, RENDER, STUCCO, {
      level: (a, t) =>
        Math.abs(Math.sin(a * 2)) < 0.3 && t > 0.38 && t < 0.62
          ? -2.3
          : t > 0.92
            ? 0.7
            : 0,
      glow: (a, t) =>
        Math.abs(Math.sin(a * 2)) < 0.3 && t > 0.38 && t < 0.62 ? 41 : 0,
    });
    cylinder(1.4, 0, 1.45, 1.38, 0, 2.4, RENDER, STUCCO, {
      level: (a, t) =>
        Math.abs(Math.sin(a * 2 + 0.6)) < 0.25 && t > 0.38 && t < 0.62
          ? -2.3
          : t > 0.92
            ? 0.7
            : 0,
      glow: (a, t) =>
        Math.abs(Math.sin(a * 2 + 0.6)) < 0.25 && t > 0.38 && t < 0.62 ? 43 : 0,
    });
    cylinder(2.5, 0, 1.25, 0.98, 0, 6.6, RENDER, TOWER, {
      level: (a, t) => {
        const front = Math.cos(a) > 0.86 && t < 0.24;
        if (front) return -2.5 + (t < 0.03 ? 0.6 : 0);
        const vertical =
          Math.abs(Math.sin(a * 3)) < 0.22 && t > 0.3 && t < 0.86;
        if (vertical) return -2.3;
        if (Math.abs(t - 0.28) < 0.03 || t > 0.95) return 0.8;
        return (noise(a * 3, t * 6) - 0.5) * 0.4;
      },
      glow: (a, t) =>
        Math.abs(Math.sin(a * 3)) < 0.22 && t > 0.3 && t < 0.86
          ? 47 + (Math.floor(a * 3) & 7)
          : 0,
    });
    cylinder(2.5, 0, 1.06, 1.06, 6.6, 6.78, RENDER, TOWER, {
      level: () => 0.8,
    });
    dome(2.5, 0, 6.78, 1.0, METAL, DOME, {
      level: (a, phi) =>
        (((((a / (Math.PI * 2)) * 12) % 1) + 1) % 1 < 0.08 ? -0.7 : 0.6) +
        (phi > 1.2 ? 0.3 : 0),
    });
    for (const [r, h] of [
      [1.75, 0.12],
      [1.55, 0.24],
      [1.35, 0.36],
    ] as const)
      cylinder(3.0, 0, r, r, 0, h, RENDER, ENTRANCE, {
        level: () => 0.5,
        shadow: false,
      });

    const trees: [number, number, number][] = [
      [-5.2, 4.2, 0.6],
      [-5.8, -3.8, 0.56],
      [5.6, -4.4, 0.5],
      [4.8, 4.6, 0.52],
      [-1.0, 5.2, 0.46],
    ];
    trees.forEach(([x, y, s], k) =>
      growTree(x, y, WOODS, s, 220, 15100 + k * 300, PINE),
    );
  },
};
