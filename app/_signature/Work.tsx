"use client";

import type React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { media } from "@/lib/media";
import shell from "./signature.module.css";
import styles from "./work.module.css";

export type Project = {
  title: string;
  href: string;
  line: string;
  image: string;
  alt: string;
  film?: string;
  proof?: { value: string; label: string };
  wide?: boolean;
  product?: { label: string; href: string };
  hero?: string;
  darkCue?: boolean;
};

export const PROJECTS: Project[] = [
  {
    title: "Avis checkout",
    href: "/work/avis",
    line: "Rebuilding how people book a rental car.",
    image: "/home/leads/avis-card.jpg",
    alt: "Avis checkout, five steps cut to three",
    film: "/work/avis/avis-3-step-c.mp4",
    proof: { value: "+5%", label: "conversion in testing" },
    wide: true,
    hero: "/work/avis/hero-cover.jpg",
    darkCue: true,
  },
  {
    title: "makeebook",
    href: "/work/makeebook",
    line: "A peaceful place for authors to write.",
    image: "/home/leads/makeebook.jpg",
    alt: "makeebook on a Kindle",
    film: "/home/makeebook-promo.mp4",
    product: { label: "makeebook.ink", href: "https://makeebook.ink" },
  },
  {
    title: "coverly",
    href: "/work/coverly",
    line: "Inspiration for your next book cover.",
    image: "/home/leads/coverly.jpg",
    alt: "coverly, a search of book covers",
    film: "/home/coverly-promo.mp4",
    product: { label: "coverly", href: "/coverly" },
  },
  {
    title: "DoodleWire",
    href: "/work/doodlewire",
    line: "Wireframe from your phone.",
    image: "/home/leads/doodlewire.jpg",
    alt: "DoodleWire wireframes on iPhone",
    product: {
      label: "App Store",
      href: "https://apps.apple.com/us/app/doodlewire/id6771274835",
    },
    hero: "/work/doodlewire/hero.jpg",
    wide: true,
  },
];

function Card({
  project,
  first,
  base,
}: {
  project: Project;
  first: boolean;
  base: string;
}) {
  const href = `${base}${project.href}`;
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const warmed = useRef(false);

  const play = () => {
    const v = video.current;
    if (!v || !project.film) return;
    if (
      !window.matchMedia(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    if (!v.src) v.src = media(project.film);
    v.play().catch(() => {});
  };

  const stop = () => {
    const v = video.current;
    if (!v) return;
    v.classList.remove(styles.on);
    v.pause();
  };

  const warm = () => {
    router.prefetch(href);
    if (project.hero && !warmed.current) {
      warmed.current = true;
      const img = new window.Image();
      img.src = project.hero;
    }
  };

  const fly = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      event.detail === 0 ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const frame = card.current?.querySelector<HTMLElement>(`.${styles.media}`);
    const still = frame?.querySelector("img");
    if (!frame || !still) return;
    event.preventDefault();
    const from = frame.getBoundingClientRect();
    const top = document.querySelector("header")?.offsetHeight ?? 0;
    const to = {
      left: 0,
      top,
      width: document.documentElement.clientWidth,
      height: Math.min(window.innerWidth * 0.5625, window.innerHeight - 64),
    };
    const box = (r: {
      left: number;
      top: number;
      width: number;
      height: number;
    }) => ({
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    const veil = document.createElement("div");
    veil.className = styles.veil;
    const flyer = document.createElement("div");
    flyer.className = styles.flyer;
    Object.assign(flyer.style, box(from));
    const v = video.current;
    let first: HTMLElement = still.cloneNode() as HTMLImageElement;
    if (v?.classList.contains(styles.on) && v.videoWidth) {
      const c = document.createElement("canvas");
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      c.getContext("2d")?.drawImage(v, 0, 0);
      first = c;
    }
    first.removeAttribute("loading");
    first.removeAttribute("style");
    flyer.append(first);
    let next: HTMLImageElement | null = null;
    if (project.hero) {
      next = document.createElement("img");
      next.src = project.hero;
      next.alt = "";
      next.style.opacity = "0";
      flyer.append(next);
    }
    document.body.append(veil, flyer);
    const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
    veil.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: "linear",
      fill: "forwards",
    });
    const flight = flyer.animate([box(from), box(to)], {
      duration: 460,
      easing: ease,
      fill: "forwards",
    });
    next?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      delay: 60,
      easing: "linear",
      fill: "forwards",
    });
    router.push(href);
    const landed = () =>
      new Promise<void>((resolve) => {
        const begun = performance.now();
        const check = () => {
          const hero =
            location.pathname === href &&
            document.querySelector("main section, section");
          const img = hero ? hero.querySelector("img") : null;
          if (
            (hero && (!img || img.complete)) ||
            performance.now() - begun > 2000
          )
            resolve();
          else requestAnimationFrame(check);
        };
        check();
      });
    Promise.all([flight.finished, landed()]).then(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
      const out = {
        duration: 220,
        easing: "linear",
        fill: "forwards" as const,
      };
      veil.animate([{ opacity: 1 }, { opacity: 0 }], out);
      flyer.animate([{ opacity: 1 }, { opacity: 0 }], out).finished.then(() => {
        veil.remove();
        flyer.remove();
      });
    });
  };

  return (
    <div
      ref={card}
      className={`${styles.card} ${project.wide ? styles.wide : ""}`}
      onPointerEnter={() => {
        warm();
        play();
      }}
      onPointerLeave={stop}
    >
      <div className={styles.frame}>
        <div className={styles.media}>
          <Image
            src={project.image}
            alt={project.alt}
            fill
            sizes={
              project.wide
                ? "(max-width: 720px) 100vw, 1072px"
                : "(max-width: 720px) 100vw, 530px"
            }
            priority={first}
          />
          {project.film ? (
            <video
              ref={video}
              muted
              loop
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload="none"
              aria-hidden="true"
              onPlaying={(e) => {
                const v = e.currentTarget;
                if (card.current?.matches(":hover")) v.classList.add(styles.on);
                else v.pause();
              }}
            />
          ) : null}
          <span
            className={`${styles.cue} ${project.darkCue ? styles.dark : ""}`}
            aria-hidden="true"
          >
            View case study
          </span>
        </div>
      </div>
      <div className={styles.caption}>
        <div>
          <h3>
            <a className={styles.open} href={href} onClick={fly}>
              {project.title}
            </a>
          </h3>
          <p>{project.line}</p>
        </div>
        {project.product ? (
          <a
            className={styles.product}
            href={project.product.href}
            {...(project.product.href.startsWith("http")
              ? { rel: "noopener" }
              : {})}
          >
            {project.product.label}
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
            </svg>
          </a>
        ) : project.proof ? (
          <div className={styles.proof}>
            <b>{project.proof.value}</b>
            <span>{project.proof.label}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Work({ base = "" }: { base?: string }) {
  return (
    <section className={shell.wrap}>
      <h2 className={shell.label} id="work">
        Work
      </h2>
      <div className={styles.work}>
        {PROJECTS.map((project, i) => (
          <Card
            key={project.href}
            project={project}
            first={i === 0}
            base={base}
          />
        ))}
      </div>
    </section>
  );
}
