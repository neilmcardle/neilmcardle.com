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
  facadeX,
  grass,
  island,
  palm,
  shadowBox,
  tone,
  windowId,
  type Level,
} from "../engine/kit";

const ROOF: RGB = [232, 230, 222];
const GLASS: RGB = [70, 92, 104];
const FRAME: RGB = [46, 44, 42];
const REDWOOD: RGB = [150, 92, 64];
const STONE: RGB = [170, 160, 146];
const DECK: RGB[] = [
  [214, 206, 190],
  [224, 216, 200],
];
const POOL: RGB[] = [
  [70, 160, 184],
  [96, 182, 200],
  [130, 204, 216],
];

const ROOFLINE = 1,
  GLASS_WALL = 2,
  BEAMS = 3,
  POOL_PART = 4,
  CHIMNEY = 5,
  SIDING = 6,
  PALM = 7;

const glassWall: Level = (u, v) =>
  u % 1.2 < 0.06 || v < 0.06 || v > 2.0
    ? -1.4
    : 0.6 + (noise(u * 0.6, v) - 0.5) * 0.8;
const glassGlow = (u: number, v: number) =>
  u % 1.2 < 0.06 || v < 0.06 || v > 2.0
    ? 0
    : windowId(Math.floor(u / 1.2), 0, 4);
const siding: Level = (u) => ((u * 6) % 1 < 0.15 ? -0.7 : 0.2);

export const midCentury: Scene = {
  id: "midcentury",
  scale: 14,
  originY: 14,
  windowLight: [255, 214, 148],
  parts: [
    "",
    "low roofline",
    "glass wall",
    "exposed beams",
    "swimming pool",
    "stone chimney",
    "redwood siding",
    "palm tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.6, y, ix, iy, 7.6, 6.8);
    if (edge < 0) return 0;
    if (x > 3.4 && x < 7.4 && y > -3.6 && y < 1.2) {
      setKind(i, 1);
      if (x > 3.9 && x < 6.9 && y > -3.0 && y < 0.6) {
        setGroundPart(i, POOL_PART);
        return tone(
          POOL,
          0.5 +
            Math.sin(x * 4 + y * 2) * 0.25 +
            (noise(x * 3, y * 3) - 0.5) * 0.4,
          ix,
          iy,
        );
      }
      return tone(DECK, noise(x * 4, y * 4), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(230, 224, 200);
    return grass(x, y, ix, iy, i, 0.35);
  },
  build() {
    box(-3, -3.4, 0, 2.6, 2.4, 2.1, REDWOOD, SIDING, { sideY: siding });
    const glass = rampId(GLASS),
      frame = rampId(FRAME);
    facadeX(2.601, -3.4, 2.4, 0, 2.1, (a, z) => {
      const l = glassWall(a, z);
      return l < 0
        ? [frame, 0.2, GLASS_WALL, 0]
        : [glass, l, GLASS_WALL, glassGlow(a, z)];
    });
    box(-3, 2.4, 0, -0.4, 4.4, 2.1, REDWOOD, SIDING, {
      sideX: siding,
      sideY: (u, v) =>
        u > 0.6 && u < 2.0 && v > 0.8 && v < 1.5 ? -1.8 : siding(u, v),
    });
    shadowBox(-3, -3.4, 2.6, 4.4, 0, 2.1);
    box(-3.4, -4.0, 2.1, 3.4, 3.0, 2.28, ROOF, ROOFLINE, {
      sideX: () => 0.8,
      sideY: () => 0.8,
      top: (u, v) => (noise(u, v) - 0.5) * 0.3,
    });
    box(-3.4, 2.4, 2.1, -0.1, 4.8, 2.28, ROOF, ROOFLINE, {
      sideX: () => 0.8,
      sideY: () => 0.8,
    });
    shadowBox(-3.4, -4.0, 3.4, 4.8, 2.1, 2.28);
    for (let y = -3.6; y <= 2.8; y += 0.6)
      box(3.4, y - 0.05, 2.12, 3.75, y + 0.05, 2.24, FRAME, BEAMS);
    box(-1.6, -0.5, 0, -0.6, 0.5, 3.2, STONE, CHIMNEY, {
      sideX: (u, v) => (noise(u * 6, v * 6) - 0.5) * 1.6,
      sideY: (u, v) => (noise(u * 6, v * 6) - 0.5) * 1.6,
    });
    shadowBox(-1.6, -0.5, -0.6, 0.5, 2.2, 3.2, 0.4);
    palm(5.4, 3.0, 3.6, PALM, 5);
    palm(-4.4, -4.6, 3.2, PALM, 7);
  },
};
