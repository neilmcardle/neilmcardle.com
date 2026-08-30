"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import styles from "./home.module.css";
import type { Lean } from "./IdentityCard";

type TokenId =
  "role" | "london" | "makeebook" | "coverly" | "doodlewire" | "idea";

type Payload = {
  image: { src: string; alt: string };
  link: { href: string; text: string; external?: boolean };
};

const PRODUCTS: Record<"makeebook" | "coverly" | "doodlewire", Payload> = {
  makeebook: {
    image: { src: "/screenshots/makeebook.png", alt: "makeEbook editor" },
    link: {
      href: "https://makeebook.ink",
      text: "makeebook.ink",
      external: true,
    },
  },
  coverly: {
    image: { src: "/screenshots/coverly.png", alt: "Coverly book covers" },
    link: { href: "/coverly", text: "View project" },
  },
  doodlewire: {
    image: { src: "/screenshots/doodlewire.png", alt: "DoodleWire mobile UI" },
    link: {
      href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
      text: "App Store",
      external: true,
    },
  },
};

const CYCLE = ["idea", "design", "build"];

export default function LiveSentence({
  onLean,
}: {
  onLean: (lean: Lean) => void;
}) {
  const [open, setOpen] = useState<TokenId | null>(null);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const closeTimer = useRef<number | null>(null);

  const show = useCallback(
    (id: TokenId, el: HTMLElement) => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
      setAnchor(el.getBoundingClientRect());
      setOpen(id);
      onLean(id === "london" ? "left" : "none");
    },
    [onLean],
  );

  const hide = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setOpen(null);
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
      setOpen(null);
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

  const tok = (id: TokenId, text: string) => (
    <Token id={id} text={text} open={open === id} onShow={show} onHide={hide} />
  );

  return (
    <div className={styles.sentenceWrap}>
      <p className={styles.sentence}>
        Neil McArdle is a {tok("role", "product designer")} in{" "}
        {tok("london", "London")} who builds the things he designs. Currently{" "}
        {tok("makeebook", "makeEbook")}, {tok("coverly", "Coverly")}, and{" "}
        {tok("doodlewire", "DoodleWire")}.{" "}
        <IdeaPhrase open={open === "idea"} onShow={show} onHide={hide} />
      </p>

      {open && anchor ? (
        <TokenCard
          id={open}
          anchor={anchor}
          onEnter={cancelHide}
          onLeave={hide}
        />
      ) : null}
    </div>
  );
}

function Token({
  id,
  text,
  open,
  onShow,
  onHide,
}: {
  id: TokenId;
  text: string;
  open: boolean;
  onShow: (id: TokenId, el: HTMLElement) => void;
  onHide: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.tok} ${open ? styles.tokOpen : ""}`}
      aria-expanded={open}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onShow(id, e.currentTarget);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onHide();
      }}
      onFocus={(e) => onShow(id, e.currentTarget)}
      onBlur={onHide}
      onClick={(e) => {
        if (open) onHide();
        else onShow(id, e.currentTarget);
      }}
    >
      {text}
    </button>
  );
}

function IdeaPhrase({
  open,
  onShow,
  onHide,
}: {
  open: boolean;
  onShow: (id: TokenId, el: HTMLElement) => void;
  onHide: () => void;
}) {
  const [i, setI] = useState(0);
  const [swapping, setSwapping] = useState(false);

  useEffect(() => {
    if (!open) {
      setI(0);
      setSwapping(false);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = window.setInterval(() => {
      setSwapping(true);
      window.setTimeout(() => {
        setI((n) => (n + 1) % CYCLE.length);
        setSwapping(false);
      }, 300);
    }, 2400);
    return () => window.clearInterval(tick);
  }, [open]);

  return (
    <button
      type="button"
      className={`${styles.tok} ${open ? styles.tokOpen : ""}`}
      aria-label="One idea at a time"
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onShow("idea", e.currentTarget);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") onHide();
      }}
      onFocus={(e) => onShow("idea", e.currentTarget)}
      onBlur={onHide}
      onClick={(e) => (open ? onHide() : onShow("idea", e.currentTarget))}
    >
      One{" "}
      <span
        className={`${styles.cycler} ${swapping ? styles.cyclerSwap : ""}`}
        aria-hidden="true"
      >
        {CYCLE[i]}
      </span>{" "}
      at a time.
    </button>
  );
}

function TokenCard({
  id,
  anchor,
  onEnter,
  onLeave,
}: {
  id: TokenId;
  anchor: DOMRect;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean }>(
    {
      left: anchor.left,
      top: anchor.bottom + 10,
      above: false,
    },
  );

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const w = el.offsetWidth;
    const above = anchor.top > window.innerHeight * 0.55;
    const left = Math.min(
      Math.max(12, anchor.left + anchor.width / 2 - w / 2),
      window.innerWidth - w - 12,
    );
    setPos({ left, top: above ? anchor.top - 10 : anchor.bottom + 10, above });
  }, [anchor, id]);

  return (
    <div
      ref={ref}
      role="tooltip"
      className={`${styles.card} ${pos.above ? styles.cardAbove : ""}`}
      style={{ left: pos.left, top: pos.top }}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      {id === "london" ? (
        <LondonCard />
      ) : id === "role" ? (
        <a
          className={styles.cardXLink}
          href="https://x.com/BetterNeil"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Follow along
          <Arrow />
        </a>
      ) : id === "idea" ? (
        <>
          <p className={styles.cardLabel}>Design philosophy</p>
          <p className={styles.cardBody}>
            Coherent thinking, coherent product. The product is coherent because
            the thinking is coherent.
          </p>
        </>
      ) : (
        <ProductCard payload={PRODUCTS[id]} />
      )}
    </div>
  );
}

function ProductCard({ payload }: { payload: Payload }) {
  return (
    <>
      <div className={styles.cardMedia}>
        <img src={payload.image.src} alt={payload.image.alt} loading="lazy" />
      </div>
      {payload.link.external ? (
        <a
          className={styles.cardLink}
          href={payload.link.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {payload.link.text}
          <Arrow />
        </a>
      ) : (
        <Link className={styles.cardLink} href={payload.link.href}>
          {payload.link.text}
          <Arrow />
        </Link>
      )}
    </>
  );
}

function LondonCard() {
  const [now, setNow] = useState<string>("");

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
    <>
      <p className={styles.cardLabel}>51.5074 N, 0.1278 W</p>
      <span className={styles.clock}>{now || "--:--:--"}</span>
    </>
  );
}

function Arrow() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M7 7h10v10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
