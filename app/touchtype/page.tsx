"use client";

// Touchtype — typing tutor with two distinct modes:
//   • Kids: bright, playful, course-driven (original kid aesthetic)
//   • Adults: dark, editorial, single-screen typing test (matches portfolio)

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// ─── Layouts ─────────────────────────────────────────────────────────────────
type KeyDef = { k: string; code?: string; cls?: string; f?: string };

const ROW1_BASE: KeyDef[] = [
  { k: "`", f: "L5" }, { k: "1", f: "L5" }, { k: "2", f: "L4" }, { k: "3", f: "L3" },
  { k: "4", f: "L2" }, { k: "5", f: "L2" },
  { k: "6", f: "R2" }, { k: "7", f: "R2" }, { k: "8", f: "R3" }, { k: "9", f: "R4" },
  { k: "0", f: "R5" }, { k: "-", f: "R5" }, { k: "=", f: "R5" },
];
const ROW2: KeyDef[] = [
  { k: "tab", code: "Tab", cls: "wide", f: "L5" },
  { k: "q", f: "L5" }, { k: "w", f: "L4" }, { k: "e", f: "L3" }, { k: "r", f: "L2" }, { k: "t", f: "L2" },
  { k: "y", f: "R2" }, { k: "u", f: "R2" }, { k: "i", f: "R3" }, { k: "o", f: "R4" }, { k: "p", f: "R5" },
  { k: "[", f: "R5" }, { k: "]", f: "R5" }, { k: "\\", f: "R5" },
];
const ROW4: KeyDef[] = [
  { k: "shift", code: "ShiftLeft", cls: "shift", f: "L5" },
  { k: "z", f: "L5" }, { k: "x", f: "L4" }, { k: "c", f: "L3" }, { k: "v", f: "L2" }, { k: "b", f: "L2" },
  { k: "n", f: "R2" }, { k: "m", f: "R2" }, { k: ",", f: "R3" }, { k: ".", f: "R4" }, { k: "/", f: "R5" },
  { k: "shift", code: "ShiftRight", cls: "shift", f: "R5" },
];

function row1(layout: "mac" | "win"): KeyDef[] {
  return [
    ...ROW1_BASE,
    { k: layout === "mac" ? "⌫" : "backspace", code: "Backspace", cls: layout === "mac" ? "wide" : "xxwide", f: "R5" },
  ];
}
function row3(layout: "mac" | "win"): KeyDef[] {
  return [
    { k: layout === "mac" ? "caps" : "caps lock", code: "CapsLock", cls: "xwide", f: "L5" },
    { k: "a", f: "L5" }, { k: "s", f: "L4" }, { k: "d", f: "L3" }, { k: "f", cls: "homing", f: "L2" }, { k: "g", f: "L2" },
    { k: "h", f: "R2" }, { k: "j", cls: "homing", f: "R2" }, { k: "k", f: "R3" }, { k: "l", f: "R4" },
    { k: ";", f: "R5" }, { k: "'", f: "R5" },
    { k: layout === "mac" ? "⏎" : "enter", code: "Enter", cls: "xwide", f: "R5" },
  ];
}
function bottomRow(layout: "mac" | "win"): KeyDef[] {
  if (layout === "mac") {
    return [
      { k: "fn", cls: "wide", f: "L5" },
      { k: "⌃", code: "ControlLeft", f: "L5" },
      { k: "⌥", code: "AltLeft", f: "L5" },
      { k: "⌘", code: "MetaLeft", cls: "wide", f: "L5" },
      { k: "space", code: "Space", cls: "space", f: "T" },
      { k: "⌘", code: "MetaRight", cls: "wide", f: "R5" },
      { k: "⌥", code: "AltRight", f: "R5" },
      { k: "←", code: "ArrowLeft", f: "R5" },
      { k: "↓", code: "ArrowDown", f: "R5" },
      { k: "↑", code: "ArrowUp", f: "R5" },
      { k: "→", code: "ArrowRight", f: "R5" },
    ];
  }
  return [
    { k: "ctrl", code: "ControlLeft", cls: "wide", f: "L5" },
    { k: "⊞", code: "MetaLeft", f: "L5" },
    { k: "alt", code: "AltLeft", f: "L5" },
    { k: "space", code: "Space", cls: "space", f: "T" },
    { k: "alt", code: "AltRight", f: "R5" },
    { k: "⊞", code: "MetaRight", f: "R5" },
    { k: "menu", code: "ContextMenu", f: "R5" },
    { k: "ctrl", code: "ControlRight", cls: "wide", f: "R5" },
  ];
}
function getLayoutRows(layout: "mac" | "win"): KeyDef[][] {
  return [row1(layout), ROW2, row3(layout), ROW4, bottomRow(layout)];
}

// ─── Lessons & adult library ─────────────────────────────────────────────────
const LESSONS: { title: string; items: string[] }[] = [
  { title: "Lesson 1 — Home Row Left (a s d f)",  items: ["a","s","d","f","a s d f","f d s a","fad","sad","dad","fad sad dad"] },
  { title: "Lesson 2 — Home Row Right (j k l ;)", items: ["j","k","l",";","j k l ;","jak","jall","sad lad"] },
  { title: "Lesson 3 — Both Hands Home Row",      items: ["asdf jkl;","fall","glass","flask","dad asks","all jall lads"] },
  { title: "Lesson 4 — Top Row",                  items: ["e","r","i","o","top","yes","try","you","quiet","puppy","type"] },
  { title: "Lesson 5 — Bottom Row",               items: ["c","v","b","n","m","cab","van","mom","zoo","my cat"] },
  { title: "Lesson 6 — Real Words!",              items: ["the","and","you","cat","dog","fish","jump","play","green","apple","happy"] },
  { title: "Lesson 7 — Tiny Sentences",           items: ["the cat","i can type","my dog runs","you are fun","a big red ball"] },
  { title: "Lesson 8 — Champion Round!",          items: ["i love to type","kids can type fast","the quick fox","jumping high","super star"] },
];

const ADULT_TEXTS: Record<string, string[]> = {
  "Common words": [
    "the of and to a in for is on that by this with you it not or be are from at as your all have new more time they up may what which can us about if my has but our one other do no",
    "people just then had he could about her than out them all use word can may these our know which down way most look great because each how only over right come into new years",
  ],
  "Pangrams": [
    "the quick brown fox jumps over the lazy dog. pack my box with five dozen liquor jugs.",
    "how vexingly quick daft zebras jump! sphinx of black quartz, judge my vow.",
  ],
  "Quotes": [
    "the only way to do great work is to love what you do. if you haven't found it yet, keep looking.",
    "design is not just what it looks like and feels like. design is how it works.",
    "less, but better. perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
  ],
  "Code-style": [
    "const greet = (name) => `hello, ${name}`; const sum = (a, b) => a + b; const isEven = (n) => n % 2 === 0;",
    "function once(fn) { let done = false; return (...args) => { if (done) return; done = true; return fn(...args); }; }",
  ],
  "Punctuation": [
    "well, here we are — at last. is this it? \"yes,\" she said, \"this is it.\" don't worry; everything's fine.",
    "list one, list two, list three: apples, oranges, pears. ready? set. go!",
  ],
};

const PRAISE_WORDS = ["Great!", "Nice!", "Yes!", "Boom!", "Awesome!", "Sweet!", "Wow!", "Cool!"] as const;

// ─── Component ───────────────────────────────────────────────────────────────
type Mode = "kids" | "adults";
type Layout = "mac" | "win";

export default function TouchtypePage() {
  const [mode, setMode] = useState<Mode>("adults");
  const [layout, setLayout] = useState<Layout>("mac");

  useEffect(() => {
    const m = (typeof window !== "undefined" && localStorage.getItem("ttMode")) as Mode | null;
    const l = (typeof window !== "undefined" && localStorage.getItem("ttLayout")) as Layout | null;
    if (m === "kids" || m === "adults") setMode(m);
    if (l === "mac" || l === "win") setLayout(l);
  }, []);
  useEffect(() => { try { localStorage.setItem("ttMode", mode); } catch {} }, [mode]);
  useEffect(() => { try { localStorage.setItem("ttLayout", layout); } catch {} }, [layout]);

  // Kids state
  const [lessonIdx, setLessonIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set());
  const [mobileNoticeDismissed, setMobileNoticeDismissed] = useState(false);
  const [wordPraise, setWordPraise] = useState<string | null>(null);
  const [showHands, setShowHands] = useState(false);

  // Adults state
  const [category, setCategory] = useState<string>("Common words");
  const [textIdx, setTextIdx] = useState(0);
  const [adultCharIdx, setAdultCharIdx] = useState(0);
  const [errors, setErrors] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);

  const [pressedKey, setPressedKey] = useState<{ key: string; ok: boolean } | null>(null);
  const [wrongFlash, setWrongFlash] = useState(false);

  const [bigMsg, setBigMsg] = useState<{ title: string; sub: string } | null>(null);

  // Kids confetti (emoji stars) and adults confetti (dots) handled the same way.
  const [stars, setStars] = useState<{ id: number; left: number; top: number; size: number; emoji: string; color: string }[]>([]);
  const starId = useRef(0);

  const rows = useMemo(() => getLayoutRows(layout), [layout]);

  const currentText = useMemo(() => {
    if (mode === "kids") return LESSONS[lessonIdx].items[itemIdx] ?? "";
    return ADULT_TEXTS[category]?.[textIdx] ?? "";
  }, [mode, lessonIdx, itemIdx, category, textIdx]);

  const currentChar = useMemo(() => {
    const idx = mode === "kids" ? charIdx : adultCharIdx;
    return currentText[idx];
  }, [mode, charIdx, adultCharIdx, currentText]);

  // Timer tick — runs for both kids and adults so WPM updates live.
  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [startTime]);

  // ─── Audio ───────────────────────────────────────────────────────────────
  const audioCtxRef = useRef<AudioContext | null>(null);
  const beep = useCallback((freq: number, dur = 0.06, type: OscillatorType = "sine", vol = 0.04) => {
    try {
      if (!audioCtxRef.current) {
        const Ctor =
          (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ||
          (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        audioCtxRef.current = new Ctor();
      }
      const ctx = audioCtxRef.current!;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      o.stop(ctx.currentTime + dur);
    } catch {}
  }, []);
  const happyBeep = useCallback(() => beep(880, 0.07, "sine", 0.06), [beep]);
  const sadBeep = useCallback(() => beep(200, 0.12, "square", 0.05), [beep]);
  const softHit = useCallback(() => beep(880, 0.04, "sine", 0.03), [beep]);
  const softMiss = useCallback(() => beep(180, 0.10, "square", 0.04), [beep]);
  const fanfare = useCallback(() => {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => beep(f, 0.15, "triangle", 0.07), i * 110)
    );
  }, [beep]);

  const fireKidsConfetti = useCallback((emojis: string[] = ["⭐","🎉","✨","🌟","💖"]) => {
    const next = Array.from({ length: 14 }, () => ({
      id: ++starId.current,
      left: Math.random() * 100,
      top: 60 + Math.random() * 30,
      size: 24 + Math.random() * 24,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      color: "",
    }));
    setStars((s) => [...s, ...next]);
    setTimeout(() => setStars((s) => s.filter((d) => !next.some((n) => n.id === d.id))), 1600);
  }, []);

  const flashBigMessage = useCallback((title: string, sub: string) => {
    setBigMsg({ title, sub });
    setTimeout(() => setBigMsg(null), 1600);
  }, []);

  // ─── Adults reset / next ─────────────────────────────────────────────────
  const resetAdults = useCallback(() => {
    setAdultCharIdx(0);
    setStartTime(null);
    setNow(null);
    setErrors(0);
    setTotalKeystrokes(0);
  }, []);
  const nextAdultText = useCallback(() => {
    const list = ADULT_TEXTS[category] || [];
    setTextIdx((i) => (i + 1) % Math.max(list.length, 1));
    resetAdults();
  }, [category, resetAdults]);

  // ─── Keydown handler ─────────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      let pressed = e.key;
      if (pressed === " " || e.code === "Space") pressed = " ";
      if (pressed.length !== 1 && pressed !== " ") return;
      e.preventDefault();

      const expected = currentChar;
      if (expected === undefined) return;
      const expLower = expected.toLowerCase();
      const pressLower = pressed.toLowerCase();

      if (pressLower === expLower) {
        setPressedKey({ key: expLower, ok: true });
        setTimeout(() => setPressedKey(null), 160);

        if (mode === "kids") {
          happyBeep();
          if (!startTime) {
            const t = Date.now();
            setStartTime(t);
            setNow(t);
          }
          setTotalKeystrokes((t) => t + 1);
          const nextChar = charIdx + 1;
          const item = LESSONS[lessonIdx].items[itemIdx] ?? "";
          setCorrect((c) => c + 1);
          const newStreak = streak + 1;
          setStreak(newStreak);
          setScore((s) => s + 10 + Math.min(newStreak, 20));

          if (newStreak > 0 && newStreak % 10 === 0) {
            flashBigMessage(`🔥 ${newStreak} streak!`, "You are on fire!");
            fireKidsConfetti(["🔥","⚡","💥"]);
          }
          if (nextChar >= item.length) {
            fireKidsConfetti();
            const nextItem = itemIdx + 1;
            if (nextItem >= LESSONS[lessonIdx].items.length) {
              setDoneSet((d) => { const n = new Set(d); n.add(lessonIdx); return n; });
              fanfare();
              const last = lessonIdx === LESSONS.length - 1;
              flashBigMessage(
                last ? "🏆 You Finished Everything!" : "🎉 Lesson Complete!",
                last ? "You are a typing champion!" : "On to the next one..."
              );
              setTimeout(() => {
                if (!last) {
                  setLessonIdx((l) => l + 1);
                  setItemIdx(0);
                }
                setCharIdx(0);
              }, 1500);
              return;
            }
            const praise = PRAISE_WORDS[Math.floor(Math.random() * PRAISE_WORDS.length)];
            setWordPraise(praise);
            window.setTimeout(() => setWordPraise(null), 900);
            setItemIdx(nextItem);
            setCharIdx(0);
          } else {
            setCharIdx(nextChar);
          }
        } else {
          // adults
          softHit();
          if (!startTime) {
            const t = Date.now();
            setStartTime(t);
            setNow(t);
          }
          setTotalKeystrokes((t) => t + 1);
          const text = ADULT_TEXTS[category]?.[textIdx] ?? "";
          const next = adultCharIdx + 1;
          setAdultCharIdx(next);
          if (next >= text.length) {
            const elapsed = (Date.now() - (startTime ?? Date.now())) / 1000 || 0.001;
            const wpm = Math.round((next / 5) / (elapsed / 60));
            flashBigMessage(`${wpm} WPM`, "Text complete");
          }
        }
      } else {
        setPressedKey({ key: pressLower, ok: false });
        setTimeout(() => setPressedKey(null), 160);
        setWrongFlash(true);
        setTimeout(() => setWrongFlash(false), 220);
        if (mode === "kids") {
          sadBeep();
          setStreak(0);
          if (!startTime) {
            const t = Date.now();
            setStartTime(t);
            setNow(t);
          }
          setTotalKeystrokes((t) => t + 1);
          setErrors((er) => er + 1);
        } else {
          softMiss();
          if (!startTime) {
            const t = Date.now();
            setStartTime(t);
            setNow(t);
          }
          setTotalKeystrokes((t) => t + 1);
          setErrors((er) => er + 1);
        }
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    mode, currentChar, charIdx, adultCharIdx, lessonIdx, itemIdx, streak,
    category, textIdx, startTime,
    happyBeep, sadBeep, softHit, softMiss, fanfare, fireKidsConfetti, flashBigMessage,
  ]);

  // ─── Stats (shared between modes) ────────────────────────────────────────
  const elapsedSec = startTime && now ? (now - startTime) / 1000 : 0;
  const charsForWpm = mode === "kids" ? correct : adultCharIdx;
  const wpm = startTime && elapsedSec > 0 ? Math.round((charsForWpm / 5) / (elapsedSec / 60)) : 0;
  const acc = totalKeystrokes > 0 ? Math.round(((totalKeystrokes - errors) / totalKeystrokes) * 100) : 100;

  const promptChars = useMemo(() => {
    const idx = mode === "kids" ? charIdx : adultCharIdx;
    return Array.from(currentText).map((c, i) => ({
      ch: c,
      done: i < idx,
      current: i === idx,
    }));
  }, [currentText, charIdx, adultCharIdx, mode]);

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div className={`tt-root tt-${mode}`}>
      {!mobileNoticeDismissed && (
        <div className="tt-mobile-notice" role="status">
          <span>Touchtype is built for a physical keyboard. Pop back on desktop for the full thing.</span>
          <button
            type="button"
            className="tt-mobile-notice-close"
            onClick={() => setMobileNoticeDismissed(true)}
            aria-label="Dismiss desktop notice"
          >
            ×
          </button>
        </div>
      )}
      {mode === "kids" ? (
        // ════════ KIDS UI ════════
        <>
          <Link href="/" className="tt-kids-back">← Home</Link>

          <header className="tt-kids-header">
            <h1>🌟 Learn How To Type! 🌟</h1>
            <p className="tt-kids-sub">Press the glowing key — match what you see!</p>
          </header>

          <div className="tt-kids-lessons">
            <p className="tt-kids-lessons-title">Lessons</p>
            {LESSONS.map((l, i) => {
              const active = i === lessonIdx;
              const done = doneSet.has(i);
              const lessonName = l.title.split("—")[1]?.trim() || l.title;
              return (
                <button
                  key={i}
                  className={`tt-kids-pill ${active ? "active" : ""} ${done ? "done" : ""}`}
                  onClick={() => { setLessonIdx(i); setItemIdx(0); setCharIdx(0); }}
                >
                  {(i + 1) + ". " + lessonName}
                </button>
              );
            })}
          </div>

          <div className="tt-kids-stage">
            <div className="tt-kids-lesson-title">{LESSONS[lessonIdx].title}</div>
            <div className="tt-kids-prompt">
              {promptChars.map((c, i) => {
                const cls =
                  "ch " +
                  (c.done ? "done " : "") +
                  (c.current ? "current " : "") +
                  (c.current && wrongFlash ? "wrong " : "");
                return <span key={i} className={cls}>{c.ch === " " ? "␣" : c.ch}</span>;
              })}
            </div>
            <div className="tt-kids-stats">
              <div className="tt-kids-stat">⭐ Score: <b>{score}</b></div>
              <div className="tt-kids-stat">⚡ WPM: <b>{wpm}</b></div>
              <div className="tt-kids-stat">🎯 Accuracy: <b>{acc}%</b></div>
              <div className="tt-kids-stat">💪 Streak: <b>{streak}</b></div>
            </div>
            {wordPraise && (
              <div className="tt-kids-praise" aria-live="polite">{wordPraise}</div>
            )}
          </div>

          <div className="tt-keyboard tt-kids-keyboard">
            {rows.map((row, i) => (
              <div key={i} className="tt-row">
                {row.map((key, j) => {
                  const isTarget =
                    currentChar !== undefined &&
                    ((currentChar === " " && key.code === "Space") ||
                      (currentChar.toLowerCase() === (key.k || "").toLowerCase() && (key.k || "").length === 1));
                  const pressedThis =
                    pressedKey &&
                    ((pressedKey.key === " " && key.code === "Space") ||
                      pressedKey.key === (key.k || "").toLowerCase());
                  const isText = (key.k || "").length > 1;
                  let cls = "tt-key";
                  if (key.cls) cls += " " + key.cls;
                  if (isText) cls += " text-key";
                  if (isTarget) cls += " target";
                  if (pressedThis) cls += pressedKey!.ok ? " pressed-correct" : " pressed-wrong";
                  return (
                    <div key={j} className={cls} data-finger={key.f}>{key.k}</div>
                  );
                })}
              </div>
            ))}
          </div>

          {showHands && <KidsHandGuide />}

          <div className="tt-kids-legend">
            <span><i style={{ background: "#ff8fb1" }} />L pinky</span>
            <span><i style={{ background: "#ffb86b" }} />L ring</span>
            <span><i style={{ background: "#ffe066" }} />L middle</span>
            <span><i style={{ background: "#a0e57c" }} />L index</span>
            <span><i style={{ background: "#5ec5ff" }} />R index</span>
            <span><i style={{ background: "#b48bff" }} />R middle</span>
            <span><i style={{ background: "#ff9bd6" }} />R ring</span>
            <span><i style={{ background: "#ff7a7a" }} />R pinky</span>
            <span><i style={{ background: "#888" }} />thumbs</span>
          </div>

          <div className="tt-kids-controls">
            <button
              className="skip"
              onClick={() => {
                const next = Math.min(lessonIdx + 1, LESSONS.length - 1);
                setLessonIdx(next); setItemIdx(0); setCharIdx(0);
              }}
            >
              ⏭ Skip Lesson
            </button>
            <button
              className="restart"
              onClick={() => {
                setLessonIdx(0); setItemIdx(0); setCharIdx(0);
                setScore(0); setCorrect(0); setStreak(0); setDoneSet(new Set());
                setStartTime(null); setNow(null); setTotalKeystrokes(0); setErrors(0);
              }}
            >
              🔄 Restart
            </button>
            <button
              className={`hands ${showHands ? "active" : ""}`}
              onClick={() => setShowHands((v) => !v)}
              aria-pressed={showHands}
            >
              🖐 {showHands ? "Hide hands" : "Show hands"}
            </button>
            <div className="tt-kids-layout-toggle">
              {(["mac", "win"] as Layout[]).map((l) => (
                <button
                  key={l}
                  className={layout === l ? "active" : ""}
                  onClick={() => setLayout(l)}
                >
                  {l === "mac" ? "🍎 Mac" : "🪟 Windows"}
                </button>
              ))}
            </div>
          </div>

          <div className="tt-kids-mode-toggle">
            {(["kids", "adults"] as Mode[]).map((m) => (
              <button
                key={m}
                className={mode === m ? "active" : ""}
                onClick={() => {
                  setMode(m);
                  if (m === "adults") resetAdults();
                  setStartTime(null); setNow(null); setTotalKeystrokes(0); setErrors(0);
                }}
              >
                {m === "kids" ? "🧒 Kids" : "👤 Adults"}
              </button>
            ))}
          </div>

          {/* Stars overlay */}
          <div className="tt-celebrate">
            {stars.map((s) => (
              <div
                key={s.id}
                className="tt-star"
                style={{
                  left: s.left + "vw",
                  top: s.top + "vh",
                  fontSize: s.size + "px",
                }}
              >
                {s.emoji}
              </div>
            ))}
          </div>

          {/* Big message */}
          <div className={`tt-kids-bigmsg ${bigMsg ? "show" : ""}`}>
            {bigMsg ? <>{bigMsg.title}<small>{bigMsg.sub}</small></> : null}
          </div>
        </>
      ) : (
        // ════════ ADULTS UI ════════
        <>
          <Link href="/" className="tt-adults-back">← Home</Link>

          <div className="tt-adults-mode-toggle">
            {(["kids", "adults"] as Mode[]).map((m) => (
              <button
                key={m}
                className={mode === m ? "active" : ""}
                onClick={() => {
                  setMode(m);
                  if (m === "adults") resetAdults();
                  setStartTime(null); setNow(null); setTotalKeystrokes(0); setErrors(0);
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="tt-adults-page">
            <div className="tt-section-label">
              <span>+ PRACTICE</span>
              <span className="rule" />
              <span>{category}</span>
            </div>

            <div className="tt-adults-stage">
              <div className="tt-adults-prompt-wrap">
                <div className="tt-adults-prompt">
                  {promptChars.map((c, i) => {
                    const cls =
                      "ch " +
                      (c.done ? "done " : "") +
                      (c.current ? "current " : "") +
                      (c.current && wrongFlash ? "wrong " : "");
                    return <span key={i} className={cls}>{c.ch}</span>;
                  })}
                </div>
              </div>
              <div className="tt-adults-stats">
                <Stat label="WPM" value={startTime ? String(wpm) : "0"} />
                <Stat label="Accuracy" value={`${acc}%`} />
                <Stat label="Errors" value={String(errors)} />
              </div>
            </div>

            <div className={`tt-keyboard tt-adults-keyboard ${layout}`}>
              {rows.map((row, i) => (
                <div key={i} className="tt-row">
                  {row.map((key, j) => {
                    const isTarget =
                      currentChar !== undefined &&
                      ((currentChar === " " && key.code === "Space") ||
                        (currentChar.toLowerCase() === (key.k || "").toLowerCase() && (key.k || "").length === 1));
                    const pressedThis =
                      pressedKey &&
                      ((pressedKey.key === " " && key.code === "Space") ||
                        pressedKey.key === (key.k || "").toLowerCase());
                    const isText = (key.k || "").length > 1;
                    let cls = "tt-key";
                    if (key.cls) cls += " " + key.cls;
                    if (isText) cls += " text-key";
                    if (isTarget) cls += " target";
                    if (pressedThis) cls += pressedKey!.ok ? " pressed-correct" : " pressed-wrong";
                    return <div key={j} className={cls} data-finger={key.f}>{key.k}</div>;
                  })}
                </div>
              ))}
            </div>

            <div className="tt-adults-legend">
              <span><i style={{ background: "#ff7aa1" }} />L pinky</span>
              <span><i style={{ background: "#ffa055" }} />L ring</span>
              <span><i style={{ background: "#ffd24a" }} />L middle</span>
              <span><i style={{ background: "#7dd060" }} />L index</span>
              <span><i style={{ background: "#4ec0ff" }} />R index</span>
              <span><i style={{ background: "#a585ff" }} />R middle</span>
              <span><i style={{ background: "#ff85ca" }} />R ring</span>
              <span><i style={{ background: "#ff6e6e" }} />R pinky</span>
              <span><i style={{ background: "#888" }} />thumbs</span>
            </div>

            <div className="tt-adults-controls">
              <div className="tt-adults-controls-left">
                <button className="primary" onClick={nextAdultText}>New text</button>
                <button onClick={resetAdults}>Reset</button>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setTextIdx(0);
                    resetAdults();
                  }}
                >
                  {Object.keys(ADULT_TEXTS).map((c) => (
                    <option key={c} value={c} style={{ color: "#000" }}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="tt-adults-layout-toggle">
                {(["mac", "win"] as Layout[]).map((l) => (
                  <button
                    key={l}
                    className={layout === l ? "active" : ""}
                    onClick={() => setLayout(l)}
                  >
                    {l === "mac" ? "Mac" : "Windows"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Adults big message */}
          <div className={`tt-adults-bigmsg ${bigMsg ? "show" : ""}`}>
            {bigMsg && (
              <div className="card">
                <h3>{bigMsg.title}</h3>
                <p>{bigMsg.sub}</p>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx global>{`
        /* Mobile-only notice — Touchtype needs a real keyboard. */
        .tt-mobile-notice { display: none; }
        @media (max-width: 820px), (pointer: coarse) {
          .tt-mobile-notice {
            display: flex;
            align-items: center;
            gap: 12px;
            position: fixed;
            top: 12px;
            left: 12px;
            right: 12px;
            z-index: 300;
            padding: 10px 12px 10px 14px;
            background: rgba(15, 15, 15, 0.92);
            color: #f5f5f5;
            border-radius: 12px;
            font: 500 13px/1.35 system-ui, -apple-system, sans-serif;
            box-shadow: 0 6px 20px rgba(0,0,0,0.25);
          }
          .tt-mobile-notice span { flex: 1; }
          .tt-mobile-notice-close {
            background: transparent;
            border: none;
            color: rgba(255,255,255,0.7);
            font-size: 22px;
            line-height: 1;
            padding: 0 4px;
            cursor: pointer;
          }
          .tt-mobile-notice-close:hover { color: #fff; }
        }

        /* ─────────────────────── KIDS THEME ─────────────────────── */
        .tt-root.tt-kids {
          font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', system-ui, sans-serif;
          color: #2b2d42;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: linear-gradient(135deg, #ffd6e8, #c9f0ff, #fff5b8);
          background-size: 400% 400%;
          animation: tt-bgShift 18s ease infinite;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 16px 16px;
          position: fixed;
          inset: 0;
        }
        @keyframes tt-bgShift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        .tt-kids-back {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 200;
          background: rgba(255,255,255,0.9);
          color: #555;
          padding: 6px 14px;
          border-radius: 22px;
          font-size: 13px;
          font-weight: bold;
          box-shadow: 0 3px 0 #b9c0d4;
          text-decoration: none;
        }
        .tt-kids-header { text-align: center; margin-bottom: 6px; }
        .tt-kids-header h1 {
          margin: 0;
          font-size: clamp(24px, 3.5vw, 38px);
          color: #ff5d8f;
          text-shadow: 2px 2px 0 #fff, 4px 4px 0 rgba(0,0,0,0.08);
          letter-spacing: 1px;
        }
        .tt-kids-sub {
          margin: 2px 0 0;
          font-size: clamp(13px, 1.4vw, 16px);
          color: #555;
        }
        .tt-kids-lessons {
          position: fixed;
          top: 56px;
          left: 12px;
          z-index: 150;
          width: 180px;
          max-height: calc(100vh - 76px);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 12px;
          background: rgba(255,255,255,0.92);
          border-radius: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10);
        }
        .tt-kids-lessons-title {
          font-size: 11px;
          font-weight: bold;
          color: #ff5d8f;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin: 0 0 2px;
          padding: 0 4px;
        }
        .tt-kids-pill {
          background: rgba(255,255,255,0.85);
          border-radius: 14px;
          padding: 6px 12px;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          box-shadow: 0 2px 0 #b9c0d4;
          border: none;
          font-family: inherit;
          text-align: left;
          width: 100%;
        }
        .tt-kids-pill.active {
          background: #ff5d8f;
          color: white;
          box-shadow: 0 2px 0 #b8326a;
        }
        .tt-kids-pill.done {
          background: #4ade80; color: white; box-shadow: 0 2px 0 #16a34a;
        }
        .tt-kids-stage {
          background: rgba(255,255,255,0.7);
          border-radius: 24px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          padding: 14px 22px;
          margin: 8px 0;
          text-align: center;
          min-width: 320px;
          max-width: 92vw;
          position: relative;
        }
        .tt-kids-praise {
          position: absolute;
          top: -14px;
          right: -22px;
          background: #fff;
          color: #ff5d8f;
          font-weight: bold;
          font-size: clamp(16px, 1.6vw, 20px);
          padding: 8px 16px;
          border-radius: 18px;
          box-shadow: 0 4px 0 #ffb3c8, 0 8px 18px rgba(0,0,0,0.08);
          animation: tt-praise-pop 900ms ease-out forwards;
          pointer-events: none;
        }
        @keyframes tt-praise-pop {
          0%   { transform: translateY(8px) scale(0.7); opacity: 0; }
          15%  { transform: translateY(-6px) scale(1.08); opacity: 1; }
          30%  { transform: translateY(0) scale(1); }
          80%  { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-12px) scale(0.95); opacity: 0; }
        }
        .tt-kids-lesson-title {
          font-size: clamp(16px, 1.8vw, 20px);
          color: #555;
          margin: 0 0 6px;
        }
        .tt-kids-prompt {
          font-family: 'Courier New', monospace;
          font-size: clamp(28px, 4.5vw, 52px);
          font-weight: bold;
          letter-spacing: 0.18em;
          line-height: 1.1;
          word-break: break-all;
          min-height: 1.2em;
        }
        .tt-kids-prompt .ch {
          display: inline-block;
          padding: 0 2px;
          transition: color 0.15s, transform 0.15s;
        }
        .tt-kids-prompt .ch.done { color: #4ade80; }
        .tt-kids-prompt .ch.current {
          color: #ff5d8f;
          transform: scale(1.25) translateY(-2px);
          animation: tt-bounce 0.9s infinite;
        }
        .tt-kids-prompt .ch.wrong {
          color: #f87171;
          animation: tt-shake 0.25s;
        }
        @keyframes tt-bounce {
          0%, 100% { transform: scale(1.25) translateY(-2px); }
          50%      { transform: scale(1.32) translateY(-6px); }
        }
        @keyframes tt-shake {
          0%,100% { transform: translateX(0) scale(1.25); }
          25%     { transform: translateX(-4px) scale(1.25); }
          75%     { transform: translateX(4px) scale(1.25); }
        }
        .tt-kids-stats {
          display: flex; gap: 18px; justify-content: center;
          margin-top: 8px;
          font-size: clamp(13px, 1.4vw, 16px);
        }
        .tt-kids-stat {
          background: #fff;
          border-radius: 12px;
          padding: 4px 12px;
          box-shadow: 0 3px 0 #b9c0d4;
        }
        .tt-kids-stat b { color: #ff5d8f; }

        .tt-kids-keyboard {
          background: rgba(255,255,255,0.55);
          border-radius: 24px;
          padding: 14px 14px 14px 84px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.10);
          margin-top: 6px;
          position: relative;
        }
        .tt-kids-keyboard .tt-row {
          display: flex; justify-content: center; gap: 6px; margin-bottom: 6px;
          position: relative;
        }
        .tt-kids-keyboard .tt-row:last-child { margin-bottom: 0; }
        .tt-kids-keyboard .tt-row::before {
          position: absolute;
          right: 100%;
          margin-right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          font-weight: bold;
          color: #ff5d8f;
          white-space: nowrap;
          pointer-events: none;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tt-kids-keyboard .tt-row:nth-child(1)::before { content: "Numbers"; }
        .tt-kids-keyboard .tt-row:nth-child(2)::before { content: "Top"; }
        .tt-kids-keyboard .tt-row:nth-child(3)::before { content: "Home"; }
        .tt-kids-keyboard .tt-row:nth-child(4)::before { content: "Bottom"; }
        .tt-kids-keyboard .tt-row:nth-child(5)::before { content: "Space"; }
        .tt-kids-keyboard .tt-key {
          --w: clamp(38px, 5.2vw, 60px);
          width: var(--w); height: var(--w);
          background: #fff;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-weight: bold;
          font-size: calc(var(--w) * 0.38);
          color: #444;
          box-shadow: 0 4px 0 #b9c0d4;
          user-select: none;
          border: none;
          transition: transform 0.06s, background 0.15s, box-shadow 0.06s;
        }
        .tt-kids-keyboard .tt-key.wide  { width: calc(var(--w) * 1.5); }
        .tt-kids-keyboard .tt-key.xwide { width: calc(var(--w) * 1.8); }
        .tt-kids-keyboard .tt-key.xxwide{ width: calc(var(--w) * 2.2); }
        .tt-kids-keyboard .tt-key.shift { width: calc(var(--w) * 2.3); }
        .tt-kids-keyboard .tt-key.space { width: calc(var(--w) * 7); }
        .tt-kids-keyboard .tt-key.text-key {
          font-size: calc(var(--w) * 0.22);
          text-transform: lowercase;
          letter-spacing: 0.5px;
          padding: 0 4px;
          overflow: hidden; white-space: nowrap;
        }
        .tt-kids-keyboard .tt-key.target {
          background: #ffe066;
          box-shadow: 0 4px 0 #c9a227, 0 0 0 4px rgba(255,224,102,0.6);
          animation: tt-pulse 1.1s infinite;
        }
        @keyframes tt-pulse {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
        .tt-kids-keyboard .tt-key.pressed-correct {
          background: #4ade80; color: white;
          transform: translateY(4px); box-shadow: 0 0 0 #b9c0d4;
        }
        .tt-kids-keyboard .tt-key.pressed-wrong {
          background: #f87171; color: white;
          transform: translateY(4px); box-shadow: 0 0 0 #b9c0d4;
        }
        .tt-kids-keyboard .tt-key[data-finger="L5"] { border-bottom: 4px solid #ff8fb1; }
        .tt-kids-keyboard .tt-key[data-finger="L4"] { border-bottom: 4px solid #ffb86b; }
        .tt-kids-keyboard .tt-key[data-finger="L3"] { border-bottom: 4px solid #ffe066; }
        .tt-kids-keyboard .tt-key[data-finger="L2"] { border-bottom: 4px solid #a0e57c; }
        .tt-kids-keyboard .tt-key[data-finger="R2"] { border-bottom: 4px solid #5ec5ff; }
        .tt-kids-keyboard .tt-key[data-finger="R3"] { border-bottom: 4px solid #b48bff; }
        .tt-kids-keyboard .tt-key[data-finger="R4"] { border-bottom: 4px solid #ff9bd6; }
        .tt-kids-keyboard .tt-key[data-finger="R5"] { border-bottom: 4px solid #ff7a7a; }
        .tt-kids-keyboard .tt-key[data-finger="T"]  { border-bottom: 4px solid #888; }

        /* Tactile homing bars on F and J — same nub real keyboards have. */
        .tt-key.homing { position: relative; }
        .tt-key.homing::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 6px;
          transform: translateX(-50%);
          width: 14px;
          height: 2px;
          background: currentColor;
          opacity: 0.55;
          border-radius: 2px;
          pointer-events: none;
        }
        .tt-adults-keyboard .tt-key.homing::after { bottom: 4px; width: 10px; }

        .tt-kids-legend {
          font-size: 11px; color: #555;
          margin-top: 6px;
          display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;
        }
        .tt-kids-legend span { display: inline-flex; align-items: center; gap: 4px; }
        .tt-kids-legend i {
          display: inline-block; width: 10px; height: 10px; border-radius: 50%;
        }

        .tt-kids-controls {
          margin-top: 8px;
          display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;
        }
        .tt-kids-controls button {
          font-family: inherit;
          font-size: 16px; font-weight: bold;
          padding: 8px 18px;
          border: none; border-radius: 14px;
          background: #5ec5ff; color: white;
          cursor: pointer;
          box-shadow: 0 4px 0 #2a8fc2;
          transition: transform 0.08s;
        }
        .tt-kids-controls button:hover { transform: translateY(-1px); }
        .tt-kids-controls button:active { transform: translateY(2px); box-shadow: 0 2px 0 #2a8fc2; }
        .tt-kids-controls button.skip {
          background: #ffae5c; box-shadow: 0 4px 0 #c97a26;
        }
        .tt-kids-controls button.restart {
          background: #c084fc; box-shadow: 0 4px 0 #7e22ce;
        }
        .tt-kids-controls button.hands {
          background: #fff; color: #555; box-shadow: 0 4px 0 #b9c0d4;
        }
        .tt-kids-controls button.hands.active {
          background: #4ade80; color: white; box-shadow: 0 4px 0 #16a34a;
        }
        .tt-kids-handguide {
          display: flex;
          justify-content: center;
          gap: clamp(40px, 8vw, 100px);
          margin-top: 8px;
          pointer-events: none;
          animation: tt-hands-fade 220ms ease-out;
        }
        .tt-kids-handguide img {
          height: clamp(90px, 14vh, 160px);
          width: auto;
          display: block;
        }
        @keyframes tt-hands-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tt-kids-layout-toggle {
          display: inline-flex;
          background: rgba(255,255,255,0.85);
          border-radius: 20px;
          padding: 3px;
          box-shadow: 0 3px 0 #b9c0d4;
          gap: 2px;
        }
        .tt-kids-layout-toggle button {
          background: transparent !important;
          color: #666 !important;
          box-shadow: none !important;
          padding: 5px 14px !important;
          font-size: 13px !important;
          border-radius: 16px !important;
          border: none;
          font-family: inherit;
          cursor: pointer;
        }
        .tt-kids-layout-toggle button.active {
          background: #ff5d8f !important;
          color: white !important;
          box-shadow: 0 2px 0 #b8326a !important;
        }

        .tt-kids-mode-toggle {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 200;
          display: inline-flex;
          background: rgba(255,255,255,0.9);
          border-radius: 22px;
          padding: 3px;
          box-shadow: 0 3px 0 #b9c0d4;
          gap: 2px;
        }
        .tt-kids-mode-toggle button {
          background: transparent;
          color: #666;
          border: none;
          padding: 6px 14px;
          font-family: inherit;
          font-size: 13px; font-weight: bold;
          cursor: pointer;
          border-radius: 18px;
        }
        .tt-kids-mode-toggle button.active {
          background: #ff5d8f; color: white;
          box-shadow: 0 2px 0 #b8326a;
        }

        .tt-celebrate {
          position: fixed; inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 50;
        }
        .tt-star {
          position: absolute;
          animation: tt-fly 1.4s ease-out forwards;
        }
        @keyframes tt-fly {
          0%   { transform: translateY(0) scale(0.4) rotate(0); opacity: 1; }
          100% { transform: translateY(-300px) scale(1.4) rotate(360deg); opacity: 0; }
        }

        .tt-kids-bigmsg {
          position: fixed;
          top: 35%; left: 50%;
          transform: translate(-50%, -50%) scale(0);
          background: white;
          padding: 30px 50px;
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          font-size: 36px;
          color: #ff5d8f;
          text-align: center;
          z-index: 100;
          transition: transform 0.4s cubic-bezier(.5,1.7,.5,1);
          font-family: 'Comic Sans MS', system-ui, sans-serif;
        }
        .tt-kids-bigmsg.show {
          transform: translate(-50%, -50%) scale(1);
        }
        .tt-kids-bigmsg small {
          display: block; font-size: 18px; color: #555; margin-top: 8px;
        }

        /* ─────────────────────── ADULTS THEME ─────────────────────── */
        .tt-root.tt-adults {
          font-family: var(--font-inter, 'Inter', -apple-system, sans-serif);
          color: #fff;
          background: #0a0a0a;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: fixed;
          inset: 0;
        }
        .tt-adults-page {
          position: relative; z-index: 1;
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px 20px 16px;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .tt-adults-back {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 200;
          background: #0a0a0a;
          color: #fff;
          padding: 8px 16px;
          border: 1.5px solid rgba(255,255,255,0.8);
          font-family: var(--font-inter, sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .tt-adults-back:hover { background: #fff; color: #0a0a0a; }

        .tt-adults-mode-toggle {
          position: fixed;
          top: 12px;
          right: 12px;
          z-index: 200;
          display: inline-flex;
          border: 1.5px solid rgba(255,255,255,0.8);
          background: #0a0a0a;
        }
        .tt-adults-mode-toggle button {
          background: transparent;
          color: #fff;
          border: 0;
          padding: 8px 16px;
          font-family: var(--font-inter, sans-serif);
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .tt-adults-mode-toggle button.active {
          background: #fff;
          color: #0a0a0a;
        }
        .tt-adults-mode-toggle button + button {
          border-left: 1.5px solid rgba(255,255,255,0.8);
        }

        .tt-section-label {
          font-size: 0.6875rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        .tt-section-label .rule {
          flex: 1; height: 1px; background: rgba(255,255,255,0.2);
        }

        .tt-adults-stage {
          border: 1.5px solid rgba(255,255,255,0.3);
          padding: 16px 20px 14px;
          margin-bottom: 14px;
          flex-shrink: 0;
        }
        .tt-adults-prompt-wrap {
          max-height: 22vh;
          overflow: hidden;
          mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
        }
        .tt-adults-prompt {
          font-family: var(--font-playfair, Georgia, serif);
          font-weight: 400;
          font-size: clamp(18px, 2.2vw, 24px);
          line-height: 1.55;
          color: rgba(255,255,255,0.4);
          word-break: break-word;
          user-select: none;
        }
        .tt-adults-prompt .ch { transition: color 0.12s; display: inline; }
        .tt-adults-prompt .ch.done { color: #fff; }
        .tt-adults-prompt .ch.current {
          color: #fff;
          border-bottom: 2px solid #ffd84a;
        }
        .tt-adults-prompt .ch.wrong {
          color: #fff;
          background: #ff5e5e;
        }

        .tt-adults-stats {
          display: flex; gap: 24px; flex-wrap: wrap;
          margin-top: 12px; padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.2);
        }
        .tt-adults-stat {
          display: flex; flex-direction: column; gap: 2px;
        }
        .tt-adults-stat .label {
          font-size: 0.625rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
        }
        .tt-adults-stat .value {
          font-family: var(--font-playfair, Georgia, serif);
          font-size: 1.25rem; font-weight: 700; color: #fff;
        }

        .tt-adults-keyboard {
          border: 1.5px solid rgba(255,255,255,0.3);
          padding: 10px;
          margin: 0 0 12px;
          background: transparent;
          flex-shrink: 0;
        }
        .tt-adults-keyboard .tt-row {
          display: flex; justify-content: center; gap: 5px; margin-bottom: 5px;
        }
        .tt-adults-keyboard .tt-row:last-child { margin-bottom: 0; }
        .tt-adults-keyboard .tt-key {
          --w: clamp(28px, 4vw, 44px);
          width: var(--w); height: var(--w);
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-inter, sans-serif);
          font-weight: 500;
          font-size: calc(var(--w) * 0.36);
          user-select: none;
          transition: background 0.1s, border-color 0.1s, color 0.1s, transform 0.05s;
        }
        .tt-adults-keyboard .tt-key.wide   { width: calc(var(--w) * 1.5); }
        .tt-adults-keyboard .tt-key.xwide  { width: calc(var(--w) * 1.8); }
        .tt-adults-keyboard .tt-key.xxwide { width: calc(var(--w) * 2.2); }
        .tt-adults-keyboard .tt-key.shift  { width: calc(var(--w) * 2.3); }
        .tt-adults-keyboard .tt-key.space  { width: calc(var(--w) * 7); }
        .tt-adults-keyboard .tt-key.text-key {
          font-size: calc(var(--w) * 0.22);
          text-transform: lowercase;
          letter-spacing: 0.05em;
          padding: 0 6px;
          overflow: hidden; white-space: nowrap;
        }
        .tt-adults-keyboard .tt-key.target {
          background: #ffd84a;
          border-color: #ffd84a;
          color: #0a0a0a;
        }
        .tt-adults-keyboard .tt-key.pressed-correct {
          background: #fff; color: #0a0a0a; border-color: #fff;
          transform: translateY(1px);
        }
        .tt-adults-keyboard .tt-key.pressed-wrong {
          background: #ff5e5e; color: #fff; border-color: #ff5e5e;
          transform: translateY(1px);
        }

        /* Finger-color stripes */
        .tt-adults-keyboard .tt-key[data-finger="L5"] { border-bottom: 3px solid #ff7aa1; }
        .tt-adults-keyboard .tt-key[data-finger="L4"] { border-bottom: 3px solid #ffa055; }
        .tt-adults-keyboard .tt-key[data-finger="L3"] { border-bottom: 3px solid #ffd24a; }
        .tt-adults-keyboard .tt-key[data-finger="L2"] { border-bottom: 3px solid #7dd060; }
        .tt-adults-keyboard .tt-key[data-finger="R2"] { border-bottom: 3px solid #4ec0ff; }
        .tt-adults-keyboard .tt-key[data-finger="R3"] { border-bottom: 3px solid #a585ff; }
        .tt-adults-keyboard .tt-key[data-finger="R4"] { border-bottom: 3px solid #ff85ca; }
        .tt-adults-keyboard .tt-key[data-finger="R5"] { border-bottom: 3px solid #ff6e6e; }
        .tt-adults-keyboard .tt-key[data-finger="T"]  { border-bottom: 3px solid #888; }
        .tt-adults-keyboard .tt-key.target[data-finger] { border-bottom-color: #c9a227; }

        .tt-adults-legend {
          display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;
          margin: 0 0 12px;
          font-size: 0.625rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        .tt-adults-legend span {
          display: inline-flex; align-items: center; gap: 5px;
        }
        .tt-adults-legend i {
          display: inline-block; width: 8px; height: 8px; border-radius: 50%;
        }

        /* Mac-layout Magic-Keyboard look (adults mode only) */
        .tt-adults-keyboard.mac {
          background: linear-gradient(#e6e6e8, #d2d2d6);
          border: 1px solid #a8a8ac;
          border-radius: 6px;
          padding: 12px 12px 12px 78px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 4px 16px rgba(0,0,0,0.4);
        }
        .tt-adults-keyboard.mac .tt-key {
          background: linear-gradient(#fbfbfb, #ececee);
          border: 1px solid #bababe;
          color: #1d1d1f;
          border-radius: 4px;
          box-shadow: 0 1px 0 #a8a8ac, inset 0 1px 0 rgba(255,255,255,0.8);
          font-weight: 400;
        }
        /* Re-apply finger-color stripes on top of the Mac key border */
        .tt-adults-keyboard.mac .tt-key[data-finger="L5"] { border-bottom: 3px solid #ff7aa1; }
        .tt-adults-keyboard.mac .tt-key[data-finger="L4"] { border-bottom: 3px solid #ffa055; }
        .tt-adults-keyboard.mac .tt-key[data-finger="L3"] { border-bottom: 3px solid #ffd24a; }
        .tt-adults-keyboard.mac .tt-key[data-finger="L2"] { border-bottom: 3px solid #7dd060; }
        .tt-adults-keyboard.mac .tt-key[data-finger="R2"] { border-bottom: 3px solid #4ec0ff; }
        .tt-adults-keyboard.mac .tt-key[data-finger="R3"] { border-bottom: 3px solid #a585ff; }
        .tt-adults-keyboard.mac .tt-key[data-finger="R4"] { border-bottom: 3px solid #ff85ca; }
        .tt-adults-keyboard.mac .tt-key[data-finger="R5"] { border-bottom: 3px solid #ff6e6e; }
        .tt-adults-keyboard.mac .tt-key[data-finger="T"]  { border-bottom: 3px solid #888; }
        .tt-adults-keyboard.mac .tt-key.target {
          background: #ffd84a;
          border-color: #c9a227;
          color: #1d1d1f;
          box-shadow: 0 1px 0 #c9a227, inset 0 1px 0 rgba(255,255,255,0.5);
        }
        .tt-adults-keyboard.mac .tt-key.pressed-correct {
          background: #1d1d1f; color: #fff; border-color: #1d1d1f;
          box-shadow: none;
          transform: translateY(1px);
        }
        .tt-adults-keyboard.mac .tt-key.pressed-wrong {
          background: #ff5e5e; color: #fff; border-color: #c63b3b;
          box-shadow: none;
          transform: translateY(1px);
        }

        /* Row labels (adults keyboard, both variants) */
        .tt-adults-keyboard {
          position: relative;
          padding-left: 78px;
        }
        .tt-adults-keyboard .tt-row { position: relative; }
        .tt-adults-keyboard .tt-row::before {
          position: absolute;
          right: 100%;
          margin-right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.625rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          font-weight: 500;
          white-space: nowrap;
          pointer-events: none;
        }
        .tt-adults-keyboard .tt-row:nth-child(1)::before { content: "Numbers"; }
        .tt-adults-keyboard .tt-row:nth-child(2)::before { content: "Top"; }
        .tt-adults-keyboard .tt-row:nth-child(3)::before { content: "Home"; }
        .tt-adults-keyboard .tt-row:nth-child(4)::before { content: "Bottom"; }
        .tt-adults-keyboard .tt-row:nth-child(5)::before { content: "Space"; }
        .tt-adults-keyboard.mac .tt-row::before { color: #555; }

        .tt-adults-controls {
          display: flex;
          gap: 10px; flex-wrap: wrap;
          align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .tt-adults-controls-left {
          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
        }
        .tt-adults-controls button,
        .tt-adults-controls select {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,0.8);
          color: #fff;
          padding: 6px 12px;
          font-family: var(--font-inter, sans-serif);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .tt-adults-controls button:hover,
        .tt-adults-controls select:hover {
          background: #fff; color: #0a0a0a;
        }
        .tt-adults-controls button.primary {
          background: #fff; color: #0a0a0a;
        }
        .tt-adults-controls button.primary:hover {
          background: transparent; color: #fff;
        }

        .tt-adults-layout-toggle {
          display: inline-flex;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .tt-adults-layout-toggle button {
          background: transparent;
          border: 0;
          color: rgba(255,255,255,0.6);
          padding: 6px 12px;
          font-family: var(--font-inter, sans-serif);
          font-size: 0.625rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .tt-adults-layout-toggle button.active {
          background: #fff; color: #0a0a0a;
        }
        .tt-adults-layout-toggle button + button {
          border-left: 1px solid rgba(255,255,255,0.3);
        }

        .tt-adults-bigmsg {
          position: fixed; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none; z-index: 60;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .tt-adults-bigmsg.show { opacity: 1; }
        .tt-adults-bigmsg .card {
          border: 2px solid #fff;
          background: #0a0a0a;
          padding: 28px 44px;
          text-align: center;
          transform: scale(0.95);
          animation: tt-pop 0.3s cubic-bezier(.5,1.7,.5,1) forwards;
        }
        @keyframes tt-pop { to { transform: scale(1); } }
        .tt-adults-bigmsg h3 {
          font-family: var(--font-playfair, Georgia, serif);
          font-style: italic; font-weight: 700;
          font-size: 2rem; margin: 0 0 8px;
        }
        .tt-adults-bigmsg p {
          font-size: 0.75rem; letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="tt-adults-stat">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}

function KidsHandGuide() {
  return (
    <div className="tt-kids-handguide" aria-hidden="true">
      <img src="/left-hand.svg" alt="" />
      <img src="/right-hand.svg" alt="" />
    </div>
  );
}
