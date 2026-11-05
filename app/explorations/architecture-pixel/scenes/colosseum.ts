import {
  caster,
  clip,
  growTree,
  hash,
  noise,
  normalOf,
  rampId,
  rgb,
  setKind,
  smooth,
  step,
  surf,
  TOP,
  type RGB,
  type Scene,
} from "../engine/engine";
import { grass, island, tone } from "../engine/kit";

const TRAVERTINE: RGB = [212, 196, 164];
const BRICK: RGB = [172, 122, 92];
const SAND: RGB = [206, 180, 140];
const PAVE: RGB[] = [
  [176, 168, 152],
  [188, 180, 164],
  [198, 190, 174],
];
const PINE: RGB[] = [
  [40, 64, 44],
  [66, 94, 58],
  [100, 124, 74],
];

const TUSCAN = 1,
  IONIC = 2,
  CORINTHIAN = 3,
  ATTIC = 4,
  SEATING = 5,
  HYPOGEUM = 6,
  INNER = 7,
  PINE_PART = 8,
  ARENA = 9,
  CORRIDOR = 10,
  VAULTS = 11;

const A = 6.4,
  B = 5.2,
  STOREY = 1.25,
  TOP_Z = 4.8,
  BAYS = 80;
const trav = rampId(TRAVERTINE),
  brick = rampId(BRICK),
  sand = rampId(SAND);
const VX = Math.SQRT1_2,
  VY = Math.SQRT1_2;

const outward = (t: number) => {
  const nx = Math.cos(t) / A,
    ny = Math.sin(t) / B,
    l = Math.hypot(nx, ny);
  return [nx / l, ny / l] as const;
};
const radius = (t: number) => Math.hypot(A * Math.cos(t), B * Math.sin(t));
const bayOf = (t: number) =>
  ((((t / (Math.PI * 2)) * BAYS) % BAYS) + BAYS) % BAYS;

function outerHeight(t: number) {
  const [nx, ny] = outward(t);
  const f = nx * VX + ny * VY;
  if (f < 0.2) return TOP_Z;
  const k = Math.floor(bayOf(t));
  const storeys = Math.round(
    4 - 3 * smooth(0.2, 0.72, f) + (hash(k, 3) - 0.5) * 1.4,
  );
  return Math.max(1, Math.min(4, storeys)) === 4
    ? TOP_Z
    : Math.max(1, Math.min(4, storeys)) * STOREY - hash(k, 4) * 0.3;
}

function facade(t: number, z: number): [number, number, number] {
  const u = bayOf(t) % 1,
    storey = Math.min(3, Math.floor(z / STOREY)),
    lz = z - storey * STOREY;
  if (storey === 3) {
    const part = ATTIC,
      lzA = z - 3 * STOREY;
    if (lzA > 0.9) return [trav, 0.8, part];
    if (
      Math.floor(bayOf(t)) % 2 === 0 &&
      Math.abs(u - 0.5) < 0.14 &&
      lzA > 0.35 &&
      lzA < 0.62
    )
      return [trav, -2.2, part];
    return [
      trav,
      u < 0.08 || u > 0.92 ? 0.5 : (noise(t * 30, z * 3) - 0.5) * 0.6,
      part,
    ];
  }
  const part = storey === 0 ? TUSCAN : storey === 1 ? IONIC : CORINTHIAN;
  if (lz > 1.1) return [trav, 0.8, part];
  const du = (u - 0.5) / 0.3,
    open =
      Math.abs(du) < 1 &&
      lz > 0.12 &&
      (lz < 0.72 || du * du + ((lz - 0.72) / 0.3) ** 2 < 1);
  if (open) return [trav, -2.4 + (lz < 0.2 ? 0.5 : 0), part];
  if (u < 0.09 || u > 0.91) return [trav, 0.6, part];
  return [trav, (noise(t * 40, z * 4) - 0.5) * 0.7, part];
}

const corridors: [number, number, [number, number][]][] = [
  [
    0.88,
    0.94,
    [
      [0.1, 1.0],
      [1.35, 2.3],
      [2.65, 3.5],
    ],
  ],
  [
    0.74,
    0.81,
    [
      [0.1, 1.0],
      [1.3, 2.15],
    ],
  ],
  [0.6, 0.66, [[0.1, 0.85]]],
];

function profileTop(s: number) {
  if (s >= 0.95) return TOP_Z;
  if (s >= 0.9) return 3.8;
  return 0.9 + ((s - 0.52) / 0.38) * 2.9;
}

function section() {
  const st = step(),
    n = normalOf(1, 1, 0);
  const reach = Math.max(A, B) * 1.05;
  for (let q = -reach; q <= reach; q += st) {
    const x = q / Math.SQRT2,
      y = -q / Math.SQRT2;
    const s = Math.hypot(x / A, y / B);
    if (s < 0.52 || s > 1) continue;
    const top = profileTop(s);
    for (let z = 0; z <= top; z += st) {
      let voidHere = false;
      for (const [s0, s1, bands] of corridors) {
        if (s < s0 || s > s1) continue;
        const mid = (s0 + s1) / 2,
          half = (s1 - s0) / 2;
        for (const [z0, z1] of bands) {
          const spring = z1 - 0.25;
          if (
            z > z0 &&
            (z < spring ||
              ((s - mid) / half) ** 2 + ((z - spring) / 0.25) ** 2 < 1)
          )
            voidHere = true;
        }
      }
      if (voidHere) {
        surf(x, y, z, brick, -2.4 + (z % 1.2 < 0.1 ? 0.4 : 0), n, CORRIDOR);
        continue;
      }
      const skin = top - z < 0.12 || s > 0.95;
      surf(
        x,
        y,
        z,
        skin ? trav : brick,
        skin
          ? 0.6
          : 0.5 +
              (Math.floor(z * 6) % 2 ? 0.2 : -0.1) +
              (noise(q * 4, z * 4) - 0.5) * 0.4,
        n,
        VAULTS,
      );
    }
  }
}

export const colosseum: Scene = {
  id: "colosseum",
  scale: 13,
  originY: 22,
  parts: [
    "",
    "Tuscan arcade",
    "Ionic arcade",
    "Corinthian arcade",
    "attic storey",
    "seating tiers",
    "hypogeum",
    "inner ring wall",
    "umbrella pine",
    "arena floor",
    "ambulatory corridor",
    "vaulted substructure",
  ],
  cutaway: { inside: [CORRIDOR, VAULTS], removes: [INNER] },
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 9.6, 8.6);
    if (edge < 0) return 0;
    if (edge > 0.84) return grass(x, y, ix, iy, i, 0.15);
    setKind(i, 1);
    if (hash(ix, iy) > 0.985) return rgb(150, 142, 128);
    const slab = (Math.floor(x * 1.3) + Math.floor(y * 1.3)) % 2;
    return tone(
      PAVE,
      0.3 + slab * 0.22 + (noise(x * 3, y * 3) - 0.5) * 0.3,
      ix,
      iy,
    );
  },
  build(cut) {
    const st = step();
    if (cut) clip((x, y) => x + y > 0.02);
    for (let t = 0; t < Math.PI * 2; t += (st / radius(0)) * 0.8) {
      const [nx, ny] = outward(t),
        r = radius(t),
        cx = A * Math.cos(t),
        cy = B * Math.sin(t);
      const front = nx * VX + ny * VY > 0;
      const h = outerHeight(t);
      if (front) {
        const n = normalOf(nx, ny, 0);
        for (let z = 0; z <= h; z += st) {
          const [ramp, level, part] = facade(t, z);
          surf(cx, cy, z, ramp, level, n, part);
        }
        const inner = normalOf(nx, ny, 0);
        for (let z = 0; z <= 3.3; z += st) {
          const u = bayOf(t) % 1,
            lz = z % 1.6,
            du = (u - 0.5) / 0.32;
          const open =
            Math.abs(du) < 1 &&
            lz > 0.1 &&
            (lz < 0.9 || du * du + ((lz - 0.9) / 0.4) ** 2 < 1);
          surf(
            cx * 0.86,
            cy * 0.86,
            z,
            brick,
            open
              ? -2.2
              : z % 1.6 > 1.45
                ? 0.6
                : (noise(t * 30, z * 5) - 0.5) * 0.7,
            inner,
            INNER,
          );
        }
      } else {
        const n = normalOf(-nx, -ny, 0);
        for (let z = 0; z <= TOP_Z; z += st) {
          const u = bayOf(t) % 1,
            lz = z % STOREY,
            du = (u - 0.5) / 0.28;
          const open =
            z < 3 * STOREY &&
            Math.abs(du) < 1 &&
            lz > 0.15 &&
            (lz < 0.7 || du * du + ((lz - 0.7) / 0.28) ** 2 < 1);
          const part =
            z < STOREY
              ? TUSCAN
              : z < 2 * STOREY
                ? IONIC
                : z < 3 * STOREY
                  ? CORINTHIAN
                  : ATTIC;
          surf(
            cx * 0.95,
            cy * 0.95,
            z,
            brick,
            open ? -2.3 : lz > 1.1 ? 0.5 : (noise(t * 30, z * 5) - 0.5) * 0.8,
            n,
            part,
          );
        }
      }
      for (let s = 0.95; s <= 1; s += st / r)
        surf(
          cx * s,
          cy * s,
          h,
          trav,
          0.3 + (hash(Math.floor(t * 60), 1) - 0.5) * 0.8,
          TOP,
          front ? (h < STOREY + 0.1 ? TUSCAN : ATTIC) : ATTIC,
        );
      if (
        Math.floor(t / 0.12) !== Math.floor((t - (st / radius(0)) * 0.8) / 0.12)
      )
        for (let z = 0.3; z <= h; z += 0.6) caster(cx, cy, z, 0.42);
    }

    for (let s = 0.52; s <= 0.9; s += st / 6) {
      const z = 0.9 + ((s - 0.52) / 0.38) * 2.9;
      for (let t = 0; t < Math.PI * 2; t += st / (radius(0) * s)) {
        const [nx, ny] = outward(t),
          r = radius(t),
          slope = 2.9 / (0.38 * r);
        const bay = Math.floor(((t / (Math.PI * 2)) * 32 + 64) % 32),
          fb = ((t / (Math.PI * 2)) * 32) % 1;
        const vom =
          Math.abs(fb - 0.5) < 0.12 && s > 0.66 && s < 0.74 && bay % 2 === 0;
        const tier = Math.floor(s * 46) % 2;
        surf(
          A * Math.cos(t) * s,
          B * Math.sin(t) * s,
          z,
          vom ? brick : trav,
          vom ? -2.4 : tier ? 0.4 : -0.3 + (noise(t * 8, s * 30) - 0.5) * 0.6,
          normalOf(-nx * slope, -ny * slope, 1),
          SEATING,
        );
      }
    }
    for (let t = 0; t < Math.PI * 2; t += st / (radius(0) * 0.52)) {
      const [nx, ny] = outward(t);
      if (nx * VX + ny * VY > 0) continue;
      for (let z = 0; z <= 0.9; z += st)
        surf(
          A * Math.cos(t) * 0.52,
          B * Math.sin(t) * 0.52,
          z,
          brick,
          z > 0.8 ? 0.6 : -0.2,
          normalOf(-nx, -ny, 0),
          SEATING,
        );
    }
    for (let x = -A * 0.52; x <= A * 0.52; x += st)
      for (let y = -B * 0.52; y <= B * 0.52; y += st) {
        if ((x / (A * 0.52)) ** 2 + (y / (B * 0.52)) ** 2 > 1) continue;
        if (x < -1.6) {
          surf(
            x,
            y,
            0.62,
            sand,
            Math.floor(y * 6) % 2 ? 0.3 : -0.1,
            TOP,
            ARENA,
          );
          continue;
        }
        const wall =
          (x * 1.8) % 1 < 0.2 || Math.abs(y) % 0.9 < 0.16 || Math.abs(y) < 0.14;
        surf(
          x,
          y,
          wall ? 0.5 : 0.04,
          wall ? brick : brick,
          wall ? 0.4 : -2.4,
          TOP,
          HYPOGEUM,
        );
      }

    if (cut) {
      clip(null);
      section();
    }
    growTree(-8.0, 5.4, PINE_PART, 0.52, 260, 7100, PINE);
    growTree(7.6, -6.2, PINE_PART, 0.5, 260, 7500, PINE);
    growTree(-7.2, -5.4, PINE_PART, 0.46, 220, 7900, PINE);
  },
};
