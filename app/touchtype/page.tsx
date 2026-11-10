"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BackLink from "@/components/BackLink";
import s from "./touchtype.module.css";

type Finger = "L5" | "L4" | "L3" | "L2" | "R2" | "R3" | "R4" | "R5" | "T";
type KeyDef = {
  k: string;
  code?: string;
  size?: "wide" | "xwide" | "xxwide" | "shift" | "space";
  f: Finger;
  homing?: boolean;
};
type Layout = "mac" | "win";
type Lesson = { name: string; short: string; keys: string; items: string[] };
type Result = {
  wpm: number;
  acc: number;
  errors: number;
  ms: number;
  chars: number;
};
type Best = Record<string, { wpm: number; acc: number }>;

const ROW1_BASE: KeyDef[] = [
  { k: "`", f: "L5" },
  { k: "1", f: "L5" },
  { k: "2", f: "L4" },
  { k: "3", f: "L3" },
  { k: "4", f: "L2" },
  { k: "5", f: "L2" },
  { k: "6", f: "R2" },
  { k: "7", f: "R2" },
  { k: "8", f: "R3" },
  { k: "9", f: "R4" },
  { k: "0", f: "R5" },
  { k: "-", f: "R5" },
  { k: "=", f: "R5" },
];
const ROW2: KeyDef[] = [
  { k: "tab", code: "Tab", size: "wide", f: "L5" },
  { k: "q", f: "L5" },
  { k: "w", f: "L4" },
  { k: "e", f: "L3" },
  { k: "r", f: "L2" },
  { k: "t", f: "L2" },
  { k: "y", f: "R2" },
  { k: "u", f: "R2" },
  { k: "i", f: "R3" },
  { k: "o", f: "R4" },
  { k: "p", f: "R5" },
  { k: "[", f: "R5" },
  { k: "]", f: "R5" },
  { k: "\\", f: "R5" },
];
const ROW4: KeyDef[] = [
  { k: "shift", code: "ShiftLeft", size: "shift", f: "L5" },
  { k: "z", f: "L5" },
  { k: "x", f: "L4" },
  { k: "c", f: "L3" },
  { k: "v", f: "L2" },
  { k: "b", f: "L2" },
  { k: "n", f: "R2" },
  { k: "m", f: "R2" },
  { k: ",", f: "R3" },
  { k: ".", f: "R4" },
  { k: "/", f: "R5" },
  { k: "shift", code: "ShiftRight", size: "shift", f: "R5" },
];

function row1(layout: Layout): KeyDef[] {
  return [
    ...ROW1_BASE,
    {
      k: layout === "mac" ? "delete" : "backspace",
      code: "Backspace",
      size: layout === "mac" ? "wide" : "xxwide",
      f: "R5",
    },
  ];
}

function row3(layout: Layout): KeyDef[] {
  return [
    {
      k: layout === "mac" ? "caps" : "caps lock",
      code: "CapsLock",
      size: "xwide",
      f: "L5",
    },
    { k: "a", f: "L5" },
    { k: "s", f: "L4" },
    { k: "d", f: "L3" },
    { k: "f", f: "L2", homing: true },
    { k: "g", f: "L2" },
    { k: "h", f: "R2" },
    { k: "j", f: "R2", homing: true },
    { k: "k", f: "R3" },
    { k: "l", f: "R4" },
    { k: ";", f: "R5" },
    { k: "'", f: "R5" },
    {
      k: layout === "mac" ? "return" : "enter",
      code: "Enter",
      size: "xwide",
      f: "R5",
    },
  ];
}

function bottomRow(layout: Layout): KeyDef[] {
  if (layout === "mac") {
    return [
      { k: "fn", size: "wide", f: "L5" },
      { k: "⌃", code: "ControlLeft", f: "L5" },
      { k: "⌥", code: "AltLeft", f: "L5" },
      { k: "⌘", code: "MetaLeft", size: "wide", f: "L5" },
      { k: "space", code: "Space", size: "space", f: "T" },
      { k: "⌘", code: "MetaRight", size: "wide", f: "R5" },
      { k: "⌥", code: "AltRight", f: "R5" },
      { k: "←", code: "ArrowLeft", f: "R5" },
      { k: "↓", code: "ArrowDown", f: "R5" },
      { k: "↑", code: "ArrowUp", f: "R5" },
      { k: "→", code: "ArrowRight", f: "R5" },
    ];
  }
  return [
    { k: "ctrl", code: "ControlLeft", size: "wide", f: "L5" },
    { k: "win", code: "MetaLeft", f: "L5" },
    { k: "alt", code: "AltLeft", f: "L5" },
    { k: "space", code: "Space", size: "space", f: "T" },
    { k: "alt", code: "AltRight", f: "R5" },
    { k: "win", code: "MetaRight", f: "R5" },
    { k: "menu", code: "ContextMenu", f: "R5" },
    { k: "ctrl", code: "ControlRight", size: "wide", f: "R5" },
  ];
}

function getRows(layout: Layout): KeyDef[][] {
  return [row1(layout), ROW2, row3(layout), ROW4, bottomRow(layout)];
}

const SHIFTED: Record<string, string> = {
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  "{": "[",
  "}": "]",
  "|": "\\",
  ":": ";",
  '"': "'",
  "<": ",",
  ">": ".",
  "?": "/",
};

const FINGER_NAMES: Record<Finger, string> = {
  L5: "left little finger",
  L4: "left ring finger",
  L3: "left middle finger",
  L2: "left index finger",
  R2: "right index finger",
  R3: "right middle finger",
  R4: "right ring finger",
  R5: "right little finger",
  T: "either thumb",
};

const LESSONS: Lesson[] = [
  {
    name: "Home row, left hand",
    short: "Left hand",
    keys: "a s d f",
    items: [
      "a",
      "s",
      "d",
      "f",
      "a s d f",
      "f d s a",
      "fad",
      "sad",
      "dad",
      "fad sad dad",
    ],
  },
  {
    name: "Home row, right hand",
    short: "Right hand",
    keys: "j k l ;",
    items: ["j", "k", "l", ";", "j k l ;", "; l k j", "jj kk ll", "jkl; ;lkj"],
  },
  {
    name: "Both hands on the home row",
    short: "Home row",
    keys: "a to ;",
    items: ["asdf jkl;", "fall", "glass", "flask", "dad asks", "all lads fall"],
  },
  {
    name: "Top row",
    short: "Top row",
    keys: "q to p",
    items: [
      "e",
      "r",
      "i",
      "o",
      "top",
      "yes",
      "try",
      "you",
      "quiet",
      "query",
      "type",
    ],
  },
  {
    name: "Bottom row",
    short: "Bottom row",
    keys: "z to /",
    items: ["c", "v", "b", "n", "m", "cab", "van", "man", "zinc", "next move"],
  },
  {
    name: "Common words",
    short: "Words",
    keys: "short words",
    items: [
      "the",
      "and",
      "you",
      "with",
      "have",
      "from",
      "work",
      "time",
      "make",
      "great",
      "about",
    ],
  },
  {
    name: "Short sentences",
    short: "Sentences",
    keys: "words and spaces",
    items: [
      "i can type",
      "keep your eyes up",
      "rest on the home row",
      "slow is smooth",
      "a calm, steady pace",
    ],
  },
  {
    name: "Longer sentences",
    short: "Long lines",
    keys: "finding a rhythm",
    items: [
      "accuracy comes before speed",
      "small steps every day add up",
      "type without looking at your hands",
      "the quick brown fox jumps",
    ],
  },
  {
    name: "Frequent words",
    short: "Frequent words",
    keys: "real text",
    items: [
      "the of and to a in for is on that by this with you it not or be are from at as your all have new more time they up may what which can us about if my has but our one other do no",
      "people just then had he could about her than out them all use word can may these our know which down way most look great because each how only over right come into new years",
    ],
  },
  {
    name: "Pangrams",
    short: "Pangrams",
    keys: "every letter",
    items: [
      "the quick brown fox jumps over the lazy dog. pack my box with five dozen liquor jugs.",
      "how vexingly quick daft zebras jump! sphinx of black quartz, judge my vow.",
    ],
  },
  {
    name: "Quotes",
    short: "Quotes",
    keys: "longer passages",
    items: [
      "the only way to do great work is to love what you do. if you haven't found it yet, keep looking.",
      "design is not just what it looks like and feels like. design is how it works.",
      "less, but better. perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    ],
  },
  {
    name: "Punctuation",
    short: "Punctuation",
    keys: "commas to quotes",
    items: [
      'well, here we are, at last. is this it? "yes," she said, "this is it." don\'t worry; everything\'s fine.',
      "list one, list two, list three: apples, oranges, pears. ready? set. go!",
    ],
  },
  {
    name: "Code",
    short: "Code",
    keys: "symbols and brackets",
    items: [
      "const greet = (name) => `hello, ${name}`; const sum = (a, b) => a + b; const isEven = (n) => n % 2 === 0;",
      "function once(fn) { let done = false; return (...args) => { if (done) return; done = true; return fn(...args); }; }",
    ],
  },
];

const BEST_KEY = "ttLabProgress";
const SOUND_KEY = "ttLabSound";
const LAYOUT_KEY = "ttLayout";

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {}
}

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function speed(chars: number, ms: number) {
  if (ms < 1000) return 0;
  return Math.round(chars / 5 / (ms / 60000));
}

function accuracy(keystrokes: number, errors: number) {
  if (keystrokes === 0) return 100;
  return Math.round(((keystrokes - errors) / keystrokes) * 100);
}

function cx(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(" ");
}

export default function TouchTypePage() {
  const [layout, setLayout] = useState<Layout>("mac");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [itemIdx, setItemIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);
  const [doneChars, setDoneChars] = useState(0);
  const [drillStart, setDrillStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [pressed, setPressed] = useState<{ key: string; ok: boolean } | null>(
    null,
  );
  const [result, setResult] = useState<Result | null>(null);
  const [best, setBest] = useState<Best>({});
  const [cleared, setCleared] = useState<Best | null>(null);
  const [sound, setSound] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(true);

  const practiceRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const lastSoundRef = useRef(0);
  const pressTimer = useRef<number | null>(null);

  useEffect(() => {
    let l: string | null = null;
    try {
      l = window.localStorage.getItem(LAYOUT_KEY);
    } catch {}
    if (l === "mac" || l === "win") setLayout(l);
    setBest(readJson<Best>(BEST_KEY, {}));
    setSound(readJson<boolean>(SOUND_KEY, false));
  }, []);

  useEffect(() => {
    if (drillStart === null) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [drillStart]);

  const lesson = LESSONS[lessonIdx];
  const text = lesson.items[itemIdx] ?? "";
  const expected = result ? undefined : text[charIdx];
  const rows = useMemo(() => getRows(layout), [layout]);

  const guide = useMemo(() => {
    if (expected === undefined) return null;
    const isSpace = expected === " ";
    const base = SHIFTED[expected] ?? expected.toLowerCase();
    const shift = expected in SHIFTED || expected !== expected.toLowerCase();
    let target: KeyDef | undefined;
    for (const row of rows) {
      for (const key of row) {
        if (
          isSpace ? key.code === "Space" : key.k === base && key.k.length === 1
        )
          target = key;
      }
    }
    if (!target) return null;
    const shiftCode = target.f.startsWith("L") ? "ShiftRight" : "ShiftLeft";
    const shiftFinger: Finger = target.f.startsWith("L") ? "R5" : "L5";
    const label = isSpace ? "space" : expected;
    let sentence = `Press ${label} with your ${FINGER_NAMES[target.f]}`;
    if (shift) {
      const side = shiftFinger === "R5" ? "right" : "left";
      sentence += `, holding the ${side} shift with your ${side} little finger`;
    }
    return {
      target,
      finger: target.f,
      shift,
      shiftCode,
      shiftFinger,
      sentence: `${sentence}.`,
    };
  }, [expected, rows]);

  const playTone = useCallback(
    (freq: number, dur: number, type: OscillatorType) => {
      if (!sound) return;
      const t = performance.now();
      if (t - lastSoundRef.current < 120) return;
      lastSoundRef.current = t;
      try {
        if (!audioRef.current) {
          const Ctor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!Ctor) return;
          audioRef.current = new Ctor();
        }
        const ctx = audioRef.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = 0.03;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
        o.stop(ctx.currentTime + dur);
      } catch {}
    },
    [sound],
  );

  const resetCounters = useCallback(() => {
    setItemIdx(0);
    setCharIdx(0);
    setKeystrokes(0);
    setErrors(0);
    setDoneChars(0);
    setDrillStart(null);
    setWrong(false);
    setPressed(null);
    setResult(null);
  }, []);

  const focusPractice = useCallback((scroll: boolean) => {
    const el = practiceRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    if (scroll) {
      const top = el.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5)
        el.scrollIntoView({ block: "start", behavior: "instant" });
    }
  }, []);

  const startLesson = useCallback(
    (i: number, scroll: boolean) => {
      setLessonIdx(i);
      resetCounters();
      focusPractice(scroll);
    },
    [resetCounters, focusPractice],
  );

  const flashKey = useCallback((key: string, ok: boolean) => {
    setPressed({ key, ok });
    if (pressTimer.current) window.clearTimeout(pressTimer.current);
    pressTimer.current = window.setTimeout(() => setPressed(null), 160);
  }, []);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      )
        return;
      const key = e.code === "Space" ? " " : e.key;
      if (key.length !== 1) return;
      if (expected === undefined) return;
      e.preventDefault();

      const stamp = Date.now();
      const start = drillStart ?? stamp;
      if (drillStart === null) {
        setDrillStart(stamp);
        setNow(stamp);
      }
      const strokes = keystrokes + 1;
      setKeystrokes(strokes);

      if (key.toLowerCase() !== expected.toLowerCase()) {
        playTone(180, 0.1, "square");
        setErrors((n) => n + 1);
        setWrong(true);
        flashKey(SHIFTED[key] ?? key.toLowerCase(), false);
        return;
      }

      playTone(880, 0.04, "sine");
      setWrong(false);
      flashKey(SHIFTED[expected] ?? expected.toLowerCase(), true);
      const next = charIdx + 1;
      if (next < text.length) {
        setCharIdx(next);
        return;
      }

      const totalChars = doneChars + text.length;
      const totalMs = stamp - start;
      if (itemIdx + 1 < lesson.items.length) {
        setDoneChars(totalChars);
        setItemIdx(itemIdx + 1);
        setCharIdx(0);
        return;
      }

      const finished: Result = {
        wpm: speed(totalChars, totalMs),
        acc: accuracy(strokes, errors),
        errors,
        ms: totalMs,
        chars: totalChars,
      };
      setCharIdx(next);
      setDoneChars(totalChars);
      setDrillStart(null);
      setResult(finished);
      setBest((prev) => {
        const old = prev[lessonIdx];
        const keep = old && old.wpm >= finished.wpm && old.acc >= finished.acc;
        const merged = keep
          ? prev
          : {
              ...prev,
              [lessonIdx]: {
                wpm: Math.max(finished.wpm, old?.wpm ?? 0),
                acc: Math.max(finished.acc, old?.acc ?? 0),
              },
            };
        writeValue(BEST_KEY, JSON.stringify(merged));
        return merged;
      });
    },
    [
      expected,
      drillStart,
      keystrokes,
      playTone,
      flashKey,
      charIdx,
      text,
      doneChars,
      itemIdx,
      lesson,
      errors,
      lessonIdx,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    return () => {
      if (pressTimer.current) window.clearTimeout(pressTimer.current);
    };
  }, []);

  const liveMs = result
    ? result.ms
    : drillStart !== null
      ? Math.max(0, now - drillStart)
      : 0;
  const liveChars = result ? result.chars : doneChars + charIdx;
  const wpm = result ? result.wpm : speed(liveChars, liveMs);
  const acc = result ? result.acc : accuracy(keystrokes, errors);
  const isShort = text.length <= 40;
  const words = useMemo(() => {
    const out: { text: string; start: number }[] = [];
    const re = /\S*\s*/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) && m[0].length > 0)
      out.push({ text: m[0], start: m.index });
    return out;
  }, [text]);
  const nextLesson = lessonIdx + 1 < LESSONS.length ? lessonIdx + 1 : null;

  const chooseLayout = (l: Layout) => {
    setLayout(l);
    writeValue(LAYOUT_KEY, l);
    focusPractice(false);
  };

  const toggleSound = () => {
    setSound((v) => {
      writeValue(SOUND_KEY, JSON.stringify(!v));
      return !v;
    });
    focusPractice(false);
  };

  const clearProgress = () => {
    setCleared(best);
    setBest({});
    writeValue(BEST_KEY, "{}");
  };

  const undoClear = () => {
    if (!cleared) return;
    setBest(cleared);
    writeValue(BEST_KEY, JSON.stringify(cleared));
    setCleared(null);
  };

  const fingerLit = (f: Finger) =>
    guide !== null &&
    (guide.finger === f || (guide.shift && guide.shiftFinger === f));

  return (
    <div className={s.root}>
      <div className={s.shell}>
        <aside className={s.menu}>
          <BackLink className={s.back}>Back to neilmcardle.com</BackLink>
          <h1 className={s.title}>
            <span className={s.mark} aria-hidden="true">
              f
            </span>
            Touch typing
          </h1>
          <p className={s.lede}>
            <span className={s.subject}>
              I built this to learn to type without looking.
            </span>{" "}
            Pick a lesson and type what you see.
          </p>
          <nav className={s.strip} aria-label="Lessons">
            <ol className={s.stripList}>
              {LESSONS.map((l, i) => {
                const b = best[i];
                return (
                  <li key={l.name}>
                    <button
                      type="button"
                      className={s.chip}
                      aria-current={i === lessonIdx ? "step" : undefined}
                      aria-label={`Lesson ${i + 1}, ${l.name}${b ? `, done, best ${b.wpm} words a minute at ${b.acc}%` : ""}`}
                      onClick={() => startLesson(i, false)}
                    >
                      <span className={s.chipNum}>{i + 1}</span>
                      <span className={s.chipName}>{l.short}</span>
                      {b && (
                        <svg
                          className={s.tick}
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3.5 8.5l3 3 6-7"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          {noticeOpen && (
            <div className={s.notice} role="status">
              <p>This needs a physical keyboard.</p>
              <button
                type="button"
                className={cx(s.btn, s.btnText)}
                onClick={() => setNoticeOpen(false)}
              >
                Dismiss
              </button>
            </div>
          )}
        </aside>

        <section
          ref={practiceRef}
          className={s.practice}
          tabIndex={-1}
          aria-label={`Typing practice, lesson ${lessonIdx + 1}: ${lesson.name}`}
        >
          <div className={s.practiceTop}>
            <h2 className={s.practiceName}>
              {lessonIdx + 1}. {lesson.name}{" "}
              <span className={s.lessonKeys}>{lesson.keys}</span>
            </h2>
            <span className={s.progress}>
              {result
                ? "Finished"
                : `Drill ${itemIdx + 1} of ${lesson.items.length}`}
            </span>
          </div>

          {result ? (
            <div className={s.result} aria-live="polite">
              <p className={s.resultTitle}>
                {result.acc >= 95
                  ? "Lesson done. That was clean."
                  : "Lesson done. Try it once more for accuracy."}
              </p>
              <p className={s.resultLine}>
                You typed {result.chars} characters in {formatTime(result.ms)}{" "}
                at {result.wpm} words a minute, with {result.acc}% accuracy and{" "}
                {result.errors} {result.errors === 1 ? "mistake" : "mistakes"}.{" "}
                {result.acc >= 95
                  ? "Move on when it feels easy."
                  : "Slow down a little. Accuracy first, and speed follows."}
              </p>
              <div className={s.resultActions}>
                {nextLesson !== null && (
                  <button
                    type="button"
                    className={cx(s.btn, s.btnPrimary)}
                    onClick={() => startLesson(nextLesson, false)}
                  >
                    Start lesson {nextLesson + 1}
                  </button>
                )}
                <button
                  type="button"
                  className={s.btn}
                  onClick={() => startLesson(lessonIdx, false)}
                >
                  Repeat this lesson
                </button>
              </div>
            </div>
          ) : (
            <>
              <p
                className={cx(s.prompt, isShort ? s.promptShort : s.promptLong)}
                aria-label={`Type: ${text}`}
              >
                {words.map((w) => (
                  <span key={w.start} className={s.word}>
                    {Array.from(w.text).map((ch, j) => {
                      const i = w.start + j;
                      return (
                        <span
                          key={i}
                          aria-hidden="true"
                          className={cx(
                            s.ch,
                            i < charIdx && s.chDone,
                            i === charIdx && s.chCurrent,
                            i === charIdx && wrong && s.chWrong,
                          )}
                        >
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                ))}
              </p>

              <div className={s.guide}>
                <p className={s.hint}>
                  {guide
                    ? guide.sentence
                    : "Start typing whenever you are ready."}
                </p>
                <div className={s.hands} aria-hidden="true">
                  <div className={s.hand}>
                    {(["L5", "L4", "L3", "L2"] as Finger[]).map((f, i) => (
                      <span
                        key={f}
                        className={cx(s.finger, fingerLit(f) && s.fingerOn)}
                        style={{ height: [12, 18, 20, 18][i] }}
                      />
                    ))}
                    <span
                      className={cx(s.finger, fingerLit("T") && s.fingerOn)}
                      style={{ height: 8 }}
                    />
                  </div>
                  <div className={s.hand}>
                    <span
                      className={cx(s.finger, fingerLit("T") && s.fingerOn)}
                      style={{ height: 8 }}
                    />
                    {(["R2", "R3", "R4", "R5"] as Finger[]).map((f, i) => (
                      <span
                        key={f}
                        className={cx(s.finger, fingerLit(f) && s.fingerOn)}
                        style={{ height: [18, 20, 18, 12][i] }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={s.keyboard} aria-hidden="true">
                {rows.map((row, ri) => (
                  <div key={ri} className={s.row}>
                    {row.map((key, ki) => {
                      const single = key.k.length === 1;
                      const isTarget =
                        guide !== null &&
                        (guide.target === key ||
                          (guide.shift && key.code === guide.shiftCode));
                      const inZone =
                        guide !== null &&
                        !isTarget &&
                        single &&
                        key.f === guide.finger;
                      const isPressed =
                        pressed !== null &&
                        ((pressed.key === " " && key.code === "Space") ||
                          (single && pressed.key === key.k));
                      return (
                        <div
                          key={ki}
                          className={cx(
                            s.key,
                            key.size && s[key.size],
                            key.size && s.labelKey,
                            !single && s.labelKey,
                            key.homing && s.homing,
                            inZone && s.zone,
                            isPressed && (pressed.ok ? s.hit : s.miss),
                            isTarget && s.target,
                          )}
                        >
                          {key.k === "space" ? "" : key.k}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className={s.panel} aria-label="Results and settings">
          <dl className={s.stats}>
            <div className={s.stat}>
              <dt className={s.statLabel}>Words a minute</dt>
              <dd className={s.statValue}>{wpm}</dd>
            </div>
            <div className={s.stat}>
              <dt className={s.statLabel}>Accuracy</dt>
              <dd className={s.statValue}>{acc}%</dd>
            </div>
            <div className={s.stat}>
              <dt className={s.statLabel}>Mistakes</dt>
              <dd className={s.statValue}>{result ? result.errors : errors}</dd>
            </div>
            <div className={s.stat}>
              <dt className={s.statLabel}>Time</dt>
              <dd className={s.statValue}>{formatTime(liveMs)}</dd>
            </div>
          </dl>
          <div className={s.controls}>
            <div
              className={s.segmented}
              role="group"
              aria-label="Keyboard layout"
            >
              {(["mac", "win"] as Layout[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  className={s.segment}
                  aria-pressed={layout === l}
                  onClick={() => chooseLayout(l)}
                >
                  {l === "mac" ? "Mac" : "Windows"}
                </button>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={sound}
              className={s.switch}
              onClick={toggleSound}
            >
              <span className={s.track}>
                <span className={s.thumb} />
              </span>
              Key sounds
            </button>
            <button
              type="button"
              className={s.btn}
              onClick={() => startLesson(lessonIdx, false)}
            >
              Start again
            </button>
            {nextLesson !== null && (
              <button
                type="button"
                className={cx(s.btn, s.btnText)}
                onClick={() => startLesson(nextLesson, false)}
              >
                Next lesson
              </button>
            )}
          </div>
          <section className={s.howto} aria-labelledby="practise-title">
            <h2 id="practise-title" className={s.howtoTitle}>
              How I practise
            </h2>
            <ul className={s.notes}>
              <li>
                I rest my fingers on the home row before every drill, feeling
                for the bumps on f and j.
              </li>
              <li>
                I keep my eyes on the screen. When I lose my place, I check the
                keyboard here, not my hands.
              </li>
              <li>
                I go slowly until a lesson stays above 95% accuracy, then let
                the speed come.
              </li>
              <li>
                Ten minutes a day does more for me than an hour once a week.
              </li>
            </ul>
            <div className={s.listFoot}>
              {cleared ? (
                <>
                  <span>Progress cleared.</span>
                  <button
                    type="button"
                    className={cx(s.btn, s.btnText)}
                    onClick={undoClear}
                  >
                    Undo
                  </button>
                </>
              ) : Object.keys(best).length > 0 ? (
                <button
                  type="button"
                  className={cx(s.btn, s.btnText)}
                  onClick={clearProgress}
                >
                  Clear my progress
                </button>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
