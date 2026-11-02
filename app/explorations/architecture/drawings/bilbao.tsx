import { measures } from "../sources";
import {
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
  type Point,
} from "./kit";

const ms = measures("bilbao");
const FISH = ms("fish");
const HEIGHT = ms("height");
const QUAY = 2;

const S = 3.2;
const f = frame(232, 310, S);

type Petal = { pts: [number, number][]; key: string };

const PETALS: Petal[] = [
  {
    key: "a",
    pts: [
      [-42, QUAY],
      [-44, 14],
      [-36, 30],
      [-24, 38],
      [-18, 26],
      [-20, QUAY],
    ],
  },
  {
    key: "b",
    pts: [
      [-26, QUAY],
      [-30, 22],
      [-20, HEIGHT - 4],
      [-8, HEIGHT],
      [-2, 40],
      [0, QUAY],
    ],
  },
  {
    key: "c",
    pts: [
      [-6, QUAY],
      [-10, 26],
      [2, 42],
      [14, 36],
      [16, 22],
      [18, QUAY],
    ],
  },
  {
    key: "d",
    pts: [
      [10, QUAY],
      [8, 18],
      [20, 28],
      [34, 24],
      [38, 14],
      [40, QUAY],
    ],
  },
];

function smooth(pts: [number, number][]) {
  const p = pts.map(([u, v]) => f.p(u, v));
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) {
    const mid: Point = [
      (p[i][0] + p[i + 1][0]) / 2,
      (p[i][1] + p[i + 1][1]) / 2,
    ];
    d += `Q${p[i][0]},${p[i][1]} ${mid[0]},${mid[1]}`;
  }
  d += `L${p[p.length - 1][0]},${p[p.length - 1][1]}`;
  return d;
}

function panelLines(pts: [number, number][], count = 6) {
  const out: string[] = [];
  for (let k = 1; k < count; k++) {
    const t = k / count;
    const inner = pts.map(([u, v], i) => {
      const cu = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cv = QUAY;
      const scale = i === 0 || i === pts.length - 1 ? 1 : 1 - t * 0.9;
      return [
        cu + (u - cu) * (i === 0 || i === pts.length - 1 ? 1 - t * 0.6 : scale),
        cv + (v - cv) * scale,
      ] as [number, number];
    });
    out.push(smooth(inner));
  }
  return out;
}

const FISH_START = 40;
const FISH_PTS: [number, number][] = [
  [FISH_START, QUAY],
  [FISH_START + 2, 22],
  [FISH_START + 40, 24],
  [FISH_START + 80, 18],
  [FISH_START + FISH, 20],
  [FISH_START + FISH, QUAY],
];

const main = (
  <>
    <ScaleBar x={40} y={36} scale={S} step={20} count={2} />
    <g className="fine">
      {[0, -1.2, -2.4].map((v) => (
        <path key={v} d={poly([f.p(-56, v), f.p(FISH_START + FISH + 6, v)])} />
      ))}
    </g>
    <path className="profile mask" d={`${smooth(FISH_PTS)}Z`} />
    <g className="fine">
      {[6, 10, 14, 18].map((v) => (
        <path
          key={v}
          d={poly([f.p(FISH_START + 2, v), f.p(FISH_START + FISH, v * 0.9)])}
        />
      ))}
      {Array.from({ length: 12 }, (_, i) => FISH_START + 8 + i * 10).map(
        (u) => (
          <path
            key={u}
            d={poly([f.p(u, QUAY), f.p(u + 1, 18 + Math.sin(u / 12) * 3)])}
          />
        ),
      )}
    </g>
    <path
      className="profile mask"
      d={poly(
        [
          f.p(FISH_START + 64, 24),
          f.p(FISH_START + 104, 24),
          f.p(FISH_START + 104, 27),
          f.p(FISH_START + 64, 27),
        ],
        true,
      )}
    />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(FISH_START + 116, QUAY),
          f.p(FISH_START + 116, 38),
          f.p(FISH_START + 124, 40),
          f.p(FISH_START + 126, QUAY),
        ],
        true,
      )}
    />
    {PETALS.map((p) => (
      <g key={p.key}>
        <path className="profile mask" d={`${smooth(p.pts)}Z`} />
        <g className="fine">
          {panelLines(p.pts).map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>
    ))}
    <path className="idea" d={smooth(PETALS[1].pts)} />
    <path
      className="profile mask"
      d={poly(
        [
          f.p(-50, 0),
          f.p(-50, QUAY),
          f.p(FISH_START + FISH + 4, QUAY),
          f.p(FISH_START + FISH + 4, 0),
        ],
        true,
      )}
    />
    <Person x={f.x(-48)} ground={f.y(QUAY)} scale={S} />
    <DimensionLine
      a={f.p(FISH_START, QUAY)}
      b={f.p(FISH_START + FISH, QUAY)}
      offset={30}
      value={FISH}
    />
    <DimensionLine
      a={f.p(-8, HEIGHT)}
      b={f.p(-8, QUAY)}
      offset={(48 - 8) * S + 20}
      value={HEIGHT}
    />
  </>
);

const W = 300;
const H = 150;
const X0 = 50;
const Y0 = 50;

function surface(u: number, v: number): Point {
  const x = X0 + u * W + Math.sin(v * Math.PI) * 26 * (1 - u);
  const y = Y0 + v * H + Math.sin(u * Math.PI * 1.2) * 34 - u * v * 30;
  return [x, y];
}

const GRID_U = 6;
const GRID_V = 4;
const PANEL: [number, number] = [3, 1];

const detail = (
  <>
    <g className="fine">
      {Array.from({ length: GRID_U + 1 }, (_, i) => (
        <path
          key={`u${i}`}
          d={poly(
            Array.from({ length: 21 }, (_, k) => surface(i / GRID_U, k / 20)),
          )}
        />
      ))}
      {Array.from({ length: GRID_V + 1 }, (_, j) => (
        <path
          key={`v${j}`}
          d={poly(
            Array.from({ length: 31 }, (_, k) => surface(k / 30, j / GRID_V)),
          )}
        />
      ))}
    </g>
    <path
      className="idea"
      d={poly(
        [
          ...Array.from({ length: 6 }, (_, k) =>
            surface((PANEL[0] + k / 5) / GRID_U, PANEL[1] / GRID_V),
          ),
          ...Array.from({ length: 6 }, (_, k) =>
            surface((PANEL[0] + 1) / GRID_U, (PANEL[1] + k / 5) / GRID_V),
          ),
          ...Array.from({ length: 6 }, (_, k) =>
            surface((PANEL[0] + 1 - k / 5) / GRID_U, (PANEL[1] + 1) / GRID_V),
          ),
          ...Array.from({ length: 6 }, (_, k) =>
            surface(PANEL[0] / GRID_U, (PANEL[1] + 1 - k / 5) / GRID_V),
          ),
        ],
        true,
      )}
    />
    <path
      className="idea mask"
      d={poly(
        [
          [180, 290],
          [262, 284],
          [266, 328],
          [178, 336],
        ],
        true,
      )}
    />
    <path
      className="fine dash"
      d={poly([
        surface((PANEL[0] + 0.5) / GRID_U, (PANEL[1] + 1) / GRID_V),
        [220, 284],
      ])}
    />
  </>
);

export const bilbao: Drawings = {
  main: {
    title: "North front, along the river",
    caption:
      "The museum from across the river, with the long gallery running east under the bridge. One curved volume is outlined in red. The 130 m gallery is from published figures; the height and the curves are drawn from photographs, since no measured elevation was found.",
    viewBox: [800, 400],
    art: main,
    labels: [
      { at: f.p(-8, HEIGHT - 2), to: [330, 100], text: "Titanium over steel" },
      { at: f.p(FISH_START + 50, 16), to: [560, 120], text: "Long gallery" },
      { at: f.p(FISH_START + 84, 27), to: [640, 180], text: "Bridge" },
      { at: f.p(-30, 0), to: [120, 380], text: "River", anchor: "end" },
    ],
  },
  detail: {
    title: "From model to panel",
    caption:
      "A patch of curved skin as modelled in CATIA, software first written for aircraft. The computer described every curve exactly, so each titanium panel, in red, could be unfolded into a flat shape and cut to fit before it reached the site.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: surface(0.1, 0.5),
        to: [24, 30],
        text: "Curved surface in the model",
      },
      {
        at: surface((PANEL[0] + 0.8) / GRID_U, (PANEL[1] + 0.5) / GRID_V),
        to: [236, 30],
        text: "One panel",
      },
      { at: [220, 330], to: [280, 370], text: "Cut flat to fit" },
    ],
  },
};
