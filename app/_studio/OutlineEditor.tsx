"use client";

import { useEffect, useRef, useState } from "react";
import outlines from "./data/hotspots.json";
import type { World } from "./engine/world";
import { STUDIO_OBJECTS } from "./objects";
import { SCENES } from "./data/scenes";

const CLICKABLE = new Set(STUDIO_OBJECTS.map((o) => o.id));

type Poly = number[][];
type Outlines = Record<string, Poly[]>;

const USED = new Set(
  SCENES.studio.hotspots.map((h) => h.outline).filter(Boolean),
);
const START = Object.fromEntries(
  Object.entries((outlines as { studio: Outlines }).studio).filter(([key]) =>
    USED.has(key),
  ),
);

function clone(o: Outlines): Outlines {
  return JSON.parse(JSON.stringify(o));
}

function simplify(points: Poly, epsilon: number): Poly {
  if (points.length < 4) return points;
  const dist = (p: number[], a: number[], b: number[]) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
  };
  const rdp = (pts: Poly): Poly => {
    let max = 0;
    let index = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = dist(pts[i], pts[0], pts[pts.length - 1]);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (max <= epsilon) return [pts[0], pts[pts.length - 1]];
    const left = rdp(pts.slice(0, index + 1));
    const right = rdp(pts.slice(index));
    return [...left.slice(0, -1), ...right];
  };
  const out = rdp([...points, points[0]]).slice(0, -1);
  return out.length >= 3 ? out : points;
}

function nearestSegment(poly: Poly, p: number[]) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const t = Math.max(
      0,
      Math.min(
        1,
        ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1),
      ),
    );
    const d = Math.hypot(a[0] + dx * t - p[0], a[1] + dy * t - p[1]);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

export default function OutlineEditor({
  world,
  tick,
}: {
  world: World | null;
  tick: unknown;
}) {
  const [data, setData] = useState<Outlines>(() => clone(START));
  const [saved, setSaved] = useState<Outlines>(() => clone(START));
  const [selected, setSelected] = useState<string>(Object.keys(START)[0]);
  const [status, setStatus] = useState("");
  const drag = useRef<{ poly: number; node: number } | null>(null);
  const [panel, setPanel] = useState<{ x: number; y: number } | null>(null);
  const [small, setSmall] = useState(false);
  const keys = Object.keys(data);
  const area = (key: string) =>
    data[key].reduce((sum, poly) => {
      const xs = poly.map((p) => p[0]);
      const ys = poly.map((p) => p[1]);
      return (
        sum +
        (Math.max(...xs) - Math.min(...xs)) *
          (Math.max(...ys) - Math.min(...ys))
      );
    }, 0);
  const layered = keys
    .filter((key) => key !== selected)
    .sort((a, b) => area(b) - area(a))
    .concat(selected);
  const dirty = JSON.stringify(data) !== JSON.stringify(saved);

  useEffect(() => {
    document.documentElement.dataset.outlines = "on";
    return () => {
      delete document.documentElement.dataset.outlines;
    };
  }, []);

  useEffect(() => {
    if (!world) return;
    world.showWhole(true);
    return () => world.showWhole(false);
  }, [world]);

  useEffect(() => {
    if (!world) return;
    world.highlight(selected);
  }, [world, selected, tick]);

  const push = (key: string, polys: Poly[]) => {
    setData((d) => ({ ...d, [key]: polys }));
    world?.setOutline(
      key,
      polys.map((poly) => poly.map(([x, y]) => ({ x, y }))),
    );
  };

  const toWorld = (e: { clientX: number; clientY: number }) => {
    const p = world!.toWorld(e.clientX, e.clientY);
    return [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10];
  };

  const save = async () => {
    setStatus("Saving…");
    const res = await fetch("/api/dev/outlines", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ outlines: data }),
    });
    if (res.ok) {
      setSaved(clone(data));
      setStatus("Saved to the site and nightwalk");
    } else {
      setStatus(`Save failed (${res.status})`);
    }
  };

  if (!world) return null;
  const host = (pt: number[]) => world.toHost({ x: pt[0], y: pt[1] });
  const polys = data[selected] ?? [];
  const count = polys.reduce((n, p) => n + p.length, 0);

  return (
    <>
      <svg className="sh-edit" aria-hidden>
        {layered.map((key) =>
          (data[key] ?? []).map((poly, i) => (
            <polygon
              key={`${key}-${i}`}
              className={key === selected ? "on" : ""}
              points={poly
                .map((pt) => {
                  const h = host(pt);
                  return `${h.x},${h.y}`;
                })
                .join(" ")}
              onClick={() => setSelected(key)}
              onDoubleClick={(e) => {
                if (key !== selected) return;
                const p = toWorld(e);
                const next = data[key].map((q) => q.slice());
                const at = nearestSegment(next[i], p);
                next[i].splice(at + 1, 0, p);
                push(key, next);
              }}
            />
          )),
        )}
        {polys.map((poly, i) =>
          poly.map((pt, j) => {
            const h = host(pt);
            return (
              <circle
                key={`${i}-${j}`}
                cx={h.x}
                cy={h.y}
                r={5}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  if (e.altKey) {
                    if (poly.length <= 3) {
                      if (polys.length > 1)
                        push(
                          selected,
                          polys.filter((_, k) => k !== i),
                        );
                      return;
                    }
                    const next = polys.map((q) => q.slice());
                    next[i].splice(j, 1);
                    push(selected, next);
                    return;
                  }
                  (e.target as Element).setPointerCapture(e.pointerId);
                  drag.current = { poly: i, node: j };
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (!d) return;
                  const next = polys.map((q) => q.slice());
                  next[d.poly][d.node] = toWorld(e);
                  push(selected, next);
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
              />
            );
          }),
        )}
      </svg>
      <div
        className="sh-edit-panel"
        style={
          panel ? { left: panel.x, top: panel.y, right: "auto" } : undefined
        }
      >
        <div
          className="sh-edit-title"
          onPointerDown={(e) => {
            if ((e.target as Element).closest("button")) return;
            e.preventDefault();
            const el = e.currentTarget.parentElement as HTMLElement;
            const box = el.getBoundingClientRect();
            const host = (
              el.offsetParent as HTMLElement
            ).getBoundingClientRect();
            const dx = e.clientX - box.left + host.left;
            const dy = e.clientY - box.top + host.top;
            const move = (ev: PointerEvent) =>
              setPanel({ x: ev.clientX - dx, y: ev.clientY - dy });
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        >
          <span>Outlines</span>
          <button
            type="button"
            className="sh-edit-min"
            onClick={() => setSmall((v) => !v)}
            aria-label={small ? "Show the panel" : "Hide the panel"}
          >
            {small ? "+" : "–"}
          </button>
        </div>
        {small ? null : (
          <>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {keys.map((key) => (
                <option key={key} value={key}>
                  {key}
                  {CLICKABLE.has(key) ? "" : " (depth only)"}
                  {JSON.stringify(data[key]) !== JSON.stringify(saved[key])
                    ? " •"
                    : ""}
                </option>
              ))}
            </select>
            <p className="sh-edit-help">
              {count} nodes. Drag a node to move it, double-click an edge to add
              one, Alt-click a node to remove it. Alt-click a corner of a
              three-node shape to remove the whole shape.
            </p>
            <div className="sh-edit-actions">
              <button
                type="button"
                onClick={() =>
                  push(
                    selected,
                    polys.map((p) => simplify(p, 4)),
                  )
                }
              >
                Fewer nodes
              </button>
              <button
                type="button"
                disabled={
                  JSON.stringify(data[selected]) ===
                  JSON.stringify(saved[selected])
                }
                onClick={() => push(selected, clone(saved)[selected])}
              >
                Undo
              </button>
              <button
                type="button"
                className="primary"
                disabled={!dirty}
                onClick={save}
              >
                Save
              </button>
            </div>
            {status ? <p className="sh-edit-help">{status}</p> : null}
          </>
        )}
      </div>
    </>
  );
}
