"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { hash, useActive, usePrefersReducedMotion } from "../lib";
import s from "./ajax.module.css";

const TILE = 256;
const ZMIN = 0;
const ZMAX = 3;

type Place = { name: string; street: string; x: number; y: number };

const PLACES: Record<string, Place[]> = {
  coffee: [
    { name: "Bean There", street: "14 Market St", x: 81, y: 54 },
    { name: "The Grind House", street: "201 River Rd", x: -117, y: 27 },
    { name: "Halfway Café", street: "9 Mill Lane", x: 18, y: -104 },
    { name: "Drip & Draw", street: "77 Canal Walk", x: 189, y: -36 },
  ],
  pizza: [
    { name: "Slice of Life", street: "3 Market St", x: -54, y: -18 },
    { name: "Forno Rosso", street: "48 High St", x: 135, y: 117 },
    { name: "Crust & Crumb", street: "12 Bridge St", x: -171, y: -94 },
  ],
  books: [
    { name: "Chapter & Verse", street: "5 Abbey Row", x: 40, y: 135 },
    { name: "The Paper Lantern", street: "60 Canal Walk", x: -90, y: 108 },
    { name: "Second Edition", street: "2 Mill Lane", x: 117, y: -135 },
  ],
};

const SUGGEST = [
  "coffee",
  "coffee shops",
  "pizza",
  "pizza delivery",
  "books",
  "bookshops",
];

function riverY(x: number) {
  return 30 + 120 * Math.sin(x / 420) + 50 * Math.sin(x / 170 + 1.3);
}

const MAJOR = 500;
const MINOR = 100;
const STREETS_X = [
  "Abbey Row",
  "Market St",
  "High St",
  "Canal Walk",
  "Mill Lane",
  "Station Rd",
];
const STREETS_Y = [
  "North Ave",
  "Bridge St",
  "River Rd",
  "King St",
  "Long Lane",
  "Park Rd",
];

function drawTile(z: number, tx: number, ty: number, dpr: number) {
  const scale = 2 ** z;
  const c = document.createElement("canvas");
  c.width = TILE * dpr;
  c.height = TILE * dpr;
  const g = c.getContext("2d")!;
  g.scale(dpr, dpr);
  const wx0 = (tx * TILE) / scale;
  const wy0 = (ty * TILE) / scale;
  const span = TILE / scale;
  const X = (wx: number) => (wx - wx0) * scale;
  const Y = (wy: number) => (wy - wy0) * scale;

  g.fillStyle = "#f2efe6";
  g.fillRect(0, 0, TILE, TILE);

  const bx0 = Math.floor(wx0 / MINOR) - 1;
  const by0 = Math.floor(wy0 / MINOR) - 1;
  const bn = Math.ceil(span / MINOR) + 2;
  for (let i = 0; i < bn; i++) {
    for (let j = 0; j < bn; j++) {
      const bx = bx0 + i;
      const by = by0 + j;
      const h = hash(bx, by, 11);
      if (h < 0.07) {
        g.fillStyle = "#c9e3a6";
        g.fillRect(
          X(bx * MINOR + 8),
          Y(by * MINOR + 8),
          (MINOR - 16) * scale,
          (MINOR - 16) * scale,
        );
      } else if (h > 0.93) {
        g.fillStyle = "#e6dfd0";
        g.fillRect(
          X(bx * MINOR + 10),
          Y(by * MINOR + 10),
          (MINOR - 20) * scale,
          (MINOR - 20) * scale,
        );
      }
    }
  }

  g.fillStyle = "#a5bfdd";
  g.beginPath();
  const step = Math.max(1, 4 / scale);
  g.moveTo(X(wx0 - 10), Y(riverY(wx0 - 10) - 32));
  for (let wx = wx0 - 10; wx <= wx0 + span + 10; wx += step)
    g.lineTo(X(wx), Y(riverY(wx) - 32));
  for (let wx = wx0 + span + 10; wx >= wx0 - 10; wx -= step)
    g.lineTo(X(wx), Y(riverY(wx) + 32));
  g.closePath();
  g.fill();

  const road = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w: number,
    fill: string,
    casing: string,
  ) => {
    g.lineCap = "butt";
    g.strokeStyle = casing;
    g.lineWidth = w + 2;
    g.beginPath();
    g.moveTo(X(x1), Y(y1));
    g.lineTo(X(x2), Y(y2));
    g.stroke();
    g.strokeStyle = fill;
    g.lineWidth = w;
    g.stroke();
  };

  if (z >= 1) {
    const w = 2 + z * 1.6;
    for (
      let gx = Math.floor(wx0 / MINOR) * MINOR;
      gx <= wx0 + span;
      gx += MINOR
    ) {
      if (gx % MAJOR === 0) continue;
      road(gx, wy0 - 5, gx, wy0 + span + 5, w, "#ffffff", "#d6d0c2");
    }
    for (
      let gy = Math.floor(wy0 / MINOR) * MINOR;
      gy <= wy0 + span;
      gy += MINOR
    ) {
      if (gy % MAJOR === 0) continue;
      road(wx0 - 5, gy, wx0 + span + 5, gy, w, "#ffffff", "#d6d0c2");
    }
  }

  const mw = 3 + z * 2.4;
  for (
    let gx = Math.floor(wx0 / MAJOR) * MAJOR;
    gx <= wx0 + span;
    gx += MAJOR
  ) {
    road(gx, wy0 - 5, gx, wy0 + span + 5, mw, "#ffe270", "#e0a83c");
  }
  for (
    let gy = Math.floor(wy0 / MAJOR) * MAJOR;
    gy <= wy0 + span;
    gy += MAJOR
  ) {
    road(wx0 - 5, gy, wx0 + span + 5, gy, mw, "#ffe270", "#e0a83c");
  }
  road(
    wx0 - 5,
    (wx0 - 5) * 0.55 - 120,
    wx0 + span + 5,
    (wx0 + span + 5) * 0.55 - 120,
    mw + 1,
    "#ffc94a",
    "#d48a1e",
  );

  if (z >= 2) {
    g.font = `${10 + z}px Verdana, Arial, sans-serif`;
    g.fillStyle = "#555";
    g.textAlign = "center";
    g.textBaseline = "middle";
    for (
      let gx = Math.floor(wx0 / MAJOR) * MAJOR;
      gx <= wx0 + span;
      gx += MAJOR
    ) {
      const name = STREETS_X[(((gx / MAJOR) % 6) + 6) % 6];
      for (
        let gy = Math.ceil(wy0 / 180) * 180 + 90;
        gy < wy0 + span;
        gy += 180
      ) {
        g.save();
        g.translate(X(gx), Y(gy));
        g.rotate(-Math.PI / 2);
        g.strokeStyle = "rgba(255,255,255,0.9)";
        g.lineWidth = 3;
        g.strokeText(name, 0, 0);
        g.fillText(name, 0, 0);
        g.restore();
      }
    }
    for (
      let gy = Math.floor(wy0 / MAJOR) * MAJOR;
      gy <= wy0 + span;
      gy += MAJOR
    ) {
      const name = STREETS_Y[(((gy / MAJOR) % 6) + 6) % 6];
      for (
        let gx = Math.ceil(wx0 / 180) * 180 + 90;
        gx < wx0 + span;
        gx += 180
      ) {
        g.strokeStyle = "rgba(255,255,255,0.9)";
        g.lineWidth = 3;
        g.strokeText(name, X(gx), Y(gy));
        g.fillText(name, X(gx), Y(gy));
      }
    }
  }
  return c;
}

function Intro({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [stage, setStage] = useState<"load" | "show">("load");
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (stage !== "load") return;
    const id = window.setInterval(() => {
      setPct((p) => {
        const n = Math.min(100, p + 1 + Math.floor(Math.random() * 4));
        if (n === 100) {
          window.clearInterval(id);
          window.setTimeout(() => setStage("show"), 250);
        }
        return n;
      });
    }, 45);
    return () => window.clearInterval(id);
  }, [stage]);

  useEffect(() => {
    if (stage !== "show") return;
    const t = window.setTimeout(() => done.current(), 2300);
    return () => window.clearTimeout(t);
  }, [stage]);

  return (
    <div className={s.intro} data-stage={stage}>
      {stage === "load" ? (
        <div className={s.loader}>
          <span className={s.loadLabel}>Loading experience</span>
          <span className={s.loadBar}>
            <i style={{ width: `${pct}%` }} />
          </span>
          <span className={s.pct}>{String(pct).padStart(3, "0")}%</span>
        </div>
      ) : (
        <div className={s.show} aria-hidden>
          <span>the web</span>
          <span>is about to</span>
          <span>stop reloading</span>
        </div>
      )}
      <button type="button" className={s.skip} onClick={() => done.current()}>
        Skip intro
      </button>
    </div>
  );
}

export default function Ajax() {
  const active = useActive();
  const reduced = usePrefersReducedMotion();
  const [intro, setIntro] = useState(true);
  const [center, setCenter] = useState({ x: 0, y: 0 });
  const [z, setZ] = useState(2);
  const [size, setSize] = useState({ w: 600, h: 400 });
  const [query, setQuery] = useState("coffee");
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [results, setResults] = useState<Place[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [fetched, setFetched] = useState(0);
  const [searching, setSearching] = useState(false);
  const [requests, setRequests] = useState(0);
  const canvas = useRef<HTMLCanvasElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const cache = useRef(
    new Map<string, { c: HTMLCanvasElement | null; at: number }>(),
  );
  const view = useRef({ center, z, size });
  const drag = useRef<{
    sx: number;
    sy: number;
    cx: number;
    cy: number;
    moved: boolean;
  } | null>(null);
  const lastTap = useRef(0);
  const dirty = useRef(true);

  view.current = { center, z, size };

  useEffect(() => {
    if (reduced) setIntro(false);
  }, [reduced]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    dirty.current = true;
  }, [center, z, size]);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !active) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let raf = 0;
    const frame = () => {
      const { center: ce, z: zz, size: sz } = view.current;
      if (
        c.width !== Math.round(sz.w * dpr) ||
        c.height !== Math.round(sz.h * dpr)
      ) {
        c.width = Math.round(sz.w * dpr);
        c.height = Math.round(sz.h * dpr);
        dirty.current = true;
      }
      const now = performance.now();
      let fading = false;
      const scale = 2 ** zz;
      const px = ce.x * scale - sz.w / 2;
      const py = ce.y * scale - sz.h / 2;
      const tx0 = Math.floor(px / TILE);
      const ty0 = Math.floor(py / TILE);
      const tx1 = Math.floor((px + sz.w) / TILE);
      const ty1 = Math.floor((py + sz.h) / TILE);
      const needs: [number, number][] = [];
      for (let tx = tx0; tx <= tx1; tx++)
        for (let ty = ty0; ty <= ty1; ty++) needs.push([tx, ty]);
      for (const [tx, ty] of needs) {
        const key = `${zz}/${tx}/${ty}`;
        const hit = cache.current.get(key);
        if (!hit) {
          cache.current.set(key, { c: null, at: 0 });
          window.setTimeout(
            () => {
              cache.current.set(key, {
                c: drawTile(zz, tx, ty, dpr),
                at: performance.now(),
              });
              setFetched((f) => f + 1);
              dirty.current = true;
            },
            90 + hash(tx, ty, zz) * 520,
          );
        } else if (hit.c && now - hit.at < 260) fading = true;
      }
      if (dirty.current || fading) {
        dirty.current = false;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (const [tx, ty] of needs) {
          const x = Math.round(tx * TILE - px);
          const y = Math.round(ty * TILE - py);
          ctx.fillStyle = "#e5e3df";
          ctx.fillRect(x, y, TILE, TILE);
          ctx.strokeStyle = "#d2cfc8";
          ctx.lineWidth = 1;
          for (let k = 32; k < TILE; k += 32) {
            ctx.beginPath();
            ctx.moveTo(x + k + 0.5, y);
            ctx.lineTo(x + k + 0.5, y + TILE);
            ctx.moveTo(x, y + k + 0.5);
            ctx.lineTo(x + TILE, y + k + 0.5);
            ctx.stroke();
          }
          const hit = cache.current.get(`${zz}/${tx}/${ty}`);
          if (hit?.c) {
            ctx.globalAlpha = Math.min(1, (now - hit.at) / 250);
            ctx.drawImage(hit.c, x, y, TILE, TILE);
            ctx.globalAlpha = 1;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const scale = 2 ** z;
  const toScreen = (p: { x: number; y: number }) => ({
    x: (p.x - center.x) * scale + size.w / 2,
    y: (p.y - center.y) * scale + size.h / 2,
  });

  const zoom = (dz: number, at?: { x: number; y: number }) => {
    const nz = Math.max(ZMIN, Math.min(ZMAX, z + dz));
    if (nz === z) return;
    if (at) {
      const wx = center.x + (at.x - size.w / 2) / scale;
      const wy = center.y + (at.y - size.h / 2) / scale;
      const ns = 2 ** nz;
      setCenter({
        x: wx - (at.x - size.w / 2) / ns,
        y: wy - (at.y - size.h / 2) / ns,
      });
    }
    setZ(nz);
  };

  const local = (e: React.PointerEvent) => {
    const r = area.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-ui]")) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = {
      sx: e.clientX,
      sy: e.clientY,
      cx: center.x,
      cy: center.y,
      moved: false,
    };
  };

  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) > 3) d.moved = true;
    if (d.moved) setCenter({ x: d.cx - dx / scale, y: d.cy - dy / scale });
  };

  const onUp = (e: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.moved) return;
    const now = performance.now();
    if (now - lastTap.current < 320) {
      zoom(1, local(e));
      lastTap.current = 0;
    } else {
      lastTap.current = now;
      setSelected(null);
    }
  };

  const search = (q: string) => {
    const key = q.trim().toLowerCase();
    setSuggestOpen(false);
    setSearching(true);
    setRequests((r) => r + 1);
    setSelected(null);
    window.setTimeout(() => {
      setSearching(false);
      const hit = Object.keys(PLACES).find(
        (k) => key.startsWith(k.slice(0, 4)) || k.startsWith(key.slice(0, 4)),
      );
      if (!key || !hit) {
        setResults([]);
        setMessage(`No results for “${q}”. Try coffee, pizza or books.`);
        return;
      }
      setMessage(null);
      setResults(PLACES[hit]);
      setCenter({ x: 9, y: 0 });
      setZ(1);
    }, 550);
  };

  const suggestions = useMemo(
    () =>
      SUGGEST.filter(
        (x) =>
          query &&
          x.startsWith(query.toLowerCase()) &&
          x !== query.toLowerCase(),
      ),
    [query],
  );

  const bubble = selected != null ? results[selected] : null;
  const bubblePos = bubble ? toScreen(bubble) : null;

  return (
    <div className={s.app}>
      <div className={s.chrome} aria-hidden>
        <i />
        <i />
        <i />
        <span>http://maps.wayfinder.com/</span>
      </div>
      <header className={s.header}>
        <div className={s.logo}>
          Wayfinder<span className={s.beta}>beta</span>
        </div>
        <form
          className={s.search}
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
        >
          <div className={s.field}>
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestOpen(true);
                setRequests((r) => r + 1);
              }}
              onFocus={() => setSuggestOpen(true)}
              onBlur={() => window.setTimeout(() => setSuggestOpen(false), 150)}
              aria-label="Search the map"
              autoComplete="off"
            />
            {suggestOpen && suggestions.length > 0 && (
              <ul className={s.suggest} role="listbox">
                {suggestions.map((sg) => (
                  <li key={sg}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setQuery(sg);
                        search(sg);
                      }}
                    >
                      <b>{query.toLowerCase()}</b>
                      {sg.slice(query.length)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="submit" className={s.go}>
            Search Maps
          </button>
        </form>
      </header>

      <div className={s.main}>
        <aside className={s.side} aria-live="polite">
          {searching && <p className={s.loading}>Loading…</p>}
          {!searching && message && <p className={s.none}>{message}</p>}
          {!searching && !message && results.length === 0 && (
            <p className={s.none}>
              Search for coffee, pizza or books. Drag the map to look around.
            </p>
          )}
          {!searching && results.length > 0 && (
            <ol className={s.results}>
              {results.map((r, i) => (
                <li key={r.name} style={{ animationDelay: `${i * 70}ms` }}>
                  <button
                    type="button"
                    onClick={() => setSelected(i)}
                    data-on={selected === i || undefined}
                  >
                    <span className={s.letter}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>
                      <b>{r.name}</b>
                      <small>{r.street}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <div
          ref={area}
          className={s.map}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={() => (drag.current = null)}
          aria-label="Map. Drag to pan, double-click to zoom in."
          role="application"
        >
          <canvas ref={canvas} className={s.canvas} />
          <div className={s.zoom} data-ui>
            <button
              type="button"
              onClick={() => zoom(1)}
              aria-label="Zoom in"
              disabled={z >= ZMAX}
            >
              +
            </button>
            <span className={s.ticks} aria-hidden>
              {[3, 2, 1, 0].map((l) => (
                <i key={l} data-on={l === z || undefined} />
              ))}
            </span>
            <button
              type="button"
              onClick={() => zoom(-1)}
              aria-label="Zoom out"
              disabled={z <= ZMIN}
            >
              –
            </button>
          </div>
          {results.map((r, i) => {
            const p = toScreen(r);
            if (
              p.x < -30 ||
              p.y < -40 ||
              p.x > size.w + 30 ||
              p.y > size.h + 40
            )
              return null;
            return (
              <button
                key={r.name}
                type="button"
                data-ui
                className={s.pin}
                style={{ left: p.x, top: p.y, animationDelay: `${i * 90}ms` }}
                onClick={() => setSelected(i)}
                aria-label={r.name}
              >
                <span>{String.fromCharCode(65 + i)}</span>
              </button>
            );
          })}
          {bubble && bubblePos && (
            <div
              className={s.bubble}
              data-ui
              style={{ left: bubblePos.x, top: bubblePos.y }}
            >
              <button
                type="button"
                className={s.x}
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
              <b>{bubble.name}</b>
              <span>{bubble.street}</span>
              <span className={s.dir}>
                Directions: <u>To here</u> · <u>From here</u>
              </span>
            </div>
          )}
          <div className={s.scaleBar} aria-hidden>
            <i style={{ width: 40 + (z % 2) * 30 }} />
            <span>{[800, 400, 200, 100][z]} m</span>
          </div>
        </div>
      </div>

      <footer className={s.footer}>
        <span>
          Page reloads: <b>0</b>
        </span>
        <span>
          Tiles fetched in the background: <b>{fetched}</b>
        </span>
        <span>
          Requests: <b>{requests}</b>
        </span>
        {!intro && (
          <button
            type="button"
            className={s.replay}
            onClick={() => setIntro(true)}
          >
            Replay the intro
          </button>
        )}
      </footer>

      {intro && active && <Intro onDone={() => setIntro(false)} />}
    </div>
  );
}
