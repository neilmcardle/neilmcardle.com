import {
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
  cypress,
  dome,
  grass,
  island,
  shadowBox,
  tone,
  windowBays,
  type Level,
} from "../engine/kit";

const PLASTER: RGB = [214, 164, 120];
const LEAD: RGB = [128, 134, 148];
const PAVE: RGB[] = [
  [184, 176, 160],
  [196, 188, 172],
  [206, 198, 182],
];

const DOME = 1,
  SEMI = 2,
  RING = 3,
  PIER = 4,
  WALLS = 6,
  TREE = 7;

const CORE = 3.6,
  CORE_TOP = 5.0,
  DRUM_TOP = 5.55,
  DOME_R = 3.0;

const arched = windowBays(
  0.9,
  0.38,
  1.3,
  0.5,
  CORE * 2,
  1.0,
  2,
  CORE_TOP - 0.4,
);
const plaster: Level = (u, v) => {
  if (v > CORE_TOP - 0.18) return 0.7;
  const hit = arched.hit(u, v);
  if (hit >= 0) return -2.2;
  return (noise(u * 1.5, v * 2) - 0.5) * 0.7 + (v < 0.3 ? 0.4 : 0);
};

function drum() {
  const st = step(),
    ramp = rampId(PLASTER);
  for (let z = CORE_TOP; z <= DRUM_TOP; z += st) {
    for (let a = Math.PI / 4 - 1.95; a <= Math.PI / 4 + 1.95; a += st / 2.9) {
      const k = Math.floor(((a / (Math.PI * 2)) * 40 + 40) % 40),
        f = ((((a / (Math.PI * 2)) * 40) % 1) + 1) % 1;
      const win =
        Math.abs(f - 0.5) < 0.22 && z > CORE_TOP + 0.1 && z < DRUM_TOP - 0.08;
      surf(
        Math.cos(a) * 2.9,
        Math.sin(a) * 2.9,
        z,
        ramp,
        win ? -2.2 : 0.4,
        normalOf(Math.cos(a), Math.sin(a), 0),
        RING,
        win ? 1 + ((k * 37) % 254) : 0,
      );
    }
  }
}

export const hagiaSophia: Scene = {
  id: "hagiasophia",
  scale: 9,
  originY: 26,
  windowLight: [255, 194, 110],
  parts: [
    "",
    "central dome",
    "semi-dome",
    "ring of windows",
    "buttress pier",
    "",
    "plaster walls",
    "cypress tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 10.4, 10.0);
    if (edge < 0) return 0;
    if (edge > 0.8 || (Math.abs(x) > 7.2 && Math.abs(y) < 4.5))
      return grass(x, y, ix, iy, i, 0.15);
    setKind(i, 1);
    if (hash(ix, iy) > 0.985) return rgb(150, 142, 128);
    const slab = (Math.floor(x * 1.2) + Math.floor(y * 1.2)) % 2;
    return tone(
      PAVE,
      0.3 + slab * 0.2 + (noise(x * 3, y * 3) - 0.5) * 0.3,
      ix,
      iy,
    );
  },
  build() {
    box(-CORE, -CORE, 0, CORE, CORE, CORE_TOP, PLASTER, WALLS, {
      sideX: plaster,
      sideY: plaster,
      glowX: arched.glow,
      glowY: arched.glow,
    });
    shadowBox(-CORE, -CORE, CORE, CORE, 0, CORE_TOP);
    for (const sx of [-1, 1]) {
      const x0 = sx > 0 ? CORE : -5.8,
        x1 = sx > 0 ? 5.8 : -CORE;
      box(x0, -2.6, 0, x1, 2.6, 3.8, PLASTER, WALLS, {
        sideX: plaster,
        sideY: plaster,
        glowX: arched.glow,
        glowY: arched.glow,
      });
      shadowBox(x0, -2.6, x1, 2.6, 0, 3.8);
      dome(sx * CORE, 0, 3.8, 2.6, LEAD, SEMI, {
        zScale: 0.62,
        from: sx > 0 ? -Math.PI / 2 : Math.PI / 2,
        to: sx > 0 ? Math.PI / 2 : (3 * Math.PI) / 2,
        level: (a, phi) =>
          ((((a / (Math.PI * 2)) * 24) % 1) + 1) % 1 < 0.1
            ? 0.7
            : Math.floor(phi * 10) % 2
              ? 0.2
              : -0.1,
      });
    }
    for (const sy of [-1, 1])
      for (const sx of [-1, 1]) {
        const x0 = sx > 0 ? 1.5 : -3.3,
          y0 = sy > 0 ? CORE : -5.0;
        box(x0, y0, 0, x0 + 1.8, y0 + 1.4, 6.0, PLASTER, PIER, {
          sideX: (u, v) =>
            v > 5.8 ? 0.7 : (noise(u * 2, v) - 0.5) * 0.6 - 0.2,
          sideY: (u, v) =>
            v > 5.8 ? 0.7 : (noise(u * 2, v) - 0.5) * 0.6 - 0.1,
        });
        shadowBox(x0, y0, x0 + 1.8, y0 + 1.4, 0, 6.0);
        dome(x0 + 0.9, y0 + 0.7, 6.0, 0.5, LEAD, PIER, { zScale: 0.9 });
      }
    drum();
    dome(0, 0, DRUM_TOP, DOME_R, LEAD, DOME, {
      zScale: 0.52,
      level: (a, phi) =>
        (((((a / (Math.PI * 2)) * 40) % 1) + 1) % 1 < 0.14 ? 0.8 : 0) +
        (phi > 1.35 ? 0.4 : 0),
    });
    cylinder(
      0,
      0,
      0.05,
      0.05,
      DRUM_TOP + DOME_R * 0.52,
      DRUM_TOP + DOME_R * 0.52 + 0.5,
      [200, 176, 96],
      DOME,
      { shadow: false },
    );

    cypress(8.6, 2.6, 3.0, TREE, 11);
    cypress(3.0, 8.6, 2.8, TREE, 44);
    cypress(-2.6, 8.8, 3.2, TREE, 77);
  },
};
