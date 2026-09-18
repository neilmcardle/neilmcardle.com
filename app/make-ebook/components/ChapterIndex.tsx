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

function IndexList({
  chapters,
  selectedChapter,
  onSelect,
  progress,
  scrollable,
  className,
}: {
  chapters: IndexChapter[];
  selectedChapter: number;
  onSelect: (index: number) => void;
  progress: number;
  scrollable: boolean;
  className: string;
}) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!list || !active) return;
    const top = active.offsetTop - list.offsetTop;
    if (top < list.scrollTop) {
      list.scrollTop = top;
    } else if (top + active.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = top + active.offsetHeight - list.clientHeight;
    }
  }, [selectedChapter]);

  return (
    <ol ref={listRef} className={className}>
      {chapters.map((ch, i) => {
        const current = i === selectedChapter;
        const label = labelFor(chapters, i);
        return (
          <li key={ch.id}>
            <button
              type="button"
              className={`${styles.indexItem} ${current ? styles.indexItemCurrent : ""}`}
              aria-current={current ? "true" : undefined}
              title={label}
              onClick={() => onSelect(i)}
            >
              <span className={styles.indexLine} aria-hidden="true" />
              <span className={styles.indexLabel}>{label}</span>
              {current && scrollable && (
                <span className={styles.indexProgress} aria-hidden="true">
                  <span style={{ transform: `scaleX(${progress})` }} />
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
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
  if (chapters.length < 2) return null;

  return (
    <nav aria-label="Chapters" className={styles.chapterIndex}>
      <IndexList
        chapters={chapters}
        selectedChapter={selectedChapter}
        onSelect={(i) => onSelectChapter?.(i)}
        progress={progress}
        scrollable={scrollable}
        className={styles.indexList}
      />
    </nav>
  );
}
