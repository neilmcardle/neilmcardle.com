import type { Metadata } from "next";
import RevflowMark from "../RevflowMark";
import { DELIVERABLES, EMAIL, FOR_WHO, LEAD, PRICE, WEEKS } from "../content";
import styles from "./offer.module.css";

export const metadata: Metadata = {
  title: "Revflow · One-page offer",
  robots: { index: false, follow: false },
};

export default function RevflowOffer() {
  return (
    <div className={styles.sheet}>
      <style>{"html,body{background:#ffffff}"}</style>
      <header className={styles.head}>
        <p className={styles.brand}>
          <RevflowMark className={styles.mark} />
          Revflow
        </p>
        <p className={styles.url}>neilmcardle.com/revflow</p>
      </header>

      <h1 className={styles.title}>Booking flows with fewer steps.</h1>
      <p className={styles.lead}>{LEAD}</p>

      <section className={styles.block}>
        <h2 className={styles.h2}>Proof</h2>
        <p className={styles.body}>
          I redesigned a major car rental booking flow from five steps to three,
          merging protections and add-ons into checkout. Conversion rose 5% in
          testing.
        </p>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2}>The sprint</h2>
        <ol className={styles.weeks}>
          {WEEKS.map((week) => (
            <li key={week.title}>
              <span className={styles.when}>{week.when}</span>
              <span>
                <strong className={styles.weekTitle}>{week.title}.</strong>{" "}
                <span className={styles.body}>{week.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2}>What you get</h2>
        <ul className={styles.list}>
          {DELIVERABLES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className={styles.block}>
        <h2 className={styles.h2}>Who it’s for</h2>
        <p className={styles.body}>
          Airlines, hotels, tour operators and event ticketing. {FOR_WHO}
        </p>
      </section>

      <footer className={styles.foot}>
        <p className={styles.price}>{PRICE}</p>
        <p className={styles.contact}>
          Neil McArdle, product designer · {EMAIL}
        </p>
      </footer>
    </div>
  );
}
