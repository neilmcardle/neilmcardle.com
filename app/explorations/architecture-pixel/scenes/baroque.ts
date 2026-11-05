import {
  hash,
  noise,
  rgb,
  setGroundPart,
  setKind,
  sphere,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  box,
  cone,
  cylinder,
  dome,
  island,
  pyramid,
  sheet,
  shadowBox,
  tone,
  windowBays,
  type Level,
  type V3,
} from "../engine/kit";

const TRAVERTINE: RGB = [230, 214, 182];
const LEAD: RGB = [126, 132, 144];
const GOLD: RGB = [214, 176, 80];
const GRANITE: RGB = [196, 150, 140];
const WATER: RGB = [56, 96, 120];
const PAVE: RGB[] = [
  [190, 176, 152],
  [202, 188, 164],
  [212, 198, 174],
];

const FACADE = 1,
  DOME = 2,
  TOWER = 3,
  LANTERN = 4,
  STATUES = 5,
  FOUNTAIN = 6,
  PIAZZA = 7,
  BODY = 8;

const FRONT = 3.0,
  BOW = 0.07,
  HALF = 3.2;
const frontX = (y: number) => FRONT + BOW * y * y;
const height = (y: number) =>
  5.6 + (Math.abs(y) < 1.8 ? 1.0 * (1 - Math.abs(y) / 1.8) : 0);

const facadeLevel: Level = (u, v) => {
  const y = u - HALF,
    z = v;
  const top = height(y);
  if (top - z < 0.14) return 0.9;
  if (Math.abs(y) < 1.8 && z > 5.6)
    return z > 5.75 && top - z > 0.3 ? -0.8 : 0.6;
  if ((z > 3.0 && z < 3.28) || (z > 5.2 && z < 5.6))
    return 0.85 - (z > 5.48 ? 0.3 : 0);
  for (const c of [-2.8, -1.9, -0.95, 0.95, 1.9, 2.8])
    if (Math.abs(y - c) < 0.15) return 0.7 + (Math.abs(y - c) < 0.05 ? 0.3 : 0);
  if (Math.abs(y) < 0.5 && z < 1.9 + Math.sqrt(Math.max(0, 0.25 - y * y)) * 0.6)
    return -2.4;
  for (const c of [-1.42, 1.42]) {
    if (
      Math.abs(y - c) < 0.26 &&
      z > 3.6 &&
      z < 4.6 + Math.sqrt(Math.max(0, 0.07 - (y - c) ** 2))
    )
      return -2.2;
    if (Math.abs(y - c) < 0.24 && z > 0.6 && z < 2.3)
      return -1.4 + (z > 1.9 ? 0.5 : 0);
  }
  return (
    (noise(u * 2, v * 2) - 0.5) * 0.5 + (Math.floor(v * 3.4) % 2 ? 0.1 : -0.1)
  );
};

const facadeGlow = (u: number, v: number) => {
  const y = u - HALF;
  for (const c of [-1.42, 1.42])
    if (Math.abs(y - c) < 0.26 && v > 3.6 && v < 4.7) return c > 0 ? 21 : 87;
  return 0;
};

function tower(side: number) {
  const y0 = side > 0 ? HALF : -HALF - 1.4,
    y1 = y0 + 1.4;
  const bay = windowBays(1.4, 0.5, 1.5, 0.45, 1.4, 1.0, 10 + side, 6.8);
  box(2.4, y0, 0, 4.0, y1, 7.2, TRAVERTINE, TOWER, {
    sideX: (u, v) =>
      bay.hit(u, v) >= 0
        ? -2
        : v % 2.4 < 0.16
          ? 0.8
          : (noise(u * 3, v * 2) - 0.5) * 0.4,
    sideY: (u, v) => (v % 2.4 < 0.16 ? 0.8 : (noise(u * 3, v * 2) - 0.5) * 0.4),
    glowX: bay.glow,
  });
  shadowBox(2.4, y0, 4.0, y1, 0, 7.2);
  box(2.6, y0 + 0.2, 7.2, 3.8, y1 - 0.2, 8.6, TRAVERTINE, TOWER, {
    sideX: (u, v) =>
      Math.abs(u - 0.5) < 0.26 && v > 0.2 && v < 1.2 ? -2.4 : 0.5,
    sideY: (u, v) =>
      Math.abs(u - 0.6) < 0.28 && v > 0.2 && v < 1.2 ? -2.4 : 0.5,
  });
  shadowBox(2.6, y0 + 0.2, 3.8, y1 - 0.2, 7.2, 8.6);
  dome(3.2, (y0 + y1) / 2, 8.6, 0.62, LEAD, TOWER, {
    level: (a) => (((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1 < 0.15 ? 0.7 : 0),
  });
  cone(3.2, (y0 + y1) / 2, 0.16, 9.2, 0.7, LEAD, TOWER);
  sphere(3.2, (y0 + y1) / 2, 9.95, 0.08, GOLD, TOWER, "solid");
  for (const [dx, dy] of [
    [0.8, 0.0],
    [0.8, 1.4],
    [-0.8, 1.4],
  ])
    sphere(3.2 + dx, y0 + dy, 7.35, 0.12, TRAVERTINE, STATUES, "solid");
}

export const baroque: Scene = {
  id: "baroque",
  scale: 10,
  originY: 32,
  windowLight: [255, 196, 112],
  parts: [
    "",
    "concave façade",
    "drum and dome",
    "bell tower",
    "lantern",
    "rooftop statues",
    "obelisk fountain",
    "piazza",
    "nave",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x - 1.6, y, ix, iy, 9.8, 7.8);
    if (edge < 0) return 0;
    setKind(i, 1);
    setGroundPart(i, PIAZZA);
    if (hash(ix, iy) > 0.985) return rgb(150, 140, 124);
    const r = Math.hypot(x - 7.8, y);
    const fan =
      (Math.floor(r * 2) +
        Math.floor((Math.atan2(y, x - 7.8) / Math.PI) * 10 + 20)) %
      2;
    return tone(
      PAVE,
      0.3 + fan * 0.2 + (noise(x * 3, y * 3) - 0.5) * 0.3,
      ix,
      iy,
    );
  },
  build() {
    box(-5.2, -HALF, 0, FRONT - 0.2, HALF, 5.2, TRAVERTINE, BODY, {
      sideY: (u, v) => (noise(u * 2, v * 2) - 0.5) * 0.5 - 0.2,
    });
    shadowBox(-5.2, -HALF, FRONT - 0.2, HALF, 0, 5.2);
    sheet(
      (t, v): V3 => {
        const y = -HALF + t * HALF * 2;
        return [frontX(y), y, v * height(y)];
      },
      TRAVERTINE,
      FACADE,
      (u, v) => facadeLevel(u, v * 1),
      (u, v) => facadeGlow(u, v),
    );
    for (const y of [-2.6, -1.6, 1.6, 2.6])
      sphere(frontX(y) - 0.1, y, 5.85, 0.14, TRAVERTINE, STATUES, "solid");
    sphere(frontX(0) - 0.15, 0, 6.85, 0.16, TRAVERTINE, STATUES, "solid");
    tower(1);
    tower(-1);

    cylinder(-1.0, 0, 2.2, 2.2, 5.2, 7.5, TRAVERTINE, DOME, {
      level: (a, t) => {
        const f = ((((a / (Math.PI * 2)) * 16) % 1) + 1) % 1;
        if (t > 0.88) return 0.8;
        if (f < 0.12) return 0.7;
        return f > 0.35 && f < 0.78 && t > 0.25 && t < 0.75 ? -2.2 : 0;
      },
      top: false,
    });
    dome(-1.0, 0, 7.5, 2.3, LEAD, DOME, {
      level: (a, phi) =>
        (((((a / (Math.PI * 2)) * 16) % 1) + 1) % 1 < 0.1 ? 0.8 : 0) +
        (phi > 1.3 ? 0.4 : 0),
    });
    cylinder(-1.0, 0, 0.44, 0.42, 9.7, 10.6, TRAVERTINE, LANTERN, {
      level: (a) =>
        ((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1 < 0.35 ? -2 : 0.4,
    });
    cone(-1.0, 0, 0.5, 10.6, 0.55, LEAD, LANTERN);
    sphere(-1.0, 0, 11.25, 0.1, GOLD, LANTERN, "solid");
    box(-1.03, -0.03, 11.3, -0.97, 0.03, 11.75, GOLD, LANTERN);

    cylinder(7.8, 0, 1.8, 1.8, 0, 0.35, TRAVERTINE, FOUNTAIN, {
      top: false,
      level: () => 0.5,
    });
    cylinder(7.8, 0, 1.65, 1.65, 0, 0.3, WATER, FOUNTAIN, { shadow: false });
    sphere(7.8, 0, 0.45, 0.75, TRAVERTINE, FOUNTAIN, "rough");
    box(7.64, -0.16, 0.9, 7.96, 0.16, 4.2, GRANITE, FOUNTAIN, {
      sideX: (u, v) => (noise(u * 9, v * 4) > 0.7 ? -0.8 : 0.3),
      sideY: (u, v) => (noise(u * 9, v * 4) > 0.7 ? -0.8 : 0.3),
    });
    shadowBox(7.64, -0.16, 7.96, 0.16, 0.9, 4.2, 0.25);
    pyramid(7.8, 0, 0.16, 4.2, 0.4, GRANITE, FOUNTAIN);
  },
};
