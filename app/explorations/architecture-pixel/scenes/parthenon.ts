import {
  growTree,
  hash,
  noise,
  rgb,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cylinder,
  gableX,
  grass,
  island,
  shadowBox,
  tone,
  type BoxOptions,
  type Level,
} from "../engine/kit";

const MARBLE: RGB = [226, 214, 190];
const MARBLE_SHADE: RGB = [204, 190, 166];
const ROOF: RGB = [214, 200, 176];
const ROCK: RGB[] = [
  [176, 166, 146],
  [190, 180, 160],
  [204, 194, 172],
  [216, 206, 184],
];
const OLIVE: RGB[] = [
  [70, 88, 66],
  [112, 128, 92],
  [158, 168, 128],
];

const COLUMN = 1,
  STYLOBATE = 2,
  ARCHITRAVE = 3,
  FRIEZE = 4,
  PEDIMENT = 5,
  CELLA = 6,
  ROOF_PART = 7,
  OLIVE_TREE = 8,
  CAPITAL = 9,
  ATHENA = 10,
  INNER = 11,
  POOL = 12,
  NAOS = 13;
const GOLD: RGB = [218, 172, 66];
const IVORY: RGB = [238, 228, 204];
const WATER: RGB = [44, 70, 104];

const HL = 9.45,
  HW = 4.2;
const BASE = 0.45,
  SHAFT = 3.3,
  ABACUS = 3.5,
  ARCH_TOP = 3.95,
  FRIEZE_TOP = 4.4,
  CORNICE = 4.58,
  RISE = 1.0;

const fluted = (seed: number) => (a: number, t: number) =>
  Math.cos(a * 20) * 0.55 + (noise(seed, t * 6) - 0.5) * 0.5 - t * 0.2;

const triglyphs =
  (spacing: number): Level =>
  (u, v) => {
    const f = ((((u - 0.38) / (spacing / 2) + 0.2) % 1) + 1) % 1;
    const triglyph = f < 0.4;
    const groove = triglyph && Math.floor((f / 0.4) * 5) % 2 === 1;
    return (triglyph ? -0.3 : 0.5) - (groove ? 1 : 0) + (v > 0.38 ? 0.4 : 0);
  };

function column(x: number, y: number, seed: number) {
  cylinder(x, y, 0.27, 0.22, BASE, SHAFT, MARBLE, COLUMN, {
    level: fluted(seed),
    top: false,
  });
  cylinder(x, y, 0.22, 0.34, SHAFT, SHAFT + 0.12, MARBLE, CAPITAL, {
    shadow: false,
    top: false,
  });
  box(
    x - 0.36,
    y - 0.36,
    SHAFT + 0.12,
    x + 0.36,
    y + 0.36,
    ABACUS,
    MARBLE,
    CAPITAL,
  );
}

export const parthenon: Scene = {
  id: "parthenon",
  scale: 12,
  originY: 12,
  parts: [
    "",
    "Doric column",
    "stylobate",
    "architrave",
    "triglyph frieze",
    "pediment",
    "cella wall",
    "marble roof tiles",
    "olive tree",
    "Doric capital",
    "Athena Parthenos",
    "inner colonnade",
    "reflecting pool",
    "naos",
  ],
  cutaway: {
    inside: [ATHENA, INNER, POOL, NAOS],
    removes: [ROOF_PART, PEDIMENT],
  },
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 12.6, 7.9);
    if (edge < 0) return 0;
    const n = noise(x * 0.5 + 4, y * 0.5);
    if (n > 0.62 && edge > 0.55) return grass(x, y, ix, iy, i, -0.15);
    setKind(i, 1);
    if (hash(ix, iy) > 0.97) return rgb(232, 224, 204);
    if (hash(ix + 3, iy) > 0.97) return rgb(150, 140, 122);
    return tone(ROCK, 0.25 + noise(x * 1.8, y * 1.8) * 0.55, ix, iy);
  },
  build(cut) {
    for (let k = 0; k < 3; k++) {
      const inset = (2 - k) * 0.2;
      box(
        -HL - inset,
        -HW - inset,
        k * 0.15,
        HL + inset,
        HW + inset,
        (k + 1) * 0.15,
        MARBLE,
        STYLOBATE,
        {
          sideX: (u, v) => (noise(u * 3, v * 12 + k) - 0.5) * 0.8,
          sideY: (u, v) => (noise(u * 3, v * 12 + k) - 0.5) * 0.8,
          top: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.6,
        },
      );
    }
    shadowBox(-HL, -HW, HL, HW, 0, BASE);

    if (cut) naos();
    else
      box(-7.3, -2.7, BASE, 7.3, 2.7, ABACUS, MARBLE_SHADE, CELLA, {
        sideX: (u, v) =>
          -0.6 + (Math.abs(u - 2.7) < 0.55 && v < 2.2 ? -1.6 : 0),
        sideY: (u, v) => -0.5 + (noise(u * 2, v * 3) - 0.5) * 0.6,
      });
    for (let j = 0; j < 6; j++) column(7.95, -2.3 + j * 0.92, 50 + j);

    const nx = 17,
      ny = 8;
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < ny; j++) {
        if (i > 0 && i < nx - 1 && j > 0 && j < ny - 1) continue;
        const x = -HL + 0.5 + (i * (HL * 2 - 1)) / (nx - 1);
        const y = -HW + 0.5 + (j * (HW * 2 - 1)) / (ny - 1);
        column(x, y, i * 8 + j);
      }

    const architrave: BoxOptions = {
      sideX: (u, v) => (v > 0.36 ? 0.5 : 0) + (noise(u * 4, v * 8) - 0.5) * 0.5,
      sideY: (u, v) => (v > 0.36 ? 0.5 : 0) + (noise(u * 4, v * 8) - 0.5) * 0.5,
    };
    const frieze: BoxOptions = {
      sideY: triglyphs((HL * 2 - 1) / 16),
      sideX: triglyphs((HW * 2 - 1) / 7),
    };
    const cornice: BoxOptions = { sideX: () => 0.6, sideY: () => 0.6 };
    if (cut) {
      band(ABACUS, ARCH_TOP, ARCHITRAVE, architrave, 0.12);
      band(ARCH_TOP, FRIEZE_TOP, FRIEZE, frieze, 0.12);
      band(FRIEZE_TOP, CORNICE, ROOF_PART, cornice, -0.05);
    } else {
      box(
        -HL + 0.12,
        -HW + 0.12,
        ABACUS,
        HL - 0.12,
        HW - 0.12,
        ARCH_TOP,
        MARBLE,
        ARCHITRAVE,
        architrave,
      );
      box(
        -HL + 0.12,
        -HW + 0.12,
        ARCH_TOP,
        HL - 0.12,
        HW - 0.12,
        FRIEZE_TOP,
        MARBLE,
        FRIEZE,
        frieze,
      );
      box(
        -HL - 0.05,
        -HW - 0.05,
        FRIEZE_TOP,
        HL + 0.05,
        HW + 0.05,
        CORNICE,
        MARBLE,
        ROOF_PART,
        cornice,
      );
      shadowBox(-HL, -HW, HL, HW, ABACUS, CORNICE);
      gableX(
        -HL - 0.05,
        HL + 0.05,
        -HW - 0.05,
        HW + 0.05,
        CORNICE,
        RISE,
        ROOF,
        ROOF_PART,
        {
          color: MARBLE,
          part: PEDIMENT,
          level: (y, h) => {
            const q = Math.abs(y) / (HW + 0.05),
              top = RISE * (1 - q);
            if (h > top - 0.12) return 0.7;
            const figure = noise(y * 2.6, h * 4) > 0.55 && h > 0.12;
            return figure ? 0.4 : -1.1;
          },
        },
      );
    }

    for (const [x, y, s, seed] of [
      [-10.6, 5.2, 0.55, 300],
      [10.2, -5.9, 0.5, 700],
      [-4.2, 6.2, 0.42, 1200],
    ] as const) {
      growTreeOlive(x, y, s, seed);
    }
    for (let k = 0; k < 18; k++) {
      const x = (hash(k, 31) - 0.5) * 22,
        y = (hash(k, 32) > 0.5 ? 1 : -1) * (5 + hash(k, 33) * 2.2);
      sphere(x, y, 0.05, 0.18 + hash(k, 34) * 0.2, ROCK[1], 0, "rough");
    }
  },
};

function band(
  z0: number,
  z1: number,
  part: number,
  o: BoxOptions,
  inset: number,
) {
  const x0 = -HL + inset,
    x1 = HL - inset,
    y0 = -HW + inset,
    y1 = HW - inset,
    d = 0.85;
  box(x0, y0, z0, x1, y0 + d, z1, MARBLE, part, o);
  box(x0, y0, z0, x0 + d, y1, z1, MARBLE, part, o);
  box(x1 - d, y0, z0, x1, y1, z1, MARBLE, part, o);
  shadowBox(x0, y0, x1, y0 + d, z0, z1);
  shadowBox(x1 - d, y0, x1, y1, z0, z1);
}

function naos() {
  const wall: Level = (u, v) =>
    -0.3 +
    (Math.floor(v * 3.2) % 2 ? 0.25 : -0.1) +
    (noise(u * 2, v * 3) - 0.5) * 0.4;
  const floor: Level = (u, v) =>
    (Math.floor(u * 1.4) + Math.floor(v * 1.4)) % 2 ? 0.4 : -0.1;
  box(-7.3, -2.7, BASE, 7.3, -2.45, ABACUS, MARBLE_SHADE, NAOS, {
    sideY: wall,
  });
  box(-7.3, -2.45, BASE, -7.05, 2.7, ABACUS, MARBLE_SHADE, NAOS, {
    sideX: wall,
  });
  box(7.05, -2.45, BASE, 7.3, 2.7, ABACUS, MARBLE_SHADE, CELLA, {
    sideX: (u, v) => -0.6 + (Math.abs(u - 2.55) < 0.55 && v < 2.2 ? -1.6 : 0),
  });
  box(-2.6, -2.45, BASE, -2.35, 2.45, ABACUS, MARBLE_SHADE, NAOS, {
    sideX: (u, v) => (Math.abs(u - 2.45) < 0.45 && v < 1.9 ? -2.2 : wall(u, v)),
  });
  box(-7.3, 2.45, BASE, 7.3, 2.7, BASE + 0.55, MARBLE_SHADE, CELLA, {
    top: (u) => (hash(Math.floor(u * 3), 2) - 0.5) * 1.4 - 0.2,
    sideY: wall,
  });
  box(-7.05, -2.45, BASE - 0.01, 7.05, 2.45, BASE + 0.01, MARBLE, NAOS, {
    top: floor,
  });
  shadowBox(-7.3, -2.7, 7.3, -2.45, BASE, ABACUS);

  for (let x = -1.6; x <= 5.8; x += 0.92)
    for (const y of [-1.75, 1.75]) innerColumn(x, y);
  for (let y = -0.875; y <= 0.9; y += 0.875) innerColumn(-1.6, y);
  for (const y of [-1.75, 1.75])
    box(-1.75, y - 0.12, 2.0, 5.95, y + 0.12, 2.14, MARBLE, INNER);
  box(-1.75, -1.87, 2.0, -1.45, 1.87, 2.14, MARBLE, INNER);

  box(0.1, -0.85, BASE + 0.005, 1.7, 0.85, BASE + 0.03, WATER, POOL, {
    top: (u, v) =>
      hash(Math.floor(u * 8), Math.floor(v * 8)) > 0.86
        ? 1.6
        : (noise(u * 3, v * 3) - 0.5) * 0.6,
  });

  box(-1.2, -0.55, BASE, -0.2, 0.55, BASE + 0.35, MARBLE, ATHENA, {
    sideX: (u, v) => (v > 0.26 ? 0.7 : -0.2),
  });
  const cx = -0.7,
    base = BASE + 0.35;
  for (let k = 0; k < 14; k++) {
    const t = k / 13,
      z = base + 0.1 + t * 1.7,
      r = 0.34 - t * 0.16 + (t > 0.55 && t < 0.7 ? 0.04 : 0);
    sphere(cx, 0, z, r, t > 0.62 && t < 0.72 ? IVORY : GOLD, ATHENA, "solid");
  }
  sphere(cx, 0, base + 2.0, 0.13, IVORY, ATHENA, "solid");
  sphere(cx - 0.03, 0, base + 2.1, 0.12, GOLD, ATHENA, "solid");
  sphere(cx - 0.06, 0, base + 2.24, 0.06, GOLD, ATHENA, "solid");
  for (let k = 0; k < 5; k++)
    sphere(
      cx - 0.05,
      0.46,
      base + 0.35 + k * 0.08,
      0.26 - Math.abs(k - 2) * 0.04,
      GOLD,
      ATHENA,
      "solid",
    );
  for (let z = base; z <= base + 2.5; z += 0.06)
    sphere(cx - 0.1, -0.42, z, 0.035, [168, 140, 80], ATHENA, "solid");
  sphere(cx + 0.38, -0.3, base + 1.25, 0.09, GOLD, ATHENA, "solid");
  sphere(cx + 0.38, -0.3, base + 1.38, 0.06, GOLD, ATHENA, "solid");
}

function innerColumn(x: number, y: number) {
  cylinder(x, y, 0.13, 0.11, BASE, 2.0, MARBLE, INNER, {
    level: (a, t) => Math.cos(a * 16) * 0.35 - t * 0.2,
    top: false,
  });
  cylinder(x, y, 0.1, 0.09, 2.14, 3.3, MARBLE, INNER, {
    level: (a, t) => Math.cos(a * 16) * 0.35 - t * 0.2,
    top: false,
  });
}

function growTreeOlive(x: number, y: number, scale: number, seed: number) {
  growTree(x, y, OLIVE_TREE, scale, 320, seed, OLIVE);
}
