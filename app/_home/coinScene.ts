import * as THREE from "three";

const SIDES = ["Ship it", "Roll back"];
const SIZE = 512;
const W = SIZE * 2;
const THICK = 0.13;
const SLOPE = 4;

export type CoinLook = {
  key: number;
  keyX: number;
  keyY: number;
  keyZ: number;
  fill: number;
  low: number;
  gold: number;
  goldBack: number;
  tone: string;
  inlay: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  coatRoughness: number;
  relief: number;
  distance: number;
  rest: number;
};

export const COIN: CoinLook = {
  key: 1.4,
  keyX: -0.7,
  keyY: 1,
  keyZ: 4,
  fill: 0.22,
  low: 0.2,
  gold: 2.2,
  goldBack: 0.9,
  tone: "#060606",
  inlay: "#ecebe7",
  metalness: 0.1,
  roughness: 0.2,
  clearcoat: 0.7,
  coatRoughness: 0.2,
  relief: 0.035,
  distance: 6.5,
  rest: 0,
};

const sheet = () => {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = SIZE;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no canvas");
  return { c, ctx };
};

function faceSheet(field: string, ink: string, font: string, into = sheet()) {
  const { c, ctx } = into;
  ctx.fillStyle = field;
  ctx.fillRect(0, 0, W, SIZE);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  let px = SIZE * 0.2;
  ctx.font = `500 ${px}px ${font}`;
  const widest = Math.max(...SIDES.map((t) => ctx.measureText(t).width));
  px *= (SIZE * 0.6) / widest;
  ctx.font = `500 ${px}px ${font}`;
  ctx.letterSpacing = `${-0.02 * px}px`;
  ctx.textBaseline = "alphabetic";
  const caps = ctx.measureText("H").actualBoundingBoxAscent;
  SIDES.forEach((text, i) => {
    ctx.fillText(text, SIZE / 2 + i * SIZE, SIZE / 2 + caps / 2);
  });
  return c;
}

function profile(relief: number) {
  const h = THICK / 2;
  const face: [number, number][] = [
    [0, h],
    [0.8, h],
    [0.806, h + relief * 0.12],
    [0.818, h + relief * 0.18],
    [0.83, h + relief * 0.12],
    [0.836, h],
    [0.865, h],
    [0.885, h + relief * 0.7],
    [0.9, h + relief],
    [0.955, h + relief],
    [0.982, h + relief * 0.75],
    [0.996, h + relief * 0.3],
    [1, h * 0.8],
  ];
  const points = [
    ...face.map(([r, z]) => new THREE.Vector2(r, -z)),
    ...[...face].reverse().map(([r, z]) => new THREE.Vector2(r, z)),
  ];
  const geometry = new THREE.LatheGeometry(points, 256);
  geometry.rotateX(Math.PI / 2);
  const pos = geometry.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    uv[i * 2] = z >= 0 ? 0.25 + x * 0.25 : 0.75 - x * 0.25;
    uv[i * 2 + 1] = 0.5 + pos.getY(i) * 0.5;
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geometry;
}

function blurred(height: HTMLCanvasElement, sigma: number) {
  const src = height.getContext("2d")!.getImageData(0, 0, W, SIZE).data;
  const radius = Math.ceil(sigma * 3);
  const kernel = new Float32Array(radius * 2 + 1);
  let total = 0;
  for (let k = -radius; k <= radius; k += 1) {
    const w = Math.exp(-(k * k) / (2 * sigma * sigma));
    kernel[k + radius] = w;
    total += w;
  }
  for (let k = 0; k < kernel.length; k += 1) kernel[k] /= total;
  const a = new Float32Array(W * SIZE);
  for (let i = 0; i < a.length; i += 1) a[i] = src[i * 4] / 255;
  const b = new Float32Array(W * SIZE);
  const cx = (v: number) => Math.min(W - 1, Math.max(0, v));
  const cy = (v: number) => Math.min(SIZE - 1, Math.max(0, v));
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < W; x += 1) {
      let v = 0;
      for (let k = -radius; k <= radius; k += 1)
        v += a[y * W + cx(x + k)] * kernel[k + radius];
      b[y * W + x] = v;
    }
  }
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < W; x += 1) {
      let v = 0;
      for (let k = -radius; k <= radius; k += 1)
        v += b[cy(y + k) * W + x] * kernel[k + radius];
      a[y * W + x] = v;
    }
  }
  return a;
}

function normals(height: HTMLCanvasElement, strength: number, sigma: number) {
  const f = blurred(height, sigma);
  const h = (x: number, y: number) =>
    f[Math.min(SIZE - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))];
  const { c, ctx } = sheet();
  const out = ctx.createImageData(W, SIZE);
  const o = out.data;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * W + x) * 4;
      o[i] = Math.round(((-dx / len) * 0.5 + 0.5) * 255);
      o[i + 1] = Math.round(((dy / len) * 0.5 + 0.5) * 255);
      o[i + 2] = Math.round(((1 / len) * 0.5 + 0.5) * 255);
      o[i + 3] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  return c;
}

const texture = (c: HTMLCanvasElement) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 8;
  return t;
};

const breathe = () => new Promise((done) => setTimeout(done, 0));

const easeOut = (x: number) => {
  const bx = (t: number) =>
    3 * 0.2 * t * (1 - t) ** 2 + 3 * 0 * t * t * (1 - t) + t ** 3;
  const by = (t: number) =>
    3 * 0.8 * t * (1 - t) ** 2 + 3 * 1 * t * t * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < x) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
};

export async function mountCoin(
  stage: HTMLElement,
  { still, look: start = COIN }: { still: boolean; look?: CoinLook },
) {
  let look = start;
  let rest = (look.rest * Math.PI) / 180;
  const font = getComputedStyle(stage).fontFamily;
  await document.fonts.load(`500 64px ${font}`).catch(() => {});
  const mark = faceSheet("#fff", "#000", font);
  await breathe();
  const normalMap = normals(mark, 3, 1.3);
  await breathe();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const canvas = renderer.domElement;
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    touchAction: "pan-y",
    cursor: "grab",
  });
  stage.appendChild(canvas);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);

  const key = new THREE.DirectionalLight(0xffffff);
  const gold = new THREE.DirectionalLight(0xffb04a);
  gold.position.set(5, -0.6, -0.6);
  const gold2 = new THREE.DirectionalLight(0xffc670);
  gold2.position.set(-5, -0.8, -0.6);
  const fill = new THREE.DirectionalLight(0xffffff);
  fill.position.set(3, 3.5, 1.2);
  const low = new THREE.DirectionalLight(0xffffff);
  low.position.set(-3, -3, 1.4);
  scene.add(key, fill, low, gold, gold2);

  const normal = texture(normalMap);
  const paintSheet = sheet();
  const colour = new THREE.CanvasTexture(paintSheet.c);
  colour.colorSpace = THREE.SRGBColorSpace;
  colour.anisotropy = 8;
  let painted = "";
  const material = new THREE.MeshPhysicalMaterial({
    normalMap: normal,
    map: colour,
  });
  let relief = look.relief;
  const coin = new THREE.Mesh(profile(relief), material);
  scene.add(coin);

  let width = 1;
  const resize = () => {
    const box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width = box.width;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.position.z =
      camera.aspect >= 1 ? look.distance : look.distance / camera.aspect;
    camera.updateProjectionMatrix();
    paint();
  };

  let angle = rest;
  let frame = 0;
  let dragging = false;
  let downX = 0;
  let downT = 0;
  let samples: { x: number; t: number }[] = [];
  let settle: { from: number; by: number; start: number; ms: number } | null =
    null;

  let live = false;
  const paint = () => {
    if (!live) return;
    coin.rotation.y = angle;
    renderer.render(scene, camera);
  };

  const draw = (now: number) => {
    frame = 0;
    if (settle) {
      const p = Math.min(1, (now - settle.start) / settle.ms);
      angle = settle.from + settle.by * easeOut(p);
      if (p >= 1) settle = null;
    }
    paint();
    if (settle || dragging) frame = requestAnimationFrame(draw);
  };
  const kick = () => {
    if (!frame) frame = requestAnimationFrame(draw);
  };

  const restNear = (a: number, dir: number) => {
    const k = (a - rest) / Math.PI;
    const n = dir > 0 ? Math.ceil(k) : dir < 0 ? Math.floor(k) : Math.round(k);
    return rest + n * Math.PI;
  };

  const release = (velocity: number) => {
    const speed = Math.abs(velocity);
    if (still) {
      angle = restNear(angle, 0);
      settle = null;
      paint();
      return;
    }
    if (speed < 0.6) {
      const target = restNear(angle, 0);
      settle = {
        from: angle,
        by: target - angle,
        start: performance.now(),
        ms: 400,
      };
    } else {
      const dir = Math.sign(velocity);
      let target = restNear(angle + velocity * 0.6, dir);
      if ((target - angle) * dir < 0.2) target += dir * Math.PI;
      if (Math.random() < 0.5) target += dir * Math.PI;
      const by = target - angle;
      const ms = Math.min(
        4000,
        Math.max(400, ((SLOPE * Math.abs(by)) / speed) * 1000),
      );
      settle = { from: angle, by, start: performance.now(), ms };
    }
    kick();
  };

  const down = (e: PointerEvent) => {
    dragging = true;
    settle = null;
    downX = e.clientX;
    downT = e.timeStamp;
    samples = [{ x: e.clientX, t: e.timeStamp }];
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = "grabbing";
    kick();
  };
  const move = (e: PointerEvent) => {
    if (!dragging) return;
    const last = samples[samples.length - 1];
    angle += ((e.clientX - last.x) / width) * Math.PI;
    samples.push({ x: e.clientX, t: e.timeStamp });
    samples = samples.filter((s) => e.timeStamp - s.t < 100);
  };
  const up = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    canvas.style.cursor = "grab";
    const tap = Math.abs(e.clientX - downX) < 4 && e.timeStamp - downT < 300;
    if (tap) {
      const box = canvas.getBoundingClientRect();
      const dir = e.clientX > box.left + box.width / 2 ? 1 : -1;
      if (still) {
        angle = restNear(angle, 0) + (Math.random() < 0.5 ? dir * Math.PI : 0);
        paint();
        return;
      }
      release(dir * 14);
      return;
    }
    const first = samples[0];
    const dt = (e.timeStamp - first.t) / 1000;
    const velocity =
      dt > 0.016 && e.timeStamp - samples[samples.length - 1].t < 80
        ? (((e.clientX - first.x) / width) * Math.PI) / dt
        : 0;
    release(Math.max(-30, Math.min(30, velocity)));
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  const apply = (next: CoinLook) => {
    look = next;
    key.intensity = look.key;
    key.position.set(look.keyX, look.keyY, look.keyZ);
    fill.intensity = look.fill;
    low.intensity = look.low;
    gold.intensity = look.gold;
    gold2.intensity = look.goldBack;
    if (painted !== look.tone + look.inlay) {
      painted = look.tone + look.inlay;
      faceSheet(look.tone, look.inlay, font, paintSheet);
      colour.needsUpdate = true;
    }
    material.metalness = look.metalness;
    material.roughness = look.roughness;
    material.clearcoat = look.clearcoat;
    material.clearcoatRoughness = look.coatRoughness;
    if (look.relief !== relief) {
      relief = look.relief;
      coin.geometry.dispose();
      coin.geometry = profile(relief);
    }
    const before = rest;
    rest = (look.rest * Math.PI) / 180;
    if (!settle && !dragging) angle += rest - before;
    resize();
  };

  const sizer = new ResizeObserver(resize);
  sizer.observe(stage);
  resize();

  apply(look);
  await breathe();
  await renderer.compileAsync(scene, camera);
  live = true;
  paint();

  const stop = () => {
    cancelAnimationFrame(frame);
    sizer.disconnect();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
    normal.dispose();
    colour.dispose();
    coin.geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return { stop, tune: apply };
}
