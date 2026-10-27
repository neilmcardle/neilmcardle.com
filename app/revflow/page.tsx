import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import NMark from "../work/NMark";
import RevflowMark from "./RevflowMark";
import {
  BOOK_CALL,
  DELIVERABLES,
  FOR_WHO,
  LEAD,
  PRICE,
  WEEKS,
} from "./content";
import styles from "./revflow.module.css";

export const metadata: Metadata = {
  title: "Revflow · Booking flows with fewer steps",
  description: LEAD,
  alternates: { canonical: "/revflow" },
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

export default function RevflowPage() {
  return (
    <div className={styles.page}>
      <style>{"html,body{background:#fafafa}"}</style>
      <header className={styles.bar}>
        <NMark />
      </header>

      <main className={styles.column}>
        <section className={styles.intro}>
          <p className={styles.brand}>
            <RevflowMark className={styles.mark} />
            Revflow
          </p>
          <h1 className={styles.title}>Booking flows with fewer steps.</h1>
          <p className={styles.lead}>{LEAD}</p>
          <div className={styles.actions}>
            <a className={styles.button} href={BOOK_CALL}>
              Book a 30-minute call
            </a>
            <a className={styles.quiet} href="/revflow/revflow-offer.pdf">
              One-page offer (PDF)
            </a>
          </div>
        </section>

        <section className={styles.proof} aria-labelledby="rf-proof">
          <Link href="/work/avis" className={styles.proofLink}>
            <Image
              className={styles.proofImage}
              src="/work/avis/three-steps-start.jpg"
              alt="The start of the redesigned car rental booking flow"
              width={1920}
              height={1080}
              sizes="(max-width: 699px) 100vw, 600px"
              priority
            />
          </Link>
          <div className={styles.proofText}>
            <h2 id="rf-proof" className={styles.h2}>
              Five steps to three
            </h2>
            <p className={styles.body}>
              I redesigned a major car rental booking flow, merging protections
              and add-ons into checkout. Conversion rose 5% in testing.
            </p>
            <Link href="/work/avis" className={styles.link}>
              Read the case study
            </Link>
          </div>
        </section>

        <section className={styles.block} aria-labelledby="rf-sprint">
          <h2 id="rf-sprint" className={styles.h2}>
            The sprint
          </h2>
          <ol className={styles.weeks}>
            {WEEKS.map((week) => (
              <li key={week.title} className={styles.week}>
                <span className={styles.when}>{week.when}</span>
                <span className={styles.weekBody}>
                  <span className={styles.weekTitle}>{week.title}</span>
                  <span className={styles.body}>{week.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block} aria-labelledby="rf-get">
          <h2 id="rf-get" className={styles.h2}>
            What you get
          </h2>
          <ul className={styles.list}>
            {DELIVERABLES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="rf-who">
          <h2 id="rf-who" className={styles.h2}>
            Who it’s for
          </h2>
          <p className={styles.body}>
            Airlines, hotels, tour operators and event ticketing. {FOR_WHO}
          </p>
        </section>

        <section className={styles.close}>
          <p className={styles.price}>{PRICE}</p>
          <a className={styles.button} href={BOOK_CALL}>
            Book a 30-minute call
          </a>
        </section>
      </main>

      <footer className={styles.foot}>
        <span>
          Revflow is run by{" "}
          <Link href="/" className={styles.link}>
            Neil McArdle
          </Link>
          , product designer.
        </span>
      </footer>
    </div>
  );
}
