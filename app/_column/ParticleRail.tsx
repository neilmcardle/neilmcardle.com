"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";
import {
  Mark,
  PER_ICON,
  samplePoints,
  type OrbitMark,
} from "@/app/_orbit/Orbit";
import { FRAGMENT, INK, VERTEX } from "@/app/_orbit/particles";
import styles from "./column.module.css";
import { targetFor } from "./targets";

type RailItem = { id: string; name: string; mark: OrbitMark; group: string };

const WIDE = "(min-width: 1200px)";

export default function ParticleRail({ items }: { items: RailItem[] }) {
  const [wide, setWide] = useState(false);
  const [hot, setHot] = useState<number | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const railRef = useRef<HTMLElement>(null);
  const glyphRefs = useRef<(SVGSVGElement | null)[]>([]);
  const live = useRef({
    hot: null as number | null,
    active: null as number | null,
  });

  useEffect(() => {
    live.current = { hot, active };
  }, [hot, active]);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const sync = () => setWide(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!wide || !rail) return;
    const place = () => {
      const title = document.querySelector("[data-group] h2");
      if (!title) return;
      const box = title.getBoundingClientRect();
      const top = box.top + box.height / 2 + window.scrollY;
      rail.style.setProperty("--top", `${Math.round(top)}px`);
      rail.dataset.placed = "";
    };
    place();
    const sizer = new ResizeObserver(place);
    sizer.observe(document.body);
    return () => sizer.disconnect();
  }, [wide]);

  useEffect(() => {
    if (!wide) return;
    let frame = 0;
    const spy = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current: number | null = null;
      items.forEach((item, i) => {
        const target = targetFor(item.id);
        if (target && target.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };
    spy();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [wide, items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const rail = railRef.current;
    if (!wide || !canvas || !rail) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const count = items.length;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true,
      });
    } catch {
      return;
    }
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
    const uniforms = {
      uForm: { value: new Array<number>(count).fill(0) },
      uCenter: {
        value: Array.from({ length: count }, () => new THREE.Vector2()),
      },
      uScale: { value: 1 },
      uTime: { value: 0 },
      uDot: { value: 1.4 * dpr },
      uInk: { value: new THREE.Color(INK) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      defines: { COUNT: count },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    const form = new Float32Array(count);
    let geometry: THREE.BufferGeometry | null = null;
    let cancelled = false;

    Promise.all(
      items.map((item, i) => samplePoints(item.mark, glyphRefs.current[i])),
    ).then((sets) => {
      if (cancelled) return;
      const total = count * PER_ICON;
      const icon = new Float32Array(total);
      const logo = new Float32Array(total * 2);
      const sphere = new Float32Array(total * 3);
      const rnd = new Float32Array(total);
      sets.forEach((set, i) => {
        for (let k = 0; k < PER_ICON; k += 1) {
          const p = i * PER_ICON + k;
          icon[p] = i;
          logo[p * 2] = set ? set[k * 2] : 0;
          logo[p * 2 + 1] = set ? set[k * 2 + 1] : 0;
          const u = Math.random() * 2 - 1;
          const a = Math.random() * Math.PI * 2;
          const ring = Math.sqrt(1 - u * u);
          const shell = 1 - Math.random() * 0.06;
          sphere[p * 3] = ring * Math.cos(a) * shell;
          sphere[p * 3 + 1] = u * shell;
          sphere[p * 3 + 2] = ring * Math.sin(a) * shell;
          rnd[p] = Math.random();
        }
      });
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array(total * 3), 3),
      );
      geometry.setAttribute("icon", new THREE.BufferAttribute(icon, 1));
      geometry.setAttribute("logo", new THREE.BufferAttribute(logo, 2));
      geometry.setAttribute("sphere", new THREE.BufferAttribute(sphere, 3));
      geometry.setAttribute("rnd", new THREE.BufferAttribute(rnd, 1));
      const points = new THREE.Points(geometry, material);
      points.frustumCulled = false;
      scene.add(points);
      setReady(true);
    });

    const place = () => {
      const box = canvas.getBoundingClientRect();
      renderer.setSize(box.width, box.height, false);
      camera.right = box.width;
      camera.bottom = box.height;
      camera.updateProjectionMatrix();
      const buttons = rail.querySelectorAll<HTMLElement>("[data-node]");
      buttons.forEach((button, i) => {
        const r = button.getBoundingClientRect();
        uniforms.uCenter.value[i].set(
          r.left + r.width / 2 - box.left,
          r.top + r.height / 2 - box.top,
        );
        if (i === 0) uniforms.uScale.value = r.width;
      });
    };
    const sizer = new ResizeObserver(place);
    sizer.observe(rail);
    place();

    let frame = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!reduced) uniforms.uTime.value += dt;
      const { hot: h, active: a } = live.current;
      for (let i = 0; i < count; i += 1) {
        const on = i === h || (h === null && i === a) ? 1 : 0;
        form[i] = reduced ? on : form[i] + (on - form[i]) * Math.min(1, dt * 3);
        uniforms.uForm.value[i] = form[i];
      }
      if (geometry) renderer.render(scene, camera);
      frame = document.hidden ? 0 : requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const onVisible = () => {
      if (!document.hidden && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      sizer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      geometry?.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [wide, items]);

  const go = (index: number) => {
    const item = items[index];
    const target = targetFor(item.id);
    if (!target) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      block: "start",
      behavior: reduced ? "instant" : "smooth",
    });
    const url = new URL(window.location.href);
    url.searchParams.set("work", item.id);
    window.history.replaceState(window.history.state, "", url);
  };

  if (!wide) return null;

  return (
    <nav
      ref={railRef}
      className={styles.rail}
      style={
        {
          "--n": items.length,
          "--g": items.filter(
            (item, i) => i > 0 && items[i - 1].group !== item.group,
          ).length,
        } as CSSProperties
      }
      aria-label="Work"
      data-ready={ready || undefined}
    >
      <canvas
        ref={canvasRef}
        className={styles.railCanvas}
        aria-hidden="true"
      />
      <ul>
        {items.map((item, i) => (
          <li
            key={item.id}
            data-gap={(i > 0 && items[i - 1].group !== item.group) || undefined}
          >
            <button
              type="button"
              data-node
              className={styles.railNode}
              aria-label={item.name}
              aria-current={active === i ? "true" : undefined}
              data-on={hot === i || (hot === null && active === i) || undefined}
              onPointerEnter={() => setHot(i)}
              onPointerLeave={() =>
                setHot((current) => (current === i ? null : current))
              }
              onFocus={() => setHot(i)}
              onBlur={() =>
                setHot((current) => (current === i ? null : current))
              }
              onClick={() => go(i)}
            >
              <span className={styles.railGlyph} aria-hidden="true">
                <span
                  ref={(el) => {
                    glyphRefs.current[i] = el?.querySelector("svg") ?? null;
                  }}
                >
                  <Mark mark={item.mark} />
                </span>
              </span>
              <span className={styles.railLabel} aria-hidden="true">
                {item.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
