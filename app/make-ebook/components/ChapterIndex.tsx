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

function paintWheel(list: HTMLOListElement, row: number) {
  const offset = list.scrollTop / row;
  const items = list.querySelectorAll<HTMLElement>("[data-wheel-item]");
  items.forEach((item, i) => {
    const d = Math.min(Math.abs(i - offset), 5);
    item.style.transform = `scale(${1 - d * 0.085})`;
    item.style.opacity = String(Math.max(0.1, 1 - d * 0.26));
  });
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
  const selectedRef = useRef(selectedChapter);
  const targetRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const onSelectRef = useRef(onSelectChapter);

  useEffect(() => {
    selectedRef.current = selectedChapter;
    onSelectRef.current = onSelectChapter;
  });

  const rowHeight = () =>
    listRef.current?.querySelector<HTMLElement>("[data-wheel-item]")
      ?.offsetHeight || 30;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const row = rowHeight();
    const top = selectedChapter * row;
    if (Math.abs(list.scrollTop - top) < 1) {
      paintWheel(list, row);
      mountedRef.current = true;
      return;
    }
    targetRef.current = selectedChapter;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    list.scrollTo({
      top,
      behavior: mountedRef.current && !reduce ? "smooth" : "auto",
    });
    paintWheel(list, row);
    mountedRef.current = true;
  }, [selectedChapter, chapters.length]);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let frame = 0;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const row = rowHeight();
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paintWheel(list, row));
      clearTimeout(settle);
      settle = setTimeout(() => {
        const index = Math.max(
          0,
          Math.min(
            list.querySelectorAll("[data-wheel-item]").length - 1,
            Math.round(list.scrollTop / row),
          ),
        );
        if (targetRef.current !== null && targetRef.current === index) {
          targetRef.current = null;
          return;
        }
        targetRef.current = null;
        if (index !== selectedRef.current) onSelectRef.current?.(index);
      }, 160);
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      list.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(settle);
    };
  }, [chapters.length]);

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
      <span className={styles.wheelBand} aria-hidden="true">
        {scrollable && (
          <span className={styles.indexProgress}>
            <span style={{ transform: `scaleX(${progress})` }} />
          </span>
        )}
      </span>
      <ol ref={listRef} className={styles.indexList}>
        {chapters.map((ch, i) => {
          const current = i === selectedChapter;
          const label = labelFor(chapters, i);
          return (
            <li key={ch.id}>
              <button
                type="button"
                data-wheel-item
                className={`${styles.indexItem} ${current ? styles.indexItemCurrent : ""}`}
                aria-current={current ? "true" : undefined}
                tabIndex={current ? 0 : -1}
                onClick={() => onSelectChapter?.(i)}
              >
                <span className={styles.indexLabel}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
