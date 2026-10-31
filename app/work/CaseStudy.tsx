import type { ReactNode } from "react";
import Image from "next/image";
import styles from "./case.module.css";
import NMark from "./NMark";
import CaseLayout from "../_signature/CaseLayout";

export type Frame =
  | { kind: "full"; src: string; alt: string }
  | { kind: "pair"; items: { src: string; alt: string }[] }
  | { kind: "film"; src: string; poster: string; label: string }
  | { kind: "custom"; id: string; node: ReactNode };

export type Fact = { label: string; value: ReactNode };

const SIZES = "(max-width: 1440px) 100vw, 1400px";

export default function CaseStudy({
  hero,
  title,
  overview,
  facts,
  frames,
  variant,
}: {
  hero: ReactNode;
  title?: string;
  overview: string;
  facts?: Fact[];
  frames: Frame[];
  variant?: "signature";
}) {
  if (variant === "signature")
    return (
      <CaseLayout
        hero={hero}
        title={title}
        overview={overview}
        facts={facts}
        frames={frames}
      />
    );
  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <NMark />
      </header>

      {hero}

      {title ? (
        <section className={styles.rows} aria-labelledby="case-title">
          <div className={`${styles.row} ${styles.lead}`}>
            <h1 id="case-title" className={styles.title}>
              {title}
            </h1>
            <p className={styles.text}>{overview}</p>
          </div>
          {facts ? (
            <dl className={styles.facts}>
              {facts.map((fact) => (
                <div key={fact.label} className={styles.row}>
                  <dt className={styles.label}>{fact.label}</dt>
                  <dd className={styles.fact}>{fact.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ) : (
        <section className={styles.overview}>
          <h2 className={styles.label}>Overview</h2>
          <p className={styles.text}>{overview}</p>
        </section>
      )}

      <div className={styles.frames}>
        {frames.map((frame) => {
          if (frame.kind === "pair")
            return (
              <div key={frame.items[0].src} className={styles.pair}>
                {frame.items.map((item) => (
                  <Image
                    key={item.src}
                    className={styles.frame}
                    src={item.src}
                    alt={item.alt}
                    width={1360}
                    height={1700}
                    sizes="(max-width: 1440px) 50vw, 680px"
                  />
                ))}
              </div>
            );
          if (frame.kind === "custom")
            return <div key={frame.id}>{frame.node}</div>;
          if (frame.kind === "film")
            return (
              <video
                key={frame.src}
                className={styles.frame}
                src={frame.src}
                poster={frame.poster}
                aria-label={frame.label}
                controls
                playsInline
                preload="none"
              />
            );
          return (
            <Image
              key={frame.src}
              className={styles.frame}
              src={frame.src}
              alt={frame.alt}
              width={2400}
              height={1350}
              sizes={SIZES}
            />
          );
        })}
      </div>
    </div>
  );
}
