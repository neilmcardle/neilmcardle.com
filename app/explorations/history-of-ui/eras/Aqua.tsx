"use client";

import { useEffect, useRef, useState } from "react";
import { Fit, useScale } from "../lib";
import s from "./aqua.module.css";

const APPS = [
  { id: "folder", label: "Documents" },
  { id: "globe", label: "Browser" },
  { id: "mail", label: "Mail" },
  { id: "music", label: "Music" },
  { id: "update", label: "Software Update" },
] as const;

type AppId = (typeof APPS)[number]["id"];
type WinState = "open" | "min" | "closed";
type Phase = "ask" | "installing" | "done";

const BASE = 42;
const GROW = 30;
const RANGE = 110;

function Screen() {
  const scale = useScale();
  const [state, setState] = useState<WinState>("open");
  const [phase, setPhase] = useState<Phase>("ask");
  const [progress, setProgress] = useState(0);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [bounce, setBounce] = useState<AppId | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const win = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLButtonElement>(null);
  const animating = useRef(false);
  const [genieOn, setGenieOn] = useState(false);

  useEffect(() => {
    if (phase !== "installing") return;
    const id = window.setInterval(() => {
      setProgress((p) => {
        const n = Math.min(100, p + 2 + Math.random() * 4);
        if (n >= 100) {
          window.clearInterval(id);
          window.setTimeout(() => setPhase("done"), 300);
        }
        return n;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [phase]);

  const slots = [
    ...APPS.map((a) => a.id as string),
    ...(state === "min" ? ["thumb"] : []),
    "trash",
  ];
  const sizes = slots.map((_, i) => {
    if (mouseX == null) return BASE;
    const total = slots.length * (BASE + 8);
    const cx = (DOCK_W - total) / 2 + i * (BASE + 8) + BASE / 2;
    const d = Math.abs(mouseX - cx);
    return d > RANGE
      ? BASE
      : BASE + GROW * Math.cos((d / RANGE) * (Math.PI / 2));
  });
  const sizeOf = (id: string) => sizes[slots.indexOf(id)] ?? BASE;

  const genie = (dir: "down" | "up", slow: boolean, done: () => void) => {
    const w = win.current;
    const t = thumb.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!w || reduce) {
      done();
      return;
    }
    const wr = w.getBoundingClientRect();
    const target =
      t?.getBoundingClientRect() ?? dock.current!.getBoundingClientRect();
    const dx =
      (target.left + target.width / 2 - (wr.left + wr.width / 2)) / scale;
    const dy =
      (target.top + target.height / 2 - (wr.top + wr.height / 2)) / scale;
    const tx = Math.max(
      0,
      Math.min(
        100,
        ((target.left + target.width / 2 - wr.left) / wr.width) * 100,
      ),
    );
    const frames: Keyframe[] = [
      {
        transform: "translate(0,0) scale(1)",
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        opacity: 1,
      },
      {
        transform: `translate(${dx * 0.15}px, ${dy * 0.2}px) scale(0.9, 1)`,
        clipPath: `polygon(0% 0%, 100% 0%, ${tx + 8}% 100%, ${tx - 8}% 100%)`,
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.06)`,
        clipPath: `polygon(${tx - 4}% 0%, ${tx + 4}% 0%, ${tx + 2}% 100%, ${tx - 2}% 100%)`,
        opacity: 0.4,
      },
    ];
    animating.current = true;
    w.getAnimations().forEach((a) => a.cancel());
    const anim = w.animate(dir === "down" ? frames : [...frames].reverse(), {
      duration: slow ? 2600 : 520,
      easing: "cubic-bezier(0.55, 0, 0.35, 1)",
      fill: "both",
    });
    anim.onfinish = () => {
      animating.current = false;
      done();
      if (dir === "up") anim.cancel();
    };
  };

  const minimise = (e: React.MouseEvent) => {
    if (animating.current) return;
    const slow = e.shiftKey;
    setGenieOn(true);
    setState("min");
    requestAnimationFrame(() => genie("down", slow, () => setGenieOn(false)));
  };

  const restore = (e: React.MouseEvent) => {
    if (animating.current) return;
    const slow = e.shiftKey;
    setGenieOn(true);
    genie("up", slow, () => {
      setGenieOn(false);
      setState("open");
    });
  };

  const launch = (id: AppId) => {
    setBounce(id);
    window.setTimeout(() => setBounce(null), 1300);
    if (id === "update") {
      window.setTimeout(() => {
        if (state === "closed") {
          setPhase("ask");
          setProgress(0);
          setState("open");
        } else if (state === "min") {
          win.current?.getAnimations().forEach((a) => a.cancel());
          setState("open");
        }
      }, 700);
    }
  };

  return (
    <div className={s.screen}>
      <div className={s.menubar}>
        <span className={s.blob} aria-hidden />
        <b>Software Update</b>
        <span>File</span>
        <span>Edit</span>
        <span>Window</span>
        <span>Help</span>
      </div>

      {state !== "closed" && (
        <div
          ref={win}
          className={s.win}
          style={{
            visibility: state === "min" && !genieOn ? "hidden" : "visible",
          }}
          role="dialog"
          aria-label="Software Update"
          aria-hidden={state === "min"}
        >
          <header className={s.titlebar}>
            <span className={s.lights}>
              <button
                type="button"
                className={s.light}
                data-c="red"
                aria-label="Close"
                onClick={() => setState("closed")}
              >
                <i>×</i>
              </button>
              <button
                type="button"
                className={s.light}
                data-c="yellow"
                aria-label="Minimise. Hold Shift for slow motion"
                onClick={minimise}
              >
                <i>–</i>
              </button>
              <button
                type="button"
                className={s.light}
                data-c="green"
                aria-label="Zoom"
                disabled
              >
                <i>+</i>
              </button>
            </span>
            <span className={s.title}>Software Update</span>
          </header>
          <div className={s.body}>
            <div className={s.badge} aria-hidden />
            <div className={s.copy}>
              {phase === "ask" && (
                <>
                  <h3>New software is available for your computer.</h3>
                  <p>
                    If you don&apos;t want to install it now, choose Later. You
                    can open Software Update from the dock at any time.
                  </p>
                </>
              )}
              {phase === "installing" && (
                <>
                  <h3>Installing…</h3>
                  <div
                    className={s.bar}
                    role="progressbar"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                  <p>{Math.round(progress)}% complete</p>
                </>
              )}
              {phase === "done" && (
                <>
                  <h3>Your software is up to date.</h3>
                  <p>
                    Nothing else to install. Try the yellow button, and hold
                    Shift while you click it.
                  </p>
                </>
              )}
              {phase === "ask" && (
                <div className={s.wait}>
                  <div className={s.pole} aria-hidden />
                </div>
              )}
            </div>
          </div>
          <footer className={s.buttons}>
            {phase === "ask" && (
              <>
                <button type="button" className={s.gel} onClick={minimise}>
                  Later
                </button>
                <button
                  type="button"
                  className={s.gel}
                  data-default
                  onClick={() => setPhase("installing")}
                >
                  Install
                </button>
              </>
            )}
            {phase === "done" && (
              <button
                type="button"
                className={s.gel}
                data-default
                onClick={() => setState("closed")}
              >
                Quit
              </button>
            )}
          </footer>
        </div>
      )}

      <div
        ref={dock}
        className={s.dock}
        style={{ width: DOCK_W }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = dock.current!.getBoundingClientRect();
          setMouseX((e.clientX - r.left) / scale);
        }}
        onPointerLeave={() => {
          setMouseX(null);
          setLabel(null);
        }}
      >
        <div className={s.shelf} aria-hidden />
        <div className={s.icons}>
          {APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              className={s.dockItem}
              style={{ width: sizeOf(a.id), height: sizeOf(a.id) }}
              data-bounce={bounce === a.id || undefined}
              onClick={() => launch(a.id)}
              onPointerEnter={() => setLabel(a.label)}
              aria-label={a.label}
            >
              <span className={s.app} data-app={a.id} />
              {a.id === "update" && state !== "closed" && (
                <span className={s.running} aria-hidden />
              )}
              {label === a.label && <span className={s.tip}>{a.label}</span>}
            </button>
          ))}
          <span className={s.divider} aria-hidden />
          {state === "min" && (
            <button
              ref={thumb}
              type="button"
              className={s.dockItem}
              style={{ width: sizeOf("thumb"), height: sizeOf("thumb") }}
              onClick={restore}
              onPointerEnter={() => setLabel("Software Update window")}
              aria-label="Restore Software Update window"
            >
              <span className={s.thumb} />
              {label === "Software Update window" && (
                <span className={s.tip}>Software Update</span>
              )}
            </button>
          )}
          <button
            type="button"
            className={s.dockItem}
            style={{ width: sizeOf("trash"), height: sizeOf("trash") }}
            onPointerEnter={() => setLabel("Trash")}
            aria-label="Trash"
          >
            <span className={s.app} data-app="trash" />
            {label === "Trash" && <span className={s.tip}>Trash</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

const DOCK_W = 460;

export default function Aqua() {
  return (
    <div className={s.outer}>
      <Fit width={640} height={420}>
        <Screen />
      </Fit>
    </div>
  );
}
