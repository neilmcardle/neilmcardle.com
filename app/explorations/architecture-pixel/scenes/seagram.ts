import {
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
  island,
  shadowBox,
  tone,
  windowId,
  type BoxOptions,
} from "../engine/kit";

const BRONZE: RGB = [120, 92, 64];
const GLASS: RGB = [86, 72, 58];
const GRANITE: RGB[] = [
  [176, 166, 154],
  [188, 178, 166],
  [198, 188, 176],
];
const WATER: RGB = [50, 76, 92];
const ROAD: RGB[] = [
  [64, 64, 72],
  [72, 72, 80],
];

const CURTAIN = 1,
  CROWN = 2,
  PODIUM = 3,
  POOLS = 4,
  PLAZA = 5,
  AVENUE = 6;

const TOP = 19.0,
  MECH = 17.8,
  FLOOR = 0.47;

function curtain(seed: number): BoxOptions {
  const level = (u: number, v: number) => {
    if (u % 0.28 < 0.05) return 0.9;
    if (v % FLOOR < 0.12) return -0.5;
    return 0.1 + (noise(u * 0.3, v * 0.2) - 0.5) * 0.5;
  };
  const glow = (u: number, v: number) =>
    u % 0.28 >= 0.05 && v % FLOOR >= 0.12 && v > 1.2 && v < MECH
      ? windowId(Math.floor(u / 0.28), Math.floor(v / FLOOR), seed)
      : 0;
  return { sideX: level, sideY: level, glowX: glow, glowY: glow };
}

export const seagram: Scene = {
  id: "seagram",
  scale: 7.5,
  originY: 56,
  windowLight: [255, 226, 176],
  parts: [
    "",
    "bronze curtain wall",
    "mechanical crown",
    "rear podium",
    "reflecting pools",
    "granite plaza",
    "Park Avenue",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.4, y, ix, iy, 9.6, 9.0);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (x > 7.0) {
      setGroundPart(i, AVENUE);
      if (Math.abs(x - 8.6) < 0.08 && Math.floor(y) % 2 === 0)
        return rgb(226, 222, 210);
      return tone(ROAD, noise(x * 2, y * 2), ix, iy);
    }
    if (x > 1.6 && x < 5.4 && Math.abs(Math.abs(y) - 2.6) < 1.1) {
      setGroundPart(i, POOLS);
      if (Math.abs(Math.abs(y) - 2.6) > 0.95 || x < 1.75 || x > 5.25)
        return rgb(200, 190, 178);
      const glint = hash(ix, iy) > 0.94 ? 60 : 0;
      return rgb(WATER[0] + glint, WATER[1] + glint, WATER[2] + glint);
    }
    setGroundPart(i, PLAZA);
    const slab = (Math.floor(x / 0.9) + Math.floor(y / 0.9)) % 2;
    return tone(
      GRANITE,
      0.3 + slab * 0.2 + (noise(x * 3, y * 3) - 0.5) * 0.3,
      ix,
      iy,
    );
  },
  build() {
    box(-2.2, -2.8, 0, 0.6, 2.8, TOP, GLASS, CURTAIN, {
      ...curtain(1),
      topColor: BRONZE,
    });
    box(-2.21, -2.81, MECH, 0.61, 2.81, TOP, BRONZE, CROWN, {
      sideX: (u, v) => (u % 0.28 < 0.05 ? 0.9 : (v * 6) % 1 < 0.5 ? -0.6 : 0),
      sideY: (u, v) => (u % 0.28 < 0.05 ? 0.9 : (v * 6) % 1 < 0.5 ? -0.6 : 0),
    });
    box(-2.21, -2.81, 0, 0.61, 2.81, 1.2, [60, 52, 46], CURTAIN, {
      sideX: (u) => (u % 0.56 < 0.1 ? 0.9 : -1.6),
      sideY: (u) => (u % 0.56 < 0.1 ? 0.9 : -1.6),
    });
    shadowBox(-2.1, -2.7, 0.5, 2.7, 0, TOP);
    box(-5.4, -3.6, 0, -2.2, 3.6, 4.2, GLASS, PODIUM, curtain(2));
    shadowBox(-5.3, -3.5, -2.3, 3.5, 0, 4.2);
    box(-5.6, -3.8, 0, 1.2, 3.8, 0.18, GRANITE[1], PLAZA);
  },
};
