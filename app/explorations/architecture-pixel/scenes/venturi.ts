import {
  growTree,
  hash,
  noise,
  rampId,
  rgb,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  facadeX,
  gableX,
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Cell,
} from "../engine/kit";

const PAINT: RGB = [196, 198, 176];
const TRIM: RGB = [234, 232, 220];
const VOID: RGB = [40, 42, 40];
const GLASS: RGB = [52, 60, 64];
const SHINGLE: RGB = [86, 86, 90];
const GRAVEL: RGB[] = [
  [190, 182, 164],
  [202, 194, 176],
  [212, 204, 186],
];
const OAK: RGB[] = [
  [46, 72, 46],
  [80, 108, 60],
  [124, 146, 78],
];

const GABLE = 1,
  ARCH = 2,
  RIBBON = 3,
  CHIMNEY = 4,
  ENTRANCE = 5,
  ROOF = 6,
  TREE = 7;

const paint = rampId(PAINT),
  trim = rampId(TRIM),
  hole = rampId(VOID),
  glass = rampId(GLASS);
const W = 4.2,
  EAVE = 2.5,
  RISE = 2.4,
  NOTCH = 0.42;

function front(a: number, z: number): Cell | null {
  const y = a - W;
  const top = EAVE + RISE * (1 - Math.abs(y) / W);
  if (z > top) return null;
  if (Math.abs(y) < NOTCH && z > EAVE + RISE * (1 - NOTCH / W) - 0.9)
    return null;
  if (top - z < 0.1) return [trim, 0.6, GABLE, 0];
  if (Math.abs(z - 2.45) < 0.05) return [trim, 0.7, ARCH, 0];
  const r = Math.hypot(y, z - 2.15);
  if (z > 2.15 && Math.abs(r - 1.45) < 0.06) return [trim, 0.8, ARCH, 0];
  if (Math.abs(y) < 0.62 && z < 2.1)
    return [hole, -0.8 + (z < 0.15 ? 0.4 : 0), ENTRANCE, 0];
  if (y > 1.3 && y < 3.7 && z > 1.15 && z < 1.65)
    return (y - 1.3) % 0.48 < 0.05
      ? [trim, 0.6, RIBBON, 0]
      : [glass, -0.2, RIBBON, windowId(Math.floor((y - 1.3) / 0.48), 1, 3)];
  for (const c of [-2.4, -1.4]) {
    if (Math.abs(y - c) < 0.32 && z > 1.0 && z < 1.65)
      return Math.abs(y - c) < 0.03
        ? [trim, 0.6, RIBBON, 0]
        : [glass, -0.2, RIBBON, windowId(c * 3, 1, 4)];
  }
  if (Math.abs(y + 2.9) < 0.22 && z > 3.0 && z < 3.4)
    return [glass, -0.2, RIBBON, windowId(9, 2, 4)];
  return [paint, (noise(a * 2, z * 2) - 0.5) * 0.3, GABLE, 0];
}

export const venturi: Scene = {
  id: "venturi",
  scale: 15,
  originY: 22,
  windowLight: [255, 210, 140],
  parts: [
    "",
    "split gable",
    "broken arch",
    "ribbon window",
    "chimney",
    "recessed entrance",
    "shingle roof",
    "oak tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.0, y, ix, iy, 7.2, 6.8);
    if (edge < 0) return 0;
    if (x > 2.6 && Math.abs(y) < 0.8 + (x - 2.6) * 0.15) {
      setKind(i, 1);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(230, 224, 204);
    return grass(x, y, ix, iy, i, 0.25);
  },
  build() {
    box(-2.4, -W, 0, 2.5, W, EAVE, PAINT, GABLE, {
      sideY: (u, v) =>
        v > EAVE - 0.1 ? 0.6 : (noise(u * 2, v * 2) - 0.5) * 0.3,
    });
    shadowBox(-2.4, -W, 2.5, W, 0, EAVE);
    gableX(-2.5, 2.45, -W - 0.1, W + 0.1, EAVE, RISE, SHINGLE, ROOF);
    box(0.4, -0.55, EAVE, 1.4, 0.55, EAVE + RISE + 0.9, PAINT, CHIMNEY, {
      sideX: (u, v) => (v > RISE + 0.7 ? 0.6 : 0),
      sideY: (u, v) => (v > RISE + 0.7 ? 0.6 : 0),
    });
    shadowBox(0.4, -0.55, 1.4, 0.55, EAVE, EAVE + RISE + 0.9, 0.4);
    box(2.5, -W, 0, 2.62, W, 0.12, TRIM, GABLE);
    facadeX(2.621, -W, W, 0, EAVE + RISE, front);
    shadowBox(2.5, -W, 2.62, W, 0, EAVE + RISE * 0.6);
    growTree(-4.6, 4.8, TREE, 0.62, 280, 16100, OAK);
    growTree(5.4, -4.8, TREE, 0.55, 260, 16500, OAK);
  },
};
