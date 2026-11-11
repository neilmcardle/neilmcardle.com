"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import styles from "./jump.module.css";
import { ENTRIES, initialJump, jump, matchEntries, selected } from "./jump";

const NOTHING = "Nothing matches that.";
const option = (id: string) => `jump-opt-${id}`;

const never = () => () => {};
const keyHint = () =>
  /mac|iphone|ipad/i.test(navigator.userAgent) ? "⌘K" : "Ctrl K";
const noHint = () => "";

const announce = (open: boolean, count: number) => {
  if (!open) return "";
  if (count === 0) return NOTHING;
  return `${count} ${count === 1 ? "piece" : "pieces"}`;
};

export default function JumpBar() {
  const [state, dispatch] = useReducer(jump, initialJump);
  const hint = useSyncExternalStore(never, keyHint, noHint);
  const [said, setSaid] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLAnchorElement>(null);
  const restore = useRef<HTMLElement | null>(null);

  const matches = matchEntries(ENTRIES, state.query);
  const active = selected(state);

  const show = useCallback(() => {
    restore.current = document.activeElement as HTMLElement | null;
    dispatch({ type: "open" });
  }, []);

  const hide = useCallback(() => {
    dispatch({ type: "close" });
    const back = restore.current;
    restore.current = null;
    if (back?.isConnected) back.focus({ preventScroll: true });
    else trigger.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "k") return;
      event.preventDefault();
      if (state.open) hide();
      else show();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open, show, hide]);

  useEffect(() => {
    if (!state.open) return;
    const body = document.body;
    const overflow = body.style.overflow;
    const padding = body.style.paddingRight;
    const bar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (bar > 0) body.style.paddingRight = `${bar}px`;
    field.current?.focus();
    return () => {
      body.style.overflow = overflow;
      body.style.paddingRight = padding;
    };
  }, [state.open]);

  useEffect(() => {
    const view = typeof window === "undefined" ? null : window.visualViewport;
    const node = panel.current;
    if (!state.open || !view || !node) return;
    const measure = () =>
      node.style.setProperty("--jump-vh", `${view.height - 16}px`);
    measure();
    view.addEventListener("resize", measure);
    view.addEventListener("scroll", measure);
    return () => {
      view.removeEventListener("resize", measure);
      view.removeEventListener("scroll", measure);
    };
  }, [state.open]);

  useEffect(() => {
    row.current?.scrollIntoView({ block: "nearest" });
  }, [state.index, state.query]);

  useEffect(() => {
    const count = matches.length;
    const timer = setTimeout(() => setSaid(announce(state.open, count)), 200);
    return () => clearTimeout(timer);
  }, [state.open, matches.length]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      hide();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const next =
        document.activeElement === field.current
          ? closer.current
          : field.current;
      next?.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      dispatch({ type: "move", delta: 1 });
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      dispatch({ type: "move", delta: -1 });
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      dispatch({ type: "move", delta: -state.index });
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      dispatch({ type: "move", delta: matches.length - 1 - state.index });
      return;
    }
    if (event.key === "Enter") {
      if (document.activeElement !== field.current) return;
      event.preventDefault();
      if (!active) return;
      row.current?.click();
      hide();
    }
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        onClick={show}
        aria-label="Jump to a piece of work"
        aria-keyshortcuts="Meta+K Control+K"
      >
        Jump
        <span className={styles.hint} aria-hidden="true">
          {hint}
        </span>
      </button>

      {state.open ? (
        <div className={styles.overlay} onKeyDown={onKeyDown}>
          <div className={styles.scrim} onPointerDown={hide} />
          <div
            ref={panel}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-label="Jump"
          >
            <div className={styles.head}>
              <input
                ref={field}
                className={styles.field}
                type="text"
                value={state.query}
                onChange={(event) =>
                  dispatch({ type: "query", value: event.target.value })
                }
                placeholder="Search the work"
                aria-label="Search the work"
                role="combobox"
                aria-expanded="true"
                aria-controls="jump-list"
                aria-autocomplete="list"
                aria-activedescendant={active ? option(active.id) : undefined}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="search"
                enterKeyHint="go"
              />
              <button
                ref={closer}
                type="button"
                className={styles.close}
                onClick={hide}
                aria-label="Close"
              >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 2l8 8M10 2l-8 8" />
                </svg>
              </button>
            </div>

            <ul
              className={styles.list}
              role="listbox"
              id="jump-list"
              aria-label="Pieces"
            >
              {matches.map((entry, i) => (
                <li key={entry.id}>
                  <Link
                    ref={i === state.index ? row : null}
                    className={styles.row}
                    href={entry.href}
                    id={option(entry.id)}
                    role="option"
                    aria-selected={i === state.index}
                    tabIndex={-1}
                    onClick={(event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      )
                        return;
                      hide();
                    }}
                  >
                    <span className={styles.thumb}>
                      {entry.image ? (
                        <Image
                          src={entry.image}
                          alt=""
                          width={64}
                          height={36}
                          sizes="64px"
                          draggable={false}
                          onError={(event) => {
                            event.currentTarget.hidden = true;
                          }}
                        />
                      ) : null}
                    </span>
                    <span className={styles.text}>
                      <span className={styles.title}>{entry.title}</span>
                      {entry.line ? (
                        <span className={styles.line}>{entry.line}</span>
                      ) : null}
                    </span>
                    <span className={styles.kind}>{entry.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {matches.length === 0 ? (
              <p className={styles.empty}>{NOTHING}</p>
            ) : null}
          </div>
          <p className={styles.say} role="status" aria-live="polite">
            {said}
          </p>
        </div>
      ) : null}
    </>
  );
}
