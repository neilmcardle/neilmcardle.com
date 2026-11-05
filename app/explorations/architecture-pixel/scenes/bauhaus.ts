import {
  growTree,
  hash,
  noise,
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
  cylinder,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Glow,
  type Level,
} from "../engine/kit";

const RENDER: RGB = [236, 234, 228];
const GLASS: RGB = [68, 96, 108];
const FRAME: RGB = [40, 40, 46];
const PATH: RGB[] = [
  [188, 184, 176],
  [200, 196, 188],
  [210, 206, 198],
];
const BIRCH: RGB[] = [
  [62, 96, 58],
  [104, 138, 76],
  [150, 176, 98],
];

const CURTAIN = 1,
  BRIDGE = 2,
  BALCONY = 3,
  STUDIOS = 4,
  RENDER_PART = 5,
  PILOTIS = 7,
  TREE = 8;

const renderRamp = rampId(RENDER);

const curtain = (seed: number) => {
  const cell = (u: number, v: number) => ({
    mullion: u % 0.36 < 0.05 || v % 0.42 < 0.05,
    k: windowId(Math.floor(u / 0.36), Math.floor(v / 0.42), seed),
  });
  const level: Level = (u, v) => {
    if (v < 0.7)
      return v < 0.08 ? 0.6 : -0.4 + (noise(u * 3, v * 6) - 0.5) * 0.4;
    if (v > 3.95) return 0.9;
    return cell(u, v).mullion
      ? -1.4
      : 0.6 + (noise(u * 0.5, v * 0.3) - 0.5) * 0.8;
  };
  const glow: Glow = (u, v) =>
    v >= 0.7 && v <= 3.95 && !cell(u, v).mullion ? cell(u, v).k : 0;
  return { level, glow };
};

const ribbons = (bands: [number, number][], seed: number) => {
  const hit = (u: number, v: number) =>
    bands.some(([a, b]) => v > a && v < b) && u % 0.6 > 0.05;
  const level: Level = (u, v) =>
    hit(u, v)
      ? u % 0.6 < 0.09
        ? -1.2
        : -0.2
      : v % 1.2 < 0.04
        ? 0.3
        : (noise(u * 2, v * 2) - 0.5) * 0.3;
  const glow: Glow = (u, v) =>
    hit(u, v) && u % 0.6 >= 0.09
      ? windowId(Math.floor(u / 0.6), Math.floor(v / 0.6), seed)
      : 0;
  return { level, glow };
};

export const bauhaus: Scene = {
  id: "bauhaus",
  scale: 11,
  originY: 16,
  windowLight: [255, 226, 168],
  parts: [
    "",
    "glass curtain wall",
    "bridge wing",
    "studio balconies",
    "Prellerhaus studios",
    "white render",
    "",
    "",
    "birch tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x + 1.2, y - 1.2, ix, iy, 9.4, 9.6);
    if (edge < 0) return 0;
    const path =
      (y > -1.9 && y < 0.3 && x < 0 && x > -4.6) ||
      (x > 5 && x < 6.6 && y > -4.4 && y < 1.6) ||
      (y > 1.2 && y < 2.4 && x > 2.4);
    if (path) {
      setKind(i, 1);
      return tone(PATH, 0.3 + (noise(x * 3, y * 3) - 0.5) * 0.5, ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(228, 224, 210);
    return grass(x, y, ix, iy, i, 0.2);
  },
  build() {
    const ws = curtain(2);
    box(0, -4, 0, 5, 1, 4.2, GLASS, CURTAIN, {
      sideX: ws.level,
      sideY: (u, v) => (u < 0.7 ? 0.4 : ws.level(u, v)),
      glowX: ws.glow,
      glowY: (u, v) => (u < 0.7 ? 0 : ws.glow(u, v)),
      topColor: RENDER,
    });
    shadowBox(0, -4, 5, 1, 0, 4.2);
    for (let u = 0; u <= 0.7; u += step())
      for (let z = 0; z <= 4.2; z += step())
        surf(u, 1.0015, z, renderRamp, z < 0.7 ? -0.4 : 0.3, PY, RENDER_PART);

    const br = ribbons(
      [
        [2.55, 3.15],
        [3.45, 4.0],
      ],
      3,
    );
    box(-4.5, -1.8, 2.2, 0, 0.2, 4.2, RENDER, BRIDGE, {
      sideX: br.level,
      sideY: br.level,
      glowX: br.glow,
      glowY: br.glow,
    });
    shadowBox(-4.4, -1.7, -0.1, 0.1, 2.2, 4.2);
    for (const x of [-3.6, -2.2, -0.8])
      for (const y of [-1.6, 0])
        cylinder(x, y, 0.11, 0.11, 0, 2.2, RENDER, PILOTIS, { top: false });

    const vs = ribbons(
      [
        [0.9, 1.6],
        [2.2, 2.9],
        [3.4, 4.0],
      ],
      4,
    );
    box(-7.6, -4.6, 0, -4.5, 2.2, 4.2, RENDER, RENDER_PART, {
      sideX: vs.level,
      sideY: vs.level,
      glowX: vs.glow,
      glowY: vs.glow,
    });
    shadowBox(-7.5, -4.5, -4.6, 2.1, 0, 4.2);

    const cs = ribbons([[0.5, 1.3]], 5);
    box(0.6, 1, 0, 2.4, 2.2, 1.6, RENDER, RENDER_PART, {
      sideX: cs.level,
      sideY: cs.level,
      glowX: cs.glow,
      glowY: cs.glow,
    });

    const studio = (u: number, v: number) => {
      const floor = Math.floor(v / 1.25),
        bay = Math.floor(u / 0.86),
        fu = u % 0.86,
        fv = v % 1.25;
      return {
        floor,
        bay,
        win: floor > 0 && fu > 0.2 && fu < 0.66 && fv > 0.25 && fv < 1.0,
      };
    };
    box(0.6, 2.2, 0, 2.4, 7.4, 6.4, RENDER, STUDIOS, {
      sideX: (u, v) =>
        studio(u, v).win
          ? -2.2
          : v > 6.25
            ? 0.6
            : (noise(u * 2, v * 2) - 0.5) * 0.3,
      glowX: (u, v) =>
        studio(u, v).win
          ? windowId(studio(u, v).bay, studio(u, v).floor, 6)
          : 0,
      sideY: (u, v) =>
        u > 0.4 && u < 1.4 && v % 1.25 > 0.3 && v % 1.25 < 0.95 && v > 1.2
          ? -2
          : 0,
      glowY: (u, v) =>
        u > 0.4 && u < 1.4 && v % 1.25 > 0.3 && v % 1.25 < 0.95 && v > 1.2
          ? windowId(1, Math.floor(v / 1.25), 7)
          : 0,
    });
    shadowBox(0.7, 2.3, 2.3, 7.3, 0, 6.4);
    for (let f = 1; f < 5; f++)
      for (let b = 0; b < 6; b++) {
        const y = 2.2 + b * 0.86 + 0.18,
          z = f * 1.25 + 0.2;
        box(2.4, y, z, 2.85, y + 0.5, z + 0.08, RENDER, BALCONY, {
          top: () => 0.4,
        });
        box(2.82, y, z + 0.08, 2.85, y + 0.5, z + 0.42, FRAME, BALCONY, {
          sideX: (u, v) => (u % 0.12 < 0.04 || v > 0.3 ? 0.4 : -3),
        });
      }
    box(-0.2, -4.2, 4.2, 5.2, 1.2, 4.32, RENDER, RENDER_PART);

    growTree(6.4, 4.6, TREE, 0.48, 220, 8100, BIRCH);
    growTree(-5.8, 5.6, TREE, 0.5, 220, 8500, BIRCH);
    growTree(7.2, -5.6, TREE, 0.42, 200, 8900, BIRCH);
  },
};
