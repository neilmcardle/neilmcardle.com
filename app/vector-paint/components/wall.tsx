"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { pageSize, PAPER, type Drawing } from "@/lib/vector-paint/drawing";
import { Strokes } from "./easel";
import { CloseIcon, PencilIcon, TrashIcon } from "./icons";
import styles from "../vector-paint.module.css";

export function Thumb({
  drawing,
}: {
  drawing: Pick<Drawing, "orientation" | "strokes">;
}) {
  const page = pageSize(drawing.orientation);
  return (
    <svg viewBox={`0 0 ${page.w} ${page.h}`} aria-hidden>
      <rect width={page.w} height={page.h} fill={PAPER} />
      <Strokes strokes={drawing.strokes} />
    </svg>
  );
}

export function tiltFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const deg = ((Math.abs(h) % 60) / 10 - 3).toFixed(1);
  return `${Number(deg) === 0 ? 1.5 : deg}deg`;
}

interface WallProps {
  drawings: Drawing[];
  currentId: string | null;
  onClose: () => void;
  onOpen: (id: string) => void;
  onOrder?: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

export default function Wall({
  drawings,
  currentId,
  onClose,
  onOpen,
  onOrder,
  onRename,
  onRemove,
}: WallProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pinned = drawings
    .filter((d) => d.strokes.length > 0)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  const chosen = pinned.find((d) => d.id === selected) ?? null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (renaming) setRenaming(false);
      else if (selected) setSelected(null);
      else onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [renaming, selected, onClose]);

  useEffect(() => {
    if (renaming) inputRef.current?.select();
  }, [renaming]);

  const startRename = () => {
    if (!chosen) return;
    setDraftName(chosen.name);
    setRenaming(true);
  };

  const finishRename = () => {
    if (chosen) onRename(chosen.id, draftName);
    setRenaming(false);
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="vp-wall-title"
    >
      <div className={styles.overlayHead}>
        <h2
          id="vp-wall-title"
          className={`${styles.overlayTitle} ${styles.display}`}
        >
          My wall
        </h2>
        <button
          className={styles.close}
          onClick={onClose}
          aria-label="Back to drawing"
        >
          <CloseIcon />
        </button>
      </div>

      <div
        className={styles.wallScroll}
        onClick={() => !renaming && setSelected(null)}
      >
        {pinned.length === 0 ? (
          <div className={styles.emptyWall}>
            <h3 className={styles.display}>Nothing up yet.</h3>
            Every drawing you make is kept here, taped up
            {onOrder ? " and ready to print" : ""}.
            <button
              className={`${styles.pill} ${styles.big}`}
              onClick={onClose}
            >
              Start drawing
            </button>
          </div>
        ) : (
          <div className={styles.wallGrid}>
            {pinned.map((d, i) => (
              <button
                key={d.id}
                className={`${styles.pinned} ${d.orientation === "landscape" ? styles.pinnedLandscape : styles.pinnedPortrait} ${selected === d.id ? styles.pinnedOn : ""}`}
                style={
                  {
                    ["--tilt" as string]: tiltFor(d.id),
                    ["--i" as string]: i,
                  } as CSSProperties
                }
                onClick={(e) => {
                  e.stopPropagation();
                  setRenaming(false);
                  setSelected(selected === d.id ? null : d.id);
                }}
                aria-pressed={selected === d.id}
                aria-label={d.name}
              >
                <span className={`${styles.tape} ${styles.tapeLeft}`} />
                <span className={`${styles.tape} ${styles.tapeRight}`} />
                <Thumb drawing={d} />
                <span className={styles.caption}>{d.name}</span>
                {d.id === currentId && (
                  <span className={styles.easelTag}>On the easel</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {chosen && (
        <div
          key={chosen.id}
          className={styles.actionBar}
          onClick={(e) => e.stopPropagation()}
        >
          {renaming ? (
            <form
              style={{ display: "flex", gap: 8, alignItems: "center" }}
              onSubmit={(e) => {
                e.preventDefault();
                finishRename();
              }}
            >
              <input
                ref={inputRef}
                className={styles.renameInput}
                value={draftName}
                maxLength={60}
                onChange={(e) => setDraftName(e.target.value)}
                aria-label="Drawing name"
              />
              <button type="submit" className={styles.pill}>
                Save name
              </button>
            </form>
          ) : (
            <>
              <button className={styles.pill} onClick={() => onOpen(chosen.id)}>
                Keep drawing
              </button>
              {onOrder && (
                <button
                  className={`${styles.pill} ${styles.primary}`}
                  onClick={() => onOrder(chosen.id)}
                >
                  Put it on canvas
                </button>
              )}
              <button
                className={styles.iconBtn}
                onClick={startRename}
                aria-label="Rename"
              >
                <PencilIcon />
              </button>
              <button
                className={styles.iconBtn}
                onClick={() => {
                  onRemove(chosen.id);
                  setSelected(null);
                }}
                aria-label="Take it down"
              >
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
