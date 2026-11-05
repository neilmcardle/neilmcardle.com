import {
  caster,
  hash,
  noise,
  normalOf,
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
  island,
  shadowBox,
  tone,
  windowBays,
  windowId,
  type Level,
} from "../engine/kit";

const STEEL: RGB = [190, 196, 204];
const GLASS: RGB = [70, 84, 100];
const DARK: RGB = [56, 60, 70];
const CRANE: RGB = [62, 108, 188];
const CAB: RGB = [30, 30, 34];
const PAVE: RGB[] = [
  [150, 148, 146],
  [162, 160, 158],
  [174, 172, 170],
];
const ROAD: RGB[] = [
  [62, 62, 70],
  [70, 70, 78],
];

const VAULT = 1,
  LIFT = 2,
  SERVICE = 3,
  DUCT = 4,
  CRANE_PART = 5,
  OFFICES = 6,
  PODS = 7,
  CAB_PART = 8;

const MAIN = 9.0,
  FLOOR = 0.86;
const glass = rampId(GLASS),
  steel = rampId(STEEL);

const office = windowBays(0.6, 0.48, FLOOR, 0.1, 6, 0.4, 2, MAIN - 0.2);
const officeLevel: Level = (u, v) => {
  if (v % FLOOR < 0.08) return 0.9;
  if (office.hit(u, v) >= 0)
    return (u * 1.7) % 1 < 0.08 ? 0.6 : -0.4 + (noise(u, v * 0.4) - 0.5) * 0.4;
  return 0.5;
};
const cladding =
  (seed: number): Level =>
  (u, v) => {
    const panel = (u * 2.2) % 1 < 0.07 || (v * 1.6) % 1 < 0.06;
    return (
      (panel ? -0.6 : 0.5) +
      (hash((u * 2.2) | 0, ((v * 1.6) | 0) + seed) > 0.7 ? 0.3 : 0)
    );
  };

export const lloyds: Scene = {
  id: "lloyds",
  scale: 9.5,
  originY: 38,
  windowLight: [214, 232, 255],
  parts: [
    "",
    "atrium vault",
    "glass lift",
    "service tower",
    "steel ducts",
    "blue crane",
    "glazed office floors",
    "toilet pods",
    "black cab",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 0.5, y - 0.4, ix, iy, 9.2, 9.2);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (x > 6.4) {
      if (hash(ix, iy) > 0.985) return rgb(90, 90, 96);
      return tone(ROAD, noise(x * 2, y * 2), ix, iy);
    }
    const slab = (Math.floor(x * 1.5) + Math.floor(y * 1.5)) % 2;
    return tone(
      PAVE,
      0.3 + slab * 0.2 + (noise(x * 3, y * 3) - 0.5) * 0.4,
      ix,
      iy,
    );
  },
  build() {
    box(-3, -3, 0, 3, 3, MAIN, GLASS, OFFICES, {
      sideX: officeLevel,
      sideY: officeLevel,
      glowX: office.glow,
      glowY: office.glow,
      topColor: STEEL,
    });
    shadowBox(-2.8, -2.8, 2.8, 2.8, 0, MAIN);
    const st = step();
    for (let x = -3; x <= 3; x += st)
      for (let y = -1.9; y <= 1.9; y += st) {
        const z = MAIN + Math.sqrt(Math.max(0, 1.9 * 1.9 - y * y)) * 0.9;
        const rib = (x + 3) % 0.5 < 0.08;
        surf(
          x,
          y,
          z,
          rib ? steel : glass,
          rib ? 0.7 : 0.3 + (Math.floor(y * 3) % 2 ? 0.3 : 0),
          normalOf(0, y, 1.9),
          VAULT,
          rib ? 0 : windowId(Math.floor((x + 3) / 0.5), 0, 9),
        );
      }
    for (let y = -1.9; y <= 1.9; y += st) {
      const top = MAIN + Math.sqrt(Math.max(0, 1.9 * 1.9 - y * y)) * 0.9;
      for (let z = MAIN; z <= top; z += st)
        surf(
          3.001,
          y,
          z,
          (y + 1.9) % 0.4 < 0.06 ? steel : glass,
          0.2,
          normalOf(1, 0, 0),
          VAULT,
          windowId(1, Math.floor(y * 3), 10),
        );
    }
    for (let x = -3; x <= 3; x += 0.5)
      for (let h = 0.3; h < 1.7; h += 0.5) caster(x, 0, MAIN + h, 1.6);

    box(3, -2.8, 0, 4.6, -1.0, 14.2, STEEL, SERVICE, {
      sideX: cladding(1),
      sideY: cladding(2),
    });
    shadowBox(3.1, -2.7, 4.5, -1.1, 0, 14.2);
    for (let k = 0; k < 12; k++) {
      const z = 1.2 + k * 1.05;
      box(4.6, -2.5, z, 5.25, -1.3, z + 0.78, STEEL, PODS, {
        sideX: (u, v) => (v < 0.08 || u % 0.4 < 0.05 ? -0.5 : 0.7),
        sideY: () => 0.3,
        glowX: (u, v) =>
          Math.abs(v - 0.4) < 0.1 && u > 0.3 && u < 0.9
            ? windowId(k, 1, 11)
            : 0,
      });
    }
    shadowBox(4.7, -2.4, 5.2, -1.4, 1.2, 13.5, 0.4);
    for (const y of [-2.72, -1.08]) {
      cylinder(4.9, y, 0.24, 0.24, 0, 14.6, STEEL, DUCT, {
        level: (a, t) =>
          Math.floor(t * 44) % 5 === 0 ? -0.8 : 0.5 + Math.cos(a) * 0.2,
        top: false,
      });
    }

    box(3, 1.0, 0, 4.4, 2.8, 12.6, STEEL, SERVICE, {
      sideX: cladding(3),
      sideY: cladding(4),
    });
    shadowBox(3.1, 1.1, 4.3, 2.7, 0, 12.6);
    [1.15, 1.65, 2.15].forEach((y, n) => {
      box(4.4, y, 0.3, 4.9, y + 0.42, 12.9, GLASS, LIFT, {
        sideX: (u) => (u < 0.04 || u > 0.38 ? 0.8 : -0.2),
        sideY: (u) => (u < 0.04 || u > 0.46 ? 0.8 : -0.2),
        glowX: (u, v) => (u > 0.04 && u < 0.38 && v % 3.2 < 0.15 ? 4 : 0),
      });
      const car = 2 + n * 3.6 + hash(n, 3) * 2;
      box(4.45, y + 0.05, car, 4.85, y + 0.37, car + 0.7, STEEL, LIFT, {
        sideX: (u, v) => (v > 0.2 && v < 0.55 ? -1.8 : 0.9),
        glowX: (u, v) => (v > 0.2 && v < 0.55 ? 7 : 0),
      });
    });

    box(-2.2, 3, 0, -0.4, 4.6, 15.4, STEEL, SERVICE, {
      sideX: cladding(5),
      sideY: cladding(6),
    });
    shadowBox(-2.1, 3.1, -0.5, 4.5, 0, 15.4);
    for (const x of [-1.95, -1.3, -0.65]) {
      cylinder(x, 4.85, 0.22, 0.22, 0, 15.1, STEEL, DUCT, {
        level: (a, t) =>
          Math.floor(t * 40) % 4 === 0 ? -0.8 : 0.4 + Math.cos(a) * 0.2,
        top: false,
      });
    }
    for (let k = 0; k < 6; k++) {
      const z = 2 + k * 2.2;
      cylinder(-1.3, 4.85, 0.3, 0.3, z, z + 0.18, DARK, DUCT, {
        shadow: false,
        top: false,
      });
    }

    for (const [x, y, z] of [
      [3.8, -1.9, 14.2],
      [-1.3, 3.8, 15.4],
    ] as const) {
      box(
        x - 0.12,
        y - 0.12,
        z,
        x + 0.12,
        y + 0.12,
        z + 1.6,
        CRANE,
        CRANE_PART,
      );
      box(
        x - 1.6,
        y - 0.1,
        z + 1.45,
        x + 0.5,
        y + 0.1,
        z + 1.7,
        CRANE,
        CRANE_PART,
        { sideX: () => 0.6, sideY: (u) => (u % 0.3 < 0.08 ? -1 : 0.6) },
      );
      box(
        x - 1.4,
        y - 0.25,
        z + 1.15,
        x - 1.0,
        y + 0.25,
        z + 1.45,
        DARK,
        CRANE_PART,
      );
      shadowBox(x - 1.5, y - 0.1, x + 0.4, y + 0.1, z + 1.4, z + 1.7, 0.2);
    }

    box(7.2, -3.4, 0.12, 8.0, -1.8, 0.75, CAB, CAB_PART, {
      sideX: (u, v) => (v > 0.38 ? -0.6 : 0.6),
      sideY: (u, v) => (v > 0.38 && u > 0.3 && u < 1.3 ? -0.8 : 0.6),
      top: () => 0.5,
    });
    box(7.35, -3.1, 0.75, 7.85, -2.2, 1.0, CAB, CAB_PART, { top: () => 0.8 });
    shadowBox(7.3, -3.3, 7.9, -1.9, 0, 0.9, 0.35);
  },
};
