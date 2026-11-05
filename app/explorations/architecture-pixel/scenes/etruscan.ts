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
  cylinder,
  cypress,
  dome,
  grass,
  island,
  shadowBox,
  tone,
} from "../engine/kit";

const TUFA: RGB = [176, 150, 112];
const MOUND: RGB = [92, 120, 64];
const DARK: RGB = [40, 34, 30];
const STREET: RGB[] = [
  [170, 148, 112],
  [182, 160, 124],
  [194, 172, 136],
];

const DRUM = 1,
  MOUNDP = 2,
  DOOR = 3,
  CUBE = 4,
  STREETP = 5,
  TREE = 6;

function tumulus(x: number, y: number, r: number, h: number) {
  cylinder(x, y, r, r, 0, h, TUFA, DRUM, {
    level: (a, t) => {
      if (t > 0.82) return 0.8;
      if (t > 0.7 && t < 0.78) return -0.6;
      if (t < 0.12) return 0.5;
      return (noise(a * 4 * r, t * 4) - 0.5) * 1.1;
    },
  });
  dome(x, y, h, r * 0.98, MOUND, MOUNDP, {
    zScale: 0.55,
    level: (a, phi) =>
      (noise(a * 6, phi * 6) - 0.5) * 1.3 +
      (hash(Math.floor(a * 20), Math.floor(phi * 20)) > 0.85 ? 0.8 : 0),
  });
  const a = Math.PI / 4,
    dx = x + Math.cos(a) * r,
    dy = y + Math.sin(a) * r;
  box(
    dx - 0.18,
    dy - 0.18,
    0,
    dx + 0.12,
    dy + 0.12,
    Math.min(1.1, h * 0.8),
    DARK,
    DOOR,
    { sideX: () => -1, sideY: () => -1.2, top: () => -1 },
  );
  box(
    dx - 0.28,
    dy - 0.28,
    Math.min(1.1, h * 0.8),
    dx + 0.2,
    dy + 0.2,
    Math.min(1.1, h * 0.8) + 0.14,
    TUFA,
    DOOR,
    { sideX: () => 0.7, sideY: () => 0.7 },
  );
}

function cubeTomb(x: number, y: number) {
  box(x, y, 0, x + 1.4, y + 1.1, 1.1, TUFA, CUBE, {
    sideX: (u, v) =>
      Math.abs(u - 0.55) < 0.18 && v < 0.75
        ? -2.4
        : v > 0.95
          ? 0.8
          : (noise(u * 4, v * 4) - 0.5) * 0.9,
    sideY: (u, v) => (v > 0.95 ? 0.8 : (noise(u * 4, v * 4) - 0.5) * 0.9),
  });
  shadowBox(x, y, x + 1.4, y + 1.1, 0, 1.1);
}

export const etruscan: Scene = {
  id: "etruscan",
  scale: 12,
  originY: 14,
  parts: [
    "",
    "tufa drum",
    "grass mound",
    "tomb doorway",
    "cube tomb",
    "necropolis street",
    "cypress tree",
  ],
  ground(x, y, ix, iy, i) {
    const edge = island(x, y, ix, iy, 8.8, 8.0);
    if (edge < 0) return 0;
    if (Math.abs(x - y * 0.25 - 2.2) < 0.75) {
      setKind(i, 1);
      setGroundPart(i, STREETP);
      const rut = Math.abs(Math.abs(x - y * 0.25 - 2.2) - 0.42) < 0.07;
      return tone(
        STREET,
        (rut ? 0 : 0.5) + (noise(x * 3, y * 3) - 0.5) * 0.4,
        ix,
        iy,
      );
    }
    if (hash(ix, iy) > 0.99) return rgb(230, 220, 180);
    return grass(x, y, ix, iy, i, 0.15);
  },
  build() {
    tumulus(-2.4, -1.6, 2.6, 1.3);
    tumulus(-1.6, 4.2, 1.8, 1.0);
    tumulus(5.6, -3.4, 1.6, 0.9);
    cubeTomb(4.2, 1.6);
    cubeTomb(4.6, 3.4);
    cubeTomb(-5.6, -6.2);
    cypress(6.6, 5.0, 3.2, TREE, 3);
    cypress(-6.4, 2.6, 3.6, TREE, 33);
    cypress(1.0, -6.4, 3.0, TREE, 66);
  },
};
