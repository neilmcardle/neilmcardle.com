"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./home.module.css";

const MODEL = "/home/play/cs6-book.glb";
const OPEN_MS = 700;
const CLOSE_MS = 420;

type Hinge = {
  node: { rotation: { z: number } };
  base: number;
  reach: number;
  delay: number;
};

export default function BookCard({ image }: { image: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = box.current;
    if (!near || !el) return;
    let cancelled = false;
    let raf = 0;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } =
        await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { RoomEnvironment } =
        await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (cancelled) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const canvas = renderer.domElement;
      canvas.className = styles.toyFrame;
      el.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
      const pivot = new THREE.Group();
      scene.add(pivot);

      const gltf = await new GLTFLoader().loadAsync(MODEL);
      if (cancelled) {
        renderer.dispose();
        return;
      }
      const book = gltf.scene;
      const bounds = new THREE.Box3().setFromObject(book);
      const centre = bounds.getCenter(new THREE.Vector3());
      const size = bounds.getSize(new THREE.Vector3()).length();
      book.position.sub(centre);
      const restX = book.position.x;
      const halfWidth = bounds.getSize(new THREE.Vector3()).x / 2;
      pivot.add(book);
      camera.position.set(0, size * 0.92, size * 1.02);
      camera.lookAt(0, -size * 0.06, 0);

      const hinges: Hinge[] = [];
      const cover = book.getObjectByName("cover_hinge");
      if (cover)
        hinges.push({
          node: cover,
          base: cover.rotation.z,
          reach: 1,
          delay: 0,
        });
      for (let i = 0; i < 5; i++) {
        const leaf = book.getObjectByName(`leaf_hinge_${i}`);
        if (leaf)
          hinges.push({
            node: leaf,
            base: leaf.rotation.z,
            reach: 0.985 - i * 0.012,
            delay: 0.08 + i * 0.05,
          });
      }
      const curls: { morphTargetInfluences?: number[] }[] = [];
      book.traverse((child) => {
        const mesh = child as unknown as { morphTargetInfluences?: number[] };
        if (mesh.morphTargetInfluences?.length) curls.push(mesh);
      });

      const resize = () => {
        const w = el.clientWidth;
        renderer.setSize(w, w, false);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(el);

      let spin = -0.5;
      let spinTarget = -0.5;
      let open = 0;
      let from = 0;
      let to = 0;
      let started = 0;
      let duration = OPEN_MS;
      let drag: { x: number; spin: number; moved: boolean } | null = null;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeIn = (t: number) => t * t * t;

      const toggle = () => {
        from = open;
        to = to > 0.5 ? 0 : 1;
        duration = to ? OPEN_MS : CLOSE_MS;
        started = performance.now();
      };

      const down = (e: PointerEvent) => {
        drag = { x: e.clientX, spin: spinTarget, moved: false };
        canvas.setPointerCapture(e.pointerId);
      };
      const move = (e: PointerEvent) => {
        if (!drag) return;
        const dx = e.clientX - drag.x;
        if (Math.abs(dx) > 4) drag.moved = true;
        spinTarget = drag.spin + dx / 120;
      };
      const up = () => {
        if (drag && !drag.moved) toggle();
        drag = null;
      };
      const key = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        } else if (e.key === "ArrowLeft") spinTarget -= 0.3;
        else if (e.key === "ArrowRight") spinTarget += 0.3;
      };
      canvas.tabIndex = 0;
      canvas.setAttribute("role", "button");
      canvas.setAttribute(
        "aria-label",
        "The Illustrator CS6 book. Press to open or close it, or use the arrow keys to turn it.",
      );
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("keydown", key);

      const tick = (now: number) => {
        if (to !== from || started) {
          const t = Math.min(1, (now - started) / duration);
          const k = reduced.matches ? 1 : to ? easeOut(t) : easeIn(t);
          open = from + (to - from) * k;
          if (t >= 1) {
            from = to;
            started = 0;
          }
        }
        spin += (spinTarget - spin) * (reduced.matches ? 1 : 0.18);
        pivot.rotation.y = spin;
        book.position.x = restX + halfWidth * 0.5 * open;
        for (const h of hinges) {
          const local = Math.min(
            1,
            Math.max(0, (open - h.delay) / (1 - h.delay)),
          );
          h.node.rotation.z = h.base + Math.PI * h.reach * local;
        }
        for (const c of curls)
          if (c.morphTargetInfluences)
            c.morphTargetInfluences[0] = open * (1 - open);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      canvas.classList.add(styles.on);
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        canvas.removeEventListener("keydown", key);
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [near]);

  return (
    <div ref={box} className={styles.toyCard}>
      <img
        className={`${styles.toyStill} ${ready ? styles.hidden : ""}`}
        src={image}
        alt=""
        width={720}
        height={720}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}
