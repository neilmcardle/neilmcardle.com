import {
  capsule,
  growTree,
  hash,
  noise,
  rgb,
  setGroundPart,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  dome,
  island,
  sheet,
  tone,
  type V3,
} from "../engine/kit";

const IRON: RGB = [46, 120, 84];
const AMBER: RGB = [214, 124, 60];
const PANE: RGB = [188, 208, 190];
const SIGN: RGB = [226, 214, 170];
const MORRIS_GREEN: RGB = [52, 84, 64];
const POSTER: RGB = [196, 82, 64];
const COBBLE: RGB[] = [
  [150, 144, 134],
  [164, 158, 148],
  [178, 172, 160],
];
const PAVE: RGB[] = [
  [190, 184, 172],
  [202, 196, 184],
];
const STEP: RGB[] = [
  [40, 40, 44],
  [58, 58, 62],
  [78, 78, 82],
  [100, 100, 104],
];

const CANOPY = 1,
  FRAME = 2,
  LAMPS = 3,
  SIGN_PART = 4,
  STAIR = 5,
  MORRIS = 6,
  TREE = 7,
  BALUSTRADE = 8;
const PLANE: RGB[] = [
  [50, 74, 52],
  [84, 112, 66],
  [128, 150, 84],
];

const balusterLevel = (u: number, v: number) => {
  if (v > 0.78 || v < 0.08) return 0.6;
  const loop = Math.sin(u * 9 + Math.sin(v * 6) * 1.4) * Math.cos(v * 7);
  return loop > 0.35 ? 0.5 : -1.6;
};

export const guimard: Scene = {
  id: "guimard",
  scale: 16,
  originY: 26,
  windowLight: [255, 196, 110],
  parts: [
    "",
    "glass canopy",
    "cast-iron frame",
    "lamp stalks",
    "Métropolitain sign",
    "stair to platforms",
    "Morris column",
    "Paris plane tree",
    "balustrade",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 6.2, 6.0);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (x > -1.5 && x < 1.75 && Math.abs(y) < 1.2) {
      setGroundPart(i, STAIR);
      const depth = (1.75 - x) / 3.25,
        step = (x * 4) % 1 < 0.22;
      return tone(STEP, 0.9 - depth * 0.85 - (step ? 0.25 : 0), ix, iy);
    }
    if (x > 2.6 || y > 3.4) {
      const r = Math.hypot(x * 2.2, y * 2.2),
        arc = Math.floor(r) % 2;
      if (hash(ix, iy) > 0.97) return rgb(120, 116, 110);
      return tone(
        COBBLE,
        0.3 + (arc ? 0.25 : 0) + (noise(x * 6, y * 6) - 0.5) * 0.5,
        ix,
        iy,
      );
    }
    return tone(PAVE, 0.3 + (noise(x * 3, y * 3) - 0.5) * 0.5, ix, iy);
  },
  build() {
    for (const side of [-1, 1]) {
      const y = side * 1.26;
      box(-1.5, y - 0.03, 0, 1.75, y + 0.03, 0.9, IRON, BALUSTRADE, {
        sideY: balusterLevel,
        sideX: balusterLevel,
      });
    }
    box(-1.56, -1.26, 0, -1.5, 1.26, 0.9, IRON, BALUSTRADE, {
      sideX: balusterLevel,
    });

    for (const [x, y] of [
      [-1.5, -1.24],
      [-1.5, 1.24],
      [1.75, -1.24],
      [1.75, 1.24],
    ] as const) {
      const out = x > 0 ? 0.35 : -0.1;
      capsule([x, y, 0], [x, y, 0.9], 0.07, 0.07, IRON, FRAME, "solid");
      capsule(
        [x, y, 0.9],
        [x + out * 0.5, y * 1.12, 2.2],
        0.07,
        0.06,
        IRON,
        FRAME,
        "solid",
      );
      capsule(
        [x + out * 0.5, y * 1.12, 2.2],
        [x + out, y * 1.3, x > 0 ? 2.85 : 3.25],
        0.06,
        0.05,
        IRON,
        FRAME,
        "solid",
      );
    }
    sheet(
      (t, v): V3 => {
        const x = -1.6 + v * 3.95,
          y = (t - 0.5) * (2.6 + v * 0.9);
        return [x, y, 3.3 - v * 0.45 + Math.sin(Math.PI * t) * 0.22];
      },
      PANE,
      CANOPY,
      (u, v) =>
        u % 0.42 < 0.07 || v % 0.5 < 0.07
          ? -2.6
          : 0.9 + (noise(u * 2, v * 2) - 0.5) * 0.6,
      (u, v) =>
        u % 0.42 < 0.06 || v % 0.5 < 0.06
          ? 0
          : 1 + ((Math.floor(u / 0.42) * 7 + Math.floor(v / 0.5) * 13) % 220),
    );
    sheet(
      (t, v): V3 => [-1.62, (t - 0.5) * 2.5, 0.9 + v * 2.35],
      PANE,
      CANOPY,
      (u, v) => (u % 0.42 < 0.06 || v % 0.5 < 0.06 ? -1.8 : 0.3),
      undefined,
      false,
    );

    for (const side of [-1, 1]) {
      const y = side * 1.38;
      capsule([1.95, y, 0], [1.95, y, 1.4], 0.07, 0.06, IRON, LAMPS, "solid");
      capsule(
        [1.95, y, 1.4],
        [2.05, y * 0.95, 2.4],
        0.06,
        0.05,
        IRON,
        LAMPS,
        "solid",
      );
      capsule(
        [2.05, y * 0.95, 2.4],
        [1.95, y * 0.9, 3.0],
        0.05,
        0.05,
        IRON,
        LAMPS,
        "solid",
      );
      box(1.84, y * 0.9 - 0.11, 3.0, 2.06, y * 0.9 + 0.11, 3.38, AMBER, LAMPS, {
        sideX: () => 0.6,
        sideY: () => 0.4,
        glowX: () => 31,
        glowY: () => 31,
      });
    }
    box(1.9, -1.15, 2.42, 1.98, 1.15, 2.78, SIGN, SIGN_PART, {
      sideX: (u, v) => {
        const k = Math.floor(u / 0.16),
          fu = u % 0.16;
        const stroke =
          v > 0.1 &&
          v < 0.27 &&
          fu > 0.03 &&
          fu < 0.12 &&
          (Math.sin(k * 2.3 + v * 30) > -0.2 || fu < 0.05);
        return v < 0.04 || v > 0.32 ? -1.4 : stroke ? -2.2 : 0.5;
      },
    });

    cylinder(-3.6, 3.0, 0.55, 0.55, 0, 0.35, MORRIS_GREEN, MORRIS, {
      top: false,
    });
    cylinder(-3.6, 3.0, 0.5, 0.5, 0.35, 2.4, POSTER, MORRIS, {
      top: false,
      level: (a, t) => (t > 0.9 ? -1.5 : (noise(a * 3, t * 4) - 0.5) * 2.2),
    });
    cylinder(-3.6, 3.0, 0.56, 0.56, 2.4, 2.6, MORRIS_GREEN, MORRIS, {
      top: false,
    });
    dome(-3.6, 3.0, 2.6, 0.5, MORRIS_GREEN, MORRIS, { zScale: 0.7 });

    growTree(3.8, -3.6, TREE, 0.62, 260, 11100, PLANE);
    growTree(-3.8, -3.2, TREE, 0.58, 260, 11500, PLANE);
  },
};
