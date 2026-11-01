"use client";

import { useEffect, useRef, useState } from "react";
import { useActive } from "../lib";
import s from "./voice.module.css";

type Phase = "idle" | "listening" | "thinking" | "speaking";
type Turn = { you: string; said: string; ok: boolean };

const SUGGEST = [
  "Set a timer for 2 minutes",
  "Play some jazz",
  "What's the weather like?",
  "Stop",
  "Book a table for four on Friday and text Sam the time",
];

const NUM: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  ten: 10,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
};
const SORRY = [
  "Sorry, I don't know that one.",
  "Hmm, I'm not sure about that.",
  "Sorry, I can't help with that yet.",
];

type Intent =
  | { kind: "timer"; secs: number | null }
  | { kind: "music" }
  | { kind: "stop" }
  | { kind: "weather" }
  | { kind: "time" }
  | { kind: "list" }
  | { kind: "joke" }
  | { kind: "help" }
  | null;

function intentOf(t: string): Intent {
  if (/\b(timer|countdown)\b/.test(t) || /\bremind me in\b/.test(t)) {
    const m = t.match(
      /(\d+|a|an|one|two|three|four|five|ten|fifteen|twenty|thirty)\s*(second|sec|minute|min)/,
    );
    if (!m) return { kind: "timer", secs: null };
    const n = Number(m[1]) || NUM[m[1]] || 1;
    return { kind: "timer", secs: m[2].startsWith("sec") ? n : n * 60 };
  }
  if (/^(stop|cancel|pause|quiet|shh|enough|be quiet)\b/.test(t))
    return { kind: "stop" };
  if (/\b(play|music|jazz|song|radio)\b/.test(t)) return { kind: "music" };
  if (/\b(weather|rain|umbrella|cold|warm|sunny|forecast)\b/.test(t))
    return { kind: "weather" };
  if (/\bwhat time\b|\bthe time\b/.test(t)) return { kind: "time" };
  if (/\b(shopping list|add .* to|on my list)\b/.test(t))
    return { kind: "list" };
  if (/\bjoke\b/.test(t)) return { kind: "joke" };
  if (/\b(what can you do|help|who are you)\b/.test(t)) return { kind: "help" };
  return null;
}

function useMusic() {
  const ctx = useRef<AudioContext | null>(null);
  const stopFn = useRef<(() => void) | null>(null);

  const play = () => {
    if (stopFn.current) return;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ac = ctx.current ?? new AC();
    ctx.current = ac;
    void ac.resume();
    const master = ac.createGain();
    master.gain.value = 0.0001;
    master.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.6);
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1400;
    master.connect(filter).connect(ac.destination);
    const chords = [
      [220, 277.18, 329.63, 415.3],
      [196, 246.94, 293.66, 369.99],
      [174.61, 220, 261.63, 329.63],
      [164.81, 207.65, 246.94, 311.13],
    ];
    let i = 0;
    const strike = () => {
      const now = ac.currentTime;
      chords[i % chords.length].forEach((f, k) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = k === 0 ? "triangle" : "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, now + k * 0.12);
        g.gain.exponentialRampToValueAtTime(0.25, now + k * 0.12 + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + k * 0.12 + 1.9);
        o.connect(g).connect(master);
        o.start(now + k * 0.12);
        o.stop(now + k * 0.12 + 2);
      });
      i++;
    };
    strike();
    const id = window.setInterval(strike, 2000);
    stopFn.current = () => {
      window.clearInterval(id);
      master.gain.cancelScheduledValues(ac.currentTime);
      master.gain.setValueAtTime(master.gain.value, ac.currentTime);
      master.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.4);
      window.setTimeout(() => master.disconnect(), 500);
    };
  };

  const chime = () => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ac = ctx.current ?? new AC();
    ctx.current = ac;
    void ac.resume();
    [880, 1318.5, 880, 1318.5].forEach((f, k) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      const t = ac.currentTime + k * 0.32;
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + 0.32);
    });
  };

  const stop = () => {
    stopFn.current?.();
    stopFn.current = null;
  };

  useEffect(
    () => () => {
      stopFn.current?.();
      void ctx.current?.close();
    },
    [],
  );

  return { play, stop, chime };
}

type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult:
    | ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void)
    | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};

export default function Voice() {
  const active = useActive();
  const music = useMusic();
  const [phase, setPhase] = useState<Phase>("idle");
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState<{ end: number; total: number } | null>(
    null,
  );
  const [now, setNow] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [speak, setSpeak] = useState(true);
  const [canListen, setCanListen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const rec = useRef<Recognition | null>(null);
  const sorry = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const speakRef = useRef(speak);
  speakRef.current = speak;

  useEffect(() => {
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    setCanListen(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (active) return;
    music.stop();
    setPlaying(false);
    rec.current?.abort();
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPhase("idle");
  }, [active, music]);

  const reply = (said: string, ok: boolean, you: string) => {
    setTurns((t) => [...t.slice(-3), { you, said, ok }]);
    setPhase("speaking");
    const done = () => setPhase((p) => (p === "speaking" ? "idle" : p));
    const synth = window.speechSynthesis;
    if (speakRef.current && synth && said) {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(said);
      u.rate = 1.02;
      u.onend = done;
      u.onerror = done;
      synth.speak(u);
      window.setTimeout(done, 400 + said.split(" ").length * 420);
    } else {
      window.setTimeout(done, 400 + said.split(" ").length * 260);
    }
  };

  useEffect(() => {
    if (!timer) return;
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= timer.end) {
        window.clearInterval(id);
        setTimer(null);
        music.chime();
        reply("Your timer's done.", true, "(timer)");
      }
    }, 250);
    return () => window.clearInterval(id);
  });

  const handle = (raw: string) => {
    const you = raw.trim();
    if (!you) return;
    const t = you.toLowerCase().replace(/[?.!,]/g, "");
    setText("");
    setPhase("thinking");
    window.setTimeout(() => {
      const parts = t
        .split(/\band then\b|\band\b|\bthen\b/)
        .map((x) => x.trim())
        .filter(Boolean);
      const intents = parts.map(intentOf);
      if (parts.length > 1 && intents.filter(Boolean).length !== 1) {
        reply(
          intents.some(Boolean)
            ? "Sorry, I can only do one thing at a time."
            : SORRY[sorry.current++ % SORRY.length],
          false,
          you,
        );
        return;
      }
      if (
        parts.length > 1 &&
        /\b(book|text|email|message|call|order)\b/.test(t)
      ) {
        reply("Sorry, I can't help with that yet.", false, you);
        return;
      }
      const it = intents.find(Boolean) ?? null;
      if (!it) {
        reply(SORRY[sorry.current++ % SORRY.length], false, you);
        return;
      }
      switch (it.kind) {
        case "timer":
          if (!it.secs) return reply("For how long?", false, you);
          setTimer({ end: Date.now() + it.secs * 1000, total: it.secs * 1000 });
          setNow(Date.now());
          return reply(
            `Timer set for ${it.secs >= 60 ? `${it.secs / 60} minute${it.secs === 60 ? "" : "s"}` : `${it.secs} seconds`}.`,
            true,
            you,
          );
        case "music":
          music.play();
          setPlaying(true);
          return reply("Playing some relaxing jazz.", true, you);
        case "stop":
          music.stop();
          setPlaying(false);
          setTimer(null);
          window.speechSynthesis?.cancel();
          setTurns((x) => [...x.slice(-3), { you, said: "", ok: true }]);
          setPhase("idle");
          return;
        case "weather":
          return reply(
            "Right now it's eleven degrees and cloudy. Expect rain after four.",
            true,
            you,
          );
        case "time":
          return reply(
            `It's ${new Date().toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit" })}.`,
            true,
            you,
          );
        case "list":
          return reply(
            "Okay, I've added that to your shopping list.",
            true,
            you,
          );
        case "joke":
          return reply(
            "Why did the speaker go to therapy? It had too many issues with feedback.",
            true,
            you,
          );
        case "help":
          return reply(
            "I can set timers, play music, tell you the weather or the time, and add things to your list.",
            true,
            you,
          );
      }
    }, 650);
  };

  const listen = () => {
    setNote(null);
    if (phase === "speaking") window.speechSynthesis?.cancel();
    const w = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };
    const R = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!R) {
      input.current?.focus();
      return;
    }
    const r = new R();
    rec.current = r;
    r.lang = "en-GB";
    r.interimResults = false;
    let heard = false;
    r.onresult = (e) => {
      heard = true;
      handle(e.results[0][0].transcript);
    };
    r.onerror = () => {
      setNote("I couldn't hear you. You can type instead.");
      setPhase("idle");
    };
    r.onend = () => {
      if (!heard) setPhase((p) => (p === "listening" ? "idle" : p));
    };
    setPhase("listening");
    try {
      r.start();
    } catch {
      setPhase("idle");
    }
  };

  const remaining = timer ? Math.max(0, timer.end - now) : 0;
  const frac = timer ? remaining / timer.total : 0;
  const mm = Math.floor(remaining / 60000);
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  const understood = turns.filter((t) => t.you !== "(timer)");
  const okCount = understood.filter((t) => t.ok).length;

  return (
    <div className={s.room}>
      <div className={s.speakerWrap}>
        <button
          type="button"
          className={s.speaker}
          onClick={listen}
          aria-label={canListen ? "Tap to talk" : "Tap to type a request"}
          data-phase={phase}
          data-music={playing || undefined}
        >
          <span
            className={s.ring}
            data-timer={timer ? true : undefined}
            style={{ "--p": `${frac * 100}%` } as React.CSSProperties}
          />
          <span className={s.top} />
          <span className={s.fabric} />
        </button>
        <div className={s.status} aria-live="polite">
          {phase === "listening" && "Listening…"}
          {phase === "thinking" && "…"}
          {phase !== "listening" &&
            phase !== "thinking" &&
            timer &&
            `Timer ${mm}:${ss}`}
          {phase !== "listening" &&
            phase !== "thinking" &&
            !timer &&
            playing &&
            "Playing relaxing jazz"}
        </div>
      </div>

      <div className={s.side}>
        <div className={s.log}>
          {turns.length === 0 && (
            <p className={s.empty}>
              {canListen
                ? "Tap the speaker and talk, or pick a request."
                : "Pick a request or type one."}
            </p>
          )}
          {turns.map((t, i) => (
            <div key={i} className={s.turn}>
              {t.you !== "(timer)" && <p className={s.you}>“{t.you}”</p>}
              {t.said && (
                <p className={s.said} data-ok={t.ok || undefined}>
                  {t.said}
                </p>
              )}
            </div>
          ))}
          {note && <p className={s.note}>{note}</p>}
        </div>
        <div className={s.chips}>
          {SUGGEST.map((x) => (
            <button
              key={x}
              type="button"
              onClick={() => handle(x)}
              disabled={phase === "thinking"}
            >
              {x}
            </button>
          ))}
        </div>
        <form
          className={s.type}
          onSubmit={(e) => {
            e.preventDefault();
            handle(text);
          }}
        >
          <input
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Or type what you'd say"
            aria-label="Type what you'd say"
          />
          <button type="submit" disabled={!text.trim()}>
            Say it
          </button>
        </form>
        <div className={s.meta}>
          <label>
            <input
              type="checkbox"
              checked={speak}
              onChange={(e) => setSpeak(e.target.checked)}
            />{" "}
            Speak replies
          </label>
          {understood.length > 0 && (
            <span>
              Understood {okCount} of {understood.length}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
