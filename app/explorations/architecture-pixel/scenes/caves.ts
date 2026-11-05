import {
  caster,
  hash,
  noise,
  normalOf,
  rampId,
  rgb,
  setGroundPart,
  setKind,
  sphere,
  step,
  surf,
  type RGB,
  type Scene,
} from "../engine/engine";
import { box, grass, island, orientedBox, tone, windowId } from "../engine/kit";

const LIMESTONE: RGB = [186, 170, 142];
const DARK: RGB = [36, 30, 28];
const EMBER: RGB = [214, 110, 50];
const POLE: RGB = [104, 82, 60];
const EARTH: RGB[] = [
  [150, 128, 98],
  [164, 142, 110],
  [178, 156, 124],
];

const ROCK = 1,
  MOUTH = 2,
  SHELTER = 3,
  HEARTH = 4,
  WALL = 5,
  LADDER = 6,
  LAND = 7;

const rock = rampId(LIMESTONE),
  dark = rampId(DARK);

const edgeX = (y: number) =>
  -1.0 + Math.sin(y * 0.7) * 0.6 + (noise(y * 0.5, 1) - 0.5) * 1.0;
const topZ = (y: number) =>
  4.4 + Math.sin(y * 0.45 + 1) * 0.9 + (noise(y * 0.6, 4) - 0.5) * 1.2;

type Mouth = { y: number; z0: number; w: number; h: number; fire: boolean };
const MOUTHS: Mouth[] = [
  { y: -3.3, z0: 0, w: 0.95, h: 1.5, fire: true },
  { y: 1.0, z0: 0, w: 1.5, h: 1.7, fire: true },
  { y: 3.9, z0: 2.0, w: 0.65, h: 0.95, fire: true },
  { y: -0.9, z0: 2.9, w: 0.5, h: 0.7, fire: false },
  { y: 5.2, z0: 0.2, w: 0.55, h: 0.8, fire: false },
];

function inMouth(y: number, z: number) {
  for (const m of MOUTHS) {
    if (z < m.z0) continue;
    const cz = m.z0 + m.h * 0.45;
    const d =
      ((y - m.y) / m.w) ** 2 +
      ((z - cz) / (m.h * 0.6)) ** 2 +
      (noise(y * 3, z * 3) - 0.5) * 0.45;
    if (d < 1) return m;
  }
  return null;
}

function cliff() {
  const st = step();
  for (let y = -6.4; y <= 6.4; y += st) {
    const xc = edgeX(y),
      top = topZ(y),
      dx = (edgeX(y + 0.05) - edgeX(y - 0.05)) / 0.1;
    for (let z = 0; z <= top; z += st) {
      const bulge =
        (noise(y * 1.6, z * 1.2) - 0.5) * 0.5 +
        Math.max(0, z - top + 0.8) * 0.35;
      const m = inMouth(y, z);
      const x = xc + bulge - (m ? 0.3 : 0);
      const strata = (Math.floor(z * 2.2 + noise(y, z) * 0.8) % 2) * 0.35;
      if (m)
        surf(
          x,
          y,
          z,
          dark,
          -1 + (noise(y * 4, z * 4) - 0.5) * 0.6,
          normalOf(1, -dx, 0.1),
          MOUTH,
          m.fire ? windowId(Math.round(m.y), 0, 1) : 0,
        );
      else
        surf(
          x,
          y,
          z,
          rock,
          strata + (noise(y * 2.4, z * 2.4) - 0.5) * 1.3 - 0.1,
          normalOf(1, -dx, 0.15),
          ROCK,
        );
    }
    for (let back = 0; back <= 6.5; back += st) {
      const x = xc - back,
        z = top + back * 0.22 + (noise(x * 0.8, y * 0.8) - 0.5) * 0.7;
      const gx =
        (noise((x + 0.05) * 0.8, y * 0.8) - noise((x - 0.05) * 0.8, y * 0.8)) *
        7;
      const grassy = noise(x * 0.9 + 7, y * 0.9) > 0.55;
      surf(
        x,
        y,
        z,
        grassy ? rampId([84, 112, 58]) : rock,
        grassy
          ? (noise(x * 4, y * 4) - 0.5) * 1.4
          : (noise(x * 2, y * 2) - 0.5) * 1.2 + 0.2,
        normalOf(-gx + 0.22, 0, 1),
        ROCK,
      );
    }
    if (Math.round(y * 10) % 5 === 0)
      for (let z = 0.4; z < top; z += 0.6) caster(xc - 0.6, y, z, 0.7);
  }
}

export const caves: Scene = {
  id: "caves",
  scale: 12,
  originY: 20,
  windowLight: [255, 150, 64],
  parts: [
    "",
    "limestone outcrop",
    "cave mouth",
    "rock shelter",
    "hearth fire",
    "drystone wall",
    "wooden ladder",
    "grassland",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x + 0.4, y, ix, iy, 8.4, 7.6);
    if (edge < 0) return 0;
    if (x < edgeX(y) + 2.2 && x > edgeX(y) - 0.4) {
      setKind(i, 1);
      setGroundPart(i, LAND);
      if (hash(ix, iy) > 0.97) return rgb(120, 104, 84);
      return tone(EARTH, 0.4 + (noise(x * 2, y * 2) - 0.5) * 0.7, ix, iy);
    }
    setGroundPart(i, LAND);
    return grass(x, y, ix, iy, i, (noise(x * 0.4, y * 0.4) - 0.5) * 0.4);
  },
  build() {
    cliff();
    const sx = edgeX(1.0);
    orientedBox(
      sx + 0.55,
      1.0,
      1.7,
      0.6,
      1.95,
      2.3,
      Math.PI / 2,
      LIMESTONE,
      SHELTER,
      {
        taper: 0.25,
        level: (u, v) => -0.8 + (noise(u * 3, v * 6) - 0.5) * 1.6,
        topLevel: (u, v) => -0.5 + (noise(u * 3, v * 3) - 0.5) * 1.4,
      },
    );
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      sphere(
        sx + 1.5 + Math.cos(a) * 0.34,
        1.0 + Math.sin(a) * 0.34,
        0.06,
        0.11,
        LIMESTONE,
        HEARTH,
        "rough",
      );
    }
    box(sx + 1.38, 0.88, 0, sx + 1.62, 1.12, 0.22, EMBER, HEARTH, {
      sideX: () => 1.4,
      sideY: () => 1.2,
      top: () => 1.6,
      glowX: () => 31,
      glowY: () => 31,
    });
    const wx = edgeX(-3.3) + 0.25;
    for (let y = -4.1; y <= -2.5; y += 0.32) {
      if (Math.abs(y + 3.3) < 0.3) continue;
      for (let z = 0; z < 0.75; z += 0.22)
        orientedBox(
          wx + (hash(y * 9, z * 9) - 0.5) * 0.08,
          y,
          0.17,
          0.14,
          z,
          z + 0.2,
          hash(y * 3, z * 7) * 0.4,
          LIMESTONE,
          WALL,
          {
            level: (u, v) => (noise(u * 6, v * 6 + y) - 0.5) * 1.2,
            shadow: false,
          },
        );
    }
    const lx = edgeX(3.9) + 0.55;
    for (const y of [3.65, 4.15])
      box(lx - 0.04, y - 0.04, 0, lx + 0.04, y + 0.04, 2.2, POLE, LADDER);
    for (let z = 0.3; z < 2.1; z += 0.32)
      box(lx - 0.03, 3.65, z, lx + 0.03, 4.15, z + 0.05, POLE, LADDER);
    for (let k = 0; k < 14; k++) {
      const y = -6 + hash(k, 1) * 12,
        x = edgeX(y) + 0.4 + hash(k, 2) * 1.6;
      sphere(x, y, 0.08, 0.12 + hash(k, 3) * 0.22, LIMESTONE, ROCK, "rough");
    }
  },
};
