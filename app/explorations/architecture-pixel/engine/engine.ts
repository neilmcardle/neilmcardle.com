export const W = 360;
export const H = 280;
export const N = W * H;
export const SIN = 0.5;
export const COS = Math.sqrt(3) / 2;
export const R2 = Math.SQRT2;

export type RGB = readonly [number, number, number];

const cl8 = (v: number) => (v <= 0 ? 0 : v >= 255 ? 255 : v | 0);
export const rgb = (r: number, g: number, b: number) =>
  ((255 << 24) | (cl8(b) << 16) | (cl8(g) << 8) | cl8(r)) >>> 0;

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (t: number) => t * t * (3 - 2 * t);
export const smooth = (a: number, b: number, v: number) =>
  ease(clamp((v - a) / (b - a), 0, 1));

export function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
export function noise(x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y),
    fx = ease(x - ix),
    fy = ease(y - iy);
  return lerp(
    lerp(hash(ix, iy), hash(ix + 1, iy), fx),
    lerp(hash(ix, iy + 1), hash(ix + 1, iy + 1), fx),
    fy,
  );
}

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(
  (v) => (v + 0.5) / 16,
);
export const bayerAt = (ix: number, iy: number) =>
  BAYER[(iy & 3) * 4 + (ix & 3)];

const COOL: RGB = [46, 38, 84];
const WARM: RGB = [255, 232, 180];
export const WHITE = 0;
export const SIGNAL = rgb(255, 214, 10);
export const INK = rgb(28, 27, 25);
export const BARK: RGB = [92, 74, 60];
export const GRASS: RGB[] = [
  [34, 62, 50],
  [52, 88, 52],
  [82, 118, 54],
  [124, 146, 62],
  [168, 172, 76],
];

const rampList: Uint32Array[] = [];
const rampKeys = new Map<string, number>();
export function rampId(c: RGB) {
  const key = c.join();
  let id = rampKeys.get(key);
  if (id === undefined) {
    const mix = (m: number, t: RGB, k: number) =>
      rgb(
        lerp(c[0] * m, t[0], k),
        lerp(c[1] * m, t[1], k),
        lerp(c[2] * m, t[2], k),
      );
    id = rampList.length;
    rampList.push(
      Uint32Array.of(
        mix(0.4, COOL, 0.34),
        mix(0.62, COOL, 0.18),
        mix(0.84, COOL, 0.05),
        mix(1, WARM, 0),
        mix(1.1, WARM, 0.22),
      ),
    );
    rampKeys.set(key, id);
  }
  return id;
}
export const rampOf = (c: RGB) => rampList[rampId(c)];

const NORMALS = new Float32Array(256 * 3);
NORMALS[2] = 1;
[0, Math.PI / 6, Math.PI / 3].forEach((e, band) => {
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2,
      n = (1 + band * 64 + k) * 3;
    NORMALS[n] = Math.cos(a) * Math.cos(e);
    NORMALS[n + 1] = Math.sin(a) * Math.cos(e);
    NORMALS[n + 2] = Math.sin(e);
  }
});
export const TOP = 0;
export function normalOf(nx: number, ny: number, nz: number) {
  const e = Math.atan2(nz, Math.hypot(nx, ny));
  if (e > 1.31) return TOP;
  const band = e < 0.26 ? 0 : e < 0.79 ? 1 : 2;
  let a = Math.atan2(ny, nx);
  if (a < 0) a += Math.PI * 2;
  return 1 + band * 64 + (Math.round((a / (Math.PI * 2)) * 64) & 63);
}
export const PX = normalOf(1, 0, 0);
export const PY = normalOf(0, 1, 0);

export const KIND_NONE = 0;
export const KIND_GRASS = 3;

type Tuft = {
  ix: number;
  iy: number;
  i: number;
  height: number;
  base: number;
  phase: number;
  bloom: number;
};
type Leaf = { x: number; y: number; z: number; k: number; pixels: number[] };

function alloc(S: number, originY: number, windowLight: RGB) {
  return {
    S,
    OX: W / 2,
    OY: H / 2 + originY,
    zb: new Float32Array(N),
    baseZ: new Float32Array(N),
    groundZ: new Float32Array(N),
    ground: new Uint8Array(N),
    kinds: new Uint8Array(N),
    ids: new Uint8Array(N),
    gRamp: new Int16Array(N).fill(-1),
    gLevel: new Float32Array(N),
    gNormal: new Uint8Array(N),
    gColor: new Uint32Array(N),
    gGlow: new Uint8Array(N),
    groundBase: new Uint32Array(N),
    lit: new Uint32Array(N),
    staticShadow: new Uint8Array(N),
    casters: [] as number[],
    tufts: [] as Tuft[],
    leaves: [] as Leaf[],
    lightKey: "",
    clip: null as ((x: number, y: number, z: number) => boolean) | null,
    windowLight: [
      rgb(...windowLight),
      rgb(windowLight[0] * 0.92, windowLight[1] * 0.82, windowLight[2] * 0.7),
    ],
  };
}
export type Baked = ReturnType<typeof alloc>;

let B: Baked;

export const step = () => 0.45 / B.S;

export function project(x: number, y: number, z: number) {
  const u = (x - y) / R2,
    v = (x + y) / R2;
  return {
    sx: B.OX + u * B.S,
    sy: B.OY + (v * SIN - z * COS) * B.S,
    d: v * COS + z * SIN,
  };
}
export function unproject(sx: number, sy: number) {
  const u = (sx - B.OX) / B.S,
    v = (sy - B.OY) / (B.S * SIN);
  return { x: (u + v) / R2, y: (v - u) / R2 };
}

export function clip(
  fn: ((x: number, y: number, z: number) => boolean) | null,
) {
  B.clip = fn;
}

export function surf(
  x: number,
  y: number,
  z: number,
  ramp: number,
  level: number,
  normal: number,
  part: number,
  glow = 0,
) {
  if (B.clip && B.clip(x, y, z)) return;
  const u = (x - y) / R2,
    v = (x + y) / R2;
  const sx = B.OX + u * B.S,
    sy = B.OY + (v * SIN - z * COS) * B.S;
  if (sx < 0 || sy < 0 || sx >= W || sy >= H) return;
  const i = (sy | 0) * W + (sx | 0),
    d = v * COS + z * SIN;
  if (d <= B.zb[i]) return;
  B.zb[i] = d;
  B.gRamp[i] = ramp;
  B.gLevel[i] = level;
  B.gNormal[i] = normal;
  B.gColor[i] = 0;
  B.ids[i] = part;
  B.gGlow[i] = glow;
}
function putFixed(
  ix: number,
  iy: number,
  d: number,
  color: number,
  part: number,
) {
  if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
  const i = iy * W + ix;
  if (d <= B.zb[i]) return;
  B.zb[i] = d;
  B.gColor[i] = color;
  B.gRamp[i] = -1;
  B.ids[i] = part;
  B.gGlow[i] = 0;
}
export function setKind(i: number, kind: number) {
  B.kinds[i] = kind;
}
export function setGroundPart(i: number, part: number) {
  B.ids[i] = part;
}
export function caster(x: number, y: number, z: number, r: number) {
  if (B.clip && B.clip(x, y, z)) return;
  B.casters.push(x, y, z, r);
}

let capture: number[] | null = null;
type SphereMode = "rough" | "solid" | undefined;
export function sphere(
  x: number,
  y: number,
  z: number,
  r: number,
  c: RGB,
  part: number,
  mode?: SphereMode,
) {
  if (B.clip && B.clip(x, y, z)) return;
  const ramp = rampOf(c);
  const p = project(x, y, z),
    rp = Math.max(r * B.S, 0.75);
  const y0 = Math.max(0, Math.floor(p.sy - rp)),
    y1 = Math.min(H - 1, Math.ceil(p.sy + rp));
  const x0 = Math.max(0, Math.floor(p.sx - rp)),
    x1 = Math.min(W - 1, Math.ceil(p.sx + rp));
  for (let iy = y0; iy <= y1; iy++)
    for (let ix = x0; ix <= x1; ix++) {
      const dx = (ix + 0.5 - p.sx) / rp,
        dy = (iy + 0.5 - p.sy) / rp,
        nn = dx * dx + dy * dy;
      if (nn > 1) continue;
      const nz = Math.sqrt(1 - nn),
        d = p.d + r * nz,
        i = iy * W + ix;
      if (d <= B.zb[i]) continue;
      let l = clamp(-0.55 * dx - 0.6 * dy + 0.58 * nz, 0, 1);
      if (mode === "rough") l += (hash(ix, iy) - 0.5) * 0.55;
      if (dy > 0.35) l = Math.max(l, 0.12 + dy * 0.24);
      const color =
        mode === "solid"
          ? ramp[clamp(Math.floor(l * 4.4 + 0.2), 1, 4)]
          : ramp[
              clamp(
                Math.floor(l * 4.4 + 0.2 + (bayerAt(ix, iy) - 0.5) * 0.7),
                0,
                4,
              )
            ];
      if (capture) {
        capture.push(ix, iy, d, color);
        continue;
      }
      putFixed(ix, iy, d, color, part);
    }
}
export function capsule(
  a: number[],
  b: number[],
  r0: number,
  r1: number,
  c: RGB,
  part: number,
  mode?: SphereMode,
) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const n = Math.max(1, Math.ceil(len / (Math.min(r0, r1) * 0.45)));
  for (let k = 0; k <= n; k++) {
    const t = k / n;
    sphere(
      lerp(a[0], b[0], t),
      lerp(a[1], b[1], t),
      lerp(a[2], b[2], t),
      lerp(r0, r1, t),
      c,
      part,
      mode,
    );
  }
}

const CROWN = [
  [0.1, 0, 3.7, 1.6],
  [-1.4, -0.7, 3.3, 1.2],
  [1.6, 0.7, 3.4, 1.25],
  [-0.6, 1.1, 3.9, 1.1],
  [0.9, -1.1, 4, 1.1],
  [0.2, 0.1, 4.9, 1.05],
];
const LEAF_DEEP: RGB = [58, 84, 62],
  LEAF_MID: RGB = [100, 126, 78],
  LEAF_SILVER: RGB = [146, 162, 112];
export function growTree(
  x: number,
  y: number,
  part: number,
  scale = 1,
  count = 420,
  seed = 0,
  leafTones: RGB[] = [LEAF_DEEP, LEAF_MID, LEAF_SILVER],
) {
  const s = scale;
  capsule(
    [x, y, 0],
    [x + 0.3 * s, y + 0.1 * s, 2.2 * s],
    0.36 * s,
    0.22 * s,
    BARK,
    part,
    "rough",
  );
  capsule(
    [x + 0.3 * s, y + 0.1 * s, 2.2 * s],
    [x - 0.8 * s, y - 0.4 * s, 3.3 * s],
    0.2 * s,
    0.13 * s,
    BARK,
    part,
    "rough",
  );
  capsule(
    [x + 0.3 * s, y + 0.1 * s, 2.2 * s],
    [x + 1.2 * s, y + 0.4 * s, 3.4 * s],
    0.2 * s,
    0.13 * s,
    BARK,
    part,
    "rough",
  );
  for (let n = 0; n < count; n++) {
    const k = n + seed,
      [cx, cy, cz, spread] = CROWN[n % CROWN.length];
    const a = hash(k, 7) * 6.283,
      tilt = hash(k, 8) * 2 - 1,
      d = Math.cbrt(hash(k, 9)) * spread,
      flat = Math.sqrt(1 - tilt * tilt);
    const rx = cx + Math.cos(a) * flat * d,
      ry = cy + Math.sin(a) * flat * d,
      rz = cz + tilt * d * 0.8;
    const tone = hash(k, 10) + (rz - 4.2) * 0.22 + (d / spread - 0.5) * 0.3;
    const leaf =
      tone > 0.72 ? leafTones[2] : tone > 0.3 ? leafTones[1] : leafTones[0];
    capture = [];
    sphere(
      x + rx * s,
      y + ry * s,
      rz * s,
      (0.2 + hash(k, 11) * 0.22) * s,
      leaf,
      part,
      "rough",
    );
    const pixels = capture;
    capture = null;
    for (let q = 0; q < pixels.length; q += 4) {
      const i = pixels[q + 1] * W + pixels[q];
      if (pixels[q + 2] > B.zb[i]) B.ids[i] = part;
    }
    B.leaves.push({ x: x + rx * s, y: y + ry * s, z: rz * s, k, pixels });
    if (k % 2 === 0) caster(x + rx * s, y + ry * s, rz * s, 0.42 * s);
  }
  for (let z = 0.3; z < 2.2 * s; z += 0.6) caster(x, y, z, 0.3 * s);
}

const WIND_STEP = 1 / 8;
export const windTime = (seconds: number) =>
  Math.floor(seconds / WIND_STEP) * WIND_STEP;
const tuftLit = GRASS.map((c) => rgb(...c));
const tuftDark = GRASS.map((c) => rgb(c[0] * 0.54, c[1] * 0.52, c[2] * 0.72));
function growGrass() {
  for (let iy = 3; iy < H; iy++)
    for (let ix = 0; ix < W; ix++) {
      const i = iy * W + ix;
      if (B.kinds[i] !== KIND_GRASS || hash(ix * 3, iy * 5) > 0.17) continue;
      B.tufts.push({
        ix,
        iy,
        i,
        height: 1 + ((hash(ix, iy * 2) * 3) | 0),
        base: Math.round(noise(ix * 0.09, iy * 0.18) * 2.2),
        phase: ix * 0.11 + iy * 0.19 + hash(ix, iy) * 0.9,
        bloom:
          hash(ix * 7, iy) < 0.022
            ? hash(ix, iy) > 0.5
              ? rgb(250, 246, 226)
              : rgb(240, 200, 84)
            : 0,
      });
    }
}
function drawTufts(t: number, out: Uint32Array) {
  const { zb, groundZ, kinds, staticShadow } = B;
  for (const tuft of B.tufts) {
    const gust =
      Math.sin(t * 0.8 + tuft.phase) +
      0.5 * Math.sin(t * 2.1 + tuft.phase * 2.3);
    const colors = staticShadow[tuft.i] ? tuftDark : tuftLit;
    for (let k = 1; k <= tuft.height; k++) {
      const jx = tuft.ix + Math.round((gust * 0.95 * k) / 3),
        jy = tuft.iy - k;
      if (jx < 0 || jx >= W || jy < 0) continue;
      const j = jy * W + jx;
      if (
        (kinds[j] !== KIND_GRASS && kinds[j] !== KIND_NONE) ||
        zb[j] !== groundZ[j]
      )
        continue;
      out[j] =
        tuft.bloom && k === tuft.height
          ? tuft.bloom
          : colors[clamp(tuft.base + k + (gust > 1 ? 1 : 0), 1, 4)];
    }
  }
}
function drawLeaves(t: number, out: Uint32Array) {
  const zb = B.zb;
  for (const leaf of B.leaves) {
    const reach = clamp((leaf.z - 2.5) / 3, 0.3, 1);
    const swayX =
      (Math.sin(t * 0.9 + leaf.x * 0.5 + leaf.z * 0.7) +
        0.55 * Math.sin(t * 2.3 + leaf.k * 1.7)) *
      reach;
    const dx = Math.round(swayX * 0.9),
      dy = Math.round(Math.sin(t * 1.3 + leaf.y + leaf.k) * reach * 0.45);
    const px = leaf.pixels;
    for (let n = 0; n < px.length; n += 4) {
      const ix = px[n] + dx,
        iy = px[n + 1] + dy;
      if (ix < 0 || iy < 0 || ix >= W || iy >= H) continue;
      const i = iy * W + ix;
      if (px[n + 2] <= zb[i]) continue;
      zb[i] = px[n + 2];
      out[i] = px[n + 3];
    }
  }
}
function bakeOcclusion() {
  const { zb, groundZ, ground, groundBase } = B;
  const offsets: number[][] = [];
  for (const r of [2, 4])
    for (let k = 0; k < 8; k++)
      offsets.push([
        Math.round(Math.cos((k * Math.PI) / 4) * r),
        Math.round(Math.sin((k * Math.PI) / 4) * r * 0.7),
      ]);
  for (let iy = 4; iy < H - 4; iy++)
    for (let ix = 4; ix < W - 4; ix++) {
      const i = iy * W + ix;
      if (!ground[i] || zb[i] !== groundZ[i]) continue;
      let hits = 0;
      for (const [ox, oy] of offsets) {
        const j = (iy + oy) * W + ix + ox;
        if (zb[j] !== groundZ[j]) hits++;
      }
      if (!hits) continue;
      if (hits >= 8) groundBase[i] = tinted(groundBase[i], 0.56, 0.54, 0.72);
      else if (hits / 8 > bayerAt(ix, iy))
        groundBase[i] = tinted(groundBase[i], 0.74, 0.72, 0.84);
    }
}
const tinted = (c: number, r: number, g: number, b: number) =>
  rgb((c & 255) * r, ((c >> 8) & 255) * g, ((c >> 16) & 255) * b);

export type Scene = {
  id: string;
  scale: number;
  originY: number;
  windowLight?: RGB;
  parts: string[];
  cutaway?: { inside: number[]; removes: number[] };
  ground: (x: number, y: number, ix: number, iy: number, i: number) => number;
  build: (cut: boolean) => void;
};

export function bake(scene: Scene, cut = false): Baked {
  B = alloc(scene.scale, scene.originY, scene.windowLight ?? [255, 206, 122]);
  B.zb.fill(-1e9);
  for (let iy = 0; iy < H; iy++)
    for (let ix = 0; ix < W; ix++) {
      const g = unproject(ix + 0.5, iy + 0.5),
        i = iy * W + ix;
      const c = scene.ground(g.x, g.y, ix, iy, i);
      if (!c) {
        B.ids[i] = 0;
        continue;
      }
      B.groundBase[i] = c;
      B.ground[i] = 1;
      B.zb[i] = ((g.x + g.y) / R2) * COS;
    }
  growGrass();
  B.groundZ.set(B.zb);
  scene.build(cut);
  B.clip = null;
  bakeOcclusion();
  B.baseZ.set(B.zb);
  return B;
}

export type Light = { sx: number; sy: number; day: number };
const faceLight = new Float32Array(256);
const mask = new Uint8Array(N);

export function light(b: Baked, L: Light, key: string) {
  if (b.lightKey === key) return;
  b.lightKey = key;
  B = b;
  const moon = L.day < 0.5;
  const sx = moon ? 0.9 : L.sx,
    sy = moon ? -0.55 : L.sy;
  const len = Math.max(0.05, Math.hypot(sx, sy));
  const hx = -sx / len,
    hy = -sy / len,
    k = 1 / Math.sqrt(1 + len * len);
  const s0 = hx * len * k,
    s1 = hy * len * k,
    s2 = k;
  for (let n = 0; n < 193; n++) {
    const dot =
      NORMALS[n * 3] * s0 + NORMALS[n * 3 + 1] * s1 + NORMALS[n * 3 + 2] * s2;
    faceLight[n] = moon
      ? clamp(2.3 + 1.2 * dot, 1.3, 3.4)
      : clamp(2.16 + 2 * dot, 1.1, 3.9);
  }
  const {
    gRamp,
    gLevel,
    gNormal,
    gColor,
    ground,
    baseZ,
    groundZ,
    groundBase,
    lit,
    casters,
  } = b;
  for (let i = 0; i < N; i++) {
    const r = gRamp[i];
    if (r >= 0) {
      const ix = i % W,
        iy = (i / W) | 0;
      lit[i] =
        rampList[r][
          clamp(
            Math.floor(
              faceLight[gNormal[i]] + gLevel[i] + (bayerAt(ix, iy) - 0.5) * 0.5,
            ),
            0,
            4,
          )
        ];
    } else if (gColor[i]) lit[i] = gColor[i];
    else if (ground[i] && baseZ[i] === groundZ[i]) lit[i] = groundBase[i];
    else lit[i] = WHITE;
  }
  mask.fill(0);
  if (!moon) {
    const rx = 0.55 * b.S;
    for (let c = 0; c < casters.length; c += 4) {
      const z = casters[c + 2],
        r = casters[c + 3];
      const p = project(casters[c] + sx * z, casters[c + 1] + sy * z, 0);
      const ex = r * b.S * 1.05 || rx,
        ey = ex * SIN + 1;
      const y0 = Math.max(0, Math.floor(p.sy - ey)),
        y1 = Math.min(H - 1, Math.ceil(p.sy + ey));
      const x0 = Math.max(0, Math.floor(p.sx - ex)),
        x1 = Math.min(W - 1, Math.ceil(p.sx + ex));
      for (let iy = y0; iy <= y1; iy++)
        for (let ix = x0; ix <= x1; ix++) {
          const dx = (ix + 0.5 - p.sx) / ex,
            dy = (iy + 0.5 - p.sy) / ey;
          if (dx * dx + dy * dy + (bayerAt(ix, iy) - 0.5) * 0.4 > 1) continue;
          mask[iy * W + ix] = 1;
        }
    }
  }
  b.staticShadow.set(mask);
  for (let i = 0; i < N; i++) {
    if (!mask[i] || !ground[i] || baseZ[i] !== groundZ[i]) continue;
    lit[i] = tinted(lit[i], 0.54, 0.52, 0.72);
  }
}

const GRADIENT_EDGE = 0.28;
function shadeEdges(out: Uint32Array) {
  const { zb, groundZ } = B;
  const gy = COS / (B.S * SIN);
  for (let iy = 1; iy < H - 1; iy++)
    for (let ix = 1; ix < W - 1; ix++) {
      const i = iy * W + ix,
        d = zb[i];
      if (d < -1e8 || d === groundZ[i]) continue;
      const a = i - W,
        b = i + W,
        c = i - 1,
        e = i + 1;
      if (
        zb[a] === groundZ[a] ||
        zb[b] === groundZ[b] ||
        zb[c] === groundZ[c] ||
        zb[e] === groundZ[e]
      ) {
        out[i] = tinted(out[i], 0.68, 0.66, 0.76);
      } else if (d - zb[a] - gy > GRADIENT_EDGE || d - zb[c] > GRADIENT_EDGE) {
        const p = out[i];
        out[i] = rgb(
          lerp(p & 255, WARM[0], 0.3),
          lerp((p >> 8) & 255, WARM[1], 0.3),
          lerp((p >> 16) & 255, WARM[2], 0.22),
        );
      } else if (zb[e] - d > GRADIENT_EDGE || zb[b] - gy - d > GRADIENT_EDGE) {
        out[i] = tinted(out[i], 0.74, 0.72, 0.82);
      }
    }
}

export type FrameOptions = {
  t: number;
  selected: number;
  hover: number;
  night: number;
  warm: number;
};

function outline(part: number, edge: number, lift: number) {
  const { ids, zb } = B;
  for (let iy = 1; iy < H - 1; iy++)
    for (let ix = 1; ix < W - 1; ix++) {
      const i = iy * W + ix;
      if (ids[i] !== part || zb[i] < -1e8) continue;
      if (
        ids[i - 1] !== part ||
        ids[i + 1] !== part ||
        ids[i - W] !== part ||
        ids[i + W] !== part
      )
        out[i] = edge;
      else {
        const p = out[i];
        out[i] = rgb(
          lerp(p & 255, 255, lift),
          lerp((p >> 8) & 255, 250, lift),
          lerp((p >> 16) & 255, 226, lift),
        );
      }
    }
}
export const out = new Uint32Array(N);

export function frame(b: Baked, o: FrameOptions) {
  B = b;
  out.set(b.lit);
  b.zb.set(b.baseZ);
  drawLeaves(o.t, out);
  drawTufts(o.t, out);
  shadeEdges(out);
  const { zb, baseZ, gGlow, windowLight } = b;
  const mr = lerp(1, 1.06, o.warm) * lerp(1, 0.36, o.night);
  const mg = lerp(1, 0.9, o.warm) * lerp(1, 0.4, o.night);
  const mb = lerp(1, 0.74, o.warm) * lerp(1, 0.66, o.night);
  if (mr !== 1 || mg !== 1 || mb !== 1) {
    for (let i = 0; i < N; i++)
      if (zb[i] > -1e8) out[i] = tinted(out[i], mr, mg, mb);
  }
  const lit = clamp((o.night - 0.3) / 0.6, 0, 1) * 0.86;
  if (lit > 0) {
    for (let i = 0; i < N; i++) {
      const g = gGlow[i];
      if (g && g / 255 < lit && zb[i] === baseZ[i]) out[i] = windowLight[g & 1];
    }
  }
  if (o.hover && o.hover !== o.selected) outline(o.hover, SIGNAL, 0.16);
  if (o.selected) outline(o.selected, SIGNAL, 0.34);
  return out;
}

export function partAt(b: Baked, ix: number, iy: number, reach = 5) {
  let best = 0,
    bestD = Infinity;
  for (let dy = -reach; dy <= reach; dy++)
    for (let dx = -reach; dx <= reach; dx++) {
      const x = ix + dx,
        y = iy + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const id = b.ids[y * W + x],
        d = dx * dx + dy * dy;
      if (id && d < bestD) {
        best = id;
        bestD = d;
      }
    }
  return best;
}

export function partAnchor(b: Baked, part: number) {
  let sx = 0,
    count = 0,
    top = H;
  for (let i = 0; i < N; i++) {
    if (b.ids[i] !== part) continue;
    const ix = i % W,
      iy = (i / W) | 0;
    sx += ix;
    count++;
    if (iy < top) top = iy;
  }
  if (!count) return null;
  const cx = sx / count;
  let best = top;
  for (let iy = top; iy < H; iy++) {
    const ix = Math.round(cx);
    if (b.ids[iy * W + ix] === part) {
      best = iy;
      break;
    }
    if (iy > top + 20) break;
  }
  return { x: cx, y: best };
}
