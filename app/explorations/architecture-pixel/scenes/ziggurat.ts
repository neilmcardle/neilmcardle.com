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
import { batter, box, island, palm, tone, type Level } from "../engine/kit";

const BAKED: RGB = [176, 128, 88];
const MUD: RGB = [196, 156, 112];
const STAIR_STONE: RGB = [206, 170, 126];
const EARTH: RGB[] = [
  [184, 150, 108],
  [196, 162, 120],
  [208, 176, 134],
  [218, 188, 146],
];

const BASE = 1,
  TERRACE = 2,
  CENTRAL = 3,
  SIDE = 4,
  SHRINE = 5,
  PALM = 6;

const brickwork =
  (seed: number): Level =>
  (a, z) => {
    const row = Math.floor(z * 9),
      joint = (z * 9) % 1 < 0.2;
    const recess = (a * 1.4) % 1 < 0.16;
    return (
      (joint ? -0.5 : 0.2) +
      (recess ? -0.9 : 0) +
      (hash(Math.floor(a * 4), row + seed) > 0.85 ? -0.4 : 0) +
      (noise(a, z * 2 + seed) - 0.5) * 0.6
    );
  };

function stairX(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  part: number,
) {
  const ramp = rampId(STAIR_STONE),
    st = step();
  const run = x0 - x1,
    rise = z1 - z0,
    n = normalOf(rise, 0, run);
  for (let x = x1; x <= x0; x += st) {
    const t = (x0 - x) / run,
      z = z0 + rise * t;
    const tread = (t * 26) % 1 < 0.5;
    for (let y = y0; y <= y1; y += st) {
      const cheek = y - y0 < 0.14 || y1 - y < 0.14;
      surf(
        x,
        y,
        z + (cheek ? 0.16 : 0),
        ramp,
        cheek ? 0.5 : tread ? 0.4 : -0.5,
        n,
        part,
      );
    }
    if (((x - x1) / 0.4) % 1 < st * 2.6)
      caster(x, (y0 + y1) / 2, z, (y1 - y0) / 2);
  }
}

function sideStair(
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  x: number,
  part: number,
) {
  const ramp = rampId(STAIR_STONE),
    st = step();
  const run = Math.abs(y1 - y0),
    rise = z1 - z0,
    dir = Math.sign(y1 - y0);
  for (let s = 0; s <= run; s += st) {
    const t = s / run,
      z = z0 + rise * t,
      y = y0 + dir * s;
    const tread = (t * 22) % 1 < 0.5;
    for (let w = 0; w <= 0.9; w += st)
      surf(
        x + w,
        y,
        z + (w > 0.78 ? 0.16 : 0),
        ramp,
        w > 0.78 ? 0.5 : tread ? 0.4 : -0.5,
        normalOf(0, -dir * rise, run),
        part,
      );
    for (let zz = 0; zz <= z; zz += st)
      surf(
        x + 0.9,
        y,
        zz,
        rampId(BAKED),
        brickwork(9)(y, zz),
        normalOf(1, 0, 0),
        part,
      );
  }
}

export const ziggurat: Scene = {
  id: "ziggurat",
  scale: 13,
  originY: 12,
  parts: [
    "",
    "baked-brick base",
    "mud-brick terrace",
    "central stair",
    "side stair",
    "shrine",
    "date palm",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.4, y, ix, iy, 10.2, 8.0);
    if (edge < 0) return 0;
    setKind(i, 1);
    if (hash(ix, iy) > 0.985) return rgb(150, 118, 84);
    return tone(
      EARTH,
      0.35 +
        (noise(x * 0.7, y * 0.7) - 0.5) * 0.6 +
        (noise(x * 4, y * 4) - 0.5) * 0.2,
      ix,
      iy,
    );
  },
  build() {
    batter(0, 0, 6.2, 4.3, 0, 1.9, 0.45, BAKED, BASE, brickwork(1));
    batter(-0.4, 0, 4.4, 3.0, 1.9, 1.2, 0.3, MUD, TERRACE, brickwork(2));
    batter(-0.8, 0, 2.8, 1.9, 3.1, 0.9, 0.2, MUD, TERRACE, brickwork(3));
    box(-1.5, -0.8, 4.0, -0.1, 0.8, 4.9, MUD, SHRINE, {
      sideX: (u, v) =>
        Math.abs(u - 0.8) < 0.2 && v < 0.55 ? -2.2 : brickwork(4)(u, v),
      sideY: brickwork(5),
    });
    stairX(9.6, 4.0, -0.62, 0.62, 0, 3.1, CENTRAL);
    sideStair(-4.2, -0.9, 0, 1.9, 6.1, SIDE);
    sideStair(4.2, 0.9, 0, 1.9, 6.1, SIDE);
    palm(9.4, 3.6, 2.4, PALM, 1);
    palm(8.2, 5.0, 2.0, PALM, 2);
    palm(-6.6, 5.4, 2.2, PALM, 3);
    palm(9.8, -4.4, 2.3, PALM, 4);
  },
};
