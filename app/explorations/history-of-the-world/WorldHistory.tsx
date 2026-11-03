"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  geoDistance,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoPermissibleObjects,
} from "d3-geo";
import {
  END,
  ERAS,
  eraOf,
  EVENTS,
  position,
  START,
  yearAt,
  yearLabel,
  type HistoryEvent,
  type LatLon,
} from "./events";
import landData from "./land.json";
import styles from "./world.module.css";

const LAND = landData as unknown as GeoPermissibleObjects;
const GRATICULE = geoGraticule10();
const SPHERE: GeoPermissibleObjects = { type: "Sphere" };
const PLAY_MS = 7000;
const FLY_MS = 1400;

type Center = [number, number]; // [lon, lat] at the middle of the globe

const toLonLat = ([lat, lon]: LatLon): [number, number] => [lon, lat];
const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const fixed = (n: number) => n.toFixed(4);

/** The part of a route travelled after `t` (0 to 1) of its length. */
function partialRoute(route: LatLon[], t: number): [number, number][] {
  const pts = route.map(toLonLat);
  if (t >= 1 || pts.length < 2) return pts;
  const legs = pts.slice(1).map((p, i) => geoDistance(pts[i], p));
  const total = legs.reduce((a, b) => a + b, 0);
  let left = total * t;
  const out: [number, number][] = [pts[0]];
  for (let i = 0; i < legs.length; i++) {
    if (left >= legs[i]) {
      out.push(pts[i + 1]);
      left -= legs[i];
    } else {
      const f = legs[i] === 0 ? 0 : left / legs[i];
      out.push(geoInterpolate(pts[i], pts[i + 1])(f) as [number, number]);
      break;
    }
  }
  return out;
}

/** Where the globe should look to frame an event (the middle of its route). */
function focusOf(ev: HistoryEvent): Center {
  if (!ev.route) return toLonLat(ev.at);
  const pts = ev.route.map(toLonLat);
  // Average on the unit sphere so routes across the antimeridian behave.
  let x = 0,
    y = 0,
    z = 0;
  for (const [lon, lat] of pts) {
    const l = (lon * Math.PI) / 180,
      p = (lat * Math.PI) / 180;
    x += Math.cos(p) * Math.cos(l);
    y += Math.cos(p) * Math.sin(l);
    z += Math.sin(p);
  }
  const lon = (Math.atan2(y, x) * 180) / Math.PI;
  const lat = (Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI;
  return [lon, lat];
}

/** How far to zoom out so a whole route fits on the visible hemisphere. */
function zoomFor(ev: HistoryEvent): number {
  if (!ev.route) return 1.35;
  const c = focusOf(ev);
  const spread = Math.max(
    ...ev.route.map((p) => geoDistance(c, toLonLat(p))),
  );
  if (spread > 1.2) return 1;
  if (spread > 0.7) return 1.15;
  if (spread > 0.35) return 1.4;
  return 1.5;
}

export default function WorldHistory() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scrub, setScrub] = useState<number | null>(null);
  const active = EVENTS[index];
  const era = eraOf(active.year);

  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const sphereRef = useRef<SVGPathElement>(null);
  const gratRef = useRef<SVGPathElement>(null);
  const landRef = useRef<SVGPathElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const routeTrailRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const markerRefs = useRef<(SVGGElement | null)[]>([]);
  const labelRef = useRef<SVGGElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const view = useRef({
    center: focusOf(EVENTS[0]) as Center,
    zoom: zoomFor(EVENTS[0]),
    size: [800, 800] as [number, number],
    routeT: 1,
    raf: 0,
    anim: null as null | {
      from: Center;
      to: Center;
      z0: number;
      z1: number;
      start: number;
    },
  });
  const activeRef = useRef(index);
  useLayoutEffect(() => {
    activeRef.current = index;
  }, [index]);

  const draw = useCallback(() => {
    const v = view.current;
    const [w, h] = v.size;
    const radius = Math.min(w, h) * 0.44 * v.zoom;
    const projection = geoOrthographic()
      .scale(radius)
      .translate([w / 2, h / 2])
      .rotate([-v.center[0], -v.center[1]])
      .clipAngle(90)
      .precision(0.4);
    const path = geoPath(projection);

    sphereRef.current?.setAttribute("d", path(SPHERE) ?? "");
    gratRef.current?.setAttribute("d", path(GRATICULE) ?? "");
    landRef.current?.setAttribute("d", path(LAND) ?? "");

    const ev = EVENTS[activeRef.current];
    if (ev.route) {
      const full = { type: "LineString", coordinates: ev.route.map(toLonLat) };
      const part = partialRoute(ev.route, v.routeT);
      routeTrailRef.current?.setAttribute(
        "d",
        path(full as GeoPermissibleObjects) ?? "",
      );
      routeRef.current?.setAttribute(
        "d",
        path({ type: "LineString", coordinates: part } as GeoPermissibleObjects) ??
          "",
      );
      const head = part[part.length - 1];
      const hp = projection(head);
      const visible = geoDistance(head, v.center) < Math.PI / 2;
      if (headRef.current) {
        headRef.current.style.display =
          hp && visible && v.routeT < 1 ? "" : "none";
        if (hp) {
          headRef.current.setAttribute("cx", hp[0].toFixed(1));
          headRef.current.setAttribute("cy", hp[1].toFixed(1));
        }
      }
    } else {
      routeTrailRef.current?.setAttribute("d", "");
      routeRef.current?.setAttribute("d", "");
      if (headRef.current) headRef.current.style.display = "none";
    }

    EVENTS.forEach((e, i) => {
      const g = markerRefs.current[i];
      if (!g) return;
      const ll = toLonLat(e.at);
      const p = projection(ll);
      const front = geoDistance(ll, v.center) < Math.PI / 2 - 0.02;
      if (!p || !front) {
        g.style.display = "none";
        return;
      }
      g.style.display = "";
      g.setAttribute(
        "transform",
        `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`,
      );
      if (i === activeRef.current && labelRef.current) {
        labelRef.current.setAttribute(
          "transform",
          `translate(${p[0].toFixed(1)} ${p[1].toFixed(1)})`,
        );
      }
    });
    if (labelRef.current) {
      const ll = toLonLat(ev.at);
      labelRef.current.style.display =
        geoDistance(ll, v.center) < Math.PI / 2 - 0.05 ? "" : "none";
    }
  }, []);

  const loop = useCallback(function step() {
    const v = view.current;
    v.raf = 0;
    const now = performance.now();
    let more = false;
    if (v.anim) {
      const t = Math.min(1, (now - v.anim.start) / FLY_MS);
      const k = ease(t);
      v.center = geoInterpolate(v.anim.from, v.anim.to)(k) as Center;
      // Pull back a little mid-flight so long trips read as travel.
      const dist = geoDistance(v.anim.from, v.anim.to);
      const lift = Math.sin(Math.PI * k) * Math.min(0.35, dist * 0.18);
      v.zoom = v.anim.z0 + (v.anim.z1 - v.anim.z0) * k - lift;
      v.zoom = Math.max(0.8, v.zoom);
      if (t >= 1) v.anim = null;
      else more = true;
    }
    if (v.routeT < 1) {
      v.routeT = Math.min(1, v.routeT + 0.006);
      more = true;
    }
    draw();
    if (more) v.raf = requestAnimationFrame(step);
  }, [draw]);

  const kick = useCallback(() => {
    const v = view.current;
    if (!v.raf) v.raf = requestAnimationFrame(loop);
  }, [loop]);

  // Fly to each newly selected event and replay its route.
  useEffect(() => {
    const v = view.current;
    const ev = EVENTS[index];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const to = focusOf(ev);
    const z1 = zoomFor(ev);
    if (reduce) {
      v.anim = null;
      v.center = to;
      v.zoom = z1;
      v.routeT = 1;
    } else {
      v.anim = { from: v.center, to, z0: v.zoom, z1, start: performance.now() };
      v.routeT = ev.route ? 0 : 1;
    }
    kick();
  }, [index, kick]);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      view.current.size = [Math.max(1, width), Math.max(1, height)];
      svgRef.current?.setAttribute("viewBox", `0 0 ${width} ${height}`);
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    const v = view.current;
    return () => {
      cancelAnimationFrame(v.raf);
      v.raf = 0;
    };
  }, []);

  // Drag to spin, wheel to zoom.
  const drag = useRef<null | { x: number; y: number; center: Center }>(null);
  const onPointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-marker]")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    view.current.anim = null;
    drag.current = { x: e.clientX, y: e.clientY, center: view.current.center };
  };
  const onPointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    const v = view.current;
    const radius = Math.min(...v.size) * 0.44 * v.zoom;
    const k = 180 / Math.PI / radius;
    const lon = d.center[0] - (e.clientX - d.x) * k;
    const lat = Math.max(
      -80,
      Math.min(80, d.center[1] + (e.clientY - d.y) * k),
    );
    v.center = [((lon + 540) % 360) - 180, lat];
    kick();
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const v = view.current;
      v.anim = null;
      v.zoom = Math.max(0.8, Math.min(4, v.zoom * Math.exp(-e.deltaY * 0.0015)));
      kick();
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [kick]);

  const go = useCallback((i: number) => {
    setIndex(Math.max(0, Math.min(EVENTS.length - 1, i)));
  }, []);

  // Autoplay through the events.
  useEffect(() => {
    if (!playing || index >= EVENTS.length - 1) return;
    const t = window.setTimeout(() => go(index + 1), PLAY_MS);
    return () => window.clearTimeout(t);
  }, [playing, index, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setPlaying(false);
        go(activeRef.current + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setPlaying(false);
        go(activeRef.current - 1);
      } else if (e.key === " " && tag !== "BUTTON") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Scrubbing the timeline selects the latest event at or before that point.
  const scrubTo = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const year = yearAt((clientX - r.left) / r.width);
    setScrub(year);
    let i = 0;
    for (let j = 0; j < EVENTS.length; j++) if (EVENTS[j].year <= year) i = j;
    if (i !== activeRef.current) go(i);
  };
  const onTrackDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPlaying(false);
    scrubTo(e.clientX);
  };
  const onTrackMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (scrub !== null) scrubTo(e.clientX);
  };
  const onTrackUp = () => setScrub(null);

  const head = scrub ?? active.year;
  const isPlaying = playing && index < EVENTS.length - 1;

  return (
    <main className={styles.root}>
      <aside className={styles.panel}>
        <header className={styles.masthead}>
          <Link href="/" className={styles.home}>
            Neil McArdle
          </Link>
          <h1 className={styles.title}>A history of the world</h1>
          <p className={styles.lede}>
            {EVENTS.length} moments across 300,000 years, from the first
            people to the present. Drag the globe, scrub the timeline or press
            play.
          </p>
        </header>

        <article className={styles.card} aria-live="polite" key={active.id}>
          <p className={styles.era}>{era.name}</p>
          <p className={styles.when}>{active.when}</p>
          <h2 className={styles.event}>{active.title}</h2>
          <p className={styles.place}>{active.place}</p>
          <p className={styles.body}>{active.body}</p>
        </article>

        <nav className={styles.controls} aria-label="Events">
          <button
            type="button"
            className={styles.step}
            onClick={() => {
              setPlaying(false);
              go(index - 1);
            }}
            disabled={index === 0}
            aria-label="Previous event"
          >
            ←
          </button>
          <button
            type="button"
            className={styles.play}
            onClick={() => {
              if (index === EVENTS.length - 1) {
                go(0);
                setPlaying(true);
              } else setPlaying(!isPlaying);
            }}
            aria-pressed={isPlaying}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            className={styles.step}
            onClick={() => {
              setPlaying(false);
              go(index + 1);
            }}
            disabled={index === EVENTS.length - 1}
            aria-label="Next event"
          >
            →
          </button>
          <span className={styles.count}>
            {index + 1} / {EVENTS.length}
          </span>
        </nav>
      </aside>

      <div className={styles.stage} ref={stageRef}>
        <svg
          ref={svgRef}
          className={styles.globe}
          role="img"
          aria-label={`Globe centred on ${active.place}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <defs>
            <radialGradient id="whOcean" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="var(--sea-lit)" />
              <stop offset="100%" stopColor="var(--sea)" />
            </radialGradient>
          </defs>
          <path ref={sphereRef} className={styles.sphere} fill="url(#whOcean)" />
          <path ref={gratRef} className={styles.graticule} />
          <path ref={landRef} className={styles.land} />
          <path ref={routeTrailRef} className={styles.routeTrail} />
          <path ref={routeRef} className={styles.route} />
          <circle ref={headRef} className={styles.routeHead} r={4} />
          {EVENTS.map((e, i) => {
            const state =
              i === index ? "active" : e.year <= active.year ? "past" : "future";
            return (
              <g
                key={e.id}
                ref={(el) => {
                  markerRefs.current[i] = el;
                }}
                className={styles.marker}
                data-marker
                data-state={state}
                style={{ display: "none" }}
                onClick={() => {
                  setPlaying(false);
                  go(i);
                }}
              >
                <title>{`${e.when}: ${e.title}`}</title>
                <circle className={styles.hit} r={11} />
                {state === "active" && <circle className={styles.pulse} r={6} />}
                <circle className={styles.dot} r={state === "active" ? 5 : 3.2} />
              </g>
            );
          })}
          <g ref={labelRef} className={styles.label} style={{ display: "none" }}>
            <text x={12} y={4}>
              {active.place}
            </text>
          </g>
        </svg>
        <p className={styles.hint}>Drag to turn · scroll to zoom</p>
      </div>

      <section className={styles.timeline} aria-label="Timeline">
        <div
          className={styles.track}
          ref={trackRef}
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
          onPointerCancel={onTrackUp}
        >
          <div className={styles.eras}>
            {ERAS.map((e) => {
              const first = EVENTS.findIndex((ev) => ev.year >= e.from);
              return (
                <button
                  key={e.id}
                  type="button"
                  className={styles.eraBand}
                  data-on={e.id === era.id || undefined}
                  style={
                    {
                      "--a": fixed(position(e.from)),
                      "--b": fixed(position(e.to)),
                    } as CSSProperties
                  }
                  onClick={() => {
                    setPlaying(false);
                    go(first);
                  }}
                >
                  <span>{e.name}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.ticks}>
            {EVENTS.map((e, i) => (
              <button
                key={e.id}
                type="button"
                className={styles.tick}
                data-state={
                  i === index ? "active" : e.year <= active.year ? "past" : "future"
                }
                style={{ "--p": fixed(position(e.year)) } as CSSProperties}
                aria-label={`${e.when}: ${e.title}`}
                title={`${e.when}: ${e.title}`}
                onClick={() => {
                  setPlaying(false);
                  go(i);
                }}
              />
            ))}
            <div
              className={styles.playhead}
              data-scrub={scrub !== null || undefined}
              style={{ "--p": fixed(position(head)) } as CSSProperties}
            >
              <span>{scrub !== null ? yearLabel(scrub) : active.when}</span>
            </div>
          </div>
          <div className={styles.scale} aria-hidden>
            <span>{yearLabel(START)}</span>
            <span style={{ "--p": fixed(position(-10000)) } as CSSProperties}>
              10,000 BCE
            </span>
            <span style={{ "--p": fixed(position(0)) } as CSSProperties}>
              1 CE
            </span>
            <span style={{ "--p": fixed(position(1500)) } as CSSProperties}>
              1500
            </span>
            <span>{END}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
