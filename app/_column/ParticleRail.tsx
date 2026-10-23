"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  Mark,
  PER_ICON,
  samplePoints,
  type OrbitMark,
} from "@/app/_orbit/Orbit";
import { FRAGMENT, INK, VERTEX } from "@/app/_orbit/particles";
import styles from "./column.module.css";
import { reveal, targetFor } from "./targets";

type RailItem = {
  id: string;
  name: string;
  mark: OrbitMark;
  divide?: boolean;
};

const WIDE = "(min-width: 1200px)";

function wheelAt(i: number, offset: number) {
  const d = Math.min(Math.abs(i - offset), 5);
  const fall = i < offset ? 0.6 : 0.26;
  return { scale: 1 - d * 0.085, fade: Math.max(0, 1 - d * fall) };
}

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
  const wheel = useRef({ offset: 0, row: 0 });
  const aim = useRef<number | null>(null);
  const aimTimer = useRef(0);
  const rolled = useRef<number | null>(null);

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
    const root = document.documentElement;
    const place = () => {
      const title = document.querySelector("[data-group] h2");
      const group = title?.closest<HTMLElement>("[data-group]");
      if (!title || !group) return;
      const box = title.getBoundingClientRect();
      const centre = box.top + box.height / 2 + window.scrollY;
      const offset =
        box.top - group.getBoundingClientRect().top + box.height / 2;
      rail.style.setProperty("--top", `${Math.round(centre)}px`);
      root.style.setProperty("--rail-land", `${Math.round(centre - offset)}px`);
      rail.dataset.placed = "";
    };
    place();
    const sizer = new ResizeObserver(place);
    sizer.observe(document.body);
    return () => {
      sizer.disconnect();
      root.style.removeProperty("--rail-land");
    };
  }, [wide]);

  const listOf = () => railRef.current?.querySelector<HTMLElement>("ul");

  const roll = (index: number) => {
    const list = listOf();
    if (!list) return;
    rolled.current = index;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollTo({
      top: index * wheel.current.row,
      behavior: reduced ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    const rail = railRef.current;
    const list = listOf();
    if (!wide || !rail || !list) return;
    const rows = list.querySelectorAll<HTMLElement>("[data-wheel-item]");
    let frame = 0;
    const measure = () => {
      wheel.current.row =
        rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 1;
    };
    const paint = () => {
      frame = 0;
      const offset = list.scrollTop / wheel.current.row;
      wheel.current.offset = offset;
      rows.forEach((li, i) => {
        const { scale, fade } = wheelAt(i, offset);
        li.style.opacity = String(fade);
        li.style.visibility = fade > 0.02 ? "" : "hidden";
        const node = li.firstElementChild as HTMLElement | null;
        if (node) node.style.transform = `scale(${scale})`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const touch = () => {
      rolled.current = null;
    };
    measure();
    rolled.current = aim.current ?? live.current.active ?? 0;
    list.scrollTop = rolled.current * wheel.current.row;
    paint();
    const resize = new ResizeObserver(() => {
      measure();
      paint();
    });
    resize.observe(list);
    list.addEventListener("scroll", onScroll, { passive: true });
    list.addEventListener("wheel", touch, { passive: true });
    list.addEventListener("touchmove", touch, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      list.removeEventListener("scroll", onScroll);
      list.removeEventListener("wheel", touch);
      list.removeEventListener("touchmove", touch);
    };
  }, [wide, items]);

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
      const want = current ?? 0;
      if (aim.current === want) aim.current = null;
      if (aim.current === null && rolled.current !== want) roll(want);
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
      uSize: { value: new Array<number>(count).fill(1) },
      uFade: { value: new Array<number>(count).fill(1) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      defines: { COUNT: count, WHEEL: 1 },
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

    const base = Array.from({ length: count }, () => new THREE.Vector2());
    const place = () => {
      const box = canvas.getBoundingClientRect();
      renderer.setSize(box.width, box.height, false);
      camera.right = box.width;
      camera.bottom = box.height;
      camera.updateProjectionMatrix();
      const list = rail.querySelector<HTMLElement>("ul");
      const rows = rail.querySelectorAll<HTMLElement>("[data-wheel-item]");
      if (!list) return;
      rows.forEach((li, i) => {
        const node = li.firstElementChild as HTMLElement | null;
        if (!node) return;
        base[i].set(
          list.offsetLeft +
            node.offsetLeft +
            node.offsetWidth / 2 -
            canvas.offsetLeft,
          list.offsetTop +
            node.offsetTop +
            node.offsetHeight / 2 -
            canvas.offsetTop,
        );
        if (i === 0) uniforms.uScale.value = node.offsetWidth;
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
      const { offset, row } = wheel.current;
      for (let i = 0; i < count; i += 1) {
        const { scale, fade } = wheelAt(i, offset);
        uniforms.uCenter.value[i].set(base[i].x, base[i].y - offset * row);
        uniforms.uSize.value[i] = scale;
        uniforms.uFade.value[i] = fade;
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
    reveal(target);
    aim.current = index;
    roll(index);
    window.clearTimeout(aimTimer.current);
    aimTimer.current = window.setTimeout(() => {
      if (aim.current !== index) return;
      aim.current = null;
      roll(live.current.active ?? index);
    }, 1600);
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

  const stepTo = (index: number) => {
    if (index < 0 || index >= items.length) return;
    go(index);
    railRef.current
      ?.querySelectorAll<HTMLElement>("[data-node]")
      [index]?.focus({ preventScroll: true });
  };

  if (!wide) return null;

  return (
    <nav
      ref={railRef}
      className={styles.rail}
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
          <li key={item.id} data-wheel-item>
            <button
              type="button"
              data-node
              data-divide={item.divide || undefined}
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
              onKeyDown={(event) => {
                if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
                  return;
                event.preventDefault();
                stepTo(i + (event.key === "ArrowDown" ? 1 : -1));
              }}
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
