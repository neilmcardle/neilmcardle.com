"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { N_MARK_SHAPE } from "@/components/home/ProductBadge";

const SHARED = /* glsl */ `
uniform float uPhase;
uniform float uDir;
uniform float uTime;
uniform float uScatter;
uniform float uSwirl;
uniform float uTurb;
uniform float uTrail;
uniform float uSweep;
uniform float uMinX;
uniform float uMaxX;
attribute vec3 home;
attribute vec3 seed;
attribute float rnd;
varying float vAlpha;

vec3 flow(vec3 x, float t) {
  return vec3(
    sin(x.y * 1.7 + t) + sin(x.z * 2.3 - t * 0.7),
    sin(x.z * 1.3 + t * 1.1) + sin(x.x * 2.1 + t * 0.5),
    sin(x.x * 1.9 - t * 0.9) + sin(x.y * 1.1 + t * 0.3)
  ) * 0.5;
}

float progress(float phase) {
  float span = uSweep * 0.9;
  float along = clamp((home.x - uMinX) / (uMaxX - uMinX), 0.0, 1.0);
  float delay = along * span * 0.75 + rnd * span * 0.25;
  float p = clamp(phase * (1.0 + span) - delay, 0.0, 1.0);
  return p * p * (3.0 - 2.0 * p);
}

vec3 place(float e, float t) {
  vec3 wind = vec3(0.9, 0.5, -0.3);
  vec3 q = home + e * uScatter * (wind + seed * 1.5);
  return q + e * uSwirl * 0.9 * flow(q * uTurb, t);
}
`;

const POINT_VERTEX = /* glsl */ `
${SHARED}
uniform float uSize;
uniform float uPixelRatio;

void main() {
  float e = progress(uPhase);
  vec4 view = modelViewMatrix * vec4(place(e, uTime), 1.0);
  gl_Position = projectionMatrix * view;
  gl_PointSize = uSize * uPixelRatio * (4.0 / -view.z);
  vAlpha = mix(0.85, 0.08, e);
}
`;

const LINE_VERTEX = /* glsl */ `
${SHARED}
attribute float tail;
uniform float uLineAlpha;

void main() {
  float e = progress(uPhase);
  float eBack = progress(uPhase - uDir * uTrail * 0.12);
  vec3 head = place(e, uTime);
  vec3 back = place(eBack, uTime - uTrail * 0.35);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(mix(head, back, tail), 1.0);
  vAlpha = smoothstep(0.02, 0.3, max(e, eBack)) * uLineAlpha;
}
`;

const POINT_FRAGMENT = /* glsl */ `
uniform vec3 uInk;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  if (dot(c, c) > 0.25) discard;
  gl_FragColor = vec4(uInk, vAlpha);
}
`;

const LINE_FRAGMENT = /* glsl */ `
uniform vec3 uInk;
varying float vAlpha;

void main() {
  gl_FragColor = vec4(uInk, vAlpha);
}
`;

export type Shape = "n" | "coin";

function glyph() {
  const shapes = new SVGLoader()
    .parse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63 63">${N_MARK_SHAPE}</svg>`,
    )
    .paths.flatMap((path) => path.toShapes());
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 9,
    bevelEnabled: true,
    bevelThickness: 1.2,
    bevelSize: 0.8,
    bevelOffset: -0.8,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geometry.translate(-31.5, -31.5, -4.5);
  geometry.scale(1 / 13.5, -1 / 13.5, 1 / 13.5);
  return geometry;
}

function tile() {
  const size = 62 / 13.5;
  const half = size / 2;
  const radius = size * (10.5 / 62);
  const shape = new THREE.Shape();
  shape.moveTo(-half + radius, -half);
  shape.lineTo(half - radius, -half);
  shape.absarc(half - radius, -half + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(half, half - radius);
  shape.absarc(half - radius, half - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-half + radius, half);
  shape.absarc(
    -half + radius,
    half - radius,
    radius,
    Math.PI / 2,
    Math.PI,
    false,
  );
  shape.lineTo(-half, -half + radius);
  shape.absarc(
    -half + radius,
    -half + radius,
    radius,
    Math.PI,
    Math.PI * 1.5,
    false,
  );
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.28,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 12,
  });
  geometry.translate(0, 0, -0.14);
  return geometry;
}

function sample(shape: Shape, count: number) {
  const n = glyph();
  const source = shape === "coin" ? mergeGeometries([n, tile()]) : n;
  const sampler = new MeshSurfaceSampler(new THREE.Mesh(source)).build();
  const point = new THREE.Vector3();
  const home = new Float32Array(count * 3);
  const seed = new Float32Array(count * 3);
  const rnd = new Float32Array(count);
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < count; i += 1) {
    sampler.sample(point);
    home.set([point.x, point.y, point.z], i * 3);
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(1 - u * u);
    const reach = 0.4 + Math.random() * 0.9;
    seed.set(
      [r * Math.cos(a) * reach, r * Math.sin(a) * reach, u * reach],
      i * 3,
    );
    rnd[i] = Math.random();
  }
  source.dispose();
  n.dispose();
  return { home, seed, rnd, minX, maxX };
}

function buffers(data: ReturnType<typeof sample>) {
  const count = data.rnd.length;
  const points = new THREE.BufferGeometry();
  points.setAttribute("position", new THREE.BufferAttribute(data.home, 3));
  points.setAttribute("home", new THREE.BufferAttribute(data.home, 3));
  points.setAttribute("seed", new THREE.BufferAttribute(data.seed, 3));
  points.setAttribute("rnd", new THREE.BufferAttribute(data.rnd, 1));

  const home = new Float32Array(count * 6);
  const seed = new Float32Array(count * 6);
  const rnd = new Float32Array(count * 2);
  const tailFlag = new Float32Array(count * 2);
  for (let i = 0; i < count; i += 1) {
    for (let side = 0; side < 2; side += 1) {
      const v = i * 2 + side;
      home.set(data.home.subarray(i * 3, i * 3 + 3), v * 3);
      seed.set(data.seed.subarray(i * 3, i * 3 + 3), v * 3);
      rnd[v] = data.rnd[i];
      tailFlag[v] = side;
    }
  }
  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(home, 3));
  lines.setAttribute("home", new THREE.BufferAttribute(home, 3));
  lines.setAttribute("seed", new THREE.BufferAttribute(seed, 3));
  lines.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
  lines.setAttribute("tail", new THREE.BufferAttribute(tailFlag, 1));
  return { points, lines };
}

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;

export type NSettings = {
  loop: boolean;
  distance: number;
  hold: number;
  scatterTime: number;
  returnTime: number;
  sweep: number;
  swirl: number;
  turbulence: number;
  flowSpeed: number;
  trail: number;
  shape: Shape;
  particles: number;
  dotSize: number;
  strokes: number;
  ink: string;
  grain: number;
  orbit: number;
  tilt: number;
  zoom: number;
  autoRotate: boolean;
  rotateSpeed: number;
};

export const N_DEFAULTS: NSettings = {
  loop: true,
  distance: 1.8,
  hold: 1.4,
  scatterTime: 2.6,
  returnTime: 2.8,
  sweep: 0.15,
  swirl: 2.5,
  turbulence: 0.3,
  flowSpeed: 1.9,
  trail: 0.1,
  shape: "n",
  particles: 40000,
  dotSize: 1.6,
  strokes: 0.1,
  ink: "#1f1d1a",
  grain: 0.35,
  orbit: -28,
  tilt: 12,
  zoom: 1,
  autoRotate: true,
  rotateSpeed: 0.12,
};

export default function NParticles({
  settings = N_DEFAULTS,
  replay = 0,
  interactive = true,
  className,
}: {
  settings?: NSettings;
  replay?: number;
  interactive?: boolean;
  className?: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const replayRef = useRef<() => void>(() => {});
  const valuesRef = useRef(settings);

  useEffect(() => {
    valuesRef.current = settings;
  });

  useEffect(() => {
    if (replay) replayRef.current();
  }, [replay]);

  const shape = settings.shape;
  const count = settings.particles;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    stage.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      touchAction: interactive ? "none" : "auto",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

    const uniforms = {
      uPhase: { value: 0 },
      uDir: { value: 0 },
      uTime: { value: 0 },
      uScatter: { value: 1.8 },
      uSwirl: { value: 1.3 },
      uTurb: { value: 1.1 },
      uTrail: { value: 0.8 },
      uSweep: { value: 0.6 },
      uMinX: { value: -1 },
      uMaxX: { value: 1 },
      uSize: { value: 1.6 },
      uLineAlpha: { value: 0.1 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uInk: { value: new THREE.Color("#1f1d1a") },
    };
    const pointMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: POINT_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      transparent: true,
      depthWrite: false,
    });
    const lineMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: LINE_VERTEX,
      fragmentShader: LINE_FRAGMENT,
      transparent: true,
      depthWrite: false,
    });

    const data = sample(shape, count);
    uniforms.uMinX.value = data.minX;
    uniforms.uMaxX.value = data.maxX;
    const geometry = buffers(data);
    const group = new THREE.Group();
    group.add(new THREE.LineSegments(geometry.lines, lineMaterial));
    group.add(new THREE.Points(geometry.points, pointMaterial));
    scene.add(group);

    const dustPositions = new Float32Array(900 * 3);
    for (let i = 0; i < dustPositions.length; i += 1)
      dustPositions[i] = (Math.random() * 2 - 1) * 7;
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(dustPositions, 3),
    );
    const dustMaterial = new THREE.PointsMaterial({
      color: "#1f1d1a",
      size: 1.6,
      sizeAttenuation: false,
      transparent: true,
      depthWrite: false,
    });
    scene.add(new THREE.Points(dustGeometry, dustMaterial));

    const resize = () => {
      const { width, height } = stage.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const sizer = new ResizeObserver(resize);
    sizer.observe(stage);
    resize();

    const cycle = {
      stage: "hold" as "hold" | "out" | "drift" | "back",
      start: 0,
    };
    let clock = performance.now() / 1000;
    let yaw = 0;
    let dragYaw = 0;
    let dragTilt = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let onScreen = true;
    let frame = 0;

    replayRef.current = () => {
      cycle.stage = "out";
      cycle.start = performance.now() / 1000;
      kick();
    };

    const onDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      dragYaw += (event.clientX - lastX) * 0.4;
      dragTilt = Math.max(
        -40,
        Math.min(40, dragTilt + (event.clientY - lastY) * 0.3),
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onUp = () => {
      dragging = false;
    };
    if (interactive) {
      renderer.domElement.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    }

    const phaseAt = (now: number) => {
      const v = valuesRef.current;
      const loop = v.loop && !reduced;
      const elapsed = now - cycle.start;
      const lengths = {
        hold: v.hold,
        out: v.scatterTime,
        drift: v.hold * 0.6,
        back: v.returnTime,
      };
      if (elapsed >= lengths[cycle.stage]) {
        const next = {
          hold: "out",
          out: "drift",
          drift: "back",
          back: "hold",
        } as const;
        if (cycle.stage === "hold" && !loop) return { phase: 0, dir: 0 };
        cycle.stage = next[cycle.stage];
        cycle.start = now;
      }
      const t = Math.min(
        1,
        (now - cycle.start) / Math.max(0.001, lengths[cycle.stage]),
      );
      if (cycle.stage === "out") return { phase: ease(t), dir: 1 };
      if (cycle.stage === "drift") return { phase: 1, dir: 0 };
      if (cycle.stage === "back") return { phase: 1 - ease(t), dir: -1 };
      return { phase: 0, dir: 0 };
    };

    const draw = () => {
      frame = 0;
      const now = performance.now() / 1000;
      const delta = Math.min(0.1, now - clock);
      clock = now;
      const v = valuesRef.current;
      const { phase, dir } = phaseAt(now);
      uniforms.uPhase.value = phase;
      uniforms.uDir.value = dir;
      uniforms.uTime.value += delta * v.flowSpeed * (reduced ? 0 : 1);
      uniforms.uScatter.value = v.distance;
      uniforms.uSweep.value = v.sweep;
      uniforms.uSwirl.value = v.swirl;
      uniforms.uTurb.value = v.turbulence;
      uniforms.uTrail.value = v.trail;
      uniforms.uSize.value = v.dotSize;
      uniforms.uLineAlpha.value = v.strokes;
      uniforms.uInk.value.set(v.ink);
      dustMaterial.color.set(v.ink);
      dustMaterial.opacity = v.grain * 0.5;

      if (v.autoRotate && !reduced && !dragging)
        yaw += delta * v.rotateSpeed * 20;
      const theta = THREE.MathUtils.degToRad(v.orbit + yaw + dragYaw);
      const phi = THREE.MathUtils.degToRad(v.tilt + dragTilt);
      const distance = 9 / v.zoom;
      camera.position.set(
        Math.sin(theta) * Math.cos(phi) * distance,
        Math.sin(phi) * distance,
        Math.cos(theta) * Math.cos(phi) * distance,
      );
      camera.lookAt(0.3, 0, 0);
      renderer.render(scene, camera);
      if (onScreen) frame = requestAnimationFrame(draw);
    };

    function kick() {
      if (!frame && onScreen) frame = requestAnimationFrame(draw);
    }

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) {
        clock = performance.now() / 1000;
        kick();
      }
    });
    visibility.observe(stage);

    cycle.start = performance.now() / 1000;
    draw();

    return () => {
      cancelAnimationFrame(frame);
      visibility.disconnect();
      sizer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      geometry.points.dispose();
      geometry.lines.dispose();
      dustGeometry.dispose();
      pointMaterial.dispose();
      lineMaterial.dispose();
      dustMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      replayRef.current = () => {};
    };
  }, [shape, count, interactive]);

  return (
    <div
      ref={stageRef}
      className={className}
      role="img"
      aria-label="The N logomark drawn in particles that scatter and reform"
    />
  );
}
