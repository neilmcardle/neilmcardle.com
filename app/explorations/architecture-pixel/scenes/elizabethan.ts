import {
  hash,
  noise,
  rampId,
  rgb,
  setGroundPart,
  setKind,
  step,
  surf,
  PX,
  PY,
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
  type BoxOptions,
} from "../engine/kit";

const STONE: RGB = [204, 190, 160];
const LEAD: RGB = [70, 76, 86];
const GRAVEL: RGB[] = [
  [196, 188, 168],
  [208, 200, 180],
  [218, 210, 190],
];

const TOWER = 2,
  PARAPET = 3,
  FRONT = 4,
  LOGGIA = 5,
  FORECOURT = 6;

const stone = rampId(STONE);
const FLOORS = [0.5, 3.0, 5.7];

function glazed(seed: number, pitch: number, top: number): BoxOptions {
  const hit = (u: number, v: number) => {
    const fu = u % pitch;
    if (fu < 0.16 || fu > pitch - 0.16 || v > top - 0.3) return -1;
    for (const z of FLOORS) {
      const h = z === FLOORS[2] ? 2.4 : 2.0;
      if (v > z && v < z + h)
        return windowId(Math.floor(u / pitch), FLOORS.indexOf(z), seed);
    }
    return -1;
  };
  const level = (u: number, v: number) => {
    const k = hit(u, v);
    if (k >= 0)
      return (u % pitch) % 0.24 < 0.04 || v % 0.36 < 0.04
        ? 0.8
        : v % 0.18 < 0.03
          ? -0.5
          : 0.2;
    return (noise(u * 2, v * 2) - 0.5) * 0.5 + (v % 2.6 < 0.12 ? 0.6 : 0);
  };
  const glow = (u: number, v: number) => Math.max(0, hit(u, v));
  return { sideX: level, sideY: level, glowX: glow, glowY: glow };
}

const GLYPH: Record<string, string[]> = {
  E: ["111", "1..", "11.", "1..", "111"],
  S: ["111", "1..", "111", "..1", "111"],
};

function parapet(
  x: number | null,
  y: number | null,
  a0: number,
  a1: number,
  z0: number,
) {
  const st = step(),
    px = 0.11,
    word = "ES";
  for (let a = a0; a <= a1; a += st)
    for (let z = z0; z <= z0 + 0.75; z += st) {
      const lu = Math.floor((a - a0) / px),
        lz = 4 - Math.floor((z - z0 - 0.1) / px);
      const span = (a1 - a0) / px,
        start = Math.floor((span - 7) / 2);
      let on = z < z0 + 0.08 || z > z0 + 0.68;
      const k = lu - start;
      if (k >= 0 && k < 7 && lz >= 0 && lz < 5 && k !== 3)
        on = GLYPH[word[k < 3 ? 0 : 1]][lz][k < 3 ? k : k - 4] === "1";
      if (!on) continue;
      if (x !== null) surf(x, a, z, stone, 0.6, PX, PARAPET);
      else if (y !== null) surf(a, y, z, stone, 0.7, PY, PARAPET);
    }
}

export const elizabethan: Scene = {
  id: "elizabethan",
  scale: 10.5,
  originY: 28,
  windowLight: [255, 206, 122],
  parts: [
    "",
    "",
    "prospect tower",
    "ES parapet",
    "more glass than wall",
    "loggia",
    "forecourt",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.6, y, ix, iy, 10.4, 9.2);
    if (edge < 0) return 0;
    if (x > 3.6 && x < 8.2 && Math.abs(y) < 4.6) {
      setKind(i, 1);
      setGroundPart(i, FORECOURT);
      if (Math.abs(x - 8.0) < 0.2 || Math.abs(Math.abs(y) - 4.4) < 0.2)
        return rgb(186, 172, 146);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    if (hash(ix, iy) > 0.99) return rgb(232, 226, 206);
    return grass(x, y, ix, iy, i, 0.2);
  },
  build() {
    box(-2.2, -4.6, 0, 2.2, 4.6, 8.0, STONE, FRONT, glazed(1, 1.15, 8.0));
    shadowBox(-2.2, -4.6, 2.2, 4.6, 0, 8.0);
    box(-2.3, -4.7, 8.0, 2.3, 4.7, 8.15, LEAD, FRONT);
    const towers: [number, number, number, number][] = [
      [2.2, -4.6, 3.8, -2.6],
      [2.2, 2.6, 3.8, 4.6],
      [-1.0, 4.6, 1.0, 6.2],
      [-1.0, -6.2, 1.0, -4.6],
    ];
    towers.forEach(([x0, y0, x1, y1], k) => {
      box(x0, y0, 0, x1, y1, 9.6, STONE, TOWER, glazed(2 + k, 1.0, 9.6));
      shadowBox(x0, y0, x1, y1, 0, 10.3);
      parapet(x1 + 0.001, null, y0, y1, 9.6);
      parapet(null, y1 + 0.001, x0, x1, 9.6);
    });
    box(2.2, -2.6, 0, 2.9, 2.6, 2.4, STONE, LOGGIA, {
      sideX: (u, v) =>
        u % 1.04 > 0.18 &&
        u % 1.04 < 0.86 &&
        (v < 1.6 || ((u % 1.04) - 0.52) ** 2 + (v - 1.6) ** 2 < 0.34 ** 2)
          ? -2.3
          : v > 2.2
            ? 0.8
            : 0.3,
    });
    shadowBox(2.2, -2.6, 2.9, 2.6, 0, 2.4);
  },
};
