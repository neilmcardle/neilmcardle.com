export type Mark = {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  strokeOpacity?: number;
};

export type Layer = { transform: string; strokes: Mark[]; faint?: boolean };

export type Drawing = {
  layers: Layer[];
  system: string;
  index: number;
  dayNumber: number;
};

export type Tweaks = {
  sharpness?: number;
  height?: number;
  peakX?: number;
  rings?: number;
  rain?: boolean;
};

export const CANVAS = 400;
const MARGIN = 0;
const INNER = CANVAS;
const LEFT = 0;
const RIGHT = CANVAS;

const CREAM = "#fbf9f3";
const GOLD = "#d8b46a";
const GOLD_BRIGHT = "#f0d091";
const GOLD_DEEP = "#b8923f";
const TAN = "#8a7f70";
const GROUND = "#0a0a0a";

const MOODS = ["Dawn", "Noon", "Dusk", "Snow", "Night"] as const;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash32(x: number) {
  let h = x | 0;
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
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
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Pt = { x: number; y: number };

const poly = (pts: Pt[], close = false) =>
  pts.map((p, i) => `${i ? "L" : "M"}${n2(p.x)} ${n2(p.y)}`).join("") +
  (close ? "Z" : "");

const line = (x1: number, y1: number, x2: number, y2: number) =>
  `M${n2(x1)} ${n2(y1)}L${n2(x2)} ${n2(y2)}`;

const rect = (x: number, y: number, w: number, h: number) =>
  `M${n2(x)} ${n2(y)}h${n2(w)}v${n2(h)}h${n2(-w)}Z`;

function hexToRgb(hex: string) {
  const v = parseInt(hex.slice(1), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function skyLuminance(sky: string | null, alpha: number) {
  const ground = hexToRgb(GROUND);
  const top = sky ? hexToRgb(sky) : ground;
  const mix = top.map((c, i) => c * alpha + ground[i] * (1 - alpha));
  return (0.2126 * mix[0] + 0.7152 * mix[1] + 0.0722 * mix[2]) / 255;
}

function contourRings(rf: () => number, tw?: Tweaks): string[] {
  const cx = CANVAS * lerp(0.3, 0.7, rf());
  const cy = CANVAS * lerp(0.3, 0.7, rf());
  const R = CANVAS * lerp(0.5, 0.85, rf());
  const ringRoll = 9 + Math.floor(rf() * 8);
  const rings = tw?.rings ?? ringRoll;
  const f1 = 2 + Math.floor(rf() * 4);
  const f2 = 4 + Math.floor(rf() * 6);
  const p1 = rf() * Math.PI * 2;
  const p2 = rf() * Math.PI * 2;
  const steps = 130;
  const out: string[] = [];

  for (let r = 0; r < rings; r++) {
    const k = (r + 1) / rings;
    const base = R * (0.1 + 0.9 * k);
    const amp = R * 0.1 * (0.35 + k);
    let d = "";
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const rad =
        base +
        amp * (Math.sin(a * f1 + p1 + k * 2) + 0.5 * Math.sin(a * f2 + p2));
      const x = cx + Math.cos(a) * rad;
      const y = cy + Math.sin(a) * rad;
      d += `${i === 0 ? "M" : "L"}${n2(x)} ${n2(y)}`;
    }
    out.push(d + "Z");
  }
  return out;
}

const disc = (cx: number, cy: number, r: number) =>
  `M${n2(cx - r)} ${n2(cy)}a${n2(r)} ${n2(r)} 0 1 0 ${n2(r * 2)} 0a${n2(r)} ${n2(r)} 0 1 0 ${n2(-r * 2)} 0`;

type Palette = {
  sky: string | null;
  skyOpacity: number;
  peak: string;
  rock: string;
  hills: string;
  water: string;
  waterOpacity: number;
  disc: string | null;
};

function paletteFor(mood: string, rf: () => number): Palette {
  switch (mood) {
    case "Dawn":
      return {
        sky: GOLD,
        skyOpacity: lerp(0.72, 0.92, rf()),
        peak: "#ece4d3",
        rock: GOLD_DEEP,
        hills: TAN,
        water: GROUND,
        waterOpacity: 0.2,
        disc: GOLD_BRIGHT,
      };
    case "Noon":
      return {
        sky: CREAM,
        skyOpacity: lerp(0.12, 0.2, rf()),
        peak: "#e2dccf",
        rock: TAN,
        hills: TAN,
        water: GROUND,
        waterOpacity: 0.16,
        disc: rf() < 0.4 ? GOLD_BRIGHT : null,
      };
    case "Dusk":
      return {
        sky: GOLD_DEEP,
        skyOpacity: lerp(0.55, 0.8, rf()),
        peak: TAN,
        rock: GROUND,
        hills: GOLD_DEEP,
        water: GROUND,
        waterOpacity: 0.24,
        disc: GOLD_BRIGHT,
      };
    case "Snow":
      return {
        sky: CREAM,
        skyOpacity: lerp(0.06, 0.12, rf()),
        peak: "#efeade",
        rock: TAN,
        hills: TAN,
        water: GROUND,
        waterOpacity: 0.12,
        disc: null,
      };
    default:
      return {
        sky: null,
        skyOpacity: 0,
        peak: TAN,
        rock: GROUND,
        hills: TAN,
        water: GROUND,
        waterOpacity: 0.1,
        disc: CREAM,
      };
  }
}

type Template = {
  name: string;
  horizon: number;
  peakX: number;
  half: number;
  oversized: number;
  riverStart: number;
  vanish: number;
  discX: number;
  discY: number;
};

const TEMPLATES: Template[] = [
  {
    name: "Thirds",
    horizon: 0.667,
    peakX: 0.333,
    half: 0.6,
    oversized: 0.15,
    riverStart: 0.72,
    vanish: 0.36,
    discX: 0.72,
    discY: 0.22,
  },
  {
    name: "Golden",
    horizon: 0.618,
    peakX: 0.382,
    half: 0.66,
    oversized: 0.2,
    riverStart: 0.28,
    vanish: 0.4,
    discX: 0.68,
    discY: 0.28,
  },
  {
    name: "Diagonal",
    horizon: 0.7,
    peakX: 0.14,
    half: 1.25,
    oversized: 0.8,
    riverStart: 0.85,
    vanish: 0.3,
    discX: 0.7,
    discY: 0.2,
  },
  {
    name: "C-curve",
    horizon: 0.6,
    peakX: 0.52,
    half: 0.6,
    oversized: 0.1,
    riverStart: 0.08,
    vanish: 0.5,
    discX: 0.24,
    discY: 0.2,
  },
  {
    name: "S-curve",
    horizon: 0.64,
    peakX: 0.6,
    half: 0.58,
    oversized: 0.12,
    riverStart: 0.34,
    vanish: 0.56,
    discX: 0.26,
    discY: 0.24,
  },
  {
    name: "L-shape",
    horizon: 0.72,
    peakX: 0.2,
    half: 1.1,
    oversized: 0.7,
    riverStart: 0.8,
    vanish: 0.26,
    discX: 0.76,
    discY: 0.18,
  },
  {
    name: "Centred",
    horizon: 0.62,
    peakX: 0.5,
    half: 0.72,
    oversized: 0.25,
    riverStart: 0.5,
    vanish: 0.5,
    discX: 0.5,
    discY: 0.18,
  },
];

const guide = (free: number, target: number, bias: number) =>
  free + (target - free) * bias;

function mountainShape(
  rf: () => number,
  horizon: number,
  tpl: Template,
  bias: number,
  tw?: Tweaks,
) {
  const oversized = rf() < guide(0.3, tpl.oversized, bias);
  const freePeak = oversized ? lerp(-0.35, 1.35, rf()) : lerp(0.16, 0.84, rf());
  const guided = guide(freePeak, tpl.peakX, bias);
  const offset = guided - 0.5;
  const deadZone = 0.14;
  const peakFraction =
    Math.abs(offset) < deadZone
      ? 0.5 + (offset >= 0 ? 1 : -1) * lerp(deadZone, deadZone * 2.4, rf())
      : guided;
  const peakX = CANVAS * (tw?.peakX ?? peakFraction);
  const freeHalf = oversized ? lerp(1.05, 2.05, rf()) : lerp(0.22, 0.46, rf());
  const halfAnchor = oversized ? tpl.half : Math.min(0.45, tpl.half * 0.55);
  const half = INNER * guide(freeHalf, halfAnchor, bias);
  const heightRoll = lerp(0.6, 0.95, rf());
  const wanted = half * heightRoll;
  const natural = oversized
    ? Math.min(wanted, horizon - INNER * lerp(0.04, 0.16, rf()))
    : wanted;
  const height =
    tw?.height !== undefined ? (horizon - INNER * 0.05) * tw.height : natural;
  const peakY = horizon - height;
  const k = lerp(2.8, 3.8, rf());

  const sharpRoll = lerp(1.25, 1.6, rf());
  const m = tw?.sharpness ?? sharpRoll;
  const floor = Math.exp(-k);
  const shoulderU = (rf() < 0.5 ? -1 : 1) * lerp(0.4, 0.62, rf());
  const shoulderAmp = lerp(0.03, 0.1, rf());
  const wobbleF = 5 + rf() * 7;
  const wobbleP = rf() * Math.PI * 2;

  const shape = (u: number) => {
    const core =
      (Math.exp(-k * Math.pow(Math.abs(u), m)) - floor) / (1 - floor);
    const bump = shoulderAmp * Math.exp(-Math.pow((u - shoulderU) / 0.18, 2));

    const nick = 0.006 * Math.sin(u * wobbleF + wobbleP);
    return Math.max(0, core + bump + nick);
  };

  const topY = (x: number) => {
    const u = (x - peakX) / half;
    if (Math.abs(u) >= 1) return horizon;
    return horizon - height * shape(u);
  };

  const outline: Pt[] = [];
  for (let i = 0; i <= 140; i++) {
    const u = -1 + (i / 140) * 2;
    outline.push({ x: peakX + u * half, y: horizon - height * shape(u) });
  }

  return { peakX, peakY, half, height, topY, outline, horizon };
}

type Mountain = ReturnType<typeof mountainShape>;

function conifer(x: number, baseY: number, h: number, w: number) {
  const tier = (t: number) => baseY - h * t;
  return (
    `M${n2(x)} ${n2(tier(1))}` +
    `L${n2(x + w * 0.55)} ${n2(tier(0.62))}` +
    `L${n2(x + w * 0.34)} ${n2(tier(0.6))}` +
    `L${n2(x + w)} ${n2(tier(0.18))}` +
    `L${n2(x + w * 0.16)} ${n2(tier(0.14))}` +
    `L${n2(x + w * 0.16)} ${n2(baseY)}` +
    `L${n2(x - w * 0.16)} ${n2(baseY)}` +
    `L${n2(x - w * 0.16)} ${n2(tier(0.14))}` +
    `L${n2(x - w)} ${n2(tier(0.18))}` +
    `L${n2(x - w * 0.34)} ${n2(tier(0.6))}` +
    `L${n2(x - w * 0.55)} ${n2(tier(0.62))}` +
    `Z`
  );
}

function scene(rf: () => number, mood: string, tw?: Tweaks) {
  const back: Mark[] = [];
  const front: Mark[] = [];

  const p = {
    sky: (d: string, fill: string, opacity: number) =>
      back.push({ d, fill, opacity }),
    block: (d: string, fill: string, opacity = 1) =>
      front.push({ d, fill, opacity }),

    edged: (d: string, fill: string, opacity = 1, edge = 0.75) =>
      front.push({
        d,
        fill,
        opacity,
        stroke: GOLD,
        strokeWidth: 2,
        strokeOpacity: edge,
      }),
    ink: (d: string, stroke: string, opacity = 0.55) =>
      front.push({ d, stroke, opacity }),
  };

  const pal = paletteFor(mood, rf);
  const tpl = TEMPLATES[Math.floor(rf() * TEMPLATES.length)];

  const bias = lerp(0.4, 0.82, rf());

  const horizon = CANVAS * guide(lerp(0.56, 0.82, rf()), tpl.horizon, bias);
  const m = mountainShape(rf, horizon, tpl, bias, tw);

  if (pal.sky)
    p.sky(rect(0, 0, CANVAS, horizon), pal.sky, pal.skyOpacity * 0.62);

  const skyLight = skyLuminance(pal.sky, pal.sky ? pal.skyOpacity * 0.62 : 0);
  const contourTone = skyLight > 0.28 ? GROUND : CREAM;
  const contourStrength =
    skyLight > 0.28 ? lerp(0.16, 0.3, rf()) : lerp(0.12, 0.24, rf());
  contourRings(rf, tw).forEach((d, i) => {
    back.push({
      d,
      stroke: contourTone,
      strokeWidth: 0.9,
      strokeOpacity: contourStrength * (i % 3 === 0 ? 1.6 : 1),
    });
  });

  if (pal.disc) {
    const r = INNER * lerp(0.05, 0.11, rf());
    const cx = CANVAS * guide(lerp(0.1, 0.9, rf()), tpl.discX, bias);
    const cy = CANVAS * guide(lerp(0.06, 0.34, rf()), tpl.discY, bias);
    back.push({ d: disc(cx, cy, r), fill: pal.disc, opacity: 0.95 });
  }

  if (rf() < 0.6) {
    const ry = horizon - INNER * lerp(0.02, 0.1, rf());
    const pts: Pt[] = [];
    const f = 2 + rf() * 4;
    const ph = rf() * Math.PI * 2;
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push({
        x: t * CANVAS,
        y: ry - INNER * 0.035 * Math.abs(Math.sin(t * Math.PI * f + ph)),
      });
    }
    pts.push({ x: CANVAS, y: horizon }, { x: 0, y: horizon });
    back.push({ d: poly(pts, true), fill: pal.hills, opacity: 0.34 });
  }

  const body = [
    ...m.outline,
    { x: m.peakX + m.half, y: horizon },
    { x: m.peakX - m.half, y: horizon },
  ];
  p.edged(poly(body, true), pal.peak, mood === "Night" ? 0.92 : 1, 0.6);

  const bankAmp = INNER * lerp(0.006, 0.022, rf());
  const bf = 1 + rf() * 3;
  const bph = rf() * Math.PI * 2;
  const bankAt = (t: number) =>
    horizon - bankAmp * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * bf + bph));

  const bankPts: Pt[] = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    bankPts.push({ x: t * CANVAS, y: bankAt(t) });
  }
  p.block(
    poly([...bankPts, { x: CANVAS, y: CANVAS }, { x: 0, y: CANVAS }], true),
    pal.hills,
    1,
  );

  if (rf() < 0.85) {
    let tx = rf() * INNER * 0.1;
    while (tx < CANVAS) {
      if (rf() > 0.25) {
        const h = INNER * lerp(0.024, 0.06, rf());
        p.block(
          conifer(tx, bankAt(tx / CANVAS) + 1, h, h * lerp(0.24, 0.36, rf())),
          pal.rock,
          0.95,
        );
      }
      tx += INNER * lerp(0.014, 0.04, rf());
    }
  }

  const vx =
    CANVAS *
    guide(
      (m.peakX + (rf() - 0.5) * INNER * 0.22) / CANVAS,
      tpl.vanish,
      bias * 0.7,
    );
  const vy = horizon + INNER * lerp(0.005, 0.03, rf());
  const mouth = guide(lerp(0.15, 0.85, rf()), tpl.riverStart, bias) * CANVAS;
  const mouthHalf = INNER * lerp(0.22, 0.44, rf());
  const narrow = INNER * lerp(0.012, 0.04, rf());
  const wob = INNER * lerp(0.05, 0.11, rf());
  const rf1 = 1.1 + rf() * 1.4;
  const rf2 = 2.4 + rf() * 2.2;
  const rp1 = rf() * Math.PI * 2;
  const rp2 = rf() * Math.PI * 2;

  const riverAt = (t: number) => {
    const e = Math.pow(t, 1.3);
    const meander =
      wob *
      (Math.sin(t * Math.PI * rf1 + rp1) +
        0.45 * Math.sin(t * Math.PI * rf2 + rp2)) *
      (1 - t * 0.55);
    return {
      cx: lerp(mouth, vx, e) + meander,
      half: lerp(mouthHalf, narrow, Math.pow(t, 1.15)),
      y: lerp(CANVAS, vy, e),
    };
  };

  const bankLeft: Pt[] = [];
  const bankRight: Pt[] = [];
  for (let i = 0; i <= 56; i++) {
    const t = i / 56;
    const r = riverAt(t);
    bankLeft.push({ x: r.cx - r.half, y: r.y });
    bankRight.push({ x: r.cx + r.half, y: r.y });
  }

  p.block(
    poly([...bankLeft, ...bankRight.slice().reverse()], true),
    pal.water,
    1,
  );

  if (rf() < 0.5) {
    const barStart = lerp(0.15, 0.55, rf());
    const barEnd = barStart + lerp(0.2, 0.45, rf());
    const barA: Pt[] = [];
    const barB: Pt[] = [];
    const barW = lerp(0.18, 0.42, rf());
    for (let i = 0; i <= 34; i++) {
      const t = lerp(barStart, Math.min(0.96, barEnd), i / 34);
      const r = riverAt(t);
      const k = (i / 34) * Math.PI;
      const spread = r.half * barW * Math.sin(k);
      const off = r.half * lerp(-0.3, 0.3, rf() * 0 + 0.5);
      barA.push({ x: r.cx + off - spread, y: r.y });
      barB.push({ x: r.cx + off + spread, y: r.y });
    }
    p.block(poly([...barA, ...barB.slice().reverse()], true), pal.hills, 1);
  }

  if (rf() < 0.55) {
    const flock = 1 + Math.floor(Math.pow(rf(), 1.7) * 16);
    const bx = lerp(INNER * 0.06, INNER * 0.78, rf());
    const by = lerp(INNER * 0.06, horizon * 0.55, rf());
    const drift = INNER * lerp(0.02, 0.06, rf());
    const scatter = INNER * lerp(0.03, 0.12, rf());
    for (let i = 0; i < flock; i++) {
      const x = bx + i * drift + (rf() - 0.5) * scatter;
      const yy = by + (rf() - 0.5) * scatter - i * INNER * 0.004;
      const w = INNER * lerp(0.008, 0.018, rf());
      p.ink(
        `M${n2(x - w)} ${n2(yy)}L${n2(x)} ${n2(yy - w * 0.55)}L${n2(x + w)} ${n2(yy)}`,
        mood === "Night" ? CREAM : GROUND,
        lerp(0.45, 0.75, rf()),
      );
    }
  }

  const rainRoll = rf() < 0.26;
  if (tw?.rain ?? rainRoll) {
    const drops = 40 + Math.floor(rf() * 90);
    const lean = lerp(0.12, 0.34, rf()) * (rf() < 0.5 ? -1 : 1);
    const tone = mood === "Snow" || mood === "Night" ? CREAM : pal.peak;
    for (let i = 0; i < drops; i++) {
      const x = -INNER * 0.15 + rf() * CANVAS * 1.3;
      const y = rf() * CANVAS;
      const len = INNER * lerp(0.03, 0.1, rf());
      p.ink(line(x, y, x + len * lean, y + len), tone, lerp(0.16, 0.4, rf()));
    }
  }

  return { back, front };
}

function moodFor(dayNumber: number, variant: number) {
  const pick = (d: number) =>
    hash32(d * 2654435761 + variant * 40503 + 12345) % MOODS.length;
  const today = pick(dayNumber);
  return today === pick(dayNumber - 1)
    ? (today + 1 + (hash32(dayNumber * 31 + 7) % (MOODS.length - 1))) %
        MOODS.length
    : today;
}

export function buildDrawing(
  dayNumber: number,
  variant = 0,
  tw?: Tweaks,
): Drawing {
  const rf = mulberry32(hash32(dayNumber * 2654435761 + variant * 40503));
  const mood = MOODS[moodFor(dayNumber, variant)];
  rf();
  rf();

  const { back, front } = scene(rf, mood, tw);

  return {
    layers: [
      { transform: "translate(0 0)", strokes: back },
      { transform: "translate(0 0)", strokes: front },
    ],
    system: mood,
    index: dayOfYear(dayNumber),
    dayNumber,
  };
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

export function partsForDay(dayNumber: number) {
  const d = new Date(dayNumber * 86400000);
  return {
    day: d.getUTCDate(),
    month: d.getUTCMonth() + 1,
    year: d.getUTCFullYear(),
  };
}

export function daysInYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
}

export function dayFromYearIndex(year: number, index: number) {
  const clamped = Math.min(Math.max(1, index), daysInYear(year));
  return Math.floor(Date.UTC(year, 0, 1) / 86400000) + clamped - 1;
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function dayFromParts(year: number, month: number, day: number) {
  const clamped = Math.min(day, daysInMonth(year, month));
  return Math.floor(Date.UTC(year, month - 1, clamped) / 86400000);
}

export function isoForDay(dayNumber: number) {
  return new Date(dayNumber * 86400000).toISOString().slice(0, 10);
}

export function drawingToSvg(drawing: Drawing, size = 1600) {
  const body = drawing.layers
    .map((layer) => {
      const paths = layer.strokes
        .map(
          (s) =>
            `<path d="${s.d}" fill="${s.fill ?? "none"}" fill-opacity="${s.opacity ?? 1}" stroke="${s.stroke ?? "none"}" stroke-width="${s.stroke ? (s.strokeWidth ?? 1.4) : 0}" stroke-opacity="${s.strokeOpacity ?? s.opacity ?? 1}" stroke-linecap="round" stroke-linejoin="round"/>`,
        )
        .join("");
      return `<g transform="${layer.transform}">${paths}</g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${size}" height="${size}"><rect width="${CANVAS}" height="${CANVAS}" fill="${GROUND}"/>${body}</svg>`;
}
