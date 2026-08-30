export type Stroke = { d: string; accent: boolean };

export type Layer = { transform: string; strokes: Stroke[]; faint?: boolean };

export type Drawing = {
  layers: Layer[];
  system: string;
  index: number;
  dayNumber: number;
};

export const CANVAS = 400;
const MARGIN = 30;
const INNER = CANVAS - MARGIN * 2;
const CX = CANVAS / 2;
const R = INNER / 2;

const SYSTEMS = ["Lattice", "Weave", "Orbit", "Contour"] as const;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dayOfYear(dayNumber: number) {
  const d = new Date(dayNumber * 86400000);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1) / 86400000;
  return dayNumber - yearStart + 1;
}

export function dayNumberFor(date: Date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
}

const n2 = (v: number) => Math.round(v * 100) / 100;

function clipSegment(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
): [number, number, number, number] | null {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const p = [-dx, dx, -dy, dy];
  const q = [x1 - rx, rx + rw - x1, y1 - ry, ry + rh - y1];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return null;
      continue;
    }
    const r = q[i] / p[i];
    if (p[i] < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }
  if (t1 - t0 < 0.001) return null;
  return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
}

const line = (x1: number, y1: number, x2: number, y2: number) =>
  `M${n2(x1)} ${n2(y1)}L${n2(x2)} ${n2(y2)}`;

function lattice(rf: () => number): Stroke[] {
  const out: Stroke[] = [];
  const cols = 4 + Math.floor(rf() * 5);
  const rows = 4 + Math.floor(rf() * 5);
  const cell = INNER / Math.max(cols, rows);
  const gw = cell * cols;
  const gh = cell * rows;
  const gx = MARGIN + rf() * (INNER - gw);
  const gy = MARGIN + rf() * (INNER - gh);
  const pad = cell * 0.13;
  const s = cell - pad * 2;
  const push = (d: string) => out.push({ d, accent: rf() < 0.14 });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = gx + c * cell + pad;
      const y = gy + r * cell + pad;
      const t = rf();
      if (t < 0.2) {
        push(line(x, y, x + s, y + s));
      } else if (t < 0.4) {
        push(line(x + s, y, x, y + s));
      } else if (t < 0.58) {
        const q = Math.floor(rf() * 4);
        const corners: [number, number, number, number][] = [
          [x, y + s, x + s, y],
          [x, y, x + s, y + s],
          [x + s, y, x, y + s],
          [x + s, y + s, x, y],
        ];
        const [ax, ay, bx, by] = corners[q];
        push(
          `M${n2(ax)} ${n2(ay)}A${n2(s)} ${n2(s)} 0 0 1 ${n2(bx)} ${n2(by)}`,
        );
      } else if (t < 0.7) {
        const k = s * 0.55;
        push(
          `M${n2(x)} ${n2(y + s)}A${n2(s)} ${n2(s)} 0 0 1 ${n2(x + s)} ${n2(y)}`,
        );
        push(
          `M${n2(x)} ${n2(y + k)}A${n2(k)} ${n2(k)} 0 0 1 ${n2(x + k)} ${n2(y + s)}`.replace(
            `${n2(y + s)}`,
            `${n2(y + s)}`,
          ),
        );
      } else if (t < 0.8) {
        push(line(x, y, x + s, y + s));
        push(line(x + s, y, x, y + s));
      } else if (t < 0.88) {
        const h = s / 2;
        push(
          `M${n2(x + h)} ${n2(y)}L${n2(x + s)} ${n2(y + h)}L${n2(x + h)} ${n2(y + s)}L${n2(x)} ${n2(y + h)}Z`,
        );
      }
    }
  }
  return out;
}

function weave(rf: () => number): Stroke[] {
  const out: Stroke[] = [];
  const base = 16 + rf() * 13;
  const freq = 0.006 + rf() * 0.012;
  const phase = rf() * Math.PI * 2;
  const span = CANVAS * 2;
  const skew = (rf() * 2 - 1) * CANVAS * 0.9;

  for (let o = -CANVAS; o < span;) {
    const seg = clipSegment(
      o,
      -CANVAS,
      o + span,
      span,
      MARGIN,
      MARGIN,
      INNER,
      INNER,
    );
    if (seg) out.push({ d: line(...seg), accent: rf() < 0.12 });
    o += Math.max(5, base * (1 + 0.7 * Math.sin(o * freq + phase)));
    if (out.length > 60) break;
  }

  const ww = INNER * (0.36 + rf() * 0.3);
  const wh = INNER * (0.36 + rf() * 0.3);
  const wx = MARGIN + rf() * (INNER - ww);
  const wy = MARGIN + rf() * (INNER - wh);
  const tight = Math.max(9, base * 0.7);

  for (let o = -CANVAS; o < span; o += tight) {
    const seg = clipSegment(o, span, o + span, -CANVAS, wx, wy, ww, wh);
    if (seg) out.push({ d: line(...seg), accent: rf() < 0.2 });
    if (out.length > 130) break;
  }

  out.push({
    d: `M${n2(wx)} ${n2(wy)}h${n2(ww)}v${n2(wh)}h${n2(-ww)}Z`,
    accent: true,
  });
  return out;
}

function orbit(rf: () => number): Stroke[] {
  const out: Stroke[] = [];
  const rings = 1 + Math.floor(rf() * 2);

  for (let ring = 0; ring < rings; ring++) {
    const rad = R * (ring === 0 ? 1 : 0.52 + rf() * 0.16);
    const n = 26 + Math.floor(rf() * 34);
    const k = 2 + Math.floor(rf() * 8);
    const rot = rf() * Math.PI * 2;
    const pt = (i: number): [number, number] => {
      const a = (i / n) * Math.PI * 2 + rot;
      return [CX + Math.cos(a) * rad, CX + Math.sin(a) * rad];
    };
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pt(i);
      const [bx, by] = pt((i * k) % n);
      if (Math.hypot(bx - ax, by - ay) < 2) continue;
      out.push({ d: line(ax, ay, bx, by), accent: rf() < 0.13 });
    }
    out.push({
      d: `M${n2(CX - rad)} ${n2(CX)}a${n2(rad)} ${n2(rad)} 0 1 0 ${n2(rad * 2)} 0a${n2(rad)} ${n2(rad)} 0 1 0 ${n2(-rad * 2)} 0`,
      accent: ring === 0,
    });
  }
  return out;
}

function contour(rf: () => number): Stroke[] {
  const out: Stroke[] = [];
  const rings = 8 + Math.floor(rf() * 7);
  const f1 = 2 + Math.floor(rf() * 4);
  const f2 = 4 + Math.floor(rf() * 6);
  const p1 = rf() * Math.PI * 2;
  const p2 = rf() * Math.PI * 2;
  const steps = 150;
  const open = rf() < 0.35;
  const sweep = open ? 0.45 + rf() * 0.4 : 1;
  const startAngle = rf() * Math.PI * 2;

  for (let r = 0; r < rings; r++) {
    const k = (r + 1) / rings;
    const base = R * (0.12 + 0.88 * k);
    const amp = R * 0.11 * (0.35 + k);
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + (i / steps) * Math.PI * 2 * sweep;
      const rad =
        base +
        amp * (Math.sin(a * f1 + p1 + k * 2) + 0.5 * Math.sin(a * f2 + p2));
      const x = CX + Math.cos(a) * rad;
      const y = CX + Math.sin(a) * rad;
      d += `${i === 0 ? "M" : "L"}${n2(x)} ${n2(y)}`;
    }
    out.push({
      d: open ? d : d + "Z",
      accent: r % Math.max(3, rings - 5) === 0,
    });
  }
  return out;
}

function generate(rf: () => number, systemIndex: number): Stroke[] {
  return systemIndex === 0
    ? lattice(rf)
    : systemIndex === 1
      ? weave(rf)
      : systemIndex === 2
        ? orbit(rf)
        : contour(rf);
}

function composition(rf: () => number, allowRotation: boolean): string {
  const scale = 0.62 + rf() * 0.7;
  const room =
    scale < 1
      ? (1 - scale) * INNER * 0.55
      : (scale - 1) * INNER * 0.4 + INNER * 0.06;
  const ox = (rf() * 2 - 1) * room;
  const oy = (rf() * 2 - 1) * room;
  const rot = allowRotation && rf() < 0.5 ? Math.round(rf() * 360) : 0;

  return [
    `translate(${n2(ox)} ${n2(oy)})`,
    rot ? `rotate(${rot} ${CX} ${CX})` : "",
    `translate(${CX} ${CX})`,
    `scale(${n2(scale)})`,
    `translate(${-CX} ${-CX})`,
  ]
    .filter(Boolean)
    .join(" ");
}

function hash32(x: number) {
  let h = x | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
}

function systemFor(dayNumber: number, variant: number) {
  const pick = (d: number) =>
    hash32(d * 2654435761 + variant * 40503 + 12345) % 4;
  const today = pick(dayNumber);
  return today === pick(dayNumber - 1)
    ? (today + 1 + (hash32(dayNumber * 31 + 7) % 3)) % 4
    : today;
}

export function buildDrawing(dayNumber: number, variant = 0): Drawing {
  const rf = mulberry32(dayNumber * 2654435761 + variant * 40503);
  const systemIndex = systemFor(dayNumber, variant);
  const system = SYSTEMS[systemIndex];

  rf();
  rf();

  const layers: Layer[] = [];

  if (rf() < 0.32) {
    const underIndex = (systemIndex + 1 + Math.floor(rf() * 3)) % 4;
    layers.push({
      transform: composition(rf, underIndex !== 3),
      strokes: generate(rf, underIndex),
      faint: true,
    });
  }

  layers.push({
    transform: composition(rf, systemIndex !== 3),
    strokes: generate(rf, systemIndex),
  });

  return { layers, system, index: dayOfYear(dayNumber), dayNumber };
}

export function formatDrawingDate(dayNumber: number) {
  const d = new Date(dayNumber * 86400000);
  return d.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const INK = "#fbf9f3";
const GOLD = "#d8b46a";

export function drawingToSvg(drawing: Drawing, size = 1600) {
  const body = drawing.layers
    .map((layer) => {
      const paths = layer.strokes
        .map((s) => {
          const stroke = s.accent ? GOLD : INK;
          const opacity = layer.faint ? 0.27 : s.accent ? 0.85 : 0.62;
          return `<path d="${s.d}" fill="none" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="1.15" stroke-linecap="round"/>`;
        })
        .join("");
      return `<g transform="${layer.transform}">${paths}</g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${size}" height="${size}"><rect width="${CANVAS}" height="${CANVAS}" fill="#0a0a0a"/>${body}</svg>`;
}

export function isoForDay(dayNumber: number) {
  return new Date(dayNumber * 86400000).toISOString().slice(0, 10);
}

export function partsForDay(dayNumber: number) {
  const d = new Date(dayNumber * 86400000);
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth() + 1,
    year: d.getUTCFullYear(),
  };
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function dayFromParts(year: number, month: number, day: number) {
  const clamped = Math.min(day, daysInMonth(year, month));
  return Math.floor(Date.UTC(year, month - 1, clamped) / 86400000);
}
