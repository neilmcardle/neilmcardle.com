export type Shape = "n" | "coin";

export type NSettings = {
  loop: boolean;
  distance: number;
  hold: number;
  scatterTime: number;
  returnTime: number;
  sweep: number;
  swirl: number;
  turbulence: number;
  flowSpeed: number;
  trail: number;
  shape: Shape;
  particles: number;
  dotSize: number;
  strokes: number;
  ink: string;
  grain: number;
  orbit: number;
  tilt: number;
  zoom: number;
  autoRotate: boolean;
  rotateSpeed: number;
};

export const N_DEFAULTS: NSettings = {
  loop: true,
  distance: 0.7,
  hold: 1.4,
  scatterTime: 2.6,
  returnTime: 2.8,
  sweep: 0.45,
  swirl: 2.9,
  turbulence: 0.3,
  flowSpeed: 1.2,
  trail: 0.4,
  shape: "n",
  particles: 40000,
  dotSize: 1.2,
  strokes: 0.15,
  ink: "#1f1d1a",
  grain: 0.2,
  orbit: -20,
  tilt: -16,
  zoom: 1,
  autoRotate: true,
  rotateSpeed: 0.8,
};
