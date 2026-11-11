"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  bake,
  bayerAt,
  clamp,
  frame,
  H,
  lerp,
  light,
  N,
  partAnchor,
  partAt,
  smooth,
  W,
  windTime,
  type Baked,
} from "@/app/explorations/architecture-pixel/engine/engine";
import { SCENES } from "@/app/explorations/architecture-pixel/scenes";
import {
  BAND,
  BUILT,
  BUILT_AT,
  ERAS,
  eraAt,
  nearestBuilt,
  TICKS,
} from "./timeline";
import styles from "./pixel-timeline.module.css";
import BackLink from "@/components/BackLink";

const DAY_HOUR = 15;
const HOUR_MIN = 5;
const HOUR_MAX = 23.5;
const DAY_SPEED = (HOUR_MAX - HOUR_MIN) / 60;
const MOMENTS = [
  { name: "Dawn", hour: 6.5 },
  { name: "Noon", hour: 12.5 },
  { name: "Dusk", hour: 18.75 },
  { name: "Night", hour: 22 },
];
const along = (h: number) => ((h - HOUR_MIN) / (HOUR_MAX - HOUR_MIN)) * 100;
const FADE_MS = 400;

function sunAt(hour: number) {
  const day = smooth(5.6, 7, hour) * (1 - smooth(18.6, 20.2, hour));
  const t = clamp((hour - 6) / 13, 0, 1);
  const arc = Math.sin(Math.PI * t);
  const angle = (lerp(-80, 45, t) * Math.PI) / 180;
  const elevation = ((12 + 30 * arc) * Math.PI) / 180;
  const len = Math.min(3.2, 1 / Math.tan(elevation));
  return {
    sx: Math.cos(angle) * len,
    sy: Math.sin(angle) * len,
    day,
    night: 1 - day,
    warm: (1 - smooth(0.15, 0.5, arc)) * day,
  };
}

const named = (part: string) =>
  (part.charAt(0).toUpperCase() + part.slice(1)).replace(/'/g, "\u2019");

const clock = (hour: number) =>
  `${String(Math.floor(hour)).padStart(2, "0")}:00`;

type Picked = {
  scene: string;
  cut: boolean;
  part: number;
  ix: number;
  iy: number;
};
type Sheet = "about" | "light" | "parts" | null;
type Runtime = {
  scene: number;
  hour: number;
  exact: number;
  playing: boolean;
  decided: boolean;
  last: number;
  selected: number;
  hover: number;
  still: boolean;
  cut: boolean;
};

export default function PixelTimeline() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cacheRef = useRef(new Map<string, Baked>());
  const runtime = useRef<Runtime>({
    scene: 0,
    hour: DAY_HOUR,
    exact: DAY_HOUR,
    playing: true,
    decided: false,
    last: 0,
    selected: 0,
    hover: 0,
    still: false,
    cut: false,
  });
  const press = useRef<{
    x: number;
    y: number;
    hour: number;
    mode: "" | "swipe" | "sun";
  } | null>(null);
  const snapTimer = useRef<number | undefined>(undefined);

  const [pos, setPos] = useState(BUILT_AT[0]);
  const [hour, setHour] = useState(DAY_HOUR);
  const [playing, setPlaying] = useState(true);
  const [pickedRaw, setPicked] = useState<Picked | null>(null);
  const [size, setSize] = useState({ w: W, h: H });
  const [compact, setCompact] = useState(false);
  const [lockedRaw, setLocked] = useState(false);
  const [sheetRaw, setSheet] = useState<Sheet>(null);
  const [cutRaw, setCut] = useState(false);
  const locked = compact && lockedRaw;
  const sheet = compact ? sheetRaw : null;

  const index = nearestBuilt(pos);
  const built = BUILT[index];
  const era = ERAS[built.era];
  const scene = SCENES[built.scene];
  const cut = !!scene.cutaway && cutRaw;
  const bakeKey = `${built.scene}|${cut}`;
  const thumbEra = eraAt(pos);
  const picked =
    pickedRaw?.scene === built.scene && pickedRaw.cut === cut
      ? pickedRaw
      : null;

  useEffect(() => {
    runtime.current.scene = index;
    runtime.current.hover = 0;
  }, [index]);
  useEffect(() => {
    runtime.current.hour = hour;
    if (Math.abs(runtime.current.exact - hour) > 0.06)
      runtime.current.exact = hour;
  }, [hour]);
  useEffect(() => {
    runtime.current.playing = playing;
  }, [playing]);
  useEffect(() => {
    runtime.current.cut = cut;
    runtime.current.hover = 0;
  }, [cut]);
  useEffect(() => {
    runtime.current.selected = picked?.part ?? 0;
  }, [picked]);

  const baked = useCallback((id: string, withCut = false) => {
    const cache = cacheRef.current,
      key = `${id}|${withCut}`;
    let b = cache.get(key);
    if (!b) {
      b = bake(SCENES[id], withCut);
      cache.set(key, b);
    }
    return b;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current,
      stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = W;
    canvas.height = H;
    const image = ctx.createImageData(W, H);
    const view = new Uint32Array(image.data.buffer);
    const previous = new Uint32Array(N);
    const cache = cacheRef.current;
    let fadeStart = -1;
    let shown = "";
    let lastKey = "";
    let raf = 0;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      runtime.current.still = motion.matches;
      lastKey = "";
    };
    onMotion();
    motion.addEventListener("change", onMotion);

    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const room = Math.min(stage.clientWidth / W, stage.clientHeight / H);
      const scale = Math.max(1, Math.floor(room * dpr)) / dpr;
      setSize({ w: W * scale, h: H * scale });
    };
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    window.addEventListener("resize", fit);
    fit();

    let visible = true;
    const seen = new IntersectionObserver(([entry]) => {
      const was = visible;
      visible = entry.isIntersecting;
      if (visible && !was) raf = requestAnimationFrame(tick);
    });
    seen.observe(canvas);

    const tick = (now: number) => {
      if (!visible) return;
      raf = requestAnimationFrame(tick);
      const st = runtime.current;
      if (!st.decided) {
        st.decided = true;
        if (st.still) {
          st.playing = false;
          setPlaying(false);
        }
      }
      const dt = st.last ? Math.min(0.1, (now - st.last) / 1000) : 0;
      st.last = now;
      if (st.playing) {
        st.exact += dt * DAY_SPEED;
        if (st.exact > HOUR_MAX) st.exact = HOUR_MIN;
        const q = Math.round(st.exact * 20) / 20;
        if (q !== st.hour) {
          st.hour = q;
          setHour(q);
        }
      }
      const sceneId = BUILT[st.scene].scene;
      const withCut = st.cut && !!SCENES[sceneId].cutaway;
      const t = st.still ? 0 : windTime(now / 1000);
      const view_ = `${sceneId}|${withCut}`;
      const key = `${view_}|${st.hour}|${st.selected}|${st.hover}|${t}`;
      if (key === lastKey && fadeStart < 0) return;
      lastKey = key;
      if (shown && shown !== view_) {
        if (st.still) fadeStart = -1;
        else {
          previous.set(view);
          fadeStart = now;
        }
      }
      shown = view_;
      const b = baked(sceneId, withCut);
      const sun = sunAt(st.hour);
      light(b, sun, String(st.hour));
      const out = frame(b, {
        t,
        selected: st.selected,
        hover: st.hover,
        night: sun.night,
        warm: sun.warm,
      });
      if (fadeStart >= 0) {
        const p = (now - fadeStart) / FADE_MS;
        if (p >= 1) {
          fadeStart = -1;
          view.set(out);
        } else {
          for (let i = 0; i < N; i++) {
            const ix = i % W,
              iy = (i / W) | 0;
            const gate = (bayerAt(ix, iy) + bayerAt(ix >> 2, iy >> 2) * 2) / 3;
            view[i] = gate < p ? out[i] : previous[i];
          }
        }
      } else view.set(out);
      ctx.putImageData(image, 0, 0);
    };
    raf = requestAnimationFrame(tick);

    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = (cb: () => void) =>
      hasIdle
        ? window.requestIdleCallback(cb, { timeout: 1500 })
        : window.setTimeout(cb, 300);
    const cancelIdle = (id: number) =>
      hasIdle ? window.cancelIdleCallback(id) : window.clearTimeout(id);
    let idleId = 0;
    const queue = BUILT.map((b) => b.scene);
    const warm = () => {
      const next = queue.find((id) => !cache.has(`${id}|false`));
      if (!next) return;
      baked(next);
      idleId = idle(warm);
    };
    idleId = idle(warm);

    return () => {
      cancelAnimationFrame(raf);
      cancelIdle(idleId);
      observer.disconnect();
      seen.disconnect();
      window.removeEventListener("resize", fit);
      motion.removeEventListener("change", onMotion);
      cache.clear();
    };
  }, [baked]);

  useEffect(() => {
    const wanted = new URLSearchParams(window.location.search).get("style");
    const k = BUILT.findIndex((b) => b.scene === wanted);
    if (k < 0) return;
    const id = window.setTimeout(() => setPos(BUILT_AT[k]), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 760px)");
    const onChange = () => setCompact(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement,
      before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = before;
    };
  }, [locked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (sheet) setSheet(null);
      else if (locked) setLocked(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, locked]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      setPos((p) => clamp(p + delta * 0.0012, 0, 1));
      window.clearTimeout(snapTimer.current);
      snapTimer.current = window.setTimeout(
        () => setPos((p) => BUILT_AT[nearestBuilt(p)]),
        260,
      );
    };
    track.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      track.removeEventListener("wheel", onWheel);
      window.clearTimeout(snapTimer.current);
    };
  }, []);

  const snap = () => setPos((p) => BUILT_AT[nearestBuilt(p)]);
  const jump = (dir: number) =>
    setPos(BUILT_AT[clamp(index + dir, 0, BUILT.length - 1)]);

  const pick = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ix = Math.floor(((e.clientX - rect.left) / rect.width) * W);
    const iy = Math.floor(((e.clientY - rect.top) / rect.height) * H);
    const b = cacheRef.current.get(bakeKey);
    if (!b) return;
    const part = partAt(b, ix, iy, e.pointerType === "mouse" ? 3 : 6);
    setPicked(
      part && part !== picked?.part
        ? { scene: built.scene, cut, part, ix, iy }
        : null,
    );
  };

  const down = (e: PointerEvent<HTMLCanvasElement>) => {
    press.current = { x: e.clientX, y: e.clientY, hour, mode: "" };
    if (locked) e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: PointerEvent<HTMLCanvasElement>) => {
    const start = press.current;
    if (!start || !locked) {
      if (e.pointerType === "mouse") hoverAt(e);
      return;
    }
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (!start.mode && Math.hypot(dx, dy) > 12)
      start.mode = Math.abs(dx) > Math.abs(dy) ? "swipe" : "sun";
    if (start.mode === "sun")
      setHour(clamp(Math.round((start.hour - dy * 0.045) * 4) / 4, 5, 23.5));
  };

  const up = (e: PointerEvent<HTMLCanvasElement>) => {
    const start = press.current;
    press.current = null;
    if (!start) return;
    const dx = e.clientX - start.x,
      dy = e.clientY - start.y;
    if (Math.hypot(dx, dy) <= 10) {
      if (compact && !locked) setLocked(true);
      else pick(e);
      return;
    }
    if (locked && start.mode === "swipe" && Math.abs(dx) > 40)
      jump(dx < 0 ? 1 : -1);
  };

  const hoverAt = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType !== "mouse") return;
    const b = cacheRef.current.get(bakeKey);
    if (!b) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ix = Math.floor(((e.clientX - rect.left) / rect.width) * W);
    const iy = Math.floor(((e.clientY - rect.top) / rect.height) * H);
    const part = partAt(b, ix, iy, 2);
    runtime.current.hover = part;
    e.currentTarget.style.cursor = part ? "pointer" : "default";
  };
  const hoverPart = (part: number) => {
    runtime.current.hover = part;
  };

  const choose = (part: number) => {
    if (picked?.part === part) {
      setPicked(null);
      return;
    }
    const needs = scene.cutaway
      ? scene.cutaway.inside.includes(part)
        ? true
        : scene.cutaway.removes.includes(part)
          ? false
          : cut
      : false;
    if (needs !== cut) setCut(needs);
    const b = baked(built.scene, needs);
    const at = partAnchor(b, part);
    if (at)
      setPicked({ scene: built.scene, cut: needs, part, ix: at.x, iy: at.y });
    if (compact) setSheet(null);
  };

  const parts = useMemo(
    () =>
      scene.parts
        .map((name, id) => ({ name: named(name), id }))
        .filter((p) => p.id > 0 && p.name),
    [scene],
  );
  const label = picked ? named(scene.parts[picked.part]) : "";
  const chipStyle = picked
    ? ({
        "--x": `${(picked.ix / W) * 100}%`,
        "--y": `${(picked.iy / H) * 100}%`,
        "--flip": picked.ix > W * 0.62 ? 1 : 0,
      } as CSSProperties)
    : undefined;
  const night = hour >= 19.5 || hour < 6;
  const moment = MOMENTS.reduce(
    (best, m) =>
      Math.abs(m.hour - hour) < Math.abs(best.hour - hour) ? m : best,
    MOMENTS[0],
  );
  const at = Math.abs(moment.hour - hour) <= 0.5 ? moment.name : "";

  const lede =
    "I drew a history of architecture as small pixel dioramas. Scrub through time, change the light and tap a building to name its parts.";
  const credit = (
    <>
      I adapted the pixel engine from{" "}
      <a
        href="https://github.com/amirmushichge/pixel-plays"
        target="_blank"
        rel="noopener noreferrer"
      >
        Pixel Plays
      </a>{" "}
      by Amir Mushich, MIT licence.
    </>
  );
  const playControl = (
    <span className={styles.timeRight}>
      <output className={styles.clock}>{clock(hour)}</output>
      <button
        type="button"
        className={styles.play}
        aria-pressed={!playing}
        aria-label={playing ? "Pause time" : "Play time"}
        onClick={() => setPlaying(!playing)}
      >
        {playing ? "Pause" : "Play"}
      </button>
    </span>
  );
  const sheetHead = (title: string, extra?: ReactNode) => (
    <div className={styles.sheetHead}>
      <h2 className={styles.sheetTitle}>{title}</h2>
      {extra}
      <button
        type="button"
        className={styles.close}
        onClick={() => setSheet(null)}
      >
        Close
      </button>
    </div>
  );

  return (
    <main className={styles.root} data-locked={locked || undefined}>
      <header className={styles.header}>
        <div>
          <BackLink className={styles.back}>Back to neilmcardle.com</BackLink>
          <h1 className={styles.title}>Architecture in Pixels</h1>
          <p className={styles.lede}>{lede}</p>
        </div>
        <button
          type="button"
          className={styles.about}
          aria-expanded={sheet === "about"}
          onClick={() => setSheet("about")}
        >
          About
        </button>
      </header>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.frame} style={{ width: size.w, height: size.h }}>
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: size.w, height: size.h }}
            role="img"
            aria-label={`${built.building}, drawn as a pixel diorama`}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => (press.current = null)}
            onPointerLeave={() => hoverPart(0)}
          />
          {picked && (
            <div className={styles.chip} style={chipStyle} role="status">
              {label}
            </div>
          )}
        </div>
        {scene.cutaway && (
          <button
            type="button"
            className={`${styles.toggle} ${styles.cutDesk}`}
            aria-pressed={cut}
            onClick={() => setCut(!cut)}
          >
            Cut away
          </button>
        )}
        {compact && !locked && (
          <button
            type="button"
            className={styles.explore}
            onClick={() => setLocked(true)}
          >
            Tap to explore
          </button>
        )}
        {locked && (
          <>
            <button
              type="button"
              className={styles.done}
              onClick={() => setLocked(false)}
            >
              Done
            </button>
            <p className={styles.gesture}>
              Swipe for another era. Drag up or down to move the sun.
            </p>
          </>
        )}
      </div>

      <div className={styles.readout} aria-live="polite">
        <h2 className={styles.style}>{built.style}</h2>
        <p className={styles.building}>{built.building}</p>
        <p className={styles.era}>
          <span>{era.name}</span>
          <span className={styles.range}>{era.range}</span>
        </p>
        <p className={styles.line}>{built.line}</p>
      </div>

      <div className={styles.scrubber} ref={trackRef}>
        <div className={styles.bands} aria-hidden="true">
          {ERAS.map((e, i) => (
            <span
              key={e.name}
              className={styles.band}
              data-active={i === thumbEra || undefined}
              style={{ left: `${i * BAND * 100}%`, width: `${BAND * 100}%` }}
            />
          ))}
          {TICKS.map((t) => (
            <span
              key={t.name}
              className={styles.tick}
              data-built={t.built >= 0 || undefined}
              data-current={t.built === index || undefined}
              style={{ left: `${t.at * 100}%` }}
              title={t.name}
            />
          ))}
        </div>
        <input
          className={styles.slider}
          type="range"
          min={0}
          max={1000}
          step={1}
          value={Math.round(pos * 1000)}
          aria-label="Year"
          aria-valuetext={`${built.style}, ${era.range}`}
          onChange={(e) => setPos(Number(e.target.value) / 1000)}
          onPointerUp={snap}
          onTouchEnd={snap}
          onBlur={snap}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              jump(1);
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              jump(-1);
            }
          }}
        />
        <div className={styles.dates} aria-hidden="true">
          {ERAS.map((e, i) => (
            <span
              key={e.start}
              data-on={i === thumbEra || i === 0 || undefined}
              style={{ left: `${i * BAND * 100}%` }}
            >
              {e.start}
            </span>
          ))}
          <span data-on style={{ left: "100%" }}>
            Now
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        {scene.cutaway && (
          <button
            type="button"
            className={styles.toggle}
            aria-pressed={cut}
            onClick={() => setCut(!cut)}
          >
            Cut away
          </button>
        )}
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={sheet === "light"}
          onClick={() => setSheet("light")}
        >
          Light <span className={styles.clock}>{clock(hour)}</span>
        </button>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={sheet === "parts"}
          onClick={() => setSheet("parts")}
        >
          Parts
        </button>
      </div>

      <section
        className={styles.sheet}
        data-name="light"
        data-open={sheet === "light" || undefined}
        aria-label="Light"
      >
        {sheetHead("Light", compact ? playControl : null)}
        <div className={styles.time}>
          {!compact && (
            <div className={styles.timeHead}>
              <span>Time of day</span>
              {playControl}
            </div>
          )}
          <div
            className={styles.sky}
            data-night={night || undefined}
            style={{ "--at": `${along(hour)}%` } as CSSProperties}
          >
            <input
              type="range"
              min={HOUR_MIN}
              max={HOUR_MAX}
              step={0.25}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              aria-label="Time of day"
              aria-valuetext={`${clock(hour)}${at ? `, ${at.toLowerCase()}` : ""}`}
            />
          </div>
          <div className={styles.moments}>
            {MOMENTS.map((m) => (
              <button
                key={m.name}
                type="button"
                className={styles.moment}
                aria-pressed={at === m.name}
                style={{ left: `${along(m.hour)}%` }}
                onClick={() => setHour(m.hour)}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section
        className={styles.sheet}
        data-name="parts"
        data-open={sheet === "parts" || undefined}
        aria-label="Parts"
      >
        {sheetHead("Parts")}
        <div className={styles.parts}>
          {parts.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.part}
              aria-pressed={picked?.part === p.id}
              onClick={() => choose(p.id)}
              onPointerEnter={(e) =>
                e.pointerType === "mouse" && hoverPart(p.id)
              }
              onPointerLeave={() => hoverPart(0)}
              onFocus={() => hoverPart(p.id)}
              onBlur={() => hoverPart(0)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </section>

      <section
        className={styles.sheet}
        data-name="about"
        data-open={sheet === "about" || undefined}
        aria-label="About"
      >
        {sheetHead("About")}
        <p className={styles.sheetText}>{lede}</p>
        <p className={styles.sheetText}>{credit}</p>
      </section>

      {sheet && (
        <div
          className={styles.backdrop}
          onClick={() => setSheet(null)}
          aria-hidden="true"
        />
      )}

      <footer className={styles.credit}>{credit}</footer>
    </main>
  );
}
