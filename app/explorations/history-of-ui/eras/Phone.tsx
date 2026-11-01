"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useScale } from "../lib";
import s from "./phone.module.css";

type Screen = "lock" | "home" | "contacts" | "notes";

const PEOPLE = [
  "Bill Atkinson",
  "Tim Berners-Lee",
  "Lynn Conway",
  "Doug Engelbart",
  "Adele Goldberg",
  "Margaret Hamilton",
  "Grace Hopper",
  "Dan Ingalls",
  "Susan Kare",
  "Alan Kay",
  "Butler Lampson",
  "Brenda Laurel",
  "Ada Lovelace",
  "Ted Nelson",
  "Don Norman",
  "Jef Raskin",
  "Dennis Ritchie",
  "Ivan Sutherland",
  "Bob Taylor",
  "Larry Tesler",
  "Chuck Thacker",
  "Ken Thompson",
  "Bruce Tognazzini",
  "Bret Victor",
];

const GROUPS = PEOPLE.reduce<Record<string, string[]>>((acc, name) => {
  const last = name.split(" ").slice(-1)[0];
  const k = last[0];
  (acc[k] ||= []).push(name);
  return acc;
}, {});

const APPS: {
  id: string;
  label: string;
  color: string;
  glyph: ReactNode;
  opens?: Screen;
}[] = [
  {
    id: "messages",
    label: "Messages",
    color: "#53c94a",
    glyph: (
      <path d="M5 8c0-3 3-5 7-5s7 2 7 5-3 5-7 5c-1 0-2 0-3-.4L5 14l1.3-2.6C5.5 10.6 5 9.4 5 8z" />
    ),
  },
  {
    id: "calendar",
    label: "Calendar",
    color: "#f4f4f4",
    glyph: (
      <text
        x="12"
        y="17"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill="#222"
        stroke="none"
      >
        29
      </text>
    ),
  },
  {
    id: "photos",
    label: "Photos",
    color: "#f2c94c",
    glyph: (
      <>
        <circle cx="12" cy="10" r="2.4" />
        <path d="M12 3v4M12 13v4M5 10h4M15 10h4M7 5l3 3M14 12l3 3M17 5l-3 3M10 12l-3 3" />
      </>
    ),
  },
  {
    id: "camera",
    label: "Camera",
    color: "#8e96a3",
    glyph: (
      <>
        <rect x="4" y="7" width="16" height="10" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <path d="M9 7l1-2h4l1 2" />
      </>
    ),
  },
  {
    id: "weather",
    label: "Weather",
    color: "#3d8bea",
    glyph: (
      <>
        <circle cx="10" cy="9" r="3" />
        <path d="M8 17h9a3 3 0 0 0 0-6 4 4 0 0 0-7.5 1.5A2.3 2.3 0 0 0 8 17z" />
      </>
    ),
  },
  {
    id: "clock",
    label: "Clock",
    color: "#222",
    glyph: (
      <>
        <circle cx="12" cy="11" r="7" />
        <path d="M12 7v4l3 2" />
      </>
    ),
  },
  {
    id: "maps",
    label: "Maps",
    color: "#7dc36b",
    glyph: <path d="M4 6l5-2 6 2 5-2v13l-5 2-6-2-5 2zM9 4v13M15 6v13" />,
  },
  {
    id: "notes",
    label: "Notes",
    color: "#f7d84a",
    opens: "notes",
    glyph: <path d="M7 6h10M7 10h10M7 14h7" />,
  },
  {
    id: "contacts",
    label: "Contacts",
    color: "#a1825c",
    opens: "contacts",
    glyph: (
      <>
        <circle cx="12" cy="9" r="3.2" />
        <path d="M6 18c0-3.3 2.7-5 6-5s6 1.7 6 5" />
      </>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    color: "#9aa1ab",
    glyph: (
      <>
        <circle cx="12" cy="11" r="3" />
        <path d="M12 3v3M12 16v3M4 11h3M17 11h3M6.3 5.3l2.1 2.1M15.6 14.6l2.1 2.1M17.7 5.3l-2.1 2.1M8.4 14.6l-2.1 2.1" />
      </>
    ),
  },
  {
    id: "stocks",
    label: "Stocks",
    color: "#2b2f36",
    glyph: <path d="M4 16l5-5 4 3 7-8M15 6h5v5" />,
  },
  {
    id: "calc",
    label: "Calculator",
    color: "#444b55",
    glyph: <path d="M7 7h4M9 5v4M14 7h4M7 15l3-3M7 12l3 3M14 13h4M14 16h4" />,
  },
];

const DOCK = [
  {
    id: "phone",
    label: "Phone",
    color: "#4cc35a",
    glyph: <path d="M8 4l2 4-2 2c1 2 3 4 5 5l2-2 4 2-1 3c-6 0-12-6-12-12z" />,
  },
  {
    id: "mail",
    label: "Mail",
    color: "#3d8bea",
    glyph: <path d="M4 7h16v10H4zM4 7l8 6 8-6" />,
  },
  {
    id: "web",
    label: "Web",
    color: "#4aa3f0",
    glyph: (
      <>
        <circle cx="12" cy="11" r="7" />
        <path d="M14.5 8.5l-2 4.5-4 1.5 2-4.5z" />
      </>
    ),
  },
  {
    id: "music",
    label: "Music",
    color: "#f2843a",
    glyph: (
      <path d="M10 16V6l8-2v10M10 16a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM18 14a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
    ),
  },
];

function useTime() {
  const [t, setT] = useState<Date | null>(null);
  useEffect(() => {
    setT(new Date());
    const id = window.setInterval(() => setT(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

function Icon({
  app,
  onOpen,
}: {
  app: {
    id: string;
    label: string;
    color: string;
    glyph: ReactNode;
    opens?: Screen;
  };
  onOpen?: () => void;
}) {
  return (
    <button
      type="button"
      className={s.app}
      onClick={onOpen}
      data-live={app.opens ? true : undefined}
      aria-label={app.opens ? `Open ${app.label}` : app.label}
    >
      <span className={s.tile} style={{ "--c": app.color } as CSSProperties}>
        <svg viewBox="0 0 24 22" aria-hidden>
          {app.glyph}
        </svg>
        <i className={s.gloss} />
      </span>
      <span className={s.appLabel}>{app.label}</span>
    </button>
  );
}

function Slider({ onUnlock }: { onUnlock: () => void }) {
  const scale = useScale();
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef(0);
  const max = useRef(0);

  return (
    <div ref={track} className={s.track}>
      <span className={s.shimmer} style={{ opacity: Math.max(0, 1 - x / 80) }}>
        slide to unlock
      </span>
      <button
        type="button"
        className={s.knob}
        style={{
          transform: `translateX(${x}px)`,
          transition: dragging
            ? "none"
            : "transform 320ms cubic-bezier(0.2, 0.9, 0.2, 1)",
        }}
        aria-label="Slide to unlock"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight")
            onUnlock();
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = e.clientX;
          const t = track.current!.getBoundingClientRect();
          const k = e.currentTarget.getBoundingClientRect();
          max.current = (t.width - k.width) / scale - 8;
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!dragging) return;
          setX(
            Math.max(
              0,
              Math.min(max.current, (e.clientX - start.current) / scale),
            ),
          );
        }}
        onPointerUp={() => {
          setDragging(false);
          if (x >= max.current - 4) {
            setX(max.current);
            window.setTimeout(onUnlock, 120);
          } else setX(0);
        }}
        onPointerCancel={() => {
          setDragging(false);
          setX(0);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M5 12h12M12 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

function Scroller({ children }: { children: ReactNode }) {
  const scale = useScale();
  const box = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const y = useRef(0);
  const v = useRef(0);
  const samples = useRef<{ t: number; y: number }[]>([]);
  const dragging = useRef<{ start: number; from: number } | null>(null);
  const raf = useRef(0);

  const bounds = () => {
    const h = box.current!.clientHeight;
    const ch = inner.current!.scrollHeight;
    return { min: Math.min(0, h - ch), max: 0, h };
  };

  const paint = () => {
    if (inner.current)
      inner.current.style.transform = `translate3d(0, ${y.current}px, 0)`;
  };

  const settle = () => {
    cancelAnimationFrame(raf.current);
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;
      const { min, max } = bounds();
      if (y.current > max || y.current < min) {
        const target = y.current > max ? max : min;
        v.current *= 0.6;
        y.current += (target - y.current) * 0.18 * dt + v.current * dt;
        if (Math.abs(target - y.current) < 0.5 && Math.abs(v.current) < 0.5) {
          y.current = target;
          paint();
          return;
        }
      } else {
        v.current *= Math.pow(0.95, dt);
        y.current += v.current * dt;
        if (Math.abs(v.current) < 0.08) {
          paint();
          return;
        }
      }
      paint();
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div
      ref={box}
      className={s.scroller}
      onPointerDown={(e) => {
        cancelAnimationFrame(raf.current);
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = { start: e.clientY, from: y.current };
        samples.current = [{ t: performance.now(), y: y.current }];
      }}
      onPointerMove={(e) => {
        const d = dragging.current;
        if (!d) return;
        const { min, max, h } = bounds();
        let next = d.from + (e.clientY - d.start) / scale;
        if (next > max) next = max + rubber(next - max, h);
        else if (next < min) next = min - rubber(min - next, h);
        y.current = next;
        samples.current.push({ t: performance.now(), y: next });
        if (samples.current.length > 6) samples.current.shift();
        paint();
      }}
      onPointerUp={() => {
        dragging.current = null;
        const sm = samples.current;
        if (sm.length > 1) {
          const a = sm[0];
          const b = sm[sm.length - 1];
          const dt = Math.max(1, b.t - a.t);
          v.current = ((b.y - a.y) / dt) * 16.67;
          if (performance.now() - b.t > 80) v.current = 0;
        }
        settle();
      }}
      onPointerCancel={() => {
        dragging.current = null;
        settle();
      }}
      onWheel={(e) => {
        const { min, max } = bounds();
        y.current = Math.max(min, Math.min(max, y.current - e.deltaY));
        paint();
      }}
    >
      <div ref={inner} className={s.scrollInner}>
        {children}
      </div>
    </div>
  );
}

function rubber(over: number, dim: number) {
  const c = 0.55;
  return (over * dim * c) / (dim + c * over);
}

export default function Phone({
  flat = 0,
  startOn = "lock",
}: {
  flat?: number;
  startOn?: Screen;
}) {
  const time = useTime();
  const [screen, setScreen] = useState<Screen>(startOn);
  const [opening, setOpening] = useState<string | null>(null);
  const [note, setNote] = useState(
    "Remember\n\nGlass that answers to a finger\nNo stylus\nPinch to zoom",
  );

  const clock = time
    ? time
        .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
        .replace(/\s?[AP]M/, "")
    : "9:41";
  const ampm = time ? (time.getHours() < 12 ? "AM" : "PM") : "AM";
  const date = time
    ? time.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  const open = (target: Screen, id: string) => {
    setOpening(id);
    setScreen(target);
  };

  return (
    <div
      className={s.device}
      data-flat={flat > 0.5 || undefined}
      style={{ "--f": flat } as CSSProperties}
    >
      <div className={s.earpiece} aria-hidden />
      <div className={s.screen}>
        <div
          className={s.status}
          data-dark={screen === "lock" || screen === "home" || undefined}
        >
          <span className={s.bars} aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className={s.carrier}>Carrier</span>
          <span className={s.statusTime}>
            {clock} {ampm}
          </span>
          <span className={s.battery} aria-hidden>
            <i />
          </span>
        </div>

        {screen === "lock" && (
          <div className={s.lock}>
            <div className={s.lockTop}>
              <div className={s.bigTime}>{clock}</div>
              <div className={s.date}>{date}</div>
            </div>
            <div className={s.lockArt} aria-hidden />
            <div className={s.lockBottom}>
              <Slider onUnlock={() => setScreen("home")} />
            </div>
          </div>
        )}

        {screen === "home" && (
          <div className={s.home}>
            <div className={s.grid}>
              {APPS.map((a) => (
                <Icon
                  key={a.id}
                  app={a}
                  onOpen={a.opens ? () => open(a.opens!, a.id) : undefined}
                />
              ))}
            </div>
            <div className={s.dock}>
              {DOCK.map((a) => (
                <Icon key={a.id} app={a} />
              ))}
            </div>
          </div>
        )}

        {screen === "contacts" && (
          <div className={s.appView} data-from={opening ?? undefined}>
            <div className={s.navbar}>
              <span className={s.navTitle}>All Contacts</span>
              <span className={s.navBtn}>+</span>
            </div>
            <Scroller>
              {Object.entries(GROUPS).map(([k, names]) => (
                <div key={k}>
                  <div className={s.section}>{k}</div>
                  {names.map((n) => {
                    const parts = n.split(" ");
                    const last = parts.pop();
                    return (
                      <div key={n} className={s.row}>
                        {parts.join(" ")} <b>{last}</b>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className={s.count}>{PEOPLE.length} Contacts</div>
            </Scroller>
          </div>
        )}

        {screen === "notes" && (
          <div className={s.appView} data-from={opening ?? undefined}>
            <div className={s.navbar} data-notes>
              <span className={s.navTitle}>Remember</span>
            </div>
            <textarea
              className={s.pad}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              aria-label="Note"
              spellCheck={false}
            />
          </div>
        )}
      </div>
      <button
        type="button"
        className={s.homeBtn}
        aria-label="Home button"
        onClick={() => {
          if (screen === "lock") return;
          setScreen("home");
        }}
      >
        <i />
      </button>
    </div>
  );
}
