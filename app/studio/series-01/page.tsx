import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WORKS, type Work } from "./works";
import styles from "./series.module.css";

export const metadata: Metadata = {
  title: "Series 01",
  description:
    "Thirty works in two volumes. Volume 01 is the graphic system and Volume 02 turns the same digital manipulations on landscapes.",
};

const BANDS: {
  id: string;
  label: string;
  vol: 1 | 2;
  kinds: Work["kind"][];
}[] = [
  { id: "posters", label: "Posters", vol: 1, kinds: ["poster"] },
  { id: "patterns", label: "Patterns", vol: 1, kinds: ["pattern"] },
  { id: "applied", label: "Applied", vol: 1, kinds: ["mockup"] },
  { id: "motion", label: "Motion", vol: 1, kinds: ["motion"] },
  { id: "two-posters", label: "Posters", vol: 2, kinds: ["poster"] },
  { id: "two-applied", label: "Applied", vol: 2, kinds: ["mockup"] },
  { id: "two-motion", label: "Motion", vol: 2, kinds: ["motion"] },
];

function Band({ id, label, vol, kinds }: (typeof BANDS)[number]) {
  const items = WORKS.filter((w) => w.vol === vol && kinds.includes(w.kind));
  if (!items.length) return null;
  const wide = kinds.includes("mockup");

  return (
    <section>
      <h3 className={styles.bandTitle} id={id}>
        {label}
      </h3>
      <div className={`${styles.grid} ${wide ? styles.gridWide : ""}`}>
        {items.map((work, i) => (
          <article key={work.n} className={styles.item}>
            {work.kind === "motion" && work.poster ? (
              <video
                className={styles.shot}
                width={work.w}
                height={work.h}
                poster={work.poster}
                aria-label={work.title}
                src={work.src}
                muted
                loop
                playsInline
                controls
                preload="none"
              />
            ) : (
              <Image
                className={styles.shot}
                src={work.src}
                alt={work.title}
                width={work.w}
                height={work.h}
                sizes={
                  wide
                    ? "(max-width: 860px) 100vw, 460px"
                    : "(max-width: 860px) 100vw, 300px"
                }
                priority={id === "posters" && i === 0}
              />
            )}
            <h4 className={styles.capTitle}>{work.title}</h4>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function SeriesPage() {
  return (
    <>
      <section className={styles.head}>
        <h1 className={styles.title}>Series 01</h1>
        <nav className={styles.jump} aria-label="Sections">
          <a className={styles.jumpLink} href="#volume-01">
            Volume 01
          </a>
          <a className={styles.jumpLink} href="#patterns">
            Patterns
          </a>
          <a className={styles.jumpLink} href="#applied">
            Applied
          </a>
          <a className={styles.jumpLink} href="#motion">
            Motion
          </a>
          <a className={styles.jumpLink} href="#volume-02">
            Volume 02
          </a>
        </nav>
      </section>

      <div className={styles.volHead} id="volume-01">
        <h2 className={styles.volTitle}>Volume 01</h2>
      </div>

      {BANDS.filter((b) => b.vol === 1).map((band) => (
        <Band key={band.id} {...band} />
      ))}

      <div className={styles.volHead} id="volume-02">
        <h2 className={styles.volTitle}>Volume 02</h2>
      </div>

      {BANDS.filter((b) => b.vol === 2).map((band) => (
        <Band key={band.id} {...band} />
      ))}

      <footer className={styles.foot}>
        <Link href="/studio">Signal &amp; Noise</Link>
      </footer>
    </>
  );
}
