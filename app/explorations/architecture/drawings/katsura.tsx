import { measures } from "../sources";
import {
  DimensionLine,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const ms = measures("katsura");
const MAT = ms("matWidth");

type Mat = { r: number; c: number; w: number; h: number };
type Room = { x: number; y: number; w: number; h: number; name: string };

function tile(w: number, h: number): Mat[] {
  const owner: number[][] = Array.from({ length: h }, () => Array(w).fill(-1));
  const mats: Mat[] = [];
  const fourCorners = () => {
    for (let r = 1; r < h; r++)
      for (let c = 1; c < w; c++) {
        const ids = [
          owner[r - 1][c - 1],
          owner[r - 1][c],
          owner[r][c - 1],
          owner[r][c],
        ];
        if (ids.every((id) => id >= 0) && new Set(ids).size === 4) return true;
      }
    return false;
  };
  const place = (m: Mat, id: number) => {
    for (let r = m.r; r < m.r + m.h; r++)
      for (let c = m.c; c < m.c + m.w; c++) owner[r][c] = id;
  };
  const clear = (m: Mat) => place(m, -1);
  const solve = (): boolean => {
    let r = -1;
    let c = -1;
    outer: for (let i = 0; i < h; i++)
      for (let j = 0; j < w; j++)
        if (owner[i][j] < 0) {
          r = i;
          c = j;
          break outer;
        }
    if (r < 0) return true;
    const options: Mat[] = [
      { r, c, w: 2, h: 1 },
      { r, c, w: 1, h: 2 },
    ];
    for (const m of (r + c) % 2 ? options.reverse() : options) {
      if (m.r + m.h > h || m.c + m.w > w) continue;
      let free = true;
      for (let i = m.r; i < m.r + m.h; i++)
        for (let j = m.c; j < m.c + m.w; j++)
          if (owner[i][j] >= 0) free = false;
      if (!free) continue;
      place(m, mats.length);
      mats.push(m);
      if (!fourCorners() && solve()) return true;
      mats.pop();
      clear(m);
    }
    return false;
  };
  solve();
  return mats;
}

const U = 10.6;
const X0 = 120;
const Y0 = 110;
const px = (x: number, y: number): Point => [X0 + x * U, Y0 + y * U];
const rect = (x: number, y: number, w: number, h: number) =>
  poly([px(x, y), px(x + w, y), px(x + w, y + h), px(x, y + h)], true);

const ROOMS: Room[] = [
  { x: 0, y: 8, w: 5, h: 4, name: "yari" },
  { x: 5, y: 8, w: 5, h: 4, name: "irori" },
  { x: 0, y: 12, w: 6, h: 5, name: "ni" },
  { x: 6, y: 12, w: 4, h: 5, name: "ichi" },
  { x: 11, y: 3, w: 4, h: 4, name: "san" },
  { x: 15, y: 3, w: 4, h: 4, name: "ni-mid" },
  { x: 11, y: 7, w: 2, h: 2, name: "small" },
  { x: 15, y: 7, w: 4, h: 3, name: "ichi-mid" },
  { x: 19, y: 2, w: 3, h: 2, name: "music" },
  { x: 22, y: -2, w: 6, h: 3, name: "ichi-new" },
  { x: 22, y: 1, w: 6, h: 3, name: "ni-new" },
  { x: 28, y: -2, w: 4, h: 5, name: "onema" },
];

const VERANDAS: [number, number, number, number][] = [
  [-1, 17, 12, 1.4],
  [10, 8, 1, 9],
  [11, 10, 8, 1.2],
  [22, 4, 10, 1.2],
];

function roomArt(room: Room, className = "fine") {
  return (
    <g key={room.name}>
      <g className={className}>
        {tile(room.w, room.h).map((m, i) => (
          <path key={i} d={rect(room.x + m.c, room.y + m.r, m.w, m.h)} />
        ))}
      </g>
      <path className="profile" d={rect(room.x, room.y, room.w, room.h)} />
    </g>
  );
}

function slats(x: number, y: number, w: number, h: number, step = 0.18) {
  const out: Point[][] = [];
  for (let k = x + step; k < x + w; k += step)
    out.push([px(k, y), px(k, y + h)]);
  return out;
}

const PLATFORM: [number, number, number, number] = [3, 18.4, 4, 3];

const main = (
  <>
    <ScaleBar x={40} y={36} scale={U / MAT} step={2} count={3} />
    <g className="fine">
      {VERANDAS.map(([x, y, w, h], i) => (
        <path key={i} d={rect(x, y, w, h)} />
      ))}
      {slats(...PLATFORM, 0.25).map((l, i) => (
        <path key={i} d={poly(l)} />
      ))}
    </g>
    <path className="profile" d={rect(...PLATFORM)} />
    {ROOMS.map((room) => roomArt(room))}
    <path className="idea" d={rect(0, 12, 2, 1)} />
    <DimensionLine
      a={px(0, 8)}
      b={px(10, 8)}
      offset={-14}
      value={+(10 * MAT).toFixed(2)}
    />
    <DimensionLine
      a={px(0, 12)}
      b={px(0, 17)}
      offset={18}
      value={+(5 * MAT).toFixed(2)}
    />
  </>
);

const SAMPLES: { w: number; h: number; mats: string; x: number; y: number }[] =
  [
    { w: 3, h: 2, mats: "3 mats", x: 0, y: 0 },
    { w: 3, h: 3, mats: "4½ mats", x: 5, y: 0 },
    { w: 4, h: 3, mats: "6 mats", x: 10, y: 0 },
    { w: 4, h: 4, mats: "8 mats", x: 0, y: 6 },
    { w: 5, h: 4, mats: "10 mats", x: 6, y: 6 },
  ];

const DU = 24;
const DX = 32;
const DY = 70;
const dpx = (x: number, y: number): Point => [DX + x * DU, DY + y * DU];
const drect = (x: number, y: number, w: number, h: number) =>
  poly([dpx(x, y), dpx(x + w, y), dpx(x + w, y + h), dpx(x, y + h)], true);

function sample(s: (typeof SAMPLES)[number]) {
  const half = s.mats === "4½ mats";
  const mats = half ? [] : tile(s.w, s.h);
  return (
    <g key={s.mats}>
      <g className="fine">
        {half ? (
          <>
            <path d={drect(s.x, s.y, 2, 1)} />
            <path d={drect(s.x + 2, s.y, 1, 2)} />
            <path d={drect(s.x + 1, s.y + 2, 2, 1)} />
            <path d={drect(s.x, s.y + 1, 1, 2)} />
            <path d={drect(s.x + 1, s.y + 1, 1, 1)} />
          </>
        ) : (
          mats.map((m, i) => (
            <path key={i} d={drect(s.x + m.c, s.y + m.r, m.w, m.h)} />
          ))
        )}
      </g>
      <path className="profile" d={drect(s.x, s.y, s.w, s.h)} />
    </g>
  );
}

const detail = (
  <>
    {SAMPLES.map(sample)}
    <path className="idea" d={drect(0, 0, 2, 1)} />
    <DimensionLine a={dpx(0, 0)} b={dpx(2, 0)} offset={-10} value={ms("mat")} />
  </>
);

export const katsura: Drawings = {
  main: {
    title: "Plan of the shoin halls",
    caption:
      "Plan of the Old, Middle and New Shoin with their mats laid in. One mat is outlined in red. The room sizes in mats follow the published plans; the outline of the halls, the verandas and the moon-viewing platform are simplified.",
    viewBox: [800, 420],
    art: main,
    labels: [
      { at: px(3, 16.2), to: [60, 340], text: "15 mats", anchor: "end" },
      { at: px(8, 15), to: [300, 330], text: "Old Shoin" },
      { at: px(12, 3.6), to: [240, 100], text: "Middle Shoin", anchor: "end" },
      {
        at: px(20.5, 2.6),
        to: [330, 60],
        text: "Music room, 3 mats",
        anchor: "end",
      },
      { at: px(31.6, 0.5), to: [500, 100], text: "New Shoin" },
      { at: px(6.6, 20), to: [230, 370], text: "Moon-viewing platform" },
    ],
  },
  detail: {
    title: "Rooms counted in mats",
    caption:
      "Common room sizes. A Kyoto mat is 1.91 by 0.955 metres, twice as long as it is wide, so rooms are named by their mat count. The mats are laid so that no four corners meet.",
    viewBox: [400, 400],
    art: detail,
    labels: SAMPLES.map((s) => ({
      at: dpx(s.x + s.w / 2, s.y + s.h + 0.9) as Point,
      text: s.mats,
      anchor: "middle" as const,
    })),
  },
};
