"use client";

import Link from "next/link";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import {
  BRUSHES,
  PAINTS,
  type Drawing,
  type Stroke,
} from "@/lib/vector-paint/drawing";
import { ORDERS_ENABLED } from "@/lib/vector-paint/products";
import Easel from "./easel";
import Mark from "./mark";
import OrderSheet from "./order-sheet";
import Wall from "./wall";
import { useDrawings } from "./use-drawings";
import {
  BrushIcon,
  EraserIcon,
  NewPageIcon,
  RedoIcon,
  RotateIcon,
  TrashIcon,
  UndoIcon,
  WallIcon,
} from "./icons";
import styles from "../vector-paint.module.css";

const HISTORY_LIMIT = 200;
const UNDO_TOAST_MS = 8000;

interface EditorState {
  id: string | null;
  strokes: Stroke[];
  past: Stroke[][];
  future: Stroke[][];
  dirty: boolean;
}

type EditorAction =
  | { type: "load"; id: string; strokes: Stroke[] }
  | { type: "commit"; stroke: Stroke }
  | { type: "clear" }
  | { type: "undo" }
  | { type: "redo" };

function editor(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "load":
      return {
        id: action.id,
        strokes: action.strokes,
        past: [],
        future: [],
        dirty: false,
      };
    case "commit":
      return {
        ...state,
        strokes: [...state.strokes, action.stroke],
        past: [...state.past, state.strokes].slice(-HISTORY_LIMIT),
        future: [],
        dirty: true,
      };
    case "clear":
      if (state.strokes.length === 0) return state;
      return {
        ...state,
        strokes: [],
        past: [...state.past, state.strokes].slice(-HISTORY_LIMIT),
        future: [],
        dirty: true,
      };
    case "undo": {
      if (state.past.length === 0) return state;
      const prev = state.past[state.past.length - 1];
      return {
        ...state,
        strokes: prev,
        past: state.past.slice(0, -1),
        future: [state.strokes, ...state.future],
        dirty: true,
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        ...state,
        strokes: next,
        past: [...state.past, state.strokes],
        future: rest,
        dirty: true,
      };
    }
  }
}

const LIGHT_PAINTS = new Set(["#FFC72C", "#7ED9B0", "#FFC9A8"]);

export default function Studio() {
  const lib = useDrawings();
  const [state, dispatch] = useReducer(editor, {
    id: null,
    strokes: [],
    past: [],
    future: [],
    dirty: false,
  });
  const [color, setColor] = useState<string>(PAINTS[1].hex);
  const [brush, setBrush] = useState(1);
  const [erasing, setErasing] = useState(false);
  const [showWall, setShowWall] = useState(false);
  const [ordering, setOrdering] = useState<Drawing | null>(null);
  const [gatePassed, setGatePassed] = useState(false);
  const [removed, setRemoved] = useState<{
    drawing: Drawing;
    index: number;
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const removedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = lib.current;

  useEffect(() => {
    if (current && current.id !== state.id)
      dispatch({ type: "load", id: current.id, strokes: current.strokes });
  }, [current, state.id]);

  const { saveStrokes } = lib;
  useEffect(() => {
    if (state.id && state.dirty) saveStrokes(state.id, state.strokes);
  }, [state.id, state.strokes, state.dirty, saveStrokes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "canceled") {
      setNotice(
        "Checkout closed. Nothing was charged, and your drawing is still here.",
      );
      window.history.replaceState(null, "", window.location.pathname);
      const t = setTimeout(() => setNotice(null), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  const overlayOpen = showWall || ordering !== null;

  useEffect(() => {
    if (overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      )
        return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (!mod && e.key.toLowerCase() === "b") {
        setErasing(false);
      } else if (!mod && e.key.toLowerCase() === "e") {
        setErasing(true);
      } else if (!mod && e.key === "[") {
        setBrush((b) => Math.max(0, b - 1));
      } else if (!mod && e.key === "]") {
        setBrush((b) => Math.min(BRUSHES.length - 1, b + 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayOpen]);

  const onCommit = useCallback(
    (stroke: Stroke) => dispatch({ type: "commit", stroke }),
    [],
  );

  const newPage = () => {
    if (!current || state.strokes.length === 0) return;
    lib.create(current.orientation);
  };

  const turnPage = () => {
    if (!current) return;
    const other = current.orientation === "portrait" ? "landscape" : "portrait";
    if (state.strokes.length === 0) lib.setOrientation(current.id, other);
    else lib.create(other);
  };

  const pickPaint = (hex: string) => {
    setColor(hex);
    setErasing(false);
  };

  const openFromWall = (id: string) => {
    lib.open(id);
    setShowWall(false);
  };

  const orderFromWall = (id: string) => {
    const d = lib.drawings.find((x) => x.id === id);
    if (d) setOrdering(d);
  };

  const orderCurrent = () => {
    if (!current || state.strokes.length === 0) return;
    setOrdering({ ...current, strokes: state.strokes });
  };

  const removeFromWall = (id: string) => {
    const result = lib.remove(id);
    if (!result) return;
    if (id === current?.id) lib.create("portrait");
    if (removedTimer.current) clearTimeout(removedTimer.current);
    setRemoved(result);
    removedTimer.current = setTimeout(() => setRemoved(null), UNDO_TOAST_MS);
  };

  const undoRemove = () => {
    if (!removed) return;
    lib.restore(removed.drawing, removed.index);
    setRemoved(null);
    if (removedTimer.current) clearTimeout(removedTimer.current);
  };

  const pinnedCount = lib.drawings.filter((d) => d.strokes.length > 0).length;
  const empty = state.strokes.length === 0;

  return (
    <div className={styles.root}>
      <header className={styles.bar}>
        <Link
          href="/"
          className={styles.brand}
          aria-label="vector paint, back to neilmcardle.com"
        >
          <Mark />
          <span className={styles.wordmark}>vector paint</span>
        </Link>
        <div className={styles.barActions}>
          <button className={styles.pill} onClick={() => setShowWall(true)}>
            <WallIcon />
            <span className={styles.hideNarrow}>My wall</span>
            {pinnedCount > 0 && (
              <span className={styles.count}>{pinnedCount}</span>
            )}
          </button>
          {ORDERS_ENABLED && (
            <button
              className={`${styles.pill} ${styles.primary}`}
              onClick={orderCurrent}
              disabled={empty}
              title={empty ? "Draw something first" : undefined}
            >
              Order a canvas
            </button>
          )}
        </div>
      </header>

      <main className={styles.easel}>
        {current && (
          <Easel
            pageKey={current.id + current.orientation}
            orientation={current.orientation}
            strokes={state.id === current.id ? state.strokes : current.strokes}
            color={color}
            width={BRUSHES[brush].w}
            erasing={erasing}
            onCommit={onCommit}
            label={`${current.name}, drawing page`}
          />
        )}
        {current && (
          <p className={styles.status} aria-live="polite">
            {!empty && <span className={styles.dot} aria-hidden />}
            {current.name}
            {!empty ? " · kept on your wall" : ""}
          </p>
        )}
      </main>

      <div className={styles.dock}>
        <div className={styles.tray} role="toolbar" aria-label="Tools">
          <button
            className={`${styles.tool} ${!erasing ? styles.toolOn : ""}`}
            onClick={() => setErasing(false)}
            aria-pressed={!erasing}
            aria-label="Paintbrush"
          >
            <BrushIcon />
          </button>
          <button
            className={`${styles.tool} ${erasing ? styles.toolOn : ""}`}
            onClick={() => setErasing(true)}
            aria-pressed={erasing}
            aria-label="Rubber"
          >
            <EraserIcon />
          </button>
          <span className={styles.sep} aria-hidden />
          {BRUSHES.map((b, i) => (
            <button
              key={b.name}
              className={`${styles.tool} ${brush === i ? styles.toolOn : ""}`}
              onClick={() => setBrush(i)}
              aria-pressed={brush === i}
              aria-label={`${b.name} brush`}
            >
              <span
                className={styles.brushDot}
                style={{
                  width: 6 + i * 6,
                  height: 6 + i * 6,
                  color:
                    brush === i ? undefined : erasing ? "var(--faint)" : color,
                }}
              />
            </button>
          ))}
          <span className={styles.sep} aria-hidden />
          <button
            className={styles.tool}
            onClick={() => dispatch({ type: "undo" })}
            disabled={state.past.length === 0}
            aria-label="Undo"
          >
            <UndoIcon />
          </button>
          <button
            className={styles.tool}
            onClick={() => dispatch({ type: "redo" })}
            disabled={state.future.length === 0}
            aria-label="Redo"
          >
            <RedoIcon />
          </button>
          <button
            className={styles.tool}
            onClick={() => dispatch({ type: "clear" })}
            disabled={empty}
            aria-label="Clear the page"
          >
            <TrashIcon />
          </button>
          <span className={styles.sep} aria-hidden />
          <button
            className={styles.tool}
            onClick={turnPage}
            aria-label={
              empty ? "Turn the page" : "New page, turned the other way"
            }
          >
            <RotateIcon />
          </button>
          <button
            className={styles.tool}
            onClick={newPage}
            disabled={empty}
            aria-label="New page"
          >
            <NewPageIcon />
          </button>
        </div>

        <div className={styles.tray} role="radiogroup" aria-label="Paint">
          <div className={styles.pots}>
            {PAINTS.map((p) => (
              <button
                key={p.hex}
                role="radio"
                aria-checked={!erasing && color === p.hex}
                aria-label={p.name}
                className={`${styles.pot} ${LIGHT_PAINTS.has(p.hex) ? styles.potLight : ""} ${!erasing && color === p.hex ? styles.potOn : ""}`}
                style={{ background: p.hex }}
                onClick={() => pickPaint(p.hex)}
              />
            ))}
          </div>
        </div>
      </div>

      {(notice || lib.storageFull) && (
        <p className={styles.notice} role="status">
          {notice ??
            "This browser is out of room for drawings. Take a few old ones down from the wall."}
        </p>
      )}

      {showWall && (
        <Wall
          drawings={lib.drawings}
          currentId={current?.id ?? null}
          onClose={() => setShowWall(false)}
          onOpen={openFromWall}
          onOrder={ORDERS_ENABLED ? orderFromWall : undefined}
          onRename={lib.rename}
          onRemove={removeFromWall}
        />
      )}

      {ORDERS_ENABLED && ordering && (
        <OrderSheet
          drawing={ordering}
          gatePassed={gatePassed}
          onGatePassed={() => setGatePassed(true)}
          onClose={() => setOrdering(null)}
        />
      )}

      {removed && (
        <div className={styles.toast} role="status" style={{ zIndex: 70 }}>
          {removed.drawing.name} taken down
          <button onClick={undoRemove}>Put it back</button>
        </div>
      )}
    </div>
  );
}
