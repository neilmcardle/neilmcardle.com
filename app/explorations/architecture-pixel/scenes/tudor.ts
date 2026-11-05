import {
  hash,
  noise,
  rampId,
  rgb,
  setGroundPart,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  facadeX,
  facadeY,
  gableX,
  gableY,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const BRICK: RGB = [168, 82, 60];
const OAK: RGB = [70, 52, 40];
const PLASTER: RGB = [228, 216, 188];
const TILE: RGB = [150, 84, 60];
const GLASS: RGB = [52, 60, 70];
const GRAVEL: RGB[] = [
  [196, 186, 164],
  [208, 198, 176],
  [218, 208, 186],
];
const HEDGE: RGB[] = [
  [34, 62, 40],
  [48, 80, 50],
];

const STUDDING = 1,
  JETTY = 2,
  CHIMNEY = 3,
  ARCH = 4,
  WINDOWS = 5,
  PLINTH = 6,
  ROOF = 7,
  KNOT = 8;

const brick = rampId(BRICK),
  oak = rampId(OAK),
  plaster = rampId(PLASTER),
  glass = rampId(GLASS);
const UP0 = 2.0,
  UP1 = 3.8;

function timbered(seed: number, len: number) {
  return (a: number, z: number): Cell => {
    const zl = z - UP0;
    if (zl < 0.16) return [oak, 0.2 + (a % 0.6 < 0.04 ? -0.8 : 0), JETTY, 0];
    if (zl > UP1 - UP0 - 0.12 || Math.abs(zl - 0.92) < 0.05)
      return [oak, 0.1, STUDDING, 0];
    const bay = Math.floor(a / 1.4),
      fa = a % 1.4;
    if (
      fa > 0.3 &&
      fa < 1.1 &&
      zl > 0.42 &&
      zl < 1.32 &&
      a > 0.3 &&
      a < len - 0.3
    ) {
      if ((fa - 0.3) % 0.2 < 0.04 || Math.abs(zl - 0.87) < 0.03)
        return [oak, -0.4, WINDOWS, 0];
      return [
        glass,
        (Math.floor(fa * 20) + Math.floor(zl * 20)) % 2 ? 0.2 : -0.3,
        WINDOWS,
        windowId(bay, seed, 3),
      ];
    }
    if (a % 0.34 < 0.1)
      return [oak, (noise(a * 3, z * 2) - 0.5) * 0.6, STUDDING, 0];
    return [plaster, (noise(a * 2 + seed, z * 3) - 0.5) * 0.5, STUDDING, 0];
  };
}

function plinth(seed: number) {
  return (a: number, z: number): Cell => {
    const row = Math.floor(z * 7),
      course = (z * 7) % 1 < 0.16;
    const diaper =
      ((a + z) * 1.2) % 1 < 0.1 || ((((a - z) * 1.2) % 1) + 1) % 1 < 0.1;
    const fa = a % 2.2;
    if (fa > 0.7 && fa < 1.5 && z > 0.7 && z < 1.6) {
      if ((fa - 0.7) % 0.2 < 0.04) return [oak, -0.3, WINDOWS, 0];
      return [
        glass,
        (Math.floor(fa * 20) + Math.floor(z * 20)) % 2 ? 0.2 : -0.3,
        WINDOWS,
        windowId(Math.floor(a / 2.2), seed, 4),
      ];
    }
    return [
      brick,
      (course ? -0.7 : 0.1) +
        (diaper ? -1 : 0) +
        (hash(Math.floor(a * 4 + (row % 2) * 0.5), row) - 0.5) * 0.6,
      PLINTH,
      0,
    ];
  };
}

function chimney(x: number, y: number, top: number) {
  box(x - 0.45, y - 0.3, 3.4, x + 0.45, y + 0.3, top, BRICK, CHIMNEY, {
    sideX: (u, v) => ((v * 7) % 1 < 0.15 ? -0.6 : 0.2),
    sideY: (u, v) => ((v * 7) % 1 < 0.15 ? -0.6 : 0.2),
  });
  shadowBox(x - 0.4, y - 0.25, x + 0.4, y + 0.25, 3.4, top, 0.35);
  for (const o of [-0.18, 0.18]) {
    cylinder(x, y + o, 0.16, 0.15, top, top + 1.6, BRICK, CHIMNEY, {
      level: (a, t) => (Math.floor(a * 1.6 + t * 9) % 2 ? 0.5 : -0.4),
      top: false,
    });
    cylinder(x, y + o, 0.22, 0.22, top + 1.6, top + 1.8, BRICK, CHIMNEY, {
      level: () => 0.6,
    });
  }
}

const knot = (x: number, y: number) => {
  const cx = 7.4,
    cy = -0.6,
    dx = x - cx,
    dy = y - cy;
  if (Math.abs(dx) > 2.2 || Math.abs(dy) > 2.6) return -1;
  const ring = Math.abs(Math.hypot(dx, dy * 0.85) - 1.5) < 0.12;
  const diamond = Math.abs(Math.abs(dx) + Math.abs(dy) * 0.8 - 1.9) < 0.12;
  const edge =
    Math.abs(Math.abs(dx) - 2.1) < 0.12 || Math.abs(Math.abs(dy) - 2.5) < 0.12;
  const cross =
    (Math.abs(dx) < 0.1 || Math.abs(dy) < 0.1) && Math.hypot(dx, dy) < 0.9;
  return ring || diamond || edge || cross ? 1 : 0;
};

export const tudor: Scene = {
  id: "tudor",
  scale: 11,
  originY: 18,
  windowLight: [255, 198, 112],
  parts: [
    "",
    "close studding",
    "jettied upper floor",
    "clustered chimneys",
    "four-centred arch",
    "leaded windows",
    "red brick plinth",
    "clay tile roof",
    "knot garden",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 2.6, y, ix, iy, 9.4, 8.2);
    if (edge < 0) return 0;
    const k = knot(x, y);
    if (k === 1) {
      setGroundPart(i, KNOT);
      return tone(HEDGE, noise(x * 4, y * 4), ix, iy);
    }
    if (k === 0 || (x > 4.5 && Math.abs(y) < 0.6)) {
      setKind(i, 1);
      if (k === 0) setGroundPart(i, KNOT);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(236, 230, 210);
    return grass(x, y, ix, iy, i, 0.2);
  },
  build() {
    box(0, -4, 0, 3.4, 4, UP0, BRICK, PLINTH);
    facadeX(3.401, -4, 2.6, 0, UP0, plinth(1));
    box(0, -4.2, UP0, 3.75, 4.2, UP1, PLASTER, STUDDING);
    facadeX(3.751, -4.2, 2.4, UP0, UP1, timbered(1, 6.6));
    shadowBox(0, -4.2, 3.75, 4.2, 0, UP1);
    gableY(-4.35, 4.2, -0.15, 3.9, UP1, 2.6, TILE, ROOF);

    box(0, 2.6, 0, 5.4, 4.6, UP0, BRICK, PLINTH);
    facadeX(5.401, 2.6, 4.6, 0, UP0, plinth(2));
    facadeY(4.601, 0, 5.4, 0, UP0, plinth(3));
    box(0, 2.4, UP0, 5.75, 4.8, UP1, PLASTER, STUDDING);
    facadeX(5.751, 2.4, 4.8, UP0, UP1, timbered(2, 2.4));
    facadeY(4.801, 0, 5.75, UP0, UP1, timbered(3, 5.75));
    shadowBox(0, 2.4, 5.75, 4.8, 0, UP1);
    gableX(0, 5.9, 2.25, 4.95, UP1, 2.4, TILE, ROOF);
    facadeX(5.901, 2.25, 4.95, UP1, UP1 + 2.4, (a, z) => {
      const h = z - UP1,
        half = 1.35 * (1 - h / 2.4),
        c = a - 1.35;
      if (Math.abs(c) > half) return null;
      if (Math.abs(c) > half - 0.12 || Math.abs(c) < 0.05 || h < 0.1)
        return [oak, 0.1, STUDDING, 0];
      if (Math.abs(Math.abs(c) - h * 0.56 - 0.1) < 0.06)
        return [oak, 0, STUDDING, 0];
      return [plaster, (noise(a * 3, z * 3) - 0.5) * 0.5, STUDDING, 0];
    });

    box(3.4, -0.75, 0, 4.5, 0.75, 2.6, BRICK, ARCH, {
      sideY: (u, v) => ((v * 7) % 1 < 0.15 ? -0.7 : 0.1),
    });
    facadeX(4.501, -0.75, 0.75, 0, 2.6, (a, z) => {
      const c = (a - 0.75) / 0.46;
      const archTop =
        1.25 +
        0.32 *
          Math.sqrt(Math.max(0, 1 - c * c)) *
          (Math.abs(c) < 0.75 ? 1 : 0.8);
      if (Math.abs(c) < 1 && z < archTop)
        return [
          oak,
          z < 1.25 ? ((a * 6) % 1 < 0.1 ? -0.4 : 0.2) : -0.6,
          ARCH,
          0,
        ];
      if (Math.abs(c) < 1.2 && z < archTop + 0.12)
        return [plaster, 0.6, ARCH, 0];
      return [brick, (z * 7) % 1 < 0.15 ? -0.7 : 0.1, ARCH, 0];
    });
    shadowBox(3.4, -0.75, 4.5, 0.75, 0, 2.6);
    gableX(3.4, 4.65, -0.9, 0.9, 2.6, 0.9, TILE, ROOF, {
      color: BRICK,
      part: ARCH,
    });

    chimney(0.9, -2.4, 5.6);
    chimney(0.9, 1.2, 5.8);
    chimney(2.6, 4.75, 5.4);
  },
};
