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
};

export const PROJECTS: Project[] = [
  {
    title: "Avis checkout",
    href: "/work/avis",
    line: "Rebuilding how people book a rental car.",
    image: "/home/leads/avis.jpg",
    alt: "Avis checkout, five steps cut to three",
    film: "/work/avis/avis-3-step-c.mp4",
    proof: { value: "+5%", label: "conversion in testing" },
    wide: true,
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
    const img = card.current?.querySelector("img");
    if (!img) return;
    event.preventDefault();
    const r = img.getBoundingClientRect();
    const gutter =
      parseFloat(
        getComputedStyle(card.current?.closest("section") ?? document.body)
          .paddingLeft,
      ) || 16;
    let w = Math.min(window.innerWidth - gutter * 2, 1120 - gutter * 2);
    let h = (w * 9) / 16;
    if (h > window.innerHeight - 48) {
      h = window.innerHeight - 48;
      w = (h * 16) / 9;
    }
    const x = (window.innerWidth - w) / 2;
    const y = 24;
    const veil = document.createElement("div");
    veil.className = styles.veil;
    const flyer = img.cloneNode() as HTMLImageElement;
    flyer.className = styles.flyer;
    flyer.removeAttribute("loading");
    Object.assign(flyer.style, {
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
    });
    document.body.append(veil, flyer);
    veil.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 240,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "forwards",
    });
    flyer
      .animate(
        [
          {
            transform: `translate(${r.left - x}px, ${r.top - y}px) scale(${r.width / w}, ${r.height / h})`,
          },
          { transform: "none" },
        ],
        { duration: 320, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" },
      )
      .finished.then(() => {
        router.push(href);
        window.setTimeout(() => {
          veil.remove();
          flyer.remove();
        }, 600);
      });
  };

  return (
    <div
      ref={card}
      className={`${styles.card} ${project.wide ? styles.wide : ""}`}
      onPointerEnter={play}
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
