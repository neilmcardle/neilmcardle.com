"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import styles from "./home.module.css";
import CopyEmail from "./CopyEmail";
import ProductBadge from "./ProductBadge";
import { dockClick } from "./menuSound";
import { FEATURES, ProductDetail, type Feature } from "./SelectedWork";

type DockKey = Feature["tileKey"] | "contact";

const KEYS: DockKey[] = [...FEATURES.map((f) => f.tileKey), "contact"];
const PANEL_ID = "dock-panel";
const PRODUCT_HEIGHT = 680;
const listeners = new Set<() => void>();

function current(): DockKey | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  return KEYS.find((key) => key === hash) ?? null;
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  window.addEventListener("hashchange", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("hashchange", fn);
  };
}

function show(key: DockKey | null) {
  const { pathname, search } = window.location;
  window.history.replaceState(
    null,
    "",
    key ? `#${key}` : `${pathname}${search}`,
  );
  for (const fn of listeners) fn();
}

export default function ProductDock() {
  const active = useSyncExternalStore(subscribe, current, () => null);
  const [shown, setShown] = useState<DockKey | null>(null);
  if (active && active !== shown) setShown(active);
  const key = active ?? shown;
  const closing = !active && shown !== null;
  const dockRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const triggers = useRef(new Map<DockKey, HTMLButtonElement>());

  const register = (key: DockKey, el: HTMLButtonElement | null) => {
    if (el) triggers.current.set(key, el);
    else triggers.current.delete(key);
  };

  const close = useCallback(() => {
    const key = current();
    show(null);
    if (key) triggers.current.get(key)?.focus();
  }, []);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const bar = barRef.current;
    if (!panel || !bar) return;
    const contact = contactRef.current;
    const fit = () => {
      const max = parseFloat(getComputedStyle(panel).maxHeight);
      const limit = Number.isFinite(max) ? max : Infinity;
      if (!contact) {
        panel.style.height = `${Math.min(PRODUCT_HEIGHT, limit)}px`;
        return;
      }
      const body = contact.parentElement;
      const spacing = body ? getComputedStyle(body) : null;
      const natural =
        bar.offsetHeight +
        contact.offsetHeight +
        (spacing
          ? parseFloat(spacing.paddingTop) + parseFloat(spacing.paddingBottom)
          : 0) +
        2;
      panel.style.height = `${Math.min(natural, limit)}px`;
    };
    fit();
    const sizer = new ResizeObserver(fit);
    if (contact) sizer.observe(contact);
    window.addEventListener("resize", fit);
    return () => {
      sizer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [key]);

  useEffect(() => {
    if (!active) return;
    panelRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        panelRef.current?.contains(target) ||
        dockRef.current?.contains(target)
      )
        return;
      show(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [active, close]);

  const feature = FEATURES.find((f) => f.tileKey === key);

  return (
    <>
      {key && (
        <div
          ref={panelRef}
          id={PANEL_ID}
          role="dialog"
          aria-label={feature ? feature.name : "Contact"}
          tabIndex={-1}
          className={styles.dockPanel}
          data-kind={feature ? "product" : "contact"}
          data-state={closing ? "closing" : "open"}
          inert={closing}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && !active) setShown(null);
          }}
        >
          <div key={key} className={styles.dockPanelContent}>
            <div ref={barRef} className={styles.dockPanelBar}>
              <span className={styles.dockPanelEyebrow}>
                {feature ? "Work" : "Contact"}
              </span>
              <button
                type="button"
                className={styles.dockClose}
                aria-label="Close"
                onClick={close}
              >
                <CloseIcon />
              </button>
            </div>

            {feature ? (
              <ProductDetail feature={feature} />
            ) : (
              <div className={styles.dockPanelBody}>
                <div ref={contactRef}>
                  <span className={styles.dockPanelMark}>
                    <span className={styles.dockMail}>
                      <MailIcon />
                    </span>
                  </span>
                  <h2 className={styles.dockPanelTitle}>Tell me more.</h2>
                  <p className={styles.dockPanelMeta}>
                    I promise I&rsquo;ll read it
                  </p>
                  <div className={styles.dockSideLink}>
                    <CopyEmail />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav
        ref={dockRef}
        aria-label="Projects"
        className={styles.dock}
        onPointerEnter={dockClick.prime}
        onFocus={dockClick.prime}
      >
        {FEATURES.map((f) => (
          <button
            key={f.tileKey}
            ref={(el) => register(f.tileKey, el)}
            type="button"
            className={styles.dockItem}
            aria-label={f.name}
            aria-expanded={active === f.tileKey}
            aria-controls={PANEL_ID}
            onClick={() => {
              dockClick.play(0.5);
              show(active === f.tileKey ? null : f.tileKey);
            }}
          >
            <span className={styles.dockIcon}>
              <ProductBadge badge={f.tileKey} size={32} />
            </span>
            <span className={styles.dockLabel}>
              <span>{f.name}</span>
            </span>
          </button>
        ))}
        <span className={styles.dockDivider} aria-hidden="true" />
        <button
          ref={(el) => register("contact", el)}
          type="button"
          className={styles.dockItem}
          aria-label="Contact"
          aria-expanded={active === "contact"}
          aria-controls={PANEL_ID}
          onClick={() => {
            dockClick.play(0.5);
            show(active === "contact" ? null : "contact");
          }}
        >
          <span className={styles.dockIcon}>
            <span className={styles.dockMail}>
              <MailIcon />
            </span>
          </span>
          <span className={styles.dockLabel}>
            <span>Contact</span>
          </span>
        </button>
      </nav>

      <section className={styles.srOnly} aria-label="Project summaries">
        <h2>Projects</h2>
        <ul>
          {FEATURES.map((f) => (
            <li key={f.tileKey}>
              <a href={f.href}>{f.name}</a>
              {`. ${f.category}. ${f.description}`}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function MailIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 63 63"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect
        x="28"
        y="12"
        width="7"
        height="39"
        rx="3.5"
        transform="rotate(45 31.5 31.5)"
      />
      <rect
        x="28"
        y="12"
        width="7"
        height="39"
        rx="3.5"
        transform="rotate(-45 31.5 31.5)"
      />
    </svg>
  );
}
