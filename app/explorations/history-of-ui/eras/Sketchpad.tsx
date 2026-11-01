"use client";

import { useEffect, useRef, useState } from "react";
import { useActive } from "../lib";
import s from "./sketchpad.module.css";

type P = { x: number; y: number };
type Line = { a: number; b: number };
type Con = { kind: "parallel" | "equal"; l1: number; l2: number };
type Mode = "draw" | "move" | "parallel" | "equal" | "erase";

type Model = {
  pts: Map<number, P>;
  lines: Map<number, Line>;
  cons: Con[];
  next: number;
};

const W = 1000;
const H = 700;
const SNAP = 24;

const MODES: { id: Mode; label: string }[] = [
  { id: "draw", label: "Draw" },
  { id: "move", label: "Move" },
  { id: "parallel", label: "Parallel" },
  { id: "equal", label: "Equal" },
  { id: "erase", label: "Erase" },
];

function seed(): Model {
  const pts = new Map<number, P>([
    [1, { x: 300, y: 240 }],
    [2, { x: 640, y: 170 }],
    [3, { x: 735, y: 470 }],
    [4, { x: 245, y: 515 }],
  ]);
  const lines = new Map<number, Line>([
    [5, { a: 1, b: 2 }],
    [6, { a: 2, b: 3 }],
    [7, { a: 3, b: 4 }],
    [8, { a: 4, b: 1 }],
  ]);
  return { pts, lines, cons: [], next: 9 };
}

function nearestPoint(m: Model, p: P, r: number, skip?: number) {
  let best: number | null = null;
  let bd = r;
  m.pts.forEach((q, id) => {
    if (id === skip) return;
    const d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < bd) {
      bd = d;
      best = id;
    }
  });
  return best as number | null;
}

function segDist(p: P, a: P, b: P) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = dx * dx + dy * dy || 1;
  const t = Math.max(
    0,
    Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len),
  );
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function nearestLine(m: Model, p: P, r: number) {
  let best: number | null = null;
  let bd = r;
  m.lines.forEach((l, id) => {
    const d = segDist(p, m.pts.get(l.a)!, m.pts.get(l.b)!);
    if (d < bd) {
      bd = d;
      best = id;
    }
  });
  return best as number | null;
}

function rotate(m: Model, l: Line, by: number, pinned: Set<number>) {
  const a = m.pts.get(l.a)!;
  const b = m.pts.get(l.b)!;
  const pa = pinned.has(l.a);
  const pb = pinned.has(l.b);
  if (pa && pb) return;
  const c = pa ? a : pb ? b : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  const cos = Math.cos(by);
  const sin = Math.sin(by);
  for (const [id, q] of [
    [l.a, a],
    [l.b, b],
  ] as const) {
    if (pinned.has(id)) continue;
    const dx = q.x - c.x;
    const dy = q.y - c.y;
    q.x = c.x + dx * cos - dy * sin;
    q.y = c.y + dx * sin + dy * cos;
  }
}

function stretch(m: Model, l: Line, f: number, pinned: Set<number>) {
  const a = m.pts.get(l.a)!;
  const b = m.pts.get(l.b)!;
  const pa = pinned.has(l.a);
  const pb = pinned.has(l.b);
  if (pa && pb) return;
  const c = pa ? a : pb ? b : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  for (const [id, q] of [
    [l.a, a],
    [l.b, b],
  ] as const) {
    if (pinned.has(id)) continue;
    q.x = c.x + (q.x - c.x) * f;
    q.y = c.y + (q.y - c.y) * f;
  }
}

function relax(m: Model, pinned: Set<number>) {
  let err = 0;
  for (const c of m.cons) {
    const L1 = m.lines.get(c.l1);
    const L2 = m.lines.get(c.l2);
    if (!L1 || !L2) continue;
    const a1 = m.pts.get(L1.a)!;
    const b1 = m.pts.get(L1.b)!;
    const a2 = m.pts.get(L2.a)!;
    const b2 = m.pts.get(L2.b)!;
    if (c.kind === "parallel") {
      const t1 = Math.atan2(b1.y - a1.y, b1.x - a1.x);
      const t2 = Math.atan2(b2.y - a2.y, b2.x - a2.x);
      let d = t2 - t1;
      d = ((((d + Math.PI / 2) % Math.PI) + Math.PI) % Math.PI) - Math.PI / 2;
      if (Math.abs(d) < 0.0005) continue;
      err += Math.abs(d);
      rotate(m, L1, d * 0.07, pinned);
      rotate(m, L2, -d * 0.07, pinned);
    } else {
      const len1 = Math.hypot(b1.x - a1.x, b1.y - a1.y) || 1;
      const len2 = Math.hypot(b2.x - a2.x, b2.y - a2.y) || 1;
      const t = (len1 + len2) / 2;
      if (Math.abs(len1 - len2) < 0.2) continue;
      err += Math.abs(len1 - len2) / 100;
      stretch(m, L1, 1 + (t / len1 - 1) * 0.14, pinned);
      stretch(m, L2, 1 + (t / len2 - 1) * 0.14, pinned);
    }
  }
  return err;
}

export default function Sketchpad() {
  const active = useActive();
  const canvas = useRef<HTMLCanvasElement>(null);
  const model = useRef<Model>(seed());
  const [mode, setMode] = useState<Mode>("draw");
  const [picked, setPicked] = useState<number | null>(null);
  const [status, setStatus] = useState("Ready");
  const modeRef = useRef(mode);
  const pickedRef = useRef(picked);
  const pointer = useRef<P | null>(null);
  const drag = useRef<
    { kind: "draw"; from: number | P } | { kind: "move"; id: number } | null
  >(null);
  const view = useRef({ k: 1, ox: 0, oy: 0, dpr: 1 });

  modeRef.current = mode;
  pickedRef.current = picked;

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const size = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      const k = Math.min(r.width / W, r.height / H);
      view.current = {
        k,
        ox: (r.width - W * k) / 2,
        oy: (r.height - H * k) / 2,
        dpr,
      };
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c || !active) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let t = 0;

    const toScreen = (p: P) => {
      const v = view.current;
      return { x: v.ox + p.x * v.k, y: v.oy + p.y * v.k };
    };

    const dotLine = (a: P, b: P, bright: number) => {
      const A = toScreen(a);
      const B = toScreen(b);
      const len = Math.hypot(B.x - A.x, B.y - A.y);
      const n = Math.max(1, Math.floor(len / 3.2));
      for (let i = 0; i <= n; i++) {
        const x = A.x + ((B.x - A.x) * i) / n;
        const y = A.y + ((B.y - A.y) * i) / n;
        ctx.fillStyle = `rgba(120,200,235,${0.09 * bright})`;
        ctx.fillRect(x - 2.5, y - 2.5, 5, 5);
        ctx.fillStyle = `rgba(225,245,255,${0.85 * bright})`;
        ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
      }
    };

    const frame = () => {
      t++;
      const m = model.current;
      const v = view.current;
      const pinned = new Set<number>();
      const d = drag.current;
      if (d && d.kind === "move") pinned.add(d.id);
      if (m.cons.length) for (let i = 0; i < 6; i++) relax(m, pinned);

      ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(6,9,12,0.42)";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = "lighter";

      const blinkOn = Math.floor(t / 14) % 2 === 0;
      m.lines.forEach((l, id) => {
        const isPicked = pickedRef.current === id;
        if (isPicked && !blinkOn) return;
        dotLine(m.pts.get(l.a)!, m.pts.get(l.b)!, isPicked ? 1.4 : 1);
      });

      ctx.font = `${Math.max(11, 15 * v.k)}px ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      for (const con of m.cons) {
        for (const lid of [con.l1, con.l2]) {
          const l = m.lines.get(lid);
          if (!l) continue;
          const a = m.pts.get(l.a)!;
          const b = m.pts.get(l.b)!;
          const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
          const nx = -(b.y - a.y) / len;
          const ny = (b.x - a.x) / len;
          const off = con.kind === "parallel" ? 22 : -22;
          const p = toScreen({
            x: (a.x + b.x) / 2 + nx * off,
            y: (a.y + b.y) / 2 + ny * off,
          });
          ctx.fillStyle = "rgba(140,190,210,0.55)";
          ctx.fillText(con.kind === "parallel" ? "∥" : "=", p.x, p.y);
        }
      }

      if (d && d.kind === "draw" && pointer.current) {
        const from = typeof d.from === "number" ? m.pts.get(d.from)! : d.from;
        const snapId = nearestPoint(
          m,
          pointer.current,
          SNAP / Math.max(0.6, v.k),
        );
        const to = snapId != null ? m.pts.get(snapId)! : pointer.current;
        dotLine(from, to, 0.9);
      }

      if (pointer.current) {
        const p = toScreen(pointer.current);
        ctx.fillStyle = "rgba(225,245,255,0.9)";
        for (let i = -3; i <= 3; i++) {
          if (i === 0) continue;
          ctx.fillRect(p.x + i * 4 - 0.8, p.y - 0.8, 1.6, 1.6);
          ctx.fillRect(p.x - 0.8, p.y + i * 4 - 0.8, 1.6, 1.6);
        }
        const near = nearestPoint(m, pointer.current, SNAP);
        if (
          near != null &&
          (modeRef.current === "draw" || modeRef.current === "move")
        ) {
          const q = toScreen(m.pts.get(near)!);
          ctx.strokeStyle = "rgba(200,235,250,0.55)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(q.x, q.y, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const toWorld = (e: React.PointerEvent): P => {
    const r = canvas.current!.getBoundingClientRect();
    const v = view.current;
    return {
      x: (e.clientX - r.left - v.ox) / v.k,
      y: (e.clientY - r.top - v.oy) / v.k,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    const m = model.current;
    const p = toWorld(e);
    pointer.current = p;
    (e.target as Element).setPointerCapture(e.pointerId);
    const touchSlop = e.pointerType === "touch" ? 1.6 : 1;

    if (mode === "draw") {
      const snap = nearestPoint(m, p, SNAP * touchSlop);
      drag.current = { kind: "draw", from: snap ?? p };
      setStatus("Rubber band");
      return;
    }
    if (mode === "move") {
      const id = nearestPoint(m, p, SNAP * touchSlop);
      if (id != null) {
        drag.current = { kind: "move", id };
        setStatus("Moving point");
      }
      return;
    }
    const lid = nearestLine(m, p, 18 * touchSlop);
    if (lid == null) return;
    if (mode === "erase") {
      const l = m.lines.get(lid)!;
      m.lines.delete(lid);
      m.cons = m.cons.filter((c) => c.l1 !== lid && c.l2 !== lid);
      for (const pid of [l.a, l.b]) {
        let used = false;
        m.lines.forEach((o) => {
          if (o.a === pid || o.b === pid) used = true;
        });
        if (!used) m.pts.delete(pid);
      }
      setStatus("Line erased");
      return;
    }
    if (picked == null) {
      setPicked(lid);
      setStatus("Now touch a second line");
      return;
    }
    if (picked === lid) {
      setPicked(null);
      setStatus("Ready");
      return;
    }
    m.cons = m.cons.filter(
      (c) =>
        !(
          c.kind === mode &&
          ((c.l1 === picked && c.l2 === lid) ||
            (c.l1 === lid && c.l2 === picked))
        ),
    );
    m.cons.push({ kind: mode, l1: picked, l2: lid });
    setPicked(null);
    setStatus(
      mode === "parallel" ? "Constraint: parallel" : "Constraint: equal length",
    );
  };

  const onMove = (e: React.PointerEvent) => {
    const p = toWorld(e);
    pointer.current = p;
    const d = drag.current;
    if (d && d.kind === "move") {
      const q = model.current.pts.get(d.id);
      if (q) {
        q.x = Math.max(0, Math.min(W, p.x));
        q.y = Math.max(0, Math.min(H, p.y));
      }
    }
  };

  const onUp = (e: React.PointerEvent) => {
    const m = model.current;
    const d = drag.current;
    drag.current = null;
    if (e.pointerType !== "mouse") pointer.current = null;
    if (!d) return;
    if (d.kind === "move") {
      setStatus("Ready");
      return;
    }
    const p = toWorld(e);
    const touchSlop = e.pointerType === "touch" ? 1.6 : 1;
    const fromId = typeof d.from === "number" ? d.from : null;
    const fromP = fromId != null ? m.pts.get(fromId)! : (d.from as P);
    const toId = nearestPoint(m, p, SNAP * touchSlop, fromId ?? undefined);
    const toP = toId != null ? m.pts.get(toId)! : p;
    if (Math.hypot(toP.x - fromP.x, toP.y - fromP.y) < 14) {
      setStatus("Ready");
      return;
    }
    let a = fromId;
    if (a == null) {
      a = m.next++;
      m.pts.set(a, { ...fromP });
    }
    let b = toId;
    if (b == null) {
      b = m.next++;
      m.pts.set(b, { x: p.x, y: p.y });
    }
    m.lines.set(m.next++, { a, b });
    setStatus(toId != null || fromId != null ? "Joined" : "Line drawn");
  };

  const choose = (next: Mode) => {
    setMode(next);
    setPicked(null);
    setStatus(
      next === "parallel" || next === "equal"
        ? "Touch the first line"
        : next === "erase"
          ? "Touch a line to erase it"
          : "Ready",
    );
  };

  const clear = () => {
    model.current = { pts: new Map(), lines: new Map(), cons: [], next: 1 };
    setPicked(null);
    setMode("draw");
    setStatus("Screen cleared");
  };

  const reset = () => {
    model.current = seed();
    setPicked(null);
    setStatus("Ready");
  };

  return (
    <div className={s.wrap}>
      <div className={s.console}>
        <div className={s.scope}>
          <canvas
            ref={canvas}
            className={s.screen}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={(e) => {
              if (!drag.current && e.pointerType === "mouse")
                pointer.current = null;
            }}
            aria-label="Sketchpad display. Draw lines with the pointer and apply constraints with the buttons."
          />
          <div className={s.glass} aria-hidden />
        </div>
        <div className={s.panel}>
          <div className={s.buttons} role="radiogroup" aria-label="Mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={mode === m.id}
                className={s.key}
                onClick={() => choose(m.id)}
              >
                <span className={s.lamp} aria-hidden />
                {m.label}
              </button>
            ))}
          </div>
          <div className={s.buttons}>
            <button type="button" className={s.key} onClick={reset}>
              <span className={s.lamp} aria-hidden />
              Reset
            </button>
            <button type="button" className={s.key} onClick={clear}>
              <span className={s.lamp} aria-hidden />
              Clear
            </button>
          </div>
          <p className={s.status} aria-live="polite">
            {status}
          </p>
        </div>
      </div>
    </div>
  );
}
