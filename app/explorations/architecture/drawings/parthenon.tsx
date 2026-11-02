import { measures } from "../sources";
import {
  DimensionLine,
  frame,
  Person,
  poly,
  ScaleBar,
  type Drawings,
} from "./kit";

const m = measures("parthenon");

const S = 16;
const f = frame(400, 440, S);

const AXES = [-14.44, -10.76, -6.46, -2.15, 2.15, 6.46, 10.76, 14.44];
const TRIGLYPHS = [
  -14.88, -12.82, -10.76, -8.61, -6.46, -4.305, -2.15, 0, 2.15, 4.305, 6.46,
  8.61, 10.76, 12.82, 14.88,
];
const BASE = 0.516 * 2 + 0.553;
const TOP = BASE + m("column");
const ECHINUS = TOP - 0.46;
const NECK = TOP - 0.86;
const HALF = m("stylobate") / 2;
const FRIEZE = TOP + 1.349;
const GEISON = FRIEZE + 1.346;
const CORNICE = GEISON + 0.595;
const APEX = CORNICE + 15.75 * Math.tan((m("slope") * Math.PI) / 180);

function column(u: number) {
  const mid = (BASE + NECK) / 2;
  const side = (s: number) =>
    `M${f.x(u + s * 0.95)},${f.y(BASE)}Q${f.x(u + s * 0.89)},${f.y(mid)} ${f.x(u + s * 0.74)},${f.y(NECK)}`;
  return (
    <g key={u}>
      <path
        className="profile mask"
        d={`${side(-1)}L${f.x(u + 0.74)},${f.y(NECK)}Q${f.x(u + 0.89)},${f.y(mid)} ${f.x(u + 0.95)},${f.y(BASE)}Z`}
      />
      <path
        className="profile mask"
        d={`M${f.x(u - 0.74)},${f.y(NECK)}Q${f.x(u - 1.03)},${f.y(NECK + 0.08)} ${f.x(u - 1.03)},${f.y(ECHINUS)}L${f.x(u + 1.03)},${f.y(ECHINUS)}Q${f.x(u + 1.03)},${f.y(NECK + 0.08)} ${f.x(u + 0.74)},${f.y(NECK)}Z`}
      />
      <path
        className="profile mask"
        d={poly(
          [
            f.p(u - 1.03, ECHINUS),
            f.p(u - 1.03, TOP),
            f.p(u + 1.03, TOP),
            f.p(u + 1.03, ECHINUS),
          ],
          true,
        )}
      />
      <g className="fine">
        <path
          d={poly([f.p(u - 0.76, NECK - 0.1), f.p(u + 0.76, NECK - 0.1)])}
        />
        {[-0.6, -0.2, 0.2, 0.6].map((k) => (
          <path
            key={k}
            d={poly([f.p(u + k * 0.95, BASE), f.p(u + k * 0.74, NECK - 0.1)])}
          />
        ))}
      </g>
    </g>
  );
}

function triglyph(u: number) {
  return (
    <g key={u}>
      <path
        className="profile"
        d={poly(
          [
            f.p(u - 0.42, FRIEZE),
            f.p(u - 0.42, GEISON),
            f.p(u + 0.42, GEISON),
            f.p(u + 0.42, FRIEZE),
          ],
          true,
        )}
      />
      <path
        className="fine"
        d={poly([f.p(u - 0.14, FRIEZE + 0.1), f.p(u - 0.14, GEISON - 0.12)])}
      />
      <path
        className="fine"
        d={poly([f.p(u + 0.14, FRIEZE + 0.1), f.p(u + 0.14, GEISON - 0.12)])}
      />
    </g>
  );
}

const main = (
  <>
    <ScaleBar x={40} y={40} scale={S} step={5} count={2} />
    <path className="cut" d={poly([f.p(-24, 0), f.p(24, 0)])} />
    <path
      className="profile"
      d={poly([
        f.p(-HALF - 1.16, 0),
        f.p(-HALF - 1.16, 0.516),
        f.p(HALF + 1.16, 0.516),
        f.p(HALF + 1.16, 0),
      ])}
    />
    <path
      className="profile"
      d={poly([
        f.p(-HALF - 0.58, 0.516),
        f.p(-HALF - 0.58, 1.032),
        f.p(HALF + 0.58, 1.032),
        f.p(HALF + 0.58, 0.516),
      ])}
    />
    <path
      className="profile"
      d={poly([
        f.p(-HALF, 1.032),
        f.p(-HALF, BASE),
        f.p(HALF, BASE),
        f.p(HALF, 1.032),
      ])}
    />
    <path
      className="tone"
      d={poly(
        [f.p(-15.3, BASE), f.p(-15.3, TOP), f.p(15.3, TOP), f.p(15.3, BASE)],
        true,
      )}
    />
    {AXES.map(column)}
    <path
      className="profile"
      d={poly(
        [
          f.p(-15.3, TOP),
          f.p(-15.3, FRIEZE),
          f.p(15.3, FRIEZE),
          f.p(15.3, TOP),
        ],
        true,
      )}
    />
    <path
      className="fine"
      d={poly([f.p(-15.3, FRIEZE - 0.18), f.p(15.3, FRIEZE - 0.18)])}
    />
    <path
      className="profile"
      d={poly([
        f.p(-15.3, FRIEZE),
        f.p(-15.3, GEISON),
        f.p(15.3, GEISON),
        f.p(15.3, FRIEZE),
      ])}
    />
    {TRIGLYPHS.map(triglyph)}
    <path
      className="profile"
      d={poly(
        [
          f.p(-15.75, GEISON),
          f.p(-15.75, CORNICE),
          f.p(15.75, CORNICE),
          f.p(15.75, GEISON),
        ],
        true,
      )}
    />
    <path
      className="profile"
      d={poly([f.p(-15.75, CORNICE), f.p(0, APEX), f.p(15.75, CORNICE)])}
    />
    <path
      className="fine"
      d={poly([f.p(-13.2, CORNICE), f.p(0, APEX - 0.62), f.p(13.2, CORNICE)])}
    />
    <Person x={f.x(-12.6)} ground={f.y(BASE)} scale={S} />
    <DimensionLine
      a={f.p(-HALF, BASE)}
      b={f.p(HALF, BASE)}
      offset={BASE * S + 16}
      value={m("stylobate")}
    />
    <DimensionLine
      a={f.p(-HALF, TOP)}
      b={f.p(-HALF, BASE)}
      offset={22}
      value={m("column")}
    />
  </>
);

const lift = (x: number) => {
  const t = (x - 40) / 320;
  return 60 * t * (1 - t);
};
const floorY = (x: number) => 320 - lift(x);
const beamY = (x: number) => 125 - lift(x);
const BAY = [70, 135, 200, 265, 330];

function leaning(x: number) {
  const corner = x === 70 || x === 330;
  const w0 = corner ? 15 : 13;
  const w1 = corner ? 11.5 : 10;
  const top = x + (200 - x) * 0.08;
  const yb = floorY(x);
  const yt = beamY(top);
  const ym = (yb + yt) / 2;
  const xm = (x + top) / 2;
  const bulge = (w0 + w1) / 2 + 2.5;
  return (
    <g key={x}>
      <path
        className="profile mask"
        d={`M${x - w0},${yb}Q${xm - bulge},${ym} ${top - w1},${yt}L${top + w1},${yt}Q${xm + bulge},${ym} ${x + w0},${yb}Z`}
      />
      <path
        className="fine dash"
        d={poly([
          [x, 320],
          [x, 112],
        ])}
      />
      <path
        className="idea"
        d={poly([
          [x, yb],
          [top, yt],
        ])}
      />
    </g>
  );
}

const detail = (
  <>
    <path
      className="fine dash"
      d={poly([
        [24, 320],
        [376, 320],
      ])}
    />
    <path
      className="fine dash"
      d={poly([
        [24, 125],
        [376, 125],
      ])}
    />
    <path className="profile" d="M40,320Q200,290 360,320L360,340L40,340Z" />
    <path
      className="fine"
      d={poly([
        [28, 340],
        [28, 352],
        [372, 352],
        [372, 340],
      ])}
    />
    {BAY.map(leaning)}
    <path
      className="profile"
      d="M40,125Q200,95 360,125L360,101Q200,71 40,101Z"
    />
    <path className="idea" d="M40,320Q200,290 360,320" />
    <path className="idea" d="M40,125Q200,95 360,125" />
  </>
);

export const parthenon: Drawings = {
  main: {
    title: "West front, as built",
    caption:
      "West front restored to its finished state, without the pediment sculpture. Eight Doric columns; the corner gaps are narrower so the triglyphs can meet at the corners.",
    viewBox: [800, 496],
    art: main,
    labels: [
      { at: [f.x(4), f.y(16.6)], to: [600, 120], text: "Pediment" },
      { at: [f.x(13.6), f.y(14.1)], to: [680, 190], text: "Frieze" },
      { at: [f.x(15.0), f.y(12.75)], to: [680, 232], text: "Architrave" },
      { at: [f.x(11.6), f.y(11.85)], to: [680, 268], text: "Capital" },
      { at: [f.x(14.44) + 15, f.y(7)], to: [680, 330], text: "Column" },
      {
        at: [f.x(-16.0), f.y(0.4)],
        to: [100, 420],
        text: "Three steps",
        anchor: "end",
      },
    ],
  },
  detail: {
    title: "The refinements, exaggerated",
    caption:
      "Dashed lines are truly level and plumb; the red lines are what was built. The real floor curve is about 11 cm over 70 m, far too small to see as a curve.",
    viewBox: [400, 400],
    art: detail,
    labels: [
      {
        at: [200, floorY(200) + 1],
        to: [200, 362],
        text: "Floor rises towards the middle",
        anchor: "middle",
      },
      {
        at: [319.6, beamY(319.6) + 4],
        to: [384, 52],
        text: "Columns lean in",
        anchor: "end",
      },
      { at: [56, 222], to: [16, 52], text: "Shafts swell slightly" },
      { at: [56, 300], to: [16, 392], text: "Corner columns thicker" },
    ],
  },
};
