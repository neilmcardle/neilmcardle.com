"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Zoom from "../_signature/Zoom";
import card from "../_signature/case.module.css";
import shell from "../_signature/signature.module.css";
import { PROJECTS } from "./projects";
import type { Chapter } from "./Story";
import story from "./story.module.css";
import styles from "./project.module.css";

function Fit({ base, children }: { base: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  useEffect(() => {
    const node = outer.current;
    if (!node) return;
    const measure = () => setZoom(Math.min(1, node.clientWidth / base));
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(node);
    return () => watch.disconnect();
  }, [base]);
  return (
    <div ref={outer} className={styles.fit}>
      <div style={{ width: zoom < 1 ? base : "100%", zoom }}>{children}</div>
    </div>
  );
}

function useAutoplay(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const films = Array.from(node.querySelectorAll("video"));
    for (const film of films) {
      film.muted = true;
      film.loop = true;
      film.playsInline = true;
      film.preload = "metadata";
    }
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const film = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) film.play().catch(() => {});
          else film.pause();
        }
      },
      { threshold: 0.5 },
    );
    for (const film of films) watch.observe(film);
    return () => watch.disconnect();
  }, [root]);
}

function Visual({ chapter, base }: { chapter: Chapter; base: number }) {
  if (!chapter.visual) return null;
  return (
    <Fit base={base}>
      <div className={`${card.card} ${story.visual}`}>{chapter.visual}</div>
    </Fit>
  );
}

function Note({ chapter }: { chapter: Chapter }) {
  if (chapter.prompt)
    return (
      <div className={styles.note}>
        <p className={styles.noteHead}>
          <span>Prompt</span>
          {chapter.prompt.date ? <span>{chapter.prompt.date}</span> : null}
        </p>
        <p className={styles.bubble}>{chapter.prompt.text}</p>
        {chapter.prompt.reply ? (
          <p className={styles.reply}>{chapter.prompt.reply}</p>
        ) : null}
      </div>
    );
  if (chapter.instead)
    return (
      <div className={styles.note}>
        <p className={styles.noteHead}>
          <span>What I tried instead</span>
        </p>
        <p className={styles.bubble}>Instead of {chapter.instead}</p>
      </div>
    );
  return null;
}

const name = (chapter: Chapter) => chapter.title ?? chapter.label;

export function ProjectPanel({ id }: { id: string }) {
  const project = PROJECTS[id];
  const root = useRef<HTMLDivElement>(null);
  useAutoplay(root);
  if (!project) return null;
  return (
    <div ref={root} className={styles.panel}>
      <p className={styles.panelLead}>{project.overview}</p>
      <p className={styles.meta}>{project.when}</p>
      {project.chapters.map((chapter) => (
        <section key={chapter.label} className={styles.panelChapter}>
          <p className={styles.kicker}>{chapter.label}</p>
          {chapter.title ? (
            <h3 className={styles.panelTitle}>{chapter.title}</h3>
          ) : null}
          <p className={styles.panelBody}>{chapter.body}</p>
          <Visual chapter={chapter} base={720} />
        </section>
      ))}
    </div>
  );
}

export function ProjectFull({
  id,
  onShrink,
  onClose,
}: {
  id: string;
  onShrink: () => void;
  onClose: () => void;
}) {
  const project = PROJECTS[id];
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const shrink = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<null | "shrink" | "close">(null);
  useAutoplay(root);

  useEffect(() => {
    const html = document.documentElement;
    const before = html.style.overflow;
    html.style.overflow = "hidden";
    html.dataset.projectFull = "";
    shrink.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = before;
      delete html.dataset.projectFull;
    };
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const sections = Array.from(
      node.querySelectorAll<HTMLElement>("[data-chapter]"),
    );
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting)
            setActive(Number((entry.target as HTMLElement).dataset.chapter));
      },
      { root: node, rootMargin: "-35% 0px -55% 0px" },
    );
    for (const section of sections) watch.observe(section);
    return () => watch.disconnect();
  }, [id]);

  const leave = (how: "shrink" | "close") => {
    if (leaving) return;
    setLeaving(how);
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => (how === "shrink" ? onShrink() : onClose()),
      calm ? 0 : 160,
    );
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (
        document.querySelector(
          '[role="dialog"][aria-modal="true"]:not([data-project])',
        )
      )
        return;
      leave("shrink");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!project) return null;
  const shown = hover ?? active;
  const jump = (index: number) =>
    scroller.current
      ?.querySelector(`[data-chapter="${index}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return createPortal(
    <div
      ref={root}
      data-project=""
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className={`${shell.root} ${styles.full} ${leaving ? styles.leaving : ""}`}
    >
      <header className={styles.bar}>
        <button
          type="button"
          className={styles.icon}
          onClick={() => leave("shrink")}
          aria-label="Back to the card"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M10 3L5 8l5 5" />
          </svg>
        </button>
        <h1 className={styles.barTitle}>{project.title}</h1>
        <button
          ref={shrink}
          type="button"
          className={styles.icon}
          onClick={() => leave("shrink")}
          aria-label="Shrink to the card"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2.5 13.5L7 9M7 9H3.5M7 9v3.5M13.5 2.5L9 7M9 7h3.5M9 7V3.5" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.icon}
          onClick={() => leave("close")}
          aria-label="Close"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
          </svg>
        </button>
      </header>

      <div ref={scroller} className={styles.scroll}>
        <div className={styles.grid}>
          <nav className={styles.index} aria-label="Chapters">
            <ol>
              {project.chapters.map((chapter, index) => (
                <li key={chapter.label}>
                  <button
                    type="button"
                    aria-current={index === active ? "true" : undefined}
                    className={index === active ? styles.on : undefined}
                    onClick={() => jump(index)}
                  >
                    {name(chapter)}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <main className={styles.main}>
            <p className={styles.lead}>{project.overview}</p>
            <p className={styles.meta}>{project.when}</p>
            {project.chapters.map((chapter, index) => (
              <section
                key={chapter.label}
                data-chapter={index}
                className={styles.chapter}
                onPointerEnter={() => setHover(index)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
              >
                <p className={styles.kicker}>{chapter.label}</p>
                {chapter.title ? (
                  <h2 className={styles.title}>{chapter.title}</h2>
                ) : null}
                <p className={styles.body}>{chapter.body}</p>
                <Visual chapter={chapter} base={960} />
              </section>
            ))}
            <a href={project.href} className={styles.page}>
              Open as a page
            </a>
          </main>

          <aside className={styles.notes} aria-live="polite">
            {project.chapters[shown] ? (
              <Note key={shown} chapter={project.chapters[shown]} />
            ) : null}
          </aside>
        </div>
      </div>
      <Zoom within="[data-project]" />
    </div>,
    document.body,
  );
}
