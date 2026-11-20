"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import styles from "./zoom.module.css";

const OPEN = 400;
const CLOSE = 240;
const SWAP = 240;
const GROW = 1.2;

type Box = { left: number; top: number; width: number; height: number };

let scope: string | undefined;

function root(): ParentNode {
  return (scope && document.querySelector(scope)) || document;
}

function shots() {
  return Array.from(
    root().querySelectorAll<HTMLImageElement>("img[data-zoomable]"),
  );
}

function fit(img: HTMLImageElement): Box {
  const pad = window.innerWidth < 560 ? 16 : 48;
  const bar = 64;
  const ratio =
    (img.naturalWidth || img.width) / (img.naturalHeight || img.height);
  const room = {
    width: window.innerWidth - pad * 2,
    height: window.innerHeight - bar * 2,
  };
  const width = Math.min(room.width, room.height * ratio);
  const height = width / ratio;
  return {
    left: (window.innerWidth - width) / 2,
    top: (window.innerHeight - height) / 2,
    width,
    height,
  };
}

function turnOf(img: HTMLElement) {
  let node: HTMLElement | null = img;
  for (let i = 0; node && i < 4; i++, node = node.parentElement) {
    const turn = parseFloat(getComputedStyle(node).rotate);
    if (turn) return turn;
  }
  return 0;
}

function from(target: Box, img: HTMLImageElement) {
  const rect = img.getBoundingClientRect();
  const turn = turnOf(img);
  const width = turn ? img.offsetWidth : rect.width;
  const height = turn ? img.offsetHeight : rect.height;
  const dx = rect.left + rect.width / 2 - (target.left + target.width / 2);
  const dy = rect.top + rect.height / 2 - (target.top + target.height / 2);
  const hw = target.width / 2;
  const hh = target.height / 2;
  return `translate(${dx + hw}px, ${dy + hh}px) rotate(${turn}deg) scale(${width / target.width}, ${height / target.height}) translate(${-hw}px, ${-hh}px)`;
}

function mark() {
  for (const img of root().querySelectorAll<HTMLImageElement>(
    "img[data-zoom]",
  )) {
    const shown = img.getBoundingClientRect();
    const grows = shown.width > 0 && fit(img).width >= shown.width * GROW;
    if (grows) {
      img.dataset.zoomable = "";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Enlarge image: ${img.alt}`);
      img.style.cursor = "zoom-in";
    } else if ("zoomable" in img.dataset) {
      delete img.dataset.zoomable;
      img.removeAttribute("tabindex");
      img.removeAttribute("role");
      img.removeAttribute("aria-label");
      img.style.cursor = "";
    }
  }
}

function sharpest(img: HTMLImageElement, width: number) {
  const need = width * window.devicePixelRatio;
  const options = img.srcset
    .split(",")
    .map((part) => {
      const [url, size] = part.trim().split(/\s+/);
      return { url, size: parseFloat(size) || 0 };
    })
    .filter((option) => option.url)
    .sort((a, b) => a.size - b.size);
  const pick = options.find((option) => option.size >= need) ?? options.at(-1);
  return pick?.url ?? img.currentSrc ?? img.src;
}

function hide(img: HTMLImageElement, hidden: boolean) {
  img.style.visibility = hidden ? "hidden" : "";
}

function lock() {
  const body = document.body;
  const y = window.scrollY;
  const saved = {
    position: body.style.position,
    top: body.style.top,
    width: body.style.width,
    overflow: body.style.overflow,
    paddingRight: body.style.paddingRight,
  };
  const bar = window.innerWidth - document.documentElement.clientWidth;
  body.style.position = "fixed";
  body.style.top = `-${y}px`;
  body.style.width = "100%";
  body.style.overflow = "hidden";
  if (bar > 0) body.style.paddingRight = `${bar}px`;
  return () => {
    Object.assign(body.style, saved);
    window.scrollTo({ top: y, behavior: "instant" });
  };
}

type View = {
  list: HTMLImageElement[];
  index: number;
  previous: number | null;
};

export default function Zoom({ within }: { within?: string } = {}) {
  const [view, setView] = useState<View | null>(null);
  const [closing, setClosing] = useState(false);
  const [sharp, setSharp] = useState<string | null>(null);
  const viewer = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const shut = useRef<HTMLButtonElement>(null);
  const calm = useRef(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const opening = useRef(false);

  useEffect(() => {
    scope = within;
    calm.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let timer = 0;
    const update = () => {
      clearTimeout(timer);
      timer = window.setTimeout(mark, 100);
    };
    update();
    const loads = new AbortController();
    for (const img of root().querySelectorAll("img[data-zoom]"))
      img.addEventListener("load", update, { signal: loads.signal });
    window.addEventListener("resize", update);

    const open = (img: HTMLImageElement) => {
      const list = shots();
      opening.current = true;
      setClosing(false);
      setView({ list, index: list.indexOf(img), previous: null });
    };
    const onClick = (event: MouseEvent) => {
      const img = (event.target as Element).closest?.("img[data-zoomable]");
      if (!(img instanceof HTMLImageElement)) return;
      event.preventDefault();
      open(img);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const img = event.target;
      if (!(img instanceof HTMLImageElement) || !("zoomable" in img.dataset))
        return;
      event.preventDefault();
      open(img);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      loads.abort();
      window.removeEventListener("resize", update);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [within]);

  const current = view ? view.list[view.index] : null;
  const box = current ? fit(current) : null;

  const isOpen = view !== null;

  useEffect(() => {
    if (!isOpen) return;
    const unlock = lock();
    shut.current?.focus({ preventScroll: true });
    return unlock;
  }, [isOpen]);

  useEffect(() => {
    if (!current) return;
    hide(current, true);
    return () => hide(current, false);
  }, [current]);

  useLayoutEffect(() => {
    const node = viewer.current;
    const back = scrim.current;
    if (!opening.current || !node || !back || !current || !box) return;
    opening.current = false;
    if (calm.current) return;
    node.style.transition = "none";
    node.style.transform = from(box, current);
    back.style.transition = "none";
    back.style.opacity = "0";
    node.getBoundingClientRect();
    node.style.transition = `transform ${OPEN}ms var(--ease)`;
    node.style.transform = "";
    back.style.transition = `opacity ${OPEN}ms var(--ease)`;
    back.style.opacity = "";
  }, [current, box]);

  useEffect(() => {
    if (!view || view.previous === null) return;
    const timer = setTimeout(
      () => setView((v) => (v ? { ...v, previous: null } : v)),
      SWAP,
    );
    return () => clearTimeout(timer);
  }, [view]);

  const close = useCallback(() => {
    if (!view || closing) return;
    const node = viewer.current;
    const back = scrim.current;
    const source = view.list[view.index];
    setClosing(true);
    const done = () => {
      hide(source, false);
      setView(null);
      setClosing(false);
      source.focus({ preventScroll: true });
    };
    if (calm.current || !node || !back) {
      setTimeout(done, 160);
      return;
    }
    node.style.transition = `transform ${CLOSE}ms var(--ease)`;
    node.style.transform = from(fit(source), source);
    back.style.transition = `opacity ${CLOSE}ms var(--ease)`;
    back.style.opacity = "0";
    setTimeout(done, CLOSE);
  }, [view, closing]);

  const step = useCallback(
    (delta: number) => {
      if (!view || closing || view.list.length < 2) return;
      const index = (view.index + delta + view.list.length) % view.list.length;
      setView({ ...view, index, previous: view.index });
    },
    [view, closing],
  );

  useEffect(() => {
    if (!view) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "Tab") {
        const stops = Array.from(
          dialog.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
        );
        if (!stops.length) return;
        const at = stops.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          (at + (event.shiftKey ? -1 : 1) + stops.length) % stops.length;
        event.preventDefault();
        stops[next].focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, close, step]);

  if (!view || !current || !box) return null;
  const previous = view.previous !== null ? view.list[view.previous] : null;
  const many = view.list.length > 1;
  const place = (b: Box) => ({
    left: b.left,
    top: b.top,
    width: b.width,
    height: b.height,
  });

  return (
    <div
      ref={dialog}
      className={`${styles.zoom} ${closing ? styles.closing : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touch.current = { x: t.clientX, y: t.clientY };
      }}
      onTouchEnd={(e) => {
        const start = touch.current;
        touch.current = null;
        if (!start) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - start.x;
        if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(t.clientY - start.y))
          step(dx < 0 ? 1 : -1);
      }}
    >
      <div ref={scrim} className={styles.scrim} onClick={close} />
      {previous ? (
        <div
          key={`out-${view.previous}`}
          className={`${styles.viewer} ${styles.leaving}`}
          style={place(fit(previous))}
          aria-hidden="true"
        >
          <Image
            src={previous.currentSrc || previous.src}
            alt=""
            fill
            unoptimized
          />
        </div>
      ) : null}
      <div
        key={`in-${view.index}`}
        ref={viewer}
        className={`${styles.viewer} ${previous ? styles.arriving : ""}`}
        style={place(box)}
        onClick={close}
      >
        <Image
          src={current.currentSrc || current.src}
          alt={current.alt}
          fill
          unoptimized
        />
        {current.srcset ? (
          <Image
            className={`${styles.sharp} ${sharp === current.src ? styles.ready : ""}`}
            src={sharpest(current, box.width)}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            onLoad={() => setSharp(current.src)}
          />
        ) : null}
      </div>
      <button
        ref={shut}
        type="button"
        className={styles.close}
        onClick={close}
        aria-label="Close"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.5 3.5l9 9M12.5 3.5l-9 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
      {many ? (
        <div className={styles.nav}>
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous image"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M10 3.5L5.5 8l4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span aria-live="polite">
            {view.index + 1} of {view.list.length}
          </span>
          <button type="button" onClick={() => step(1)} aria-label="Next image">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 3.5L10.5 8 6 12.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
