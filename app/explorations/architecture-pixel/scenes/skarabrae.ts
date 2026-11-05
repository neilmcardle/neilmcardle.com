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
  grass,
  island,
  orientedBox,
  tone,
  type Level,
} from "../engine/kit";

const FLAG: RGB = [150, 146, 136];
const ASH: RGB = [58, 52, 50];
const SAND: RGB[] = [
  [206, 196, 168],
  [218, 208, 182],
  [228, 220, 196],
];
const SEA: RGB[] = [
  [40, 84, 104],
  [52, 104, 122],
  [72, 128, 140],
  [110, 158, 162],
];

const WALL = 1,
  DRESSER = 2,
  BED = 3,
  HEARTH = 4,
  PASSAGE = 5,
  BAY = 6,
  MOUND = 7;

const slabs =
  (seed: number): Level =>
  (u, v) =>
    ((v * 13) % 1 < 0.24 ? -0.9 : 0.25) +
    (hash(Math.floor(u * 5 + seed), Math.floor(v * 13)) - 0.5) * 0.9 +
    (noise(u + seed, v * 2) - 0.5) * 0.4;

type House = { x: number; y: number; a: number; b: number; door: number };
const HOUSES: House[] = [
  { x: 0, y: 0, a: 1.45, b: 1.25, door: 0 },
  { x: -3.3, y: 2.2, a: 1.3, b: 1.15, door: -0.6 },
  { x: -0.9, y: -3.3, a: 1.25, b: 1.1, door: 1.3 },
  { x: 2.7, y: 3.1, a: 1.2, b: 1.05, door: -1.9 },
];

function house(h: House, seed: number) {
  const n = 4;
  const at = (t: number) => {
    const c = Math.cos(t),
      s = Math.sin(t);
    return [
      h.x + h.a * Math.sign(c) * Math.abs(c) ** (2 / n),
      h.y + h.b * Math.sign(s) * Math.abs(s) ** (2 / n),
    ];
  };
  for (let t = 0; t < Math.PI * 2; t += 0.2) {
    const gap =
      Math.abs(Math.atan2(Math.sin(t - h.door), Math.cos(t - h.door))) < 0.28;
    if (gap) continue;
    const [px, py] = at(t),
      [qx, qy] = at(t + 0.05);
    const ang = Math.atan2(qy - py, qx - px);
    const top =
      0.75 +
      hash(Math.floor(t * 10), seed) * 0.3 -
      (Math.cos(t - 0.785) > 0.6 ? 0.25 : 0);
    orientedBox(px, py, 0.17, 0.24, 0, top, ang, FLAG, WALL, {
      level: slabs(seed + t),
      shadow: true,
    });
  }
  const back = h.door + Math.PI,
    bx = h.x + Math.cos(back) * h.a * 0.62,
    by = h.y + Math.sin(back) * h.b * 0.62;
  const across = back + Math.PI / 2;
  for (const s of [-0.38, 0.38])
    orientedBox(
      bx + Math.cos(across) * s,
      by + Math.sin(across) * s,
      0.05,
      0.16,
      0,
      0.72,
      back,
      FLAG,
      DRESSER,
      { level: slabs(seed + 5) },
    );
  for (const z of [0.3, 0.6])
    orientedBox(bx, by, 0.42, 0.17, z, z + 0.06, across, FLAG, DRESSER, {
      level: () => 0.5,
      shadow: false,
    });
  for (const side of [-1, 1]) {
    const ang = h.door + (side * Math.PI) / 2,
      ex = h.x + Math.cos(ang) * h.a * 0.6,
      ey = h.y + Math.sin(ang) * h.b * 0.6;
    orientedBox(ex, ey, 0.48, 0.05, 0, 0.32, ang + Math.PI / 2, FLAG, BED, {
      level: slabs(seed + side),
    });
    orientedBox(
      ex + Math.cos(ang) * 0.25,
      ey + Math.sin(ang) * 0.25,
      0.5,
      0.05,
      0,
      0.4,
      ang + Math.PI / 2,
      FLAG,
      BED,
      { level: slabs(seed + side + 2) },
    );
  }
  for (let k = 0; k < 4; k++) {
    const ang = h.door + (k * Math.PI) / 2,
      ex = h.x + Math.cos(ang) * 0.32,
      ey = h.y + Math.sin(ang) * 0.32;
    orientedBox(ex, ey, 0.3, 0.04, 0, 0.12, ang + Math.PI / 2, FLAG, HEARTH, {
      level: () => 0.4,
      shadow: false,
    });
  }
  box(h.x - 0.26, h.y - 0.26, 0, h.x + 0.26, h.y + 0.26, 0.03, ASH, HEARTH, {
    top: (u, v) => (noise(u * 9, v * 9) > 0.6 ? 0.8 : -0.4),
  });
}

function passage(a: House, b: House) {
  const dx = b.x - a.x,
    dy = b.y - a.y,
    len = Math.hypot(dx, dy),
    ang = Math.atan2(dy, dx);
  const nx = -dy / len,
    ny = dx / len;
  const mx = (a.x + b.x) / 2,
    my = (a.y + b.y) / 2,
    half = len / 2 - 1.1;
  if (half <= 0) return;
  for (const s of [-0.32, 0.32])
    orientedBox(
      mx + nx * s,
      my + ny * s,
      half,
      0.12,
      0,
      0.7,
      ang,
      FLAG,
      PASSAGE,
      { level: slabs(len) },
    );
  for (let k = -half + 0.3; k < half; k += 0.7)
    orientedBox(
      mx + Math.cos(ang) * k,
      my + Math.sin(ang) * k,
      0.28,
      0.46,
      0.7,
      0.8,
      ang,
      FLAG,
      PASSAGE,
      { level: () => 0.4 },
    );
}

export const skaraBrae: Scene = {
  id: "skarabrae",
  scale: 14,
  originY: 8,
  parts: [
    "",
    "drystone wall",
    "stone dresser",
    "box bed",
    "central hearth",
    "covered passage",
    "Bay of Skaill",
    "midden mound",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 0.6, y, ix, iy, 9.0, 7.6);
    if (edge < 0) return 0;
    const shore =
      5.4 + Math.sin(y * 0.6) * 0.5 + (noise(y * 0.8, 3) - 0.5) * 0.6;
    if (x > shore + 1.1) {
      setGroundPart(i, BAY);
      const foam = x < shore + 1.4 && hash(ix, iy) > 0.4;
      if (foam) return rgb(226, 232, 228);
      return tone(
        SEA,
        0.75 - (x - shore - 1.1) * 0.2 + (noise(x * 0.8, y * 2) - 0.5) * 0.3,
        ix,
        iy,
      );
    }
    if (x > shore) {
      setKind(i, 1);
      return tone(SAND, noise(x * 3, y * 3), ix, iy);
    }
    setGroundPart(i, MOUND);
    return grass(x, y, ix, iy, i, (noise(x * 0.5, y * 0.5) - 0.5) * 0.6 + 0.1);
  },
  build() {
    HOUSES.forEach((h, k) => house(h, k * 17));
    passage(HOUSES[0], HOUSES[1]);
    passage(HOUSES[0], HOUSES[2]);
    passage(HOUSES[0], HOUSES[3]);
  },
};
