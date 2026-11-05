import {
  bayerAt,
  caster,
  clamp,
  COS,
  GRASS,
  hash,
  KIND_GRASS,
  lerp,
  noise,
  normalOf,
  PX,
  PY,
  rampId,
  rgb,
  setKind,
  SIN,
  sphere,
  capsule,
  step,
  surf,
  TOP,
  type RGB,
} from "./engine";

export type V3 = readonly [number, number, number];
export type Level = (u: number, v: number) => number;
export type Glow = (u: number, v: number) => number;

const VIEW: V3 = [COS / Math.SQRT2, COS / Math.SQRT2, SIN];

export function facing(n: V3) {
  const d = n[0] * VIEW[0] + n[1] * VIEW[1] + n[2] * VIEW[2];
  return d < 0 ? ([-n[0], -n[1], -n[2]] as V3) : n;
}

export function quad(
  o: V3,
  U: V3,
  V: V3,
  c: RGB,
  part: number,
  level?: Level,
  glow?: Glow,
  normal?: number,
) {
  const ramp = rampId(c);
  const lu = Math.hypot(U[0], U[1], U[2]),
    lv = Math.hypot(V[0], V[1], V[2]);
  let n = normal;
  if (n === undefined) {
    const cr = facing([
      U[1] * V[2] - U[2] * V[1],
      U[2] * V[0] - U[0] * V[2],
      U[0] * V[1] - U[1] * V[0],
    ]);
    n = normalOf(cr[0], cr[1], cr[2]);
  }
  const st = step();
  const du = lu > 0 ? st / lu : 1,
    dv = lv > 0 ? st / lv : 1;
  for (let a = 0; a <= 1 + 1e-6; a += du)
    for (let b = 0; b <= 1 + 1e-6; b += dv) {
      const u = a * lu,
        v = b * lv;
      const g = glow ? glow(u, v) : 0;
      surf(
        o[0] + U[0] * a + V[0] * b,
        o[1] + U[1] * a + V[1] * b,
        o[2] + U[2] * a + V[2] * b,
        ramp,
        level ? level(u, v) : 0,
        n,
        part,
        g,
      );
    }
}

export type BoxOptions = {
  top?: Level;
  sideY?: Level;
  sideX?: Level;
  glowY?: Glow;
  glowX?: Glow;
  topColor?: RGB;
  seed?: number;
};

export function grainOf(seed = 0): Level {
  return (u, v) => (noise(u * 0.8 + seed, v * 9) - 0.5) * 1.3;
}

export function box(
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  c: RGB,
  part: number,
  o: BoxOptions = {},
) {
  const g = grainOf(o.seed ?? 0);
  quad(
    [x0, y0, z1],
    [x1 - x0, 0, 0],
    [0, y1 - y0, 0],
    o.topColor ?? c,
    part,
    o.top ?? g,
    undefined,
    TOP,
  );
  quad(
    [x0, y1, z0],
    [x1 - x0, 0, 0],
    [0, 0, z1 - z0],
    c,
    part,
    o.sideY ?? g,
    o.glowY,
    PY,
  );
  quad(
    [x1, y0, z0],
    [0, y1 - y0, 0],
    [0, 0, z1 - z0],
    c,
    part,
    o.sideX ?? g,
    o.glowX,
    PX,
  );
}

export function shadowBox(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  z0: number,
  z1: number,
  r = 0.55,
) {
  const nx = Math.max(1, Math.ceil((x1 - x0) / 0.5)),
    ny = Math.max(1, Math.ceil((y1 - y0) / 0.5));
  for (let i = 0; i <= nx; i++)
    for (let j = 0; j <= ny; j++)
      for (let z = z0 + 0.3; z <= z1 + 0.01; z += 0.6)
        caster(lerp(x0, x1, i / nx), lerp(y0, y1, j / ny), Math.min(z, z1), r);
}

export function solid(
  x0: number,
  y0: number,
  z0: number,
  x1: number,
  y1: number,
  z1: number,
  c: RGB,
  part: number,
  o: BoxOptions = {},
) {
  box(x0, y0, z0, x1, y1, z1, c, part, o);
  shadowBox(x0 + 0.25, y0 + 0.25, x1 - 0.25, y1 - 0.25, z0, z1);
}

export function orientedBox(
  cx: number,
  cy: number,
  hl: number,
  hw: number,
  z0: number,
  z1: number,
  angle: number,
  c: RGB,
  part: number,
  o: { taper?: number; level?: Level; topLevel?: Level; shadow?: boolean } = {},
) {
  const ca = Math.cos(angle),
    sa = Math.sin(angle),
    taper = o.taper ?? 0,
    h = z1 - z0;
  const lv =
    o.level ?? ((u, v) => (noise(u * 2.2 + cx * 3, v * 1.6 + cy) - 0.5) * 1.5);
  const corner = (l: number, w: number, z: number): V3 => {
    const k = 1 - taper * ((z - z0) / h);
    return [cx + (ca * l - sa * w) * k, cy + (sa * l + ca * w) * k, z];
  };
  const sides: [number, number, number, number][] = [
    [-hl, hw, hl, hw],
    [hl, hw, hl, -hw],
    [hl, -hw, -hl, -hw],
    [-hl, -hw, -hl, hw],
  ];
  for (const [l0, w0, l1, w1] of sides) {
    const nl = (l0 + l1) / 2,
      nw = (w0 + w1) / 2;
    const nx = ca * nl - sa * nw,
      ny = sa * nl + ca * nw;
    if (nx * VIEW[0] + ny * VIEW[1] < -0.02) continue;
    const n = normalOf(nx, ny, taper * 0.5);
    const st = step();
    const len = Math.hypot(l1 - l0, w1 - w0) * 2;
    for (let z = z0; z <= z1; z += st) {
      const a = corner(l0, w0, z),
        b = corner(l1, w1, z);
      const span = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let t = 0; t <= 1; t += st / Math.max(span, 0.01)) {
        surf(
          lerp(a[0], b[0], t),
          lerp(a[1], b[1], t),
          z,
          rampId(c),
          lv(t * len + l0 * 3, z),
          n,
          part,
        );
      }
    }
  }
  const tl = o.topLevel ?? lv;
  const k = 1 - taper;
  const st = step();
  for (let l = -hl * k; l <= hl * k; l += st)
    for (let w = -hw * k; w <= hw * k; w += st) {
      surf(
        cx + ca * l - sa * w,
        cy + sa * l + ca * w,
        z1,
        rampId(c),
        tl(l + 7, w * 3) + 0.3,
        TOP,
        part,
      );
    }
  if (o.shadow !== false) {
    const r = Math.max(hw, 0.2),
      n = Math.max(1, Math.round(hl / r));
    for (let z = z0 + 0.2; z <= z1 + 0.01; z += 0.35)
      for (let k = -n; k <= n; k++)
        caster(
          cx + ((ca * hl * k) / n) * 0.8,
          cy + ((sa * hl * k) / n) * 0.8,
          Math.min(z, z1),
          r,
        );
  }
}

const VIS_CENTER = Math.PI / 4;
export function cylinder(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  z0: number,
  z1: number,
  c: RGB,
  part: number,
  o: {
    level?: (angle: number, t: number) => number;
    top?: boolean;
    shadow?: boolean;
    glow?: (angle: number, t: number) => number;
  } = {},
) {
  const ramp = rampId(c),
    st = step(),
    h = z1 - z0;
  for (let z = z0; z <= z1; z += st) {
    const t = (z - z0) / h,
      r = lerp(r0, r1, t),
      da = st / Math.max(r, 0.05);
    for (let a = VIS_CENTER - 1.85; a <= VIS_CENTER + 1.85; a += da) {
      const nx = Math.cos(a),
        ny = Math.sin(a);
      surf(
        cx + nx * r,
        cy + ny * r,
        z,
        ramp,
        o.level ? o.level(a, t) : 0,
        normalOf(nx, ny, (r0 - r1) / h),
        part,
        o.glow ? o.glow(a, t) : 0,
      );
    }
  }
  if (o.top !== false) {
    for (let x = -r1; x <= r1; x += st)
      for (let y = -r1; y <= r1; y += st)
        if (x * x + y * y <= r1 * r1)
          surf(cx + x, cy + y, z1, ramp, 0.2, TOP, part);
  }
  if (o.shadow !== false)
    for (let z = z0 + 0.25; z <= z1; z += 0.5)
      caster(cx, cy, z, Math.max(r0, r1) * 0.9);
}

export function cone(
  cx: number,
  cy: number,
  r: number,
  z0: number,
  h: number,
  c: RGB,
  part: number,
  level?: (angle: number, t: number) => number,
) {
  const ramp = rampId(c),
    st = step(),
    slant = Math.hypot(r, h);
  for (let t = 0; t <= 1; t += st / slant) {
    const rr = r * (1 - t),
      da = st / Math.max(rr, 0.03);
    for (let a = VIS_CENTER - 1.85; a <= VIS_CENTER + 1.85; a += da) {
      const nx = Math.cos(a),
        ny = Math.sin(a);
      surf(
        cx + nx * rr,
        cy + ny * rr,
        z0 + h * t,
        ramp,
        level ? level(a, t) : 0,
        normalOf(nx * h, ny * h, r),
        part,
      );
    }
  }
  for (let z = z0 + 0.2; z <= z0 + h; z += 0.5)
    caster(cx, cy, z, r * (1 - (z - z0) / h) * 0.9 + 0.1);
}

export function pyramid(
  cx: number,
  cy: number,
  hw: number,
  z0: number,
  h: number,
  c: RGB,
  part: number,
  level?: Level,
) {
  const ramp = rampId(c),
    st = step();
  const nX = normalOf(h, 0, hw),
    nY = normalOf(0, h, hw);
  for (let t = 0; t <= 1; t += st / Math.hypot(hw, h)) {
    const half = hw * (1 - t),
      z = z0 + h * t;
    for (let a = -half; a <= half; a += st) {
      surf(cx + half, cy + a, z, ramp, level ? level(a, t) : 0, nX, part);
      surf(
        cx + a,
        cy + half,
        z,
        ramp,
        level ? level(a, t) + 0.15 : 0.15,
        nY,
        part,
      );
    }
  }
  for (let z = z0 + 0.2; z <= z0 + h; z += 0.5)
    caster(cx, cy, z, hw * (1 - (z - z0) / h) + 0.1);
}

export function gableX(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z: number,
  rise: number,
  c: RGB,
  part: number,
  end?: { color: RGB; part: number; level?: Level },
) {
  const ramp = rampId(c),
    st = step(),
    yc = (y0 + y1) / 2,
    half = (y1 - y0) / 2;
  const nP = normalOf(0, rise, half),
    nN = normalOf(0, -rise, half);
  for (let x = x0; x <= x1; x += st)
    for (let y = y0; y <= y1; y += st) {
      const q = Math.abs(y - yc) / half,
        row = Math.floor(q * half * 3.4) % 2;
      surf(
        x,
        y,
        z + rise * (1 - q),
        ramp,
        row * 0.45 - (hash((x * 3) | 0, (y * 9) | 0) > 0.85 ? 0.6 : 0),
        y > yc ? nP : nN,
        part,
      );
    }
  if (end) {
    const er = rampId(end.color);
    for (let y = y0; y <= y1; y += st) {
      const q = Math.abs(y - yc) / half;
      for (let hgt = 0; hgt <= rise * (1 - q); hgt += st)
        surf(
          x1,
          y,
          z + hgt,
          er,
          end.level ? end.level(y, hgt) : 0,
          PX,
          end.part,
        );
    }
  }
  for (let x = x0; x <= x1; x += 0.6)
    for (let hgt = 0.3; hgt <= rise; hgt += 0.6)
      caster(x, yc, z + hgt, half * (1 - hgt / rise) * 0.8 + 0.2);
}

export function gableY(
  y0: number,
  y1: number,
  x0: number,
  x1: number,
  z: number,
  rise: number,
  c: RGB,
  part: number,
  end?: { color: RGB; part: number; level?: Level },
) {
  const ramp = rampId(c),
    st = step(),
    xc = (x0 + x1) / 2,
    half = (x1 - x0) / 2;
  const nP = normalOf(rise, 0, half),
    nN = normalOf(-rise, 0, half);
  for (let y = y0; y <= y1; y += st)
    for (let x = x0; x <= x1; x += st) {
      const q = Math.abs(x - xc) / half,
        row = Math.floor(q * half * 3.4) % 2;
      surf(
        x,
        y,
        z + rise * (1 - q),
        ramp,
        row * 0.45 - (hash((y * 3) | 0, (x * 9) | 0) > 0.85 ? 0.6 : 0),
        x > xc ? nP : nN,
        part,
      );
    }
  if (end) {
    const er = rampId(end.color);
    for (let x = x0; x <= x1; x += st) {
      const q = Math.abs(x - xc) / half;
      for (let hgt = 0; hgt <= rise * (1 - q); hgt += st)
        surf(
          x,
          y1,
          z + hgt,
          er,
          end.level ? end.level(x, hgt) : 0,
          PY,
          end.part,
        );
    }
  }
  for (let y = y0; y <= y1; y += 0.6)
    for (let hgt = 0.3; hgt <= rise; hgt += 0.6)
      caster(xc, y, z + hgt, half * (1 - hgt / rise) * 0.8 + 0.2);
}

export function pointed(
  a: number,
  z: number,
  cx: number,
  w: number,
  spring: number,
  top = Infinity,
) {
  if (Math.abs(a - cx) > w || z > top) return false;
  if (z <= spring) return true;
  return (
    Math.hypot(a - (cx + w), z - spring) <= 2 * w &&
    Math.hypot(a - (cx - w), z - spring) <= 2 * w
  );
}

export function courses(a: number, z: number, h = 0.32, w = 0.7) {
  const fz = z / h,
    course = Math.floor(fz),
    fa = a / w + (course % 2) * 0.5,
    block = Math.floor(fa);
  const mortar = fz - course < 0.14 || fa - block < 0.08;
  const tone = hash(block, course);
  return (tone > 0.75 ? 0.6 : tone < 0.2 ? -0.5 : 0) - (mortar ? 0.9 : 0);
}

export function island(
  x: number,
  y: number,
  ix: number,
  iy: number,
  rx: number,
  ry: number,
) {
  const edge = Math.pow(
    Math.pow(Math.abs(x) / rx, 4) + Math.pow(Math.abs(y) / ry, 4),
    0.25,
  );
  const rough = edge + (noise(x * 1.3, y * 1.3) - 0.5) * 0.13;
  if (rough > 1.04) return -1;
  if (rough > 0.93 && hash(ix, iy) < (rough - 0.93) / 0.11) return -1;
  return rough;
}

export const tone = (tones: RGB[], v: number, ix: number, iy: number) =>
  rgb(
    ...tones[
      clamp(
        Math.floor(v * tones.length + (bayerAt(ix, iy) - 0.5) * 0.7),
        0,
        tones.length - 1,
      )
    ],
  );

export function grass(
  x: number,
  y: number,
  ix: number,
  iy: number,
  i: number,
  lift = 0,
) {
  setKind(i, KIND_GRASS);
  const t =
    noise(x * 0.9, y * 0.9) * 1.15 + (hash(ix, iy) - 0.5) * 0.55 - 0.08 + lift;
  return rgb(...GRASS[clamp(Math.floor(t * 4.2), 0, 3)]);
}

export const windowId = (a: number, b: number, seed = 0) =>
  1 + ((hash(a + seed * 13.1, b + seed * 7.7) * 254) | 0);

export function dome(
  cx: number,
  cy: number,
  z0: number,
  r: number,
  c: RGB,
  part: number,
  o: {
    zScale?: number;
    level?: (angle: number, phi: number) => number;
    shadow?: boolean;
    from?: number;
    to?: number;
    glow?: (angle: number, phi: number) => number;
  } = {},
) {
  const ramp = rampId(c),
    st = step(),
    zs = o.zScale ?? 1;
  const lo = o.from ?? -Infinity,
    hi = o.to ?? Infinity;
  for (let phi = 0; phi <= Math.PI / 2; phi += st / (r * Math.max(zs, 0.4))) {
    const ring = r * Math.cos(phi),
      z = z0 + r * zs * Math.sin(phi);
    const da = st / Math.max(ring, 0.05);
    for (let a = Math.PI / 4 - 1.95; a <= Math.PI / 4 + 1.95; a += da) {
      if (a < lo || a > hi) continue;
      const nx = Math.cos(a) * Math.cos(phi),
        ny = Math.sin(a) * Math.cos(phi);
      surf(
        cx + Math.cos(a) * ring,
        cy + Math.sin(a) * ring,
        z,
        ramp,
        o.level ? o.level(a, phi) : 0,
        normalOf(nx, ny, Math.sin(phi) / Math.max(zs, 0.2)),
        part,
        o.glow ? o.glow(a, phi) : 0,
      );
    }
  }
  if (o.shadow !== false)
    for (let h = 0.2; h <= r * zs; h += 0.5)
      caster(
        cx,
        cy,
        z0 + h,
        Math.sqrt(Math.max(0, 1 - (h / (r * zs)) ** 2)) * r * 0.9 + 0.1,
      );
}

const CYPRESS: RGB[] = [
  [30, 50, 38],
  [46, 70, 48],
  [70, 96, 60],
];
export function cypress(
  x: number,
  y: number,
  h: number,
  part: number,
  seed = 0,
) {
  for (let k = 0; k < 90; k++) {
    const t = hash(k + seed, 3),
      z = 0.3 + t * h,
      w = 0.42 * Math.sin(Math.PI * Math.min(1, 0.15 + t * 0.95)) + 0.06;
    const a = hash(k + seed, 4) * 6.283,
      d = hash(k + seed, 5) * w * 0.6;
    const shade =
      CYPRESS[
        clamp(
          Math.floor(
            hash(k + seed, 6) * 2 + (Math.cos(a) + Math.sin(a) < 0 ? 0 : 1),
          ),
          0,
          2,
        )
      ];
    sphere(
      x + Math.cos(a) * d,
      y + Math.sin(a) * d,
      z,
      w * 0.75 + 0.05,
      shade,
      part,
      "rough",
    );
  }
  for (let z = 0.3; z < h; z += 0.5) caster(x, y, z, 0.32);
}

export function windowBays(
  pitch: number,
  w: number,
  floor: number,
  margin: number,
  len: number,
  z0: number,
  seed: number,
  z1 = Infinity,
) {
  const hit = (u: number, v: number) => {
    if (u < margin || u > len - margin || v < z0 || v > z1) return -1;
    const col = Math.floor((u - margin) / pitch),
      inCol = (u - margin) % pitch < w;
    const f = (v - z0) % floor;
    if (!inCol || f < floor * 0.22 || f > floor * 0.86) return -1;
    return windowId(col, Math.floor((v - z0) / floor), seed);
  };
  return {
    hit,
    glow: (u: number, v: number) => Math.max(0, hit(u, v)),
  };
}

export function batter(
  cx: number,
  cy: number,
  hx: number,
  hy: number,
  z0: number,
  h: number,
  inset: number,
  c: RGB,
  part: number,
  level?: Level,
  topLevel?: Level,
) {
  const ramp = rampId(c),
    st = step();
  const nX = normalOf(h, 0, inset),
    nY = normalOf(0, h, inset);
  for (let t = 0; t <= 1; t += st / Math.hypot(h, inset)) {
    const ex = hx - inset * t,
      ey = hy - inset * t,
      z = z0 + h * t;
    for (let a = -ey; a <= ey; a += st)
      surf(
        cx + ex,
        cy + a,
        z,
        ramp,
        level ? level(a + hy, z - z0) : 0,
        nX,
        part,
      );
    for (let a = -ex; a <= ex; a += st)
      surf(
        cx + a,
        cy + ey,
        z,
        ramp,
        level ? level(a + hx, z - z0) + 0.1 : 0.1,
        nY,
        part,
      );
  }
  const tx = hx - inset,
    ty = hy - inset;
  for (let x = -tx; x <= tx; x += st)
    for (let y = -ty; y <= ty; y += st)
      surf(
        cx + x,
        cy + y,
        z0 + h,
        ramp,
        topLevel ? topLevel(x + tx, y + ty) : 0.2,
        TOP,
        part,
      );
  for (let x = -hx + 0.3; x <= hx - 0.3; x += 0.6)
    for (let y = -hy + 0.3; y <= hy - 0.3; y += 0.6)
      for (let z = z0 + 0.3; z <= z0 + h; z += 0.6)
        caster(cx + x, cy + y, z, 0.5);
}

const FROND: RGB[] = [
  [52, 88, 50],
  [86, 120, 60],
];
export function palm(x: number, y: number, h: number, part: number, seed = 0) {
  const lean = (hash(seed, 1) - 0.5) * 0.8;
  const top: V3 = [x + lean, y + lean * 0.4, h];
  capsule(
    [x, y, 0],
    [top[0], top[1], top[2]],
    0.13,
    0.09,
    [118, 92, 66],
    part,
    "rough",
  );
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + hash(seed, k) * 0.4,
      len = 0.9 + hash(seed + 3, k) * 0.3;
    const mid: V3 = [
      top[0] + Math.cos(a) * len * 0.55,
      top[1] + Math.sin(a) * len * 0.55,
      h + 0.18,
    ];
    const tip: V3 = [
      top[0] + Math.cos(a) * len,
      top[1] + Math.sin(a) * len,
      h - 0.35,
    ];
    capsule(
      [top[0], top[1], top[2]],
      [mid[0], mid[1], mid[2]],
      0.1,
      0.08,
      FROND[k % 2],
      part,
      "rough",
    );
    capsule(
      [mid[0], mid[1], mid[2]],
      [tip[0], tip[1], tip[2]],
      0.08,
      0.04,
      FROND[(k + 1) % 2],
      part,
      "rough",
    );
    caster(mid[0], mid[1], mid[2], 0.3);
  }
  for (let z = 0.3; z < h; z += 0.6) caster(x + (lean * z) / h, y, z, 0.15);
}

export function sheet(
  at: (t: number, v: number) => V3,
  c: RGB,
  part: number,
  level?: Level,
  glow?: Glow,
  shadow = true,
) {
  const ramp = rampId(c),
    st = step();
  let lt = 0,
    lv = 0;
  for (let k = 0; k < 8; k++) {
    const a = at(k / 8, 0.5),
      b = at((k + 1) / 8, 0.5),
      p = at(0.5, k / 8),
      q = at(0.5, (k + 1) / 8);
    lt += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    lv += Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
  }
  const dt = (st / Math.max(lt, 0.1)) * 0.8,
    dv = (st / Math.max(lv, 0.1)) * 0.8;
  for (let t = 0; t <= 1; t += dt)
    for (let v = 0; v <= 1; v += dv) {
      const p = at(t, v),
        pt = at(Math.min(1, t + 0.01), v),
        pv = at(t, Math.min(1, v + 0.01));
      const U = [pt[0] - p[0], pt[1] - p[1], pt[2] - p[2]],
        Vv = [pv[0] - p[0], pv[1] - p[1], pv[2] - p[2]];
      const n = facing([
        U[1] * Vv[2] - U[2] * Vv[1],
        U[2] * Vv[0] - U[0] * Vv[2],
        U[0] * Vv[1] - U[1] * Vv[0],
      ]);
      surf(
        p[0],
        p[1],
        p[2],
        ramp,
        level ? level(t * lt, v * lv) : 0,
        normalOf(n[0], n[1], n[2]),
        part,
        glow ? glow(t * lt, v * lv) : 0,
      );
    }
  if (shadow)
    for (let t = 0; t <= 1; t += 0.06)
      for (let v = 0.1; v <= 1; v += 0.15) {
        const p = at(t, v);
        caster(p[0], p[1], p[2], 0.45);
      }
}

export type Cell = [number, number, number, number] | null;

export function facadeX(
  x: number,
  y0: number,
  y1: number,
  z0: number,
  z1: number,
  fn: (a: number, z: number) => Cell,
) {
  const st = step();
  for (let a = y0; a <= y1; a += st)
    for (let z = z0; z <= z1; z += st) {
      const c = fn(a - y0, z);
      if (c) surf(x, a, z, c[0], c[1], PX, c[2], c[3]);
    }
}

export function facadeY(
  y: number,
  x0: number,
  x1: number,
  z0: number,
  z1: number,
  fn: (a: number, z: number) => Cell,
) {
  const st = step();
  for (let a = x0; a <= x1; a += st)
    for (let z = z0; z <= z1; z += st) {
      const c = fn(a - x0, z);
      if (c) surf(a, y, z, c[0], c[1], PY, c[2], c[3]);
    }
}
