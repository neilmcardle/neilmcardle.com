import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Fact, Frame } from "@/app/work/CaseStudy";
import Shell from "./Shell";
import Header from "./Header";
import Finale from "./Finale";
import shell from "./signature.module.css";
import styles from "./case.module.css";

export default function CaseLayout({
  hero,
  title,
  overview,
  facts,
  frames,
  home = "/",
  children,
}: {
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
      <Header home={home} />
      {hero}
      <section className={`${shell.wrap} ${styles.intro}`}>
        {title ? <h1 className={styles.title}>{title}</h1> : <span />}
        <div>
          <p className={styles.overview}>{overview}</p>
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
      <div className={`${shell.wrap} ${styles.frames}`}>
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
                    sizes="(max-width: 720px) 100vw, 530px"
                  />
                ))}
              </div>
            );
          if (frame.kind === "custom")
            return (
              <div key={frame.id} className={styles.plate}>
                {frame.node}
              </div>
            );
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
              sizes="(max-width: 1120px) 100vw, 1072px"
            />
          );
        })}
        {children}
        <Link className={styles.back} href={`${home.replace(/\/$/, "")}/work`}>
          All work
        </Link>
      </div>
      <Finale />
    </Shell>
  );
}
