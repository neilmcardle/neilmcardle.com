"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { Mark } from "../_home/Chip";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { CASES } from "../work/cases";
import { APPS, PLAY, STORIES, WORK, WRITING, type Piece } from "../_home/data";
import { CV_PDF, EXPERIENCE } from "../_home/experience";
import PuiMark from "../_signature/PuiMark";
import styles from "./profile.module.css";

type Row = {
  id: string;
  title: string;
  line: string;
  kind: string;
  href?: string;
  icon: React.ReactNode;
  opens?: boolean;
};

const views = () => import("../work/ProjectViews");

const ProjectPanel = dynamic(() => views().then((m) => m.ProjectPanel), {
  ssr: false,
  loading: () => <div className={styles.waiting} />,
});

const ProjectFull = dynamic(() => views().then((m) => m.ProjectFull), {
  ssr: false,
});

const STUDIO_ROW: Row = {
  id: "studio",
  title: "The studio",
  line: "How this homepage was made.",
  kind: "",
  href: "/work/studio",
  icon: <Thumb src="/work/studio/project-panel.jpg" wide />,
  opens: true,
};

const TITLES: Record<string, string> = {
  ...Object.fromEntries([...WORK, ...APPS].map((p) => [p.id, p.title])),
  studio: STUDIO_ROW.title,
};

export function Thumb({ src, wide }: { src?: string; wide?: boolean }) {
  return (
    <span
      className={`${styles.tile} ${styles.thumb} ${wide ? styles.wide : ""}`}
    >
      {src ? (
        <Image
          src={src.endsWith(".svg") ? src.replace(/\.svg$/, "-thumb.jpg") : src}
          alt=""
          width={wide ? 192 : 64}
          height={wide ? 120 : 64}
          sizes={wide ? "96px" : "32px"}
        />
      ) : null}
    </span>
  );
}

export function Icon({ id }: { id: string }) {
  if (id === "performance-ui")
    return (
      <span className={`${styles.tile} ${styles.tileDark}`}>
        <PuiMark className={styles.pui} />
      </span>
    );
  if (id === "doodlewire")
    return (
      <span className={`${styles.tile} ${styles.tileDark}`}>
        <Image
          src="/logos/doodlewire-mark.png"
          alt=""
          width={96}
          height={96}
          className={styles.dw}
        />
      </span>
    );
  if (id === "banner")
    return <span className={`${styles.tile} ${styles.banner}`} />;
  if (id === "neil")
    return (
      <span className={`${styles.tile} ${styles.tileDark}`}>
        <svg viewBox="18 18 27 27" className={styles.n} aria-hidden="true">
          <path d="M45 45L32 31.2985V18H45V45Z" />
          <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
        </svg>
      </span>
    );
  return (
    <span className={styles.tile}>
      <span className={styles.scale}>
        <Mark id={id} />
      </span>
    </span>
  );
}

const WHITE: Record<string, string> = {
  mobbin: "/logos/mobbin-mark.svg",
  avis: "/logos/avis-mark-white.png",
  banner: "/logos/banner-of-truth-mark-white.svg",
};

function Logo({ id }: { id: string }) {
  if (WHITE[id])
    return (
      <span className={styles.logo}>
        <Image
          src={WHITE[id]}
          alt=""
          width={64}
          height={64}
          unoptimized
          className={styles[`logo_${id}`]}
        />
      </span>
    );
  return (
    <span className={styles.logo}>
      <svg viewBox="18 18 27 27" className={styles.n} aria-hidden="true">
        <path d="M45 45L32 31.2985V18H45V45Z" />
        <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
      </svg>
    </span>
  );
}

const fromPiece = (p: Piece, icon: React.ReactNode): Row => ({
  id: p.id,
  title: p.title,
  line: p.line ?? "",
  kind: p.kind ?? "",
  href: p.href,
  icon,
});

const SECTIONS: { title: string; rows: Row[]; more?: Row }[] = [
  {
    title: "Experience",
    rows: EXPERIENCE.map((r) => ({
      id: r.id,
      title: r.company,
      line: r.title,
      kind: r.when,
      href: r.href,
      icon: <Logo id={r.id} />,
      opens: r.href === `/work/${r.id}` && r.id in CASES,
    })),
  },
  {
    title: "Work",
    rows: [
      ...[...WORK, ...APPS]
        .filter((p) => p.id !== "tessera")
        .map((p): Row => ({
          ...fromPiece(p, <Thumb src={p.image} wide />),
          kind: "",
          opens: p.id in CASES,
        })),
      STUDIO_ROW,
    ],
  },
  {
    title: "Writing",
    rows: [...WRITING, ...STORIES].map((p) =>
      fromPiece(p, <Thumb src={p.image} />),
    ),
  },
  {
    title: "Playground",
    rows: PLAY.map((p) => fromPiece(p, <Thumb src={p.image} />)),
  },
];

function Line({ row, onOpen }: { row: Row; onOpen: (id: string) => void }) {
  const inner = (
    <>
      {row.icon}
      <span className={styles.text}>
        <span className={styles.name}>{row.title}</span>
        <span className={styles.line}>{row.line}</span>
      </span>
      <span className={styles.kind}>{row.kind}</span>
    </>
  );
  return row.href ? (
    <Link
      href={row.href}
      className={styles.row}
      onPointerEnter={row.opens ? () => void views() : undefined}
      onClick={
        row.opens
          ? (event) => {
              if (
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                event.button !== 0
              )
                return;
              event.preventDefault();
              onOpen(row.id);
            }
          : undefined
      }
    >
      {inner}
    </Link>
  ) : (
    <div className={styles.row}>{inner}</div>
  );
}

const EMAIL = ["neil", ["neilmcardle", "com"].join(".")].join("@");

export default function ProfileCard() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      ?.writeText(EMAIL)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };
  const [open, setOpen] = useState<string | null>(null);
  const [full, setFull] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const saved = useRef(0);
  const back = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const card = document.getElementById("profile");
    const scroller = body.current;
    if (!card || !scroller) return;
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey || scroller.contains(event.target as Node)) return;
      event.preventDefault();
      scroller.scrollBy({ top: event.deltaY, behavior: "instant" });
    };
    card.addEventListener("wheel", onWheel, { passive: false });
    return () => card.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onPop = (event: PopStateEvent) => {
      if (!event.state?.project) setFull(false);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const show = (id: string) => {
    saved.current = body.current?.scrollTop ?? 0;
    setOpen(id);
    requestAnimationFrame(() => {
      if (body.current) body.current.scrollTop = 0;
      back.current?.focus({ preventScroll: true });
    });
  };

  const hide = () => {
    setOpen(null);
    requestAnimationFrame(() => {
      if (body.current) body.current.scrollTop = saved.current;
    });
  };

  const expand = () => {
    if (!open) return;
    setFull(true);
    window.history.pushState(
      { ...window.history.state, project: open },
      "",
      `/work/${open}`,
    );
  };

  const shrink = () => {
    if (window.history.state?.project) window.history.back();
    setFull(false);
  };

  const close = () => {
    shrink();
    hide();
  };

  return (
    <aside id="profile" className={styles.card} aria-label="About Neil">
      {open ? (
        <div className={styles.head}>
          <button
            ref={back}
            type="button"
            className={styles.headButton}
            onClick={hide}
            aria-label="Back to my profile"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M10 3L5 8l5 5" />
            </svg>
          </button>
          <span className={styles.headTitle}>{TITLES[open]}</span>
          <button
            type="button"
            className={styles.headButton}
            onClick={expand}
            aria-label="Expand to full screen"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M9.5 2.5h4v4M13.5 2.5L9 7M6.5 13.5h-4v-4M2.5 13.5L7 9" />
            </svg>
          </button>
        </div>
      ) : (
        <div className={styles.head}>
          <span className={styles.who}>
            <Image
              src="/home/face-small.png"
              alt=""
              width={78}
              height={144}
              className={styles.face}
            />
            Neil McArdle
          </span>
        </div>
      )}

      <div ref={body} className={styles.body}>
        {open ? (
          <ProjectPanel key={open} id={open} />
        ) : (
          <>
            <p className={styles.say}>
              I&rsquo;m Neil, a product designer and builder in London.{" "}
              <span className={styles.keep}>I design at Avis.</span>
            </p>

            <div className={styles.actions}>
              <a href="#contact" className={styles.contact}>
                Tell me more
              </a>
              <a
                href="https://x.com/BetterNeil"
                className={styles.round}
                aria-label="X"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M17.75 3h3.07l-6.7 7.66L22 21h-6.18l-4.84-6.33L5.44 21H2.37l7.17-8.2L2 3h6.33l4.37 5.78L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z"
                  />
                </svg>
              </a>
              <a
                href="https://github.com/neilmcardle"
                className={styles.round}
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/neilmcardle/"
                className={styles.round}
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z"
                  />
                </svg>
              </a>
              <a
                href={`mailto:${EMAIL}`}
                className={styles.round}
                aria-label={`Email ${EMAIL}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  aria-hidden="true"
                >
                  <rect
                    x="3.5"
                    y="5.5"
                    width="17"
                    height="13"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M4.5 7l7.5 6 7.5-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <button
                type="button"
                className={`${styles.round} ${styles.joined}`}
                onClick={copy}
                aria-label={
                  copied ? "Email address copied" : "Copy my email address"
                }
              >
                {copied ? (
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="17"
                    height="17"
                    aria-hidden="true"
                  >
                    <rect
                      x="8.5"
                      y="8.5"
                      width="11"
                      height="11"
                      rx="2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                    <path
                      d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                )}
              </button>
              <span className={styles.copied} aria-live="polite">
                {copied ? "Copied" : ""}
              </span>
            </div>

            {SECTIONS.map((section) => (
              <section key={section.title} className={styles.section}>
                <div className={styles.labelRow}>
                  <h2 className={styles.label}>{section.title}</h2>
                  {section.title === "Experience" ? (
                    <a
                      href={CV_PDF}
                      download
                      className={styles.tool}
                      aria-label="Download my CV"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        width="16"
                        height="16"
                        aria-hidden="true"
                      >
                        <path
                          d="M8 2.5v7.5M4.75 6.75 8 10l3.25-3.25M3 13.5h10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  ) : null}
                </div>
                <ul className={styles.list}>
                  {section.rows.map((row) => (
                    <li key={row.id}>
                      <Line row={row} onOpen={show} />
                    </li>
                  ))}
                </ul>
                {section.title === "Playground" ? (
                  <Link href="/playground" className={styles.more}>
                    Everything in the playground
                  </Link>
                ) : null}
              </section>
            ))}
          </>
        )}
      </div>
      {open && full ? (
        <ProjectFull id={open} onShrink={shrink} onClose={close} />
      ) : null}
    </aside>
  );
}
