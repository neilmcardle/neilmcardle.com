import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const MARK = [
  "M45 45L32 31.2985V18H45V45Z",
  "M18 18L32 31.6343L32 45L18 45L18 18Z",
];
const SIZE = 512;
const RADIUS = 1;
const THICK = 0.13;
const RELIEF = 0.035;
const FIELD = 0.5;
const RIM = 1;
const REST = 0;
const SLOPE = 4;

const sheet = () => {
  const c = document.createElement("canvas");
  c.width = c.height = SIZE;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("no canvas");
  return { c, ctx };
};

const grey = (v: number) => {
  const g = Math.round(Math.min(1, Math.max(0, v)) * 255);
  return `rgb(${g} ${g} ${g})`;
};

function base(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = grey(RIM);
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = grey(FIELD);
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE * 0.445, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = grey(FIELD + 0.16);
  ctx.lineWidth = SIZE * 0.006;
  ctx.beginPath();
  ctx.arc(SIZE / 2, SIZE / 2, SIZE * 0.415, 0, Math.PI * 2);
  ctx.stroke();
}

function soften(c: HTMLCanvasElement, px: number) {
  const out = sheet();
  out.ctx.filter = `blur(${px}px)`;
  out.ctx.drawImage(c, 0, 0);
  return out;
}

function logoHeight() {
  const { c, ctx } = sheet();
  base(ctx);
  const side = SIZE * 0.5;
  ctx.save();
  ctx.translate(SIZE / 2 - side / 2, SIZE / 2 - side / 2);
  ctx.scale(side / 27, side / 27);
  ctx.translate(-18, -18);
  ctx.fillStyle = grey(FIELD - 0.42);
  for (const d of MARK) ctx.fill(new Path2D(d));
  ctx.restore();
  return { c, ctx };
}

function normals(height: HTMLCanvasElement, strength: number) {
  const src = height.getContext("2d")!.getImageData(0, 0, SIZE, SIZE).data;
  const h = (x: number, y: number) => {
    const cx = Math.min(SIZE - 1, Math.max(0, x));
    const cy = Math.min(SIZE - 1, Math.max(0, y));
    return src[(cy * SIZE + cx) * 4] / 255;
  };
  const { c, ctx } = sheet();
  const out = ctx.createImageData(SIZE, SIZE);
  const o = out.data;
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * SIZE + x) * 4;
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
  t.anisotropy = 4;
  return t;
};

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

export function mountCoin(stage: HTMLElement, { still }: { still: boolean }) {
  const logo = logoHeight();

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
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const env = pmrem.fromScene(room, 0.04).texture;
  scene.environment = env;
  scene.environmentIntensity = 0.28;
  room.dispose();
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 50);
  camera.position.set(0, 0, 6.5);

  const key = new THREE.DirectionalLight(0xffffff, 0.35);
  key.position.set(-1, 5, 1.2);
  const gold = new THREE.DirectionalLight(0xffb04a, 2.2);
  gold.position.set(5, -0.6, -0.6);
  const gold2 = new THREE.DirectionalLight(0xffc670, 0.9);
  gold2.position.set(-5, -0.8, -0.6);
  const fill = new THREE.DirectionalLight(0xffffff, 0.22);
  fill.position.set(3, 3.5, 1.2);
  const low = new THREE.DirectionalLight(0xffffff, 0.2);
  low.position.set(-3, -3, 1.4);
  scene.add(key, fill, low, gold, gold2);

  const lacquer = {
    color: 0x060606,
    metalness: 0.1,
    roughness: 0.2,
    clearcoat: 0.7,
    clearcoatRoughness: 0.2,
  };

  const coin = new THREE.Group();
  const edge = new THREE.Mesh(
    new THREE.CylinderGeometry(
      RADIUS,
      RADIUS,
      THICK + RELIEF * 2,
      160,
      1,
      true,
    ),
    new THREE.MeshPhysicalMaterial({ ...lacquer, roughness: 0.22 }),
  );
  edge.rotation.x = Math.PI / 2;
  coin.add(edge);

  const maps: THREE.Texture[] = [];
  const side = (height: HTMLCanvasElement, back: boolean) => {
    const displacement = texture(soften(height, 5).c);
    const normal = texture(normals(soften(height, 1.4).c, 7));
    maps.push(displacement, normal);
    const geometry = new THREE.RingGeometry(0.0001, RADIUS, 200, 110);
    const material = new THREE.MeshPhysicalMaterial({
      ...lacquer,
      displacementMap: displacement,
      displacementScale: RELIEF,
      normalMap: normal,
      normalScale: new THREE.Vector2(1, 1),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = back ? -THICK / 2 : THICK / 2;
    if (back) mesh.rotation.y = Math.PI;
    coin.add(mesh);
    return mesh;
  };
  const front = side(logo.c, false);
  const rear = side(logo.c, true);
  scene.add(coin);

  let width = 1;
  const resize = () => {
    const box = stage.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width = box.width;
    renderer.setSize(box.width, box.height, false);
    camera.aspect = box.width / box.height;
    camera.position.z = camera.aspect >= 1 ? 6.5 : 6.5 / camera.aspect;
    camera.updateProjectionMatrix();
    paint();
  };

  let angle = REST;
  let frame = 0;
  let dragging = false;
  let downX = 0;
  let downT = 0;
  let samples: { x: number; t: number }[] = [];
  let settle: { from: number; by: number; start: number; ms: number } | null =
    null;

  const paint = () => {
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
    const k = (a - REST) / Math.PI;
    const n = dir > 0 ? Math.ceil(k) : dir < 0 ? Math.floor(k) : Math.round(k);
    return REST + n * Math.PI;
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
      const by = target - angle;
      const ms = Math.min(
        3200,
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
        angle = restNear(angle, 0) + dir * Math.PI;
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

  const sizer = new ResizeObserver(resize);
  sizer.observe(stage);
  resize();

  return () => {
    cancelAnimationFrame(frame);
    sizer.disconnect();
    canvas.removeEventListener("pointerdown", down);
    canvas.removeEventListener("pointermove", move);
    canvas.removeEventListener("pointerup", up);
    canvas.removeEventListener("pointercancel", up);
    for (const m of maps) m.dispose();
    for (const mesh of [edge, front, rear]) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    env.dispose();
    renderer.dispose();
    canvas.remove();
  };
}
