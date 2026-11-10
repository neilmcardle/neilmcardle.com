"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/studio.module.css";

interface IndexChapter {
  id: string;
  title: string;
  type?: "frontmatter" | "content" | "backmatter";
}

interface ChapterIndexProps {
  chapters: IndexChapter[];
  selectedChapter: number;
  onSelectChapter?: (index: number) => void;
}

function labelFor(chapters: IndexChapter[], index: number) {
  const title = chapters[index]?.title?.trim();
  if (title) return title;
  const kind = chapters[index]?.type;
  if (kind === "frontmatter") return "Front matter";
  if (kind === "backmatter") return "Back matter";
  const n = chapters
    .slice(0, index + 1)
    .filter((c) => !c.type || c.type === "content").length;
  return `Chapter ${n}`;
}

function useEditorProgress(selectedChapter: number, count: number) {
  const [progress, setProgress] = useState(0);
  const [scrollable, setScrollable] = useState(false);

  useEffect(() => {
    setProgress(0);
    const el = [
      ...document.querySelectorAll<HTMLElement>(
        ".editor-root[contenteditable]",
      ),
    ].find((node) => node.offsetParent !== null);
    if (!el) return;
    const read = () => {
      const range = el.scrollHeight - el.clientHeight;
      setScrollable(range > 8);
      setProgress(
        range > 8 ? Math.min(1, Math.max(0, el.scrollTop / range)) : 0,
      );
    };
    read();
    el.addEventListener("scroll", read, { passive: true });
    el.addEventListener("input", read);
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", read);
      el.removeEventListener("input", read);
      observer.disconnect();
    };
  }, [selectedChapter, count]);

  return { progress, scrollable };
}

export function ChapterIndex({
  chapters,
  selectedChapter,
  onSelectChapter,
}: ChapterIndexProps) {
  const { progress, scrollable } = useEditorProgress(
    selectedChapter,
    chapters.length,
  );
  const listRef = useRef<HTMLOListElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !item) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const top = item.offsetTop - list.clientHeight / 2 + item.offsetHeight / 2;
    list.scrollTo({
      top: Math.max(0, top),
      behavior: mountedRef.current && !reduce ? "smooth" : "auto",
    });
    mountedRef.current = true;
  }, [selectedChapter, chapters.length]);

  if (chapters.length < 2) return null;

  const step = (delta: number) => {
    const next = Math.max(
      0,
      Math.min(chapters.length - 1, selectedChapter + delta),
    );
    if (next !== selectedChapter) onSelectChapter?.(next);
  };

  return (
    <nav
      aria-label="Chapters"
      className={styles.chapterIndex}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          step(1);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          step(-1);
        }
      }}
    >
      <ol ref={listRef} className={styles.indexList}>
        {chapters.map((ch, i) => {
          const current = i === selectedChapter;
          const label = labelFor(chapters, i);
          return (
            <li key={ch.id}>
              <button
                type="button"
                className={`${styles.indexItem} ${current ? styles.indexItemCurrent : ""}`}
                aria-current={current ? "true" : undefined}
                tabIndex={current ? 0 : -1}
                onClick={() => onSelectChapter?.(i)}
              >
                <span className={styles.indexLabel}>{label}</span>
                {current && scrollable ? (
                  <span className={styles.indexProgress} aria-hidden="true">
                    <span style={{ transform: `scaleX(${progress})` }} />
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
