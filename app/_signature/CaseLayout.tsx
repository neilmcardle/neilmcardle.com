import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Fact, Frame } from "@/app/work/CaseStudy";
import Shell from "./Shell";
import Header from "./Header";
import Finale from "./Finale";
import ScrollHint from "./ScrollHint";
import shell from "./signature.module.css";
import styles from "./case.module.css";

function Lead({ text }: { text: string }) {
  const match = text.match(/^(.+?[.!?])\s+(\S[\s\S]*)$/);
  if (!match) return <span className={styles.lead}>{text}</span>;
  return (
    <>
      <span className={styles.lead}>{match[1]}</span> {match[2]}
    </>
  );
}

export default function CaseLayout({
  hero,
  title,
  overview,
  facts,
  frames,
  home = "/",
  brief,
  children,
}: {
  brief?: ReactNode;
  hero: ReactNode;
  title?: string;
  overview: string;
  facts?: Fact[];
  frames: Frame[];
  home?: string;
  children?: ReactNode;
}) {
  return (
    <Shell>
      <div className={styles.bar}>
        <Header home={home} back={home === "/" ? "/#work" : `${home}#work`} />
      </div>
      <main id="main">
        {hero}
        <ScrollHint target="overview" />
        <section id="overview" className={`${shell.wrap} ${styles.intro}`}>
          {title ? <h1 className={styles.title}>{title}</h1> : <span />}
          <div>
            <p className={styles.overview}>
              <Lead text={overview} />
            </p>
            {facts ? (
              <dl className={styles.facts}>
                {facts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </section>
        {brief}
        <div className={`${shell.wrap} ${styles.frames}`}>
          {frames.map((frame) => {
            if (frame.kind === "pair")
              return (
                <div key={frame.items[0].src} className={styles.pair}>
                  {frame.items.map((item) => (
                    <div key={item.src} className={styles.card}>
                      <Image
                        className={styles.frame}
                        src={item.src}
                        alt={item.alt}
                        width={1360}
                        height={1700}
                        sizes="(max-width: 720px) 100vw, 530px"
                      />
                    </div>
                  ))}
                </div>
              );
            if (frame.kind === "custom")
              return (
                <div
                  key={frame.id}
                  className={`${styles.card} ${styles.plate}`}
                >
                  {frame.node}
                </div>
              );
            if (frame.kind === "film")
              return (
                <div key={frame.src} className={styles.card}>
                  <video
                    className={styles.frame}
                    src={frame.src}
                    poster={frame.poster}
                    aria-label={frame.label}
                    controls
                    playsInline
                    preload="none"
                  />
                </div>
              );
            return (
              <div key={frame.src} className={styles.card}>
                <Image
                  className={styles.frame}
                  src={frame.src}
                  alt={frame.alt}
                  width={2400}
                  height={1350}
                  sizes="(max-width: 1120px) 100vw, 1072px"
                />
              </div>
            );
          })}
          {children}
          <div className={styles.ending}>
            <Link
              className={styles.back}
              href={`${home.replace(/\/$/, "")}/work`}
            >
              All work
            </Link>
          </div>
        </div>
      </main>
      <Finale signOff />
    </Shell>
  );
}
