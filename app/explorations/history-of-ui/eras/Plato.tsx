"use client";

import { useEffect, useRef, useState } from "react";
import { Fit, useActive, useScale } from "../lib";
import s from "./plato.module.css";

const CELL = 32;
type Mode = "menu" | "lesson" | "talk";
type Target = { id: string; c0: number; r0: number; c1: number; r1: number };

const QUESTIONS = [
  {
    ask: "Touch the planet closest to the sun.",
    answer: "mercury",
    planets: [
      { id: "earth", label: "Earth", c: 3, r: 6, size: 1 },
      { id: "mars", label: "Mars", c: 12, r: 5, size: 0.8 },
      { id: "mercury", label: "Mercury", c: 6, r: 10, size: 0.6 },
      { id: "venus", label: "Venus", c: 11, r: 10, size: 0.95 },
    ],
  },
  {
    ask: "Touch the largest planet.",
    answer: "jupiter",
    planets: [
      { id: "saturn", label: "Saturn", c: 4, r: 6, size: 1.5 },
      { id: "neptune", label: "Neptune", c: 12, r: 6, size: 1.1 },
      { id: "jupiter", label: "Jupiter", c: 7, r: 10, size: 1.8 },
      { id: "uranus", label: "Uranus", c: 12, r: 10, size: 1.15 },
    ],
  },
];

const PEOPLE = [
  {
    name: "kim",
    lines: [
      "anyone done the chem lesson yet",
      "the terminal in the union is broken again",
      "brb lunch :-)",
    ],
  },
  {
    name: "raj",
    lines: [
      "you can see every letter as i type it",
      "even my typos. teh. the",
      "try it in your row",
    ],
  },
  {
    name: "sam",
    lines: [
      "did someone start a game of empire",
      "i'll join after this lesson",
    ],
  },
];

function cellOf(x: number, y: number) {
  return { c: Math.floor(x / CELL), r: Math.floor(y / CELL) };
}

function useTyping(lines: string[], active: boolean, offset: number) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    let line = 0;
    let i = 0;
    let typo = false;
    let t: number;
    const tick = () => {
      const target = lines[line % lines.length];
      if (i < target.length) {
        if (!typo && Math.random() < 0.05 && i > 2) {
          typo = true;
          setText(
            (x) => x + String.fromCharCode(97 + Math.floor(Math.random() * 26)),
          );
          t = window.setTimeout(tick, 260);
          return;
        }
        if (typo) {
          typo = false;
          setText((x) => x.slice(0, -1));
          t = window.setTimeout(tick, 160);
          return;
        }
        i++;
        setText(target.slice(0, i));
        t = window.setTimeout(tick, 70 + Math.random() * 120);
      } else {
        t = window.setTimeout(
          () => {
            line++;
            i = 0;
            setText("");
            tick();
          },
          2600 + Math.random() * 1600,
        );
      }
    };
    t = window.setTimeout(tick, offset);
    return () => window.clearTimeout(t);
  }, [active, lines, offset]);
  return text;
}

function Talk({ active }: { active: boolean }) {
  const a = useTyping(PEOPLE[0].lines, active, 300);
  const b = useTyping(PEOPLE[1].lines, active, 1500);
  const c = useTyping(PEOPLE[2].lines, active, 3200);
  const [mine, setMine] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, []);

  const rows = [
    { name: PEOPLE[0].name, text: a },
    { name: PEOPLE[1].name, text: b },
    { name: PEOPLE[2].name, text: c },
    { name: "you", text: mine },
  ];

  return (
    <div
      className={s.talk}
      onClick={() => input.current?.focus({ preventScroll: true })}
    >
      <div className={s.head}>TALKOMATIC · channel 3 · 4 people</div>
      {rows.map((r) => (
        <div
          key={r.name}
          className={s.channel}
          data-me={r.name === "you" || undefined}
        >
          <span className={s.who}>{r.name}</span>
          <span className={s.said}>
            {r.text}
            <span className={s.caret} aria-hidden>
              ▁
            </span>
          </span>
        </div>
      ))}
      <input
        ref={input}
        className={s.hidden}
        value={mine}
        maxLength={46}
        onChange={(e) => setMine(e.target.value.toLowerCase())}
        onKeyDown={(e) => {
          if (e.key === "Enter") setMine("");
        }}
        aria-label="Type in your Talkomatic row"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      <div className={s.foot}>
        type. everyone sees each key as you press it. RETURN clears your row.
      </div>
    </div>
  );
}

function Screen() {
  const active = useActive();
  const scale = useScale();
  const [mode, setMode] = useState<Mode>("menu");
  const [q, setQ] = useState(0);
  const [judge, setJudge] = useState<{ id: string; ok: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const [hover, setHover] = useState<{ c: number; r: number } | null>(null);
  const [touched, setTouched] = useState<{
    c: number;
    r: number;
    k: number;
  } | null>(null);
  const box = useRef<HTMLDivElement>(null);

  const targets: Target[] =
    mode === "menu"
      ? [
          { id: "lesson", c0: 2, r0: 5, c1: 13, r1: 6 },
          { id: "talk", c0: 2, r0: 8, c1: 13, r1: 9 },
        ]
      : mode === "lesson" && !done
        ? QUESTIONS[q].planets.map((p) => ({
            id: p.id,
            c0: p.c - 1,
            r0: p.r - 1,
            c1: p.c + 1,
            r1: p.r + 1,
          }))
        : [];

  const local = (e: React.PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return cellOf((e.clientX - r.left) / scale, (e.clientY - r.top) / scale);
  };

  const touch = (e: React.PointerEvent) => {
    const cell = local(e);
    if (cell.c < 0 || cell.c > 15 || cell.r < 0 || cell.r > 15) return;
    setTouched({ ...cell, k: Date.now() });
    const hit = targets.find(
      (t) =>
        cell.c >= t.c0 && cell.c <= t.c1 && cell.r >= t.r0 && cell.r <= t.r1,
    );
    if (!hit) return;
    if (mode === "menu") {
      setMode(hit.id as Mode);
      setQ(0);
      setDone(false);
      setJudge(null);
      return;
    }
    if (mode === "lesson") {
      if (judge?.ok) return;
      const ok = hit.id === QUESTIONS[q].answer;
      setJudge({ id: hit.id, ok });
      if (ok) {
        window.setTimeout(() => {
          setJudge(null);
          if (q + 1 < QUESTIONS.length) setQ(q + 1);
          else setDone(true);
        }, 1100);
      }
    }
  };

  const key = (k: "NEXT" | "BACK" | "HELP") => {
    if (k === "BACK") {
      setMode("menu");
      return;
    }
    if (k === "NEXT" && mode === "lesson" && done) setMode("menu");
    if (k === "HELP" && mode === "lesson" && !done && !judge?.ok) {
      setJudge({ id: QUESTIONS[q].answer, ok: true });
      window.setTimeout(() => {
        setJudge(null);
        if (q + 1 < QUESTIONS.length) setQ(q + 1);
        else setDone(true);
      }, 1100);
    }
  };

  return (
    <div className={s.terminal}>
      <div className={s.bezel}>
        <div
          ref={box}
          className={s.panel}
          onPointerMove={(e) => setHover(local(e))}
          onPointerLeave={() => setHover(null)}
          onPointerDown={mode === "talk" ? undefined : touch}
          role="application"
          aria-label="PLATO touch panel"
        >
          {mode === "menu" && (
            <div className={s.page}>
              <div className={s.title}>PLATO IV</div>
              <div className={s.sub}>
                University of Illinois · type or touch
              </div>
              <div
                className={s.option}
                style={{ top: 5 * CELL, height: 2 * CELL }}
              >
                Lesson: the planets
              </div>
              <div
                className={s.option}
                style={{ top: 8 * CELL, height: 2 * CELL }}
              >
                Talkomatic: live chat
              </div>
              <div className={s.small} style={{ top: 12 * CELL }}>
                Touch a box. The panel is a 16 × 16 grid of infrared beams, so
                it knows your finger to the nearest square.
              </div>
            </div>
          )}

          {mode === "lesson" && (
            <div className={s.page}>
              {!done ? (
                <>
                  <div className={s.ask}>{QUESTIONS[q].ask}</div>
                  <div className={s.sun} aria-hidden />
                  {QUESTIONS[q].planets.map((p) => (
                    <div
                      key={p.id}
                      className={s.planet}
                      data-judge={
                        judge?.id === p.id
                          ? judge.ok
                            ? "ok"
                            : "no"
                          : undefined
                      }
                      style={
                        {
                          left: (p.c + 0.5) * CELL,
                          top: (p.r + 0.5) * CELL,
                          "--d": `${p.size * 40}px`,
                        } as React.CSSProperties
                      }
                    >
                      <i />
                      <span>{p.label}</span>
                    </div>
                  ))}
                  {judge && (
                    <div className={s.verdict}>{judge.ok ? "ok" : "no"}</div>
                  )}
                </>
              ) : (
                <div className={s.done}>
                  <div>Lesson complete.</div>
                  <div className={s.small2}>Press NEXT for the menu.</div>
                </div>
              )}
            </div>
          )}

          {mode === "talk" && <Talk active={active} />}

          {hover && mode !== "talk" && (
            <span
              className={s.cell}
              style={{ left: hover.c * CELL, top: hover.r * CELL }}
              aria-hidden
            />
          )}
          {touched && mode !== "talk" && (
            <span
              key={touched.k}
              className={s.hit}
              style={{ left: touched.c * CELL, top: touched.r * CELL }}
              aria-hidden
            />
          )}
          <div className={s.glow} aria-hidden />
        </div>
      </div>
      <div className={s.keys}>
        {(["HELP", "BACK", "NEXT"] as const).map((k) => (
          <button
            key={k}
            type="button"
            className={s.key}
            onClick={() => key(k)}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Plato() {
  return (
    <Fit width={580} height={640}>
      <Screen />
    </Fit>
  );
}
