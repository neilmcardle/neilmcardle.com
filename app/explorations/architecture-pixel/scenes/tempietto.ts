import {
  noise,
  rgb,
  setGroundPart,
  setKind,
  type RGB,
  type Scene,
} from "../engine/engine";
import {
  courses,
  cone,
  cylinder,
  cypress,
  dome,
  grass,
  island,
  tone,
} from "../engine/kit";

const TRAVERTINE: RGB = [224, 214, 192];
const GRANITE: RGB = [150, 140, 132];
const LEAD: RGB = [132, 136, 146];
const PAVING: RGB[] = [
  [196, 184, 160],
  [208, 196, 172],
  [218, 206, 184],
];

const COLONNADE = 1,
  DRUM = 2,
  DOME = 3,
  LANTERN = 4,
  BALUSTRADE = 5,
  BASE = 6,
  CYPRESS = 7,
  PAVING_PART = 8,
  ENTABLATURE = 9;

const COLS = 16,
  RING = 3.3,
  BASE_TOP = 0.6,
  SHAFT_TOP = 3.4,
  ENT_TOP = 3.9,
  BAL_TOP = 4.45,
  DRUM_TOP = 6.3,
  DOME_R = 2.55;

const fluted = (a: number, t: number) => Math.cos(a * 16) * 0.45 - t * 0.2;

export const tempietto: Scene = {
  id: "tempietto",
  scale: 13,
  originY: 30,
  windowLight: [255, 200, 120],
  parts: [
    "",
    "Doric colonnade",
    "drum",
    "dome",
    "lantern",
    "balustrade",
    "stepped base",
    "cypress tree",
    "cloister paving",
    "frieze",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 8.4, 8.4);
    if (edge < 0) return 0;
    if (edge > 0.8) return grass(x, y, ix, iy, i, 0.1);
    setKind(i, 1);
    setGroundPart(i, PAVING_PART);
    const r = Math.hypot(x, y);
    const ring = Math.floor(r * 1.6) % 2 === 0;
    const spoke = Math.floor((Math.atan2(y, x) / Math.PI) * 16 + 32) % 2 === 0;
    if (Math.abs(r - 5.2) < 0.12) return rgb(180, 168, 146);
    return tone(
      PAVING,
      0.3 + (ring !== spoke ? 0.3 : 0) + (noise(x * 3, y * 3) - 0.5) * 0.3,
      ix,
      iy,
    );
  },
  build() {
    for (let k = 0; k < 3; k++) {
      cylinder(
        0,
        0,
        4.3 - k * 0.3,
        4.3 - k * 0.3,
        k * 0.2,
        (k + 1) * 0.2,
        TRAVERTINE,
        BASE,
        {
          level: (a, t) => (t > 0.8 ? 0.6 : 0) + (noise(a * 6, k) - 0.5) * 0.5,
        },
      );
    }
    cylinder(0, 0, 2.5, 2.5, BASE_TOP, DRUM_TOP, TRAVERTINE, DRUM, {
      level: (a, t) => {
        const z = BASE_TOP + t * (DRUM_TOP - BASE_TOP);
        const bay = ((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1;
        const niche =
          Math.abs(bay - 0.5) < 0.12 &&
          ((z > 1.2 && z < 2.9) || (z > 4.8 && z < 5.9));
        const window = niche && z > 4.8;
        if (window) return -2.3;
        if (niche) return -1.4 + (z > 2.6 ? 0.6 : 0);
        if (Math.abs(z - 4.6) < 0.08) return 0.8;
        return courses(a * 2.5, z, 0.3, 0.6) * 0.5 - 0.3;
      },
      top: false,
    });
    for (let k = 0; k < COLS; k++) {
      const a = (k / COLS) * Math.PI * 2;
      const x = Math.cos(a) * RING,
        y = Math.sin(a) * RING;
      cylinder(x, y, 0.2, 0.17, BASE_TOP, SHAFT_TOP, GRANITE, COLONNADE, {
        level: fluted,
        top: false,
      });
      cylinder(
        x,
        y,
        0.17,
        0.26,
        SHAFT_TOP,
        SHAFT_TOP + 0.12,
        TRAVERTINE,
        COLONNADE,
        { shadow: false, top: false },
      );
    }
    cylinder(
      0,
      0,
      3.62,
      3.62,
      SHAFT_TOP + 0.12,
      ENT_TOP,
      TRAVERTINE,
      ENTABLATURE,
      {
        level: (a, t) => {
          if (t < 0.4) return 0.4;
          const f = ((((a / (Math.PI * 2)) * 64) % 1) + 1) % 1;
          return t > 0.86 ? 0.9 : f < 0.36 ? -0.7 : 0.4;
        },
      },
    );
    cylinder(0, 0, 3.5, 3.5, ENT_TOP, BAL_TOP, TRAVERTINE, BALUSTRADE, {
      top: false,
      shadow: false,
      level: (a, t) => {
        if (t > 0.8 || t < 0.15) return 0.7;
        const f = ((((a / (Math.PI * 2)) * 120) % 1) + 1) % 1;
        return f < 0.45 ? 0.5 : -2.2;
      },
    });
    dome(0, 0, DRUM_TOP, DOME_R, LEAD, DOME, {
      level: (a, phi) => {
        const rib = ((((a / (Math.PI * 2)) * 16) % 1) + 1) % 1 < 0.1;
        return (rib ? 0.8 : 0) + (Math.floor(phi * 14) % 2 ? 0.2 : -0.1);
      },
    });
    cylinder(
      0,
      0,
      0.42,
      0.42,
      DRUM_TOP + DOME_R - 0.15,
      DRUM_TOP + DOME_R + 0.7,
      TRAVERTINE,
      LANTERN,
      {
        level: (a) =>
          ((((a / (Math.PI * 2)) * 8) % 1) + 1) % 1 < 0.3 ? -2 : 0.3,
      },
    );
    cone(0, 0, 0.5, DRUM_TOP + DOME_R + 0.7, 0.55, LEAD, LANTERN);
    cylinder(
      0,
      0,
      0.06,
      0.06,
      DRUM_TOP + DOME_R + 1.25,
      DRUM_TOP + DOME_R + 1.7,
      [196, 170, 96],
      LANTERN,
    );

    cypress(-5.6, 3.6, 4.2, CYPRESS, 0);
    cypress(3.8, -5.6, 3.8, CYPRESS, 300);
    cypress(-6.2, -2.4, 3.4, CYPRESS, 600);
  },
};
