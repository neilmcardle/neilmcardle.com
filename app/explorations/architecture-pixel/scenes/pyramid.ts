import {
  hash,
  noise,
  rgb,
  setGroundPart,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import { box, island, pyramid, shadowBox, tone } from "../engine/kit";

const LIMESTONE: RGB = [214, 186, 138];
const CASING: RGB = [232, 216, 184];
const MASTABA: RGB = [200, 172, 128];
const SAND: RGB[] = [
  [204, 170, 116],
  [216, 184, 130],
  [226, 196, 144],
  [236, 210, 160],
];
const ROAD: RGB[] = [
  [188, 160, 118],
  [198, 170, 128],
];

const COURSES = 1,
  APEX = 2,
  QUEEN = 3,
  MASTABA_PART = 4,
  CAUSEWAY = 5,
  ENTRANCE = 6,
  DUNE = 7;

const HW = 5.6,
  HEIGHT = 7.1;

const coursed = (scale: number, seed: number) => (a: number, t: number) => {
  const row = Math.floor(t * 46 * scale),
    block = Math.floor((a + (row % 2) * 0.3) * 2.4);
  const joint = (t * 46 * scale) % 1 < 0.22;
  const weather = (noise(a * 0.6 + seed, t * 8) - 0.5) * 1.1;
  return (
    (joint ? -0.8 : 0.2) + (hash(block, row + seed) > 0.8 ? -0.4 : 0) + weather
  );
};

export const greatPyramid: Scene = {
  id: "pyramid",
  scale: 11,
  originY: 22,
  parts: [
    "",
    "limestone courses",
    "apex",
    "queens' pyramid",
    "mastaba tomb",
    "causeway",
    "entrance",
    "desert sand",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 0.6, y, ix, iy, 11.4, 10.4);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (y > 2.2 && y < 3.4 && x > HW) {
      setGroundPart(i, CAUSEWAY);
      return tone(ROAD, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.985) return rgb(170, 140, 100);
    const ripple = Math.sin((x + y) * 3.2 + noise(x * 0.4, y * 0.4) * 6) * 0.12;
    if (edge > 0.82) setGroundPart(i, DUNE);
    return tone(
      SAND,
      0.42 + ripple + (noise(x * 0.6, y * 0.6) - 0.5) * 0.5,
      ix,
      iy,
    );
  },
  build() {
    pyramid(0, 0, HW, 0, HEIGHT, LIMESTONE, COURSES, coursed(1, 0));
    pyramid(0, 0, HW * 0.08, HEIGHT * 0.92, HEIGHT * 0.08, CASING, APEX);
    box(
      0.85,
      HW * (1 - 1.8 / HEIGHT),
      1.4,
      1.15,
      HW * (1 - 1.4 / HEIGHT) + 0.05,
      1.8,
      [120, 96, 70],
      ENTRANCE,
      { sideY: () => -2.2, top: () => -1.5 },
    );

    for (const [x, y] of [
      [7.2, -3.4],
      [7.2, -1.4],
      [7.2, 0.6],
    ] as const) {
      pyramid(x, y, 0.85, 0, 1.15, LIMESTONE, QUEEN, coursed(0.35, x + y));
    }
    for (let k = 0; k < 9; k++) {
      const x = -7.4 + (k % 3) * 1.7,
        y = 6.0 + Math.floor(k / 3) * 1.25;
      if (hash(k, 9) < 0.25) continue;
      box(
        x,
        y,
        0,
        x + 1.2,
        y + 0.8,
        0.5 + hash(k, 10) * 0.25,
        MASTABA,
        MASTABA_PART,
        {
          sideX: (u, v) => (noise(u * 3, v * 6) - 0.5) * 0.8,
          sideY: (u, v) => (noise(u * 3, v * 6) - 0.5) * 0.8,
        },
      );
      shadowBox(x + 0.1, y + 0.1, x + 1.1, y + 0.7, 0, 0.6, 0.35);
    }
    for (let k = 0; k < 24; k++) {
      const x = (hash(k, 21) - 0.5) * 20,
        y = (hash(k, 22) - 0.5) * 18;
      if (Math.max(Math.abs(x), Math.abs(y)) < HW + 1) continue;
      sphere(x, y, 0.04, 0.12 + hash(k, 23) * 0.16, SAND[0], 0, "rough");
    }
  },
};
