"use client";

import type React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HotspotDef } from "./data/scenes";
import type { Target, World } from "./engine/world";
import { STUDIO_OBJECTS, type StudioObject } from "./objects";
import { Rain } from "./rain";
import "./studio.css";

const OutlineEditor =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./OutlineEditor"), { ssr: false })
    : null;

const BY_ID = new Map(STUDIO_OBJECTS.map((o) => [o.id, o]));
const START = { x: 1930, y: 1240 };
const FOCUS = { focusX: 1380, focusY: 900 };
const SOUND_KEY = "studio-sound";
const LINKS = Array.from(
  new Map(
    STUDIO_OBJECTS.filter((o) => o.work).map((o) => [o.work!.href, o.work!]),
  ).values(),
);

type Spot = {
  hotspot: HotspotDef;
  left: number;
  top: number;
  width: number;
  height: number;
};

function unwidow(text: string) {
  return text.replace(/\s+(\S+)\s*$/, " $1");
}

function whenIdle(fn: () => void) {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout: 1500 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 200);
  return () => window.clearTimeout(id);
}

export default function StudioHero({
  className,
  profile,
}: {
  className?: string;
  profile?: React.ReactNode;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const speechRef = useRef<HTMLParagraphElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const foundTimer = useRef<number | null>(null);
  const lineTimer = useRef<number | null>(null);
  const cardTimer = useRef<number | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [line, setLine] = useState<string | null>(null);
  const [card, setCard] = useState<StudioObject | null>(null);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [moved, setMoved] = useState(false);
  const [found, setFound] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [hostWidth, setHostWidth] = useState(0);
  const [liveWorld, setLiveWorld] = useState<World | null>(null);
  const [editing, setEditing] = useState(false);
  const foundRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const rainRef = useRef<Rain | null>(null);
  const [sound, setSound] = useState<"idle" | "on" | "off">(() => {
    try {
      if (
        typeof window !== "undefined" &&
        window.localStorage.getItem(SOUND_KEY) === "off"
      )
        return "off";
    } catch {}
    return "idle";
  });
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(false);

  const say = useCallback((text: string) => {
    setLine(text);
    if (lineTimer.current) window.clearTimeout(lineTimer.current);
    lineTimer.current = window.setTimeout(
      () => setLine(null),
      Math.max(3400, text.length * 65),
    );
  }, []);

  const find = useCallback((id: string | null, linger: boolean) => {
    if (foundTimer.current) window.clearTimeout(foundTimer.current);
    foundTimer.current = null;
    setFound(id);
    foundRef.current = id;
    worldRef.current?.highlight(hoverRef.current ?? id);
    if (id && linger)
      foundTimer.current = window.setTimeout(() => {
        setFound(null);
        foundRef.current = null;
        worldRef.current?.highlight(hoverRef.current);
      }, 3200);
  }, []);

  const activate = useCallback(
    (hotspot: HotspotDef, walk: boolean) => {
      const world = worldRef.current;
      if (!world) return;
      const object = BY_ID.get(hotspot.id);
      if (cardTimer.current) window.clearTimeout(cardTimer.current);
      setCard(null);
      const speak = () => {
        world.facePlayer(hotspot.face);
        world.setOverlay("drawer", hotspot.id === "drawer");
        say(object?.line ?? hotspot.look);
        if (object?.work)
          cardTimer.current = window.setTimeout(() => setCard(object), 650);
      };
      if (walk) {
        setMoved(true);
        world.walkTo(hotspot.walkTo, speak);
      } else speak();
    },
    [say],
  );

  const onPrimary = useCallback(
    (
      target: Target | null,
      point: { x: number; y: number },
      touch: boolean,
    ) => {
      const world = worldRef.current;
      if (!world) return;
      if (target?.kind === "hotspot") {
        const object = BY_ID.get(target.hotspot.id);
        find(touch && object ? object.id : null, !object?.work);
        return activate(target.hotspot, true);
      }
      find(null, false);
      setCard(null);
      setMoved(true);
      world.setOverlay("drawer", false);
      world.walkTo(point);
    },
    [activate, find],
  );

  const onLook = useCallback(
    (target: Target | null) => {
      if (target?.kind !== "hotspot") return;
      const object = BY_ID.get(target.hotspot.id);
      say(object?.line ?? target.hotspot.look);
    },
    [say],
  );

  const onHover = useCallback((target: Target | null | undefined) => {
    const id =
      target?.kind === "hotspot" && BY_ID.has(target.hotspot.id)
        ? target.hotspot.id
        : null;
    if (id === hoverRef.current) return;
    if (document.documentElement.dataset.outlines) return;
    hoverRef.current = id;
    setHover(id);
    worldRef.current?.highlight(id ?? foundRef.current);
  }, []);

  const handlers = useRef({ onPrimary, onLook, onHover });
  useEffect(() => {
    handlers.current = { onPrimary, onLook, onHover };
  }, [onPrimary, onLook, onHover]);

  useEffect(() => {
    if (!OutlineEditor) return;
    const on = new URLSearchParams(window.location.search).has("outlines");
    const id = window.setTimeout(() => setEditing(on), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        document.documentElement.dataset.studio = entry.isIntersecting
          ? "on"
          : "off";
        setInView(entry.isIntersecting);
      },
      { threshold: 0.25 },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      delete document.documentElement.dataset.studio;
    };
  }, []);

  useEffect(() => {
    const rain = new Rain();
    rainRef.current = rain;
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      rain.destroy();
      rainRef.current = null;
    };
  }, []);

  useEffect(() => {
    rainRef.current?.set(sound === "on" && inView && !hidden);
  }, [sound, inView, hidden]);

  const wake = () => {
    if (sound !== "idle") return;
    rainRef.current?.set(true);
    setSound("on");
  };

  const toggleSound = () => {
    const next = sound === "on" ? "off" : "on";
    rainRef.current?.set(next === "on");
    setSound(next);
    try {
      if (next === "off") window.localStorage.setItem(SOUND_KEY, "off");
      else window.localStorage.removeItem(SOUND_KEY);
    } catch {}
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let world: World | null = null;
    let cleanup = () => undefined as void;

    const start = async () => {
      try {
        const { World } = await import("./engine/world");
        if (cancelled) return;
        let lastCamera = "";
        let nearLeft = false;
        const w: World = new World(
          host,
          {
            onHover: (_label, _screen, target) =>
              handlers.current.onHover(target),
            onPrimary: (t, p, touch) => handlers.current.onPrimary(t, p, touch),
            onLook: (t) => handlers.current.onLook(t),
            onReady: async () => {
              await w.setScene(
                "studio",
                [{ id: "neil", pos: START, facing: "towards" }],
                "neil",
              );
              if (cancelled) return;
              setSpots(w.hotspotBoxes());
              setHostWidth(host.clientWidth);
              setLiveWorld(w);
              setReady(true);
            },
            onFrame: () => {
              if (w.cameraKey !== lastCamera) {
                lastCamera = w.cameraKey;
                setSpots(w.hotspotBoxes());
              }
              const el = speechRef.current;
              const head = w.headOf("neil");
              if (!el || !head) return;
              const box = host.getBoundingClientRect();
              const about = document.getElementById("profile");
              if (about) {
                const edge =
                  about.getBoundingClientRect().right - box.left + 320;
                const goal = w.destinationOf("neil");
                const near = head.x < edge || (goal ? goal.x < edge : false);
                if (near !== nearLeft) {
                  nearLeft = near;
                  if (near)
                    document.documentElement.dataset.studioNear = "left";
                  else delete document.documentElement.dataset.studioNear;
                }
              }
              const tag = tagRef.current;
              if (tag) {
                const tx = Math.min(
                  box.width - tag.offsetWidth - 12,
                  Math.max(12, head.x - tag.offsetWidth / 2),
                );
                const ty = Math.max(12, head.y - tag.offsetHeight - 6);
                tag.style.transform = `translate(${Math.round(tx)}px, ${Math.round(ty)}px)`;
              }
              const x = Math.min(
                box.width - el.offsetWidth - 12,
                Math.max(12, head.x - el.offsetWidth / 2),
              );
              const y = Math.min(
                box.height - el.offsetHeight - 12,
                Math.max(12, head.y - el.offsetHeight),
              );
              el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
            },
          },
          { touchScroll: true, cast: ["neil"], cover: FOCUS },
        );
        world = w;
        worldRef.current = w;
        await w.init();
        const onResize = () => {
          setSpots(w.hotspotBoxes());
          setHostWidth(host.clientWidth);
        };
        window.addEventListener("resize", onResize);
        cleanup = () => window.removeEventListener("resize", onResize);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const stopIdle = whenIdle(() => void start());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCard(null);
        setFound(null);
        foundRef.current = null;
        worldRef.current?.highlight(hoverRef.current);
        worldRef.current?.setOverlay("drawer", false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelled = true;
      stopIdle();
      cleanup();
      window.removeEventListener("keydown", onKey);
      world?.destroy();
      worldRef.current = null;
      delete document.documentElement.dataset.studioNear;
    };
  }, []);

  const interactive = spots.filter(({ hotspot }) => BY_ID.has(hotspot.id));

  const closeCard = () => {
    find(null, false);
    setCard(null);
    worldRef.current?.setOverlay("drawer", false);
  };

  return (
    <section
      ref={sectionRef}
      className={`sh ${className ?? ""}`}
      aria-label="Neil's studio"
      onPointerDownCapture={(e) => {
        if (!(e.target as Element).closest(".sh-sound")) wake();
      }}
    >
      <div className="sh-stage" ref={hostRef} />
      {profile}
      <div className={`sh-poster ${ready ? "gone" : ""}`} aria-hidden>
        <Image
          src="/hero-studio/poster-2560.webp"
          alt=""
          fill
          sizes="100vw"
          priority
        />
      </div>

      {!ready && (
        <nav className="sh-sr" aria-label="Studio">
          <ul>
            {LINKS.map((work) => (
              <li key={work.href}>
                <a href={work.href}>{work.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="sh-spots">
        {interactive.map(({ hotspot, left, top, width, height }) => {
          const object = BY_ID.get(hotspot.id)!;
          return (
            <button
              key={hotspot.id}
              type="button"
              className="sh-spot"
              style={{ left, top, width, height }}
              aria-label={
                object.work
                  ? `${object.name}: ${object.work.title}`
                  : object.name
              }
              onClick={() => activate(hotspot, true)}
            />
          );
        })}
      </div>

      {ready && (
        <div
          className={`sh-tag ${moved ? "gone" : ""}`}
          ref={tagRef}
          aria-hidden
        >
          <svg viewBox="18 18 27 27" width="11" height="11">
            <path d="M45 45L32 31.2985V18H45V45Z" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
          </svg>
          <span>Neil McArdle</span>
        </div>
      )}

      {(() => {
        const shown = hover ?? found;
        const spot = shown
          ? spots.find(({ hotspot }) => hotspot.id === shown)
          : null;
        const object = shown ? BY_ID.get(shown) : null;
        if (!spot || !object) return null;
        const x = Math.min(
          hostWidth - 16,
          Math.max(16, spot.left + spot.width / 2),
        );
        const above = spot.top > 48;
        return (
          <p
            key={`found-${shown}`}
            className={`sh-found ${above ? "" : "below"}`}
            style={{
              left: x,
              top: above ? spot.top - 10 : spot.top + spot.height + 10,
            }}
            aria-hidden
          >
            {object.name}
          </p>
        );
      })()}

      {OutlineEditor && editing && ready ? (
        <OutlineEditor world={liveWorld} tick={spots} />
      ) : null}

      <p
        className={`sh-speech ${line ? "on" : ""}`}
        ref={speechRef}
        aria-live="polite"
      >
        {line ? unwidow(line) : null}
      </p>

      {card?.work && (
        <aside className="sh-card" key={card.id}>
          <button
            type="button"
            className="sh-close"
            onClick={closeCard}
            aria-label="Close"
          >
            <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
              <path
                d="M1.5 1.5l7 7M8.5 1.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="sh-card-title">{unwidow(card.work.title)}</p>
          <p className="sh-card-text">{unwidow(card.work.summary)}</p>
          <div className="sh-card-actions">
            {(
              card.work.links ?? [
                {
                  label:
                    card.id === "post"
                      ? "Write to me"
                      : card.id === "drawer"
                        ? "Open the playground"
                        : "Read the case study",
                  href: card.work.href,
                },
              ]
            ).map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                className={i === 0 ? "sh-go" : "sh-go sh-go-quiet"}
                onClick={link.href.startsWith("/#") ? closeCard : undefined}
              >
                {link.label}
              </a>
            ))}
          </div>
        </aside>
      )}

      <a
        href="#work"
        className="sh-down"
        aria-label="Scroll down to see all the work"
      >
        <span>All the work</span>
        <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
          <path
            d="M2 4.5l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
      {ready && (
        <button
          type="button"
          className="sh-sound"
          onClick={toggleSound}
          aria-pressed={sound === "on"}
          aria-label={sound === "on" ? "Mute the rain" : "Play the rain"}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" fill="currentColor" />
            {sound === "on" ? (
              <path
                d="M10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.6 3.8a6 6 0 0 1 0 8.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M10.5 6l4 4M14.5 6l-4 4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      )}
      {!ready && !failed && <p className="sh-hint">Opening the studio…</p>}
      <span id="work" className="sh-anchor" />
    </section>
  );
}
