import {
  caster,
  clip,
  growTree,
  hash,
  noise,
  normalOf,
  PX,
  PY,
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
  courses,
  facing,
  gableX,
  grass,
  island,
  pointed,
  pyramid,
  quad,
  shadowBox,
  tone,
  windowId,
} from "../engine/kit";

const STONE: RGB = [208, 194, 162];
const LEAD: RGB = [106, 114, 130];
const GLASS: RGB = [52, 60, 94];
const GRAVEL: RGB[] = [
  [186, 178, 160],
  [198, 190, 172],
  [210, 202, 184],
];
const YEW: RGB[] = [
  [34, 54, 40],
  [52, 76, 52],
  [82, 104, 66],
];

const FRONT = 1,
  FLYER = 2,
  PINNACLE = 3,
  LANCET = 4,
  PORTAL = 5,
  NICHE = 6,
  ROOF = 7,
  TOWER = 8,
  PIER = 9,
  CLERESTORY = 10,
  AISLE = 11,
  TREE = 12,
  VAULT = 13,
  ARCADE = 14,
  TRIFORIUM = 15,
  GLASS_PART = 16,
  NAVE = 17;

const FX = 7.2;
const NAVE0 = FX - 14.4;
const FRONT_TOP = 9.4;
const TOWER_TOP = 13.2;

const stone = rampId(STONE),
  glass = rampId(GLASS);

type Cell = [number, number, number, number] | null;

function paintX(
  x: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  fn: (a: number, z: number) => Cell,
) {
  const st = step();
  for (let a = y0; a <= y1; a += st)
    for (let z = z0; z <= z1; z += st) {
      const c = fn(a, z);
      if (c) surf(x, a, z, c[0], c[1], PX, c[2], c[3]);
    }
}

function niche(
  a: number,
  z: number,
  z0: number,
  z1: number,
  spacing: number,
  from: number,
): Cell {
  if (z < z0 || z > z1) return null;
  const k = Math.round((a - from) / spacing),
    c = from + k * spacing;
  if (!pointed(a, z, c, 0.2, z1 - 0.32, z1 - 0.04)) {
    return Math.abs(a - c) < 0.26 && z > z1 - 0.1
      ? [stone, 0.7, NICHE, 0]
      : null;
  }
  const statue =
    Math.abs(a - c) < 0.08 + (z < z0 + 0.5 ? 0.03 : 0) &&
    z > z0 + 0.08 &&
    z < z1 - 0.3;
  return statue
    ? [stone, 0.9 + (z > z1 - 0.48 ? 0.4 : 0), NICHE, 0]
    : [stone, -1.8, NICHE, 0];
}

function westFront(a: number, z: number): Cell {
  const plain: Cell = [
    stone,
    courses(a, z, 0.34, 0.6) * 0.8 + (noise(a * 2, z) - 0.5) * 0.4,
    FRONT,
    0,
  ];
  if (z < 0.35) return [stone, 0.4, FRONT, 0];
  for (const [c, w, spring] of [
    [0, 0.72, 1.45],
    [-2.05, 0.38, 1.05],
    [2.05, 0.38, 1.05],
  ]) {
    if (pointed(a, z, c, w, spring))
      return [stone, -2.4 + (z < 0.5 ? 0.5 : 0), PORTAL, 0];
    if (pointed(a, z, c, w + 0.16, spring + 0.04) && z > 0.35)
      return [stone, 0.9, PORTAL, 0];
  }
  const tier1 = niche(a, z, 2.5, 3.7, 0.6, 0.3);
  if (tier1) return tier1;
  const tier2 = niche(a, z, 4.3, 5.5, 0.6, 0);
  if (tier2 && Math.abs(a) > 1.5) return tier2;
  if (z > 2.35 && z < 2.47) return [stone, 0.8, FRONT, 0];
  for (const c of [-0.95, 0, 0.95]) {
    const top = c === 0 ? 8.9 : 8.4,
      spring = top - 0.62;
    if (pointed(a, z, c, 0.3, spring, top) && z > 5.8) {
      const pane = Math.floor(z * 3.4) % 2 === 0 && Math.abs(a - c) < 0.04;
      return [
        glass,
        pane ? 1.2 : (noise(a * 9, z * 6) - 0.5) * 1.2,
        LANCET,
        windowId(c * 3, 1, 4),
      ];
    }
    if (pointed(a, z, c, 0.38, spring, top + 0.1) && z > 5.7)
      return [stone, 0.9, LANCET, 0];
  }
  return plain;
}

function gable(a: number, z: number): Cell {
  const h = z - FRONT_TOP,
    half = 2.5 * (1 - h / 2.6);
  if (Math.abs(a) > half) return null;
  if (Math.abs(a) > half - 0.16) return [stone, 0.9, FRONT, 0];
  const t = niche(a, z, FRONT_TOP + 0.3, FRONT_TOP + 1.3, 0.5, 0.25);
  if (t && Math.abs(a) < half - 0.35) return t;
  return [stone, courses(a, z, 0.34, 0.6) * 0.8, FRONT, 0];
}

function towerFace(a: number, z: number, c: number): Cell {
  if (z > TOWER_TOP - 0.25)
    return [stone, 0.8 + (Math.floor(a * 3) % 2 === 0 ? 0 : -1.2), TOWER, 0];
  for (const o of [-0.42, 0.42]) {
    if (pointed(a, z, c + o, 0.2, 12.2, 12.75) && z > 10.1) {
      const louvre = Math.floor(z * 8) % 2 === 0;
      return [stone, louvre ? -1.4 : -2.4, TOWER, 0];
    }
    if (pointed(a, z, c + o, 0.28, 12.2, 12.86) && z > 10.0)
      return [stone, 0.8, TOWER, 0];
  }
  const t = niche(a, z, FRONT_TOP + 0.15, FRONT_TOP + 0.75, 0.42, c + 0.21);
  if (t) return t;
  return [stone, courses(a, z, 0.34, 0.6) * 0.8, TOWER, 0];
}

function flyer(px: number) {
  const st = step(),
    top = normalOf(0, 0.5, 1);
  for (let y = 2; y <= 4.45; y += st) {
    const t = (y - 2) / 2.45;
    const hi = 6.95 - t * 1.25,
      lo = 4.95 + 1.5 * Math.sqrt(Math.max(0, 1 - t * t));
    for (let z = lo; z <= hi; z += st)
      surf(px + 0.16, y, z, stone, courses(y, z, 0.2, 0.36) * 0.7, PX, FLYER);
    for (let x = px - 0.16; x <= px + 0.16; x += st)
      surf(x, y, hi, stone, 0.6, top, FLYER);
    caster(px, y, hi - 0.3, 0.25);
  }
}

const PANES: RGB[] = [
  [54, 84, 176],
  [176, 52, 52],
  [216, 176, 64],
  [60, 132, 96],
];
const panes = PANES.map((c) => rampId(c));
const VAULT_RISE = 1.5;
const vaultZ = (y: number) =>
  7.4 + VAULT_RISE * Math.sin(((y + 2) / 2) * (Math.PI / 2));

function stained(a: number, z: number, seed: number): [number, number, number] {
  const cell = Math.floor(a * 9) * 31 + Math.floor(z * 9) * 17 + seed;
  const lead = (a * 9) % 1 < 0.18 || (z * 9) % 1 < 0.18;
  return [
    lead ? rampId([40, 40, 48]) : panes[Math.floor(hash(cell, 3) * 4)],
    lead ? 0 : 0.6,
    lead ? 0 : windowId(cell, seed, 12),
  ];
}

function interior() {
  const st = step();
  for (let x = NAVE0; x <= FX - 1; x += st)
    for (let y = -2; y <= 0; y += st) {
      const slab = (Math.floor(x * 1.6) + Math.floor(y * 1.6)) % 2;
      surf(x, y, 0.02, stone, slab ? 0.4 : -0.2, 0, NAVE);
    }
  for (let x = NAVE0; x <= FX - 1; x += st)
    for (let z = 0; z <= 7.4; z += st) {
      const u = (((x - NAVE0) % 2) + 2) % 2,
        bay = Math.floor((x - NAVE0) / 2);
      const shaft = u < 0.12 || u > 1.88;
      if (shaft) {
        surf(
          x,
          -2,
          z,
          stone,
          0.9 - (u < 0.05 || u > 1.95 ? 0.6 : 0),
          PY,
          ARCADE,
        );
        continue;
      }
      if (z < 3.6 && pointed(u, z, 1, 0.72, 2.6, 3.6)) {
        surf(x, -2, z, stone, -2.5, PY, ARCADE);
        continue;
      }
      if (z < 3.75 && pointed(u, z, 1, 0.82, 2.6, 3.75)) {
        surf(x, -2, z, stone, 0.8, PY, ARCADE);
        continue;
      }
      if (z > 4.0 && z < 4.9) {
        const tu = ((u - 0.12) / 1.76) * 3,
          k = Math.floor(tu),
          c = ((k + 0.5) / 3) * 1.76 + 0.12;
        if (pointed(u, z, c, 0.2, 4.6, 4.85))
          surf(x, -2, z, stone, -1.9, PY, TRIFORIUM);
        else
          surf(x, -2, z, stone, z > 4.8 || z < 4.08 ? 0.8 : 0.2, PY, TRIFORIUM);
        continue;
      }
      if (z > 5.3 && pointed(u, z, 1, 0.38, 6.6, 7.15)) {
        const [r, l, g] = stained(x, z, bay);
        surf(x, -2, z, r, l, PY, GLASS_PART, g);
        continue;
      }
      surf(x, -2, z, stone, courses(x, z, 0.34, 0.6) * 0.6 - 0.2, PY, NAVE);
    }
  for (let y = -2; y <= 0; y += st)
    for (let z = 0; z <= vaultZ(y); z += st) {
      if (z > 3.6 && pointed(y, z, -1, 0.7, 5.8, 7.2)) {
        const [r, l, g] = stained(y, z, 9);
        surf(NAVE0, y, z, r, l, PX, GLASS_PART, g);
      } else
        surf(
          NAVE0,
          y,
          z,
          stone,
          courses(y, z, 0.34, 0.6) * 0.6 - 0.2,
          PX,
          NAVE,
        );
    }
  for (let x = NAVE0; x <= FX - 1; x += st)
    for (let y = -2; y <= 0; y += st) {
      const z = vaultZ(y),
        dz =
          VAULT_RISE * (Math.PI / 4) * Math.cos(((y + 2) / 2) * (Math.PI / 2));
      const u = (((x - NAVE0) % 2) + 2) % 2,
        w = (y + 2) / 2;
      const rib =
        u < 0.1 ||
        u > 1.9 ||
        Math.abs(u - w) < 0.08 ||
        Math.abs(2 - u - w) < 0.08 ||
        y > -0.08;
      const n = facing([0, dz, -1]);
      surf(
        x,
        y,
        z,
        stone,
        rib ? 0.9 : 0.1 + (noise(x * 2, y * 4) - 0.5) * 0.4,
        normalOf(n[0], n[1], n[2]),
        VAULT,
      );
    }
  for (let x = NAVE0; x <= FX - 1; x += st)
    for (let y = -2.4; y <= -2; y += st) surf(x, y, 7.4, stone, 0.5, 0, NAVE);
  shadowBox(NAVE0, -2.4, FX - 1, -2, 0, 9);
}

function cutFaces() {
  const st = step();
  for (let x = FX - 1; x <= FX; x += st)
    for (
      let z = 0;
      z <= FRONT_TOP + 2.6 * (1 - Math.max(0, x - FX) / 2.5);
      z += st
    ) {
      if (z > FRONT_TOP + 2.6) break;
      const portal = z < 1.45 + 0.6;
      surf(x, 0.001, z, stone, portal && z < 2.0 ? -2.4 : 0.9, PY, FRONT);
    }
  for (let x = NAVE0; x <= FX - 1; x += st)
    for (let z = vaultZ(0); z <= vaultZ(0) + 0.25; z += st)
      surf(x, 0.001, z, stone, 0.9, PY, VAULT);
}

export const gothic: Scene = {
  id: "gothic",
  scale: 10,
  originY: 22,
  windowLight: [255, 186, 98],
  parts: [
    "",
    "west front",
    "flying buttress",
    "pinnacle",
    "lancet window",
    "pointed arch portal",
    "statue niche",
    "lead roof",
    "bell tower",
    "buttress pier",
    "clerestory",
    "side aisle",
    "yew tree",
    "rib vault",
    "nave arcade",
    "triforium",
    "stained glass",
    "nave",
  ],
  cutaway: {
    inside: [VAULT, ARCADE, TRIFORIUM, GLASS_PART, NAVE],
    removes: [FLYER, PIER, AISLE, ROOF, CLERESTORY],
  },
  ground(x, y, ix, iy, i) {
    const edge = island(x - 0.6, y, ix, iy, 10.6, 8.6);
    if (edge < 0) return 0;
    const path =
      x > FX && x < FX + 2.3 + noise(y, 2) * 0.4 && Math.abs(y) < 5.6;
    const lane = x > FX && Math.abs(y) < 0.9 + (noise(x, 4) - 0.5) * 0.3;
    if (path || lane) {
      setKind(i, 1);
      if (hash(ix, iy) > 0.95) return rgb(226, 220, 204);
      return tone(GRAVEL, noise(x * 3, y * 3), ix, iy);
    }
    return grass(x, y, ix, iy, i, 0.15);
  },
  build(cut) {
    if (cut) {
      clip((_x, y) => y > 0.01);
      interior();
    } else {
      box(NAVE0, -2, 0, FX - 1, 2, 7.4, STONE, CLERESTORY, {
        sideY: (u, v) => {
          const bay = ((u % 2) + 2) % 2;
          return pointed(bay, v, 1, 0.34, 6.5, 7.0) && v > 5.3
            ? -2.2
            : courses(u, v, 0.34, 0.6) * 0.7;
        },
        glowY: (u, v) => {
          const bay = ((u % 2) + 2) % 2;
          return pointed(bay, v, 1, 0.34, 6.5, 7.0) && v > 5.3
            ? windowId(Math.floor(u / 2), 2, 3)
            : 0;
        },
      });
      shadowBox(NAVE0, -2, FX - 1, 2, 0, 7.4);
      gableX(NAVE0, FX - 1, -2.15, 2.15, 7.4, 3.0, LEAD, ROOF);
    }

    box(NAVE0, 2, 0, FX - 1, 4.2, 4.0, STONE, AISLE, {
      sideY: (u, v) => {
        const bay = ((u % 2) + 2) % 2;
        if (pointed(bay, v, 1, 0.36, 2.8, 3.3) && v > 1)
          return -2.2 + (Math.abs(bay - 1) < 0.04 ? 1.2 : 0);
        return courses(u, v, 0.34, 0.6) * 0.8;
      },
      glowY: (u, v) => {
        const bay = ((u % 2) + 2) % 2;
        return pointed(bay, v, 1, 0.36, 2.8, 3.3) &&
          v > 1 &&
          Math.abs(bay - 1) >= 0.04
          ? windowId(Math.floor(u / 2), 3, 5)
          : 0;
      },
    });
    quad(
      [NAVE0, 2, 5.1],
      [FX - 1 - NAVE0, 0, 0],
      [0, 2.25, -1.1],
      LEAD,
      ROOF,
      (u) => (Math.floor(u * 2.2) % 2) * 0.4,
    );
    shadowBox(NAVE0, 2, FX - 1, 4.2, 0, 4.6);

    for (let k = 0; k < 7; k++) {
      const px = NAVE0 + 2 * k;
      if (px < NAVE0 + 0.2) continue;
      box(px - 0.26, 4.2, 0, px + 0.26, 5.0, 5.4, STONE, PIER, {
        sideY: (u, v) => (v > 2 && v < 2.1 ? 0.8 : 0),
        sideX: (u, v) => courses(u, v, 0.34, 0.4) * 0.6,
      });
      shadowBox(px - 0.2, 4.3, px + 0.2, 4.9, 0, 5.4, 0.4);
      pyramid(px, 4.6, 0.26, 5.4, 1.4, STONE, PINNACLE, (a, t) =>
        Math.floor(t * 9) % 2 ? 0.5 : -0.3,
      );
      flyer(px);
    }

    box(FX - 1, -5.3, 0, FX, 5.3, FRONT_TOP, STONE, FRONT, {
      sideY: (u, v) => courses(u, v, 0.34, 0.6) * 0.8,
    });
    paintX(FX + 0.001, -5.3, 5.3, 0, FRONT_TOP, westFront);
    paintX(FX + 0.001, -2.5, 2.5, FRONT_TOP, FRONT_TOP + 2.6, gable);
    shadowBox(FX - 1, -5.3, FX, 5.3, 0, FRONT_TOP);
    for (let h = 0.2; h < 2.6; h += 0.4)
      caster(FX - 0.5, 0, FRONT_TOP + h, 2.2 * (1 - h / 2.6));

    for (const side of [-1, 1]) {
      const y0 = side > 0 ? 2.9 : -5.3,
        y1 = side > 0 ? 5.3 : -2.9,
        c = (y0 + y1) / 2;
      box(FX - 1.6, y0, FRONT_TOP, FX, y1, TOWER_TOP, STONE, TOWER, {
        sideY: (u, v) => courses(u, v, 0.34, 0.6) * 0.8,
      });
      paintX(FX + 0.001, y0, y1, FRONT_TOP, TOWER_TOP, (a, z) =>
        towerFace(a, z, c),
      );
      shadowBox(FX - 1.6, y0, FX, y1, FRONT_TOP, TOWER_TOP);
      for (const [px, py] of [
        [FX - 0.22, y0 + 0.22],
        [FX - 0.22, y1 - 0.22],
        [FX - 1.38, y1 - 0.22],
      ])
        pyramid(px, py, 0.22, TOWER_TOP, 1.5, STONE, PINNACLE, (a, t) =>
          Math.floor(t * 10) % 2 ? 0.5 : -0.2,
        );
    }
    for (const y of [-5.3, -2.9, -1.55, 1.55, 2.9, 5.0]) {
      const top = Math.abs(y) > 2.5 ? TOWER_TOP - 0.3 : FRONT_TOP + 0.4;
      box(FX, y, 0, FX + 0.3, y + 0.3, top, STONE, FRONT, {
        sideX: (u, v) => (Math.floor(v * 1.4) % 3 === 0 ? 0.7 : 0.1),
      });
      if (Math.abs(y) < 2)
        pyramid(FX + 0.15, y + 0.15, 0.17, top, 0.9, STONE, PINNACLE);
    }

    if (cut) {
      clip(null);
      cutFaces();
    }
    growTree(FX + 2.4, -7.1, TREE, 0.58, 300, 2100, YEW);
    growTree(-4.6, 7.4, TREE, 0.62, 300, 2600, YEW);
  },
};
