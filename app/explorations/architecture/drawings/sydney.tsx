import { measures } from "../sources";
import {
  DimensionLine,
  frame,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const ms = measures("sydney-opera-house");
const R = ms("radius");
const TOP = ms("top");
const HALF = ms("length") / 2;
const PODIUM = 6;

const S = 3.8;
const f = frame(400, 330, S);

function arcBetween(
  a: [number, number],
  b: [number, number],
  r: number,
  outward: 1 | -1,
  steps = 20,
): Point[] {
  const mx = (a[0] + b[0]) / 2;
  const my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const h = Math.sqrt(Math.max(0, r * r - (len / 2) ** 2));
  const nx = (-dy / len) * outward;
  const ny = (dx / len) * outward;
  const cx = mx - nx * h;
  const cy = my - ny * h;
  const a0 = Math.atan2(a[1] - cy, a[0] - cx);
  let a1 = Math.atan2(b[1] - cy, b[0] - cx);
  if (a1 - a0 > Math.PI) a1 -= 2 * Math.PI;
  if (a1 - a0 < -Math.PI) a1 += 2 * Math.PI;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = a0 + ((a1 - a0) * i) / steps;
    return f.p(cx + r * Math.cos(t), cy + r * Math.sin(t));
  });
}

type Shell = { front: number; peak: [number, number]; back: number };

const SHELLS: Shell[] = [
  { front: 58, peak: [74, 24], back: 88 },
  { front: 30, peak: [48, 38], back: 66 },
  { front: 2, peak: [22, 52], back: 44 },
  { front: -42, peak: [-12, TOP], back: 14 },
  { front: -84, peak: [-66, 24], back: -50 },
];

function shell(s: Shell, i: number, red = false) {
  const front = arcBetween([s.front, PODIUM], s.peak, R, 1);
  const back = arcBetween(s.peak, [s.back, PODIUM], R, 1);
  const base: Point = f.p((s.front + s.back) / 2, PODIUM);
  const ribs = [0.15, 0.3, 0.45, 0.6, 0.75, 0.9].map(
    (t) => front[Math.round(t * (front.length - 1))],
  );
  return (
    <g key={i}>
      <path
        className="profile mask"
        d={poly([...front, ...back.slice(1)], true)}
      />
      <g className="fine">
        {ribs.map((p, k) => (
          <path key={k} d={poly([base, p])} />
        ))}
      </g>
      {red && <path className="idea" d={poly(front)} />}
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={20} count={2} />
    <g className="fine">
      {[0, -1.5, -3].map((v) => (
        <path key={v} d={poly([f.p(-100, v), f.p(100, v)])} />
      ))}
    </g>
    {SHELLS.map((s, i) => shell(s, i, i === 3))}
    <path
      className="profile mask"
      d={poly(
        [f.p(-HALF, 0), f.p(-HALF, PODIUM), f.p(HALF, PODIUM), f.p(HALF, 0)],
        true,
      )}
    />
    <DimensionLine
      a={f.p(-HALF, 0)}
      b={f.p(HALF, 0)}
      offset={26}
      value={ms("length")}
    />
    <DimensionLine
      a={f.p(-12, TOP)}
      b={f.p(-12, 0)}
      offset={-(HALF + 2) * S - 46}
      value={TOP}
    />
  </>
);

const C: Point = [200, 210];
const DR = 150;

function project(lat: number, lon: number): Point {
  const a = (lat * Math.PI) / 180;
  const o = (lon * Math.PI) / 180;
  return [C[0] + DR * Math.cos(a) * Math.sin(o), C[1] - DR * Math.sin(a)];
}

function vec(lat: number, lon: number) {
  const a = (lat * Math.PI) / 180;
  const o = (lon * Math.PI) / 180;
  return [Math.cos(a) * Math.sin(o), Math.sin(a), Math.cos(a) * Math.cos(o)];
}

function great(p: [number, number], q: [number, number], steps = 16): Point[] {
  const a = vec(...p);
  const b = vec(...q);
  const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const w = Math.acos(Math.min(1, dot));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const s1 = Math.sin((1 - t) * w) / Math.sin(w);
    const s2 = Math.sin(t * w) / Math.sin(w);
    const v = [a[0] * s1 + b[0] * s2, a[1] * s1 + b[1] * s2];
    return [C[0] + DR * v[0], C[1] - DR * v[1]] as Point;
  });
}

const TRIANGLES: [number, number, number][] = [
  [-42, 18, 22],
  [0, 26, 28],
  [40, 16, 20],
];

const detail = (
  <>
    <circle className="profile" cx={C[0]} cy={C[1]} r={DR} />
    <g className="fine">
      {[-60, -30, 0, 30, 60].map((lat) => (
        <path
          key={`lat${lat}`}
          d={poly(
            Array.from({ length: 37 }, (_, i) => project(lat, -90 + i * 5)),
          )}
        />
      ))}
      {[-60, -30, 0, 30, 60].map((lon) => (
        <path
          key={`lon${lon}`}
          d={poly(
            Array.from({ length: 37 }, (_, i) => project(-90 + i * 5, lon)),
          )}
        />
      ))}
    </g>
    {TRIANGLES.map(([lon, half, height], i) => {
      const a: [number, number] = [-6, lon - half / 2];
      const b: [number, number] = [-6, lon + half / 2];
      const apex: [number, number] = [-6 + height * 2, lon - half * 0.15];
      return (
        <path
          key={i}
          className="idea mask"
          d={poly(
            [
              ...great(a, apex),
              ...great(apex, b).slice(1),
              ...great(b, a).slice(1),
            ],
            true,
          )}
        />
      );
    })}
    <DimensionLine
      a={C}
      b={[C[0] - DR * 0.707, C[1] + DR * 0.707]}
      offset={0.1}
      value={R}
    />
  </>
);

export const sydney: Drawings = {
  main: {
    title: "West elevation",
    caption:
      "The shells from the west, on their podium above the harbour. Every edge is drawn as an arc of the same 75.2 m radius; the leading edge of the tallest shell is in red. The length and the height of the tallest shell are from published figures; the other shell sizes and the podium height are estimates.",
    viewBox: [800, 400],
    art: main,
    labels: [
      {
        at: f.p(-12, TOP - 1),
        to: [300, 40],
        text: "Tallest shell",
        anchor: "end",
      },
      {
        at: f.p(-30, 30),
        to: [160, 120],
        text: "Precast ribs fan out",
        anchor: "end",
      },
      { at: f.p(89.5, 3), to: [720, 384], text: "Podium" },
      { at: f.p(-80, -1.5), to: [60, 384], text: "Harbour" },
    ],
  },
  detail: {
    title: "One sphere",
    caption:
      "The solution Utzon found in 1961: every shell is a curved triangle cut from the surface of one sphere of radius 75.2 m. Because every curve is the same, the ribs could be cast in standard pieces and the tiles laid in repeating panels.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      { at: project(30, 2), to: [270, 30], text: "Shells cut from it" },
      { at: project(-80, 60), to: [270, 390], text: "One sphere" },
    ],
  },
};
