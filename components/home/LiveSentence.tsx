"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./home.module.css";
import type { Lean } from "./IdentityCard";

export default function LiveSentence({
  onLean,
}: {
  onLean: (lean: Lean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const closeTimer = useRef<number | null>(null);

  const show = useCallback(
    (el: HTMLElement) => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      setAnchor(el.getBoundingClientRect());
      setOpen(true);
      onLean("left");
    },
    [onLean],
  );

  const hide = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
      setAnchor(null);
      onLean("none");
    }, 260);
  }, [onLean]);

  const cancelHide = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = () => {
      setOpen(false);
      setAnchor(null);
      onLean("none");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("scroll", close, { passive: true });
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onLean]);

  return (
    <div className={styles.sentenceWrap}>
      <p className={styles.sentence}>
        I&rsquo;m Neil, a product designer in{" "}
        <button
          type="button"
          className={`${styles.tok} ${open ? styles.tokOpen : ""}`}
          aria-expanded={open}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") show(e.currentTarget);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "mouse") hide();
          }}
          onFocus={(e) => show(e.currentTarget)}
          onBlur={hide}
          onClick={(e) => {
            if (open) hide();
            else show(e.currentTarget);
          }}
        >
          London
        </button>
        .
      </p>

      {open && anchor ? (
        <LondonCard anchor={anchor} onEnter={cancelHide} onLeave={hide} />
      ) : null}
    </div>
  );
}

function LondonCard({
  anchor,
  onEnter,
  onLeave,
}: {
  anchor: DOMRect;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<string>("");
  const [pos, setPos] = useState({
    left: anchor.left,
    top: anchor.top - 10,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const left = Math.min(
      Math.max(12, anchor.left + anchor.width / 2 - w / 2),
      window.innerWidth - w - 12,
    );
    setPos({ left, top: anchor.top - 10 });
  }, [anchor]);

  useEffect(() => {
    const paint = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          timeZone: "Europe/London",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    paint();
    const t = window.setInterval(paint, 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div
      ref={ref}
      role="tooltip"
      className={styles.card}
      style={{ left: pos.left, top: pos.top }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <span className={styles.clock}>{now || "--:--:--"}</span>
    </div>
  );
}
