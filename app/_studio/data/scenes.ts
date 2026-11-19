import hotspotOutlines from "./hotspots.json";
import art from "./art.json";
import type { Point } from "../engine/geometry";

export type SceneId = "studio";
export type Facing = "left" | "right" | "towards" | "away";

export type HotspotDef = {
  id: string;
  name: string;
  outline: string | null;
  area?: number[][];
  inert?: boolean;
  walkTo: Point;
  face: Facing;
  look: string;
};

export type LightDef = {
  x: number;
  y: number;
  radius: number;
  color: [number, number, number];
};

export type SceneDef = {
  id: SceneId;
  title: string;
  image: string;
  width: number;
  height: number;
  walkable: number[][];
  depth: [number, number][];
  ambient: [number, number, number];
  lights: LightDef[];
  hotspots: HotspotDef[];
  entries: Record<string, { at: Point; face: Facing }>;
};

const outlines = hotspotOutlines as Record<
  string,
  Record<string, number[][][]>
>;

export function outlineFor(scene: SceneId, key: string): number[][][] {
  return outlines[scene]?.[key] ?? [];
}

export const SCENES: Record<SceneId, SceneDef> = {
  studio: {
    id: "studio",
    title: "The studio",
    image: art.scenes.studio.src,
    width: art.scenes.studio.width,
    height: art.scenes.studio.height,
    walkable: [
      [300, 1104],
      [1030, 1104],
      [1044, 1158],
      [1912, 1158],
      [1926, 1104],
      [2540, 1104],
      [2540, 1432],
      [20, 1432],
      [20, 1214],
      [300, 1214],
    ],
    depth: [
      [1104, 1.0],
      [1432, 1.16],
    ],
    ambient: [214, 186, 160],
    lights: [{ x: 1300, y: 1000, radius: 1100, color: [255, 206, 150] }],
    hotspots: [
      {
        id: "easel",
        name: "Easel",
        outline: "easel",
        walkTo: { x: 420, y: 1250 },
        face: "left",
        look: "A landscape, half finished. The river is better than the trees.",
      },
      {
        id: "print-makeebook",
        name: "makeEbook print",
        outline: "print-makeebook",
        walkTo: { x: 600, y: 1130 },
        face: "away",
        look: "A print of the makeEbook mark, pegged up to dry.",
      },
      {
        id: "print-coverly",
        name: "Coverly print",
        outline: "print-coverly",
        walkTo: { x: 720, y: 1130 },
        face: "away",
        look: "A print of the Coverly mark, pegged up to dry.",
      },
      {
        id: "print-doodlewire",
        name: "DoodleWire print",
        outline: "print-doodlewire",
        walkTo: { x: 840, y: 1130 },
        face: "away",
        look: "A print of the DoodleWire mark, pegged up to dry.",
      },
      {
        id: "press",
        name: "Proof press",
        outline: "press",
        walkTo: { x: 720, y: 1130 },
        face: "away",
        look: "A small cast iron proof press. There's a sheet still on the plate.",
      },
      {
        id: "desk",
        name: "Desk",
        outline: "desk",
        inert: true,
        walkTo: { x: 1300, y: 1180 },
        face: "away",
        look: "Sketchbooks, a jar of pencils, a lamp. Tidy, in a way only one person understands.",
      },
      {
        id: "drawer",
        name: "Drawer",
        outline: "drawer",
        walkTo: { x: 2000, y: 1190 },
        face: "left",
        look: "A drawer of small toys and curiosities.",
      },
      {
        id: "window",
        name: "Window",
        outline: "window",
        inert: true,
        walkTo: { x: 1560, y: 1140 },
        face: "away",
        look: "The street outside, and the lamp you passed on the way in.",
      },
      {
        id: "door",
        name: "Door to the street",
        outline: "door",
        inert: true,
        walkTo: { x: 2200, y: 1150 },
        face: "away",
        look: "The way back out. A bolt, a latch, and a basket of post nobody has opened.",
      },
      {
        id: "laptop",
        name: "Laptop",
        outline: "laptop",
        walkTo: { x: 1320, y: 1180 },
        face: "away",
        look: "A laptop, still on, still glowing.",
      },
      {
        id: "phone",
        name: "Phone",
        outline: "phone",
        walkTo: { x: 1700, y: 1180 },
        face: "away",
        look: "A phone, face up on the desk.",
      },
      {
        id: "coat",
        name: "Grey coat",
        outline: null,
        area: [
          [2362, 250],
          [2530, 250],
          [2530, 790],
          [2350, 790],
        ],
        walkTo: { x: 2420, y: 1150 },
        face: "away",
        look: "A grey coat on the hook by the door.",
      },
      {
        id: "post",
        name: "Basket of post",
        outline: "post",
        walkTo: { x: 2210, y: 1150 },
        face: "away",
        look: "Letters in a wire basket on the back of the door.",
      },
    ],
    entries: {
      fromStreet: { at: { x: 2200, y: 1200 }, face: "left" },
    },
  },
};
