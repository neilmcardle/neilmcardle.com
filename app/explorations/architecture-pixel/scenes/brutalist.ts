import {
  growTree,
  hash,
  noise,
  PX,
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
  grass,
  island,
  shadowBox,
  tone,
  windowId,
  type Level,
} from "../engine/kit";

const CONCRETE: RGB = [178, 174, 166];
const GLASS: RGB = [46, 50, 60];
const PANEL: RGB = [168, 92, 62];
const PATH: RGB[] = [
  [184, 180, 170],
  [196, 192, 182],
  [206, 202, 192],
];
const PLANE: RGB[] = [
  [48, 72, 50],
  [82, 110, 64],
  [126, 148, 82],
];

const SLAB = 1,
  SERVICE = 2,
  BRIDGE = 3,
  BOILER = 4,
  BALCONY = 5,
  CORRIDOR = 6,
  TREE = 7;

const SLAB_TOP = 16.4,
  SERVICE_TOP = 18.4,
  BOILER_TOP = 20.2,
  FLOOR = SLAB_TOP / 31;
const concrete = rampId(CONCRETE),
  glass = rampId(GLASS),
  panel = rampId(PANEL);

const brut =
  (seed: number): Level =>
  (u, v) =>
    ((v * 7) % 1 < 0.16 ? -0.55 : 0) +
    (noise(u * 3 + seed, v * 0.35) - 0.5) * 1.1 +
    (hash((u * 6) | 0, seed) > 0.92 ? -0.4 : 0);

function facade(u: number, z: number): [number, number, number, number] {
  const f = Math.floor(z / FLOOR),
    fz = z - f * FLOOR;
  if (f === 0)
    return Math.floor(u * 1.2) % 2 === 0 && fz > 0.08
      ? [glass, -0.5, SLAB, windowId(u | 0, 0, 3)]
      : [concrete, brut(1)(u, z), SLAB, 0];
  if (u < 0.32 || u > 8.88) return [concrete, brut(2)(u, z) + 0.3, SLAB, 0];
  const fin = (u - 0.32) % 1.15 < 0.12;
  if (fin) return [concrete, 0.5 + brut(3)(u, z) * 0.4, SLAB, 0];
  if (f % 3 === 1) {
    const win = (u * 2.4) % 1 < 0.5 && fz > 0.18 && fz < 0.4;
    return win
      ? [glass, -0.2, CORRIDOR, windowId(Math.floor(u * 2.4), f, 4)]
      : [concrete, brut(4)(u, z) + 0.2, CORRIDOR, 0];
  }
  if (fz < 0.09) return [concrete, 1.0, BALCONY, 0];
  if (fz < 0.24) {
    const bay = Math.floor((u - 0.32) / 1.15);
    return hash(bay, f) > 0.7
      ? [panel, -0.2, BALCONY, 0]
      : [concrete, -0.6 + brut(5)(u, z) * 0.3, BALCONY, 0];
  }
  return [
    glass,
    Math.floor(u * 5) % 2 ? -0.3 : 0.2,
    BALCONY,
    windowId(Math.floor((u - 0.32) / 1.15), f, 5),
  ];
}

export const brutalist: Scene = {
  id: "brutalist",
  scale: 8,
  originY: 50,
  windowLight: [255, 208, 132],
  parts: [
    "",
    "béton brut",
    "service tower",
    "access bridge",
    "boiler house",
    "balcony",
    "corridor floor",
    "London plane tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y + 0.4, ix, iy, 9.4, 10.2);
    if (edge < 0) return 0;
    const path =
      (x > 1.4 && x < 3.4 && y > -7.4 && y < 6.6) ||
      (y > 6.2 && y < 7.6 && x > -2) ||
      (Math.abs(y + 1) < 0.7 && x > 3.4);
    if (path) {
      setKind(i, 1);
      const slab = (Math.floor(x * 1.2) + Math.floor(y * 0.8)) % 2;
      return tone(
        PATH,
        0.3 + slab * 0.25 + (noise(x * 3, y * 3) - 0.5) * 0.35,
        ix,
        iy,
      );
    }
    if (hash(ix, iy) > 0.99) return rgb(220, 214, 200);
    return grass(x, y, ix, iy, i, 0.1);
  },
  build() {
    box(-1.4, -3, 0, 1.4, 6.2, SLAB_TOP, CONCRETE, SLAB, {
      sideY: (u, v) => {
        const slot =
          Math.abs(u - 1.4) < 0.14 && Math.floor(v / FLOOR) % 3 === 1;
        return slot ? -2 : brut(7)(u, v);
      },
      glowY: (u, v) =>
        Math.abs(u - 1.4) < 0.14 && Math.floor(v / FLOOR) % 3 === 1
          ? windowId(1, Math.floor(v / FLOOR), 6)
          : 0,
      top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.6 - 0.3,
    });
    const st = step();
    for (let u = 0; u <= 9.2; u += st)
      for (let z = 0; z <= SLAB_TOP; z += st) {
        const [ramp, level, part, glow] = facade(u, z);
        const fz = z - Math.floor(z / FLOOR) * FLOOR;
        const proud = part === BALCONY && fz < 0.09 ? 0.18 : 0;
        surf(1.4 + 0.001 + proud, -3 + u, z, ramp, level, PX, part, glow);
      }
    shadowBox(-1.2, -2.8, 1.2, 6.0, 0, SLAB_TOP);

    box(-1.0, -6.6, 0, 1.0, -4.4, SERVICE_TOP, CONCRETE, SERVICE, {
      sideX: (u, v) => {
        const slit =
          (Math.abs(u - 0.6) < 0.08 || Math.abs(u - 1.6) < 0.08) &&
          v % 1.2 > 0.15;
        return slit ? -2.2 : brut(9)(u, v);
      },
      glowX: (u, v) =>
        (Math.abs(u - 0.6) < 0.08 || Math.abs(u - 1.6) < 0.08) && v % 1.2 > 0.15
          ? windowId(u > 1 ? 1 : 0, Math.floor(v / 1.2), 8)
          : 0,
      sideY: brut(10),
    });
    shadowBox(-0.8, -6.4, 0.8, -4.6, 0, SERVICE_TOP);

    for (let k = 0; k < 10; k++) {
      const z = 1.6 + k * 3 * FLOOR + FLOOR;
      box(-0.75, -4.4, z, 0.75, -3, z + FLOOR * 0.9, CONCRETE, BRIDGE, {
        sideX: (u, v) => (v > 0.12 && v < 0.36 ? -2 : 0.3),
        glowX: (u, v) => (v > 0.12 && v < 0.36 ? windowId(k, 0, 9) : 0),
      });
      shadowBox(-0.7, -4.4, 0.7, -3, z, z + FLOOR * 0.9, 0.4);
    }

    box(-1.5, -7.0, SERVICE_TOP, 1.5, -3.8, BOILER_TOP, CONCRETE, BOILER, {
      sideX: (u, v) => (u % 0.42 < 0.14 ? 0.8 : -0.9) + (v < 0.18 ? 0.6 : 0),
      sideY: (u, v) => (u % 0.42 < 0.14 ? 0.8 : -0.9) + (v < 0.18 ? 0.6 : 0),
      glowX: (u, v) =>
        u % 0.42 >= 0.14 && v > 0.5 && v < 1.4
          ? windowId(Math.floor(u / 0.42), 1, 11)
          : 0,
    });
    box(-0.4, -6.0, BOILER_TOP, 0.4, -5.2, BOILER_TOP + 0.9, CONCRETE, BOILER);
    shadowBox(-1.3, -6.8, 1.3, -4.0, SERVICE_TOP, BOILER_TOP + 0.6);

    for (let u = 0; u < 2.4; u += st)
      for (let z = 0; z < 2.2; z += st)
        surf(1.0 + 0.002, -6.6 + 0.9 + u * 0.2, z, glass, -0.2, PX, SERVICE, 0);

    growTree(5.6, -4.2, TREE, 0.5, 240, 4100, PLANE);
    growTree(4.8, 4.6, TREE, 0.56, 260, 4500, PLANE);
    growTree(-4.8, 7.2, TREE, 0.46, 220, 4900, PLANE);
  },
};
