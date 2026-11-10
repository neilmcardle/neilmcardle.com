import type { Metadata } from "next";
import { share } from "@/app/shared-metadata";
import Shell from "@/app/_signature/Shell";
import Header from "@/app/_signature/Header";
import Finale from "@/app/_signature/Finale";
import kit from "./kit.module.css";
import styles from "./readably.module.css";

const TITLE = "Readably – accessible ebooks for Christian publishers";
const DESCRIPTION =
  "I fix backlist ePubs so they meet the European Accessibility Act. Free check on one title, report within five working days.";
const MAIL = "mailto:neil@neilmcardle.com?subject=Free%20accessibility%20check";

const QUOTE: { text: string; cite: string } | null = null;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  ...share({ title: TITLE, description: DESCRIPTION, path: "/readably" }),
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

const CHECKS = [
  "The file is valid and opens correctly in every store",
  "Every picture has a description for screen-reader users",
  "Headings and contents let readers jump between chapters",
  "Text is read aloud in the right order",
  "Footnotes open and return to the right place",
  "Greek and Hebrew are marked so they’re pronounced correctly",
  "Page numbers match the print edition",
  "Accessibility metadata is present, so stores can show the book is accessible",
];

const PRICES = [
  {
    level: "Light",
    included:
      "Valid EPUB 3, accessibility metadata, headings, contents, language, up to 5 image descriptions",
    price: "£150",
  },
  {
    level: "Standard",
    included:
      "Everything in Light, plus up to 25 image descriptions, footnotes, tables and page numbers",
    price: "£250",
  },
  {
    level: "Complex",
    included:
      "Heavily illustrated books, Greek or Hebrew, scanned or fixed-layout books",
    price: "Quoted, from £400",
  },
];

const QUESTIONS = [
  {
    q: "Does this apply to us?",
    a: "If you sell ebooks to readers in the EU, through any store, and you have 10 or more staff or turnover over €2m, yes. If you’re unsure, send me a title and I’ll tell you where you stand.",
  },
  {
    q: "Do you need our original files?",
    a: "No. I work from the ePub you already sell. For heavily illustrated or complex books, InDesign files help.",
  },
  {
    q: "Will the book look different?",
    a: "No. Almost all the changes are behind the scenes. Readers see the same book. Screen readers, reading apps and stores see a much better one.",
  },
  {
    q: "Can you do our whole backlist?",
    a: "Yes, in monthly batches. Send me a list of your ebook ISBNs and I’ll sort them into fix levels for free.",
  },
];

export default function ReadablyPage() {
  return (
    <Shell>
      <div className={kit.bar}>
        <Header back="/" backLabel="Home" />
      </div>
      <main id="main" className={`${kit.root} ${kit.scope} ${kit.wrap}`}>
        <article className={styles.article}>
          <header className={styles.head}>
            <h1 className={kit.title}>
              Accessible ebooks for Christian publishers
            </h1>
            <p className={styles.intro}>
              <span className={styles.subject}>
                I fix backlist ePubs so they meet the European Accessibility
                Act.
              </span>{" "}
              Image descriptions, reading order, navigation and accessibility
              metadata. The book looks the same, and now it works for every
              reader.
            </p>
            <a className={styles.button} href={MAIL}>
              Email me for a free check
            </a>
          </header>

          <section>
            <h2 id="why-now" className={styles.h2}>
              Why now
            </h2>
            <p className={styles.p}>
              Since 28 June 2025, ebooks sold into the EU have to meet the
              European Accessibility Act. UK and US publishers are covered too
              for every ebook they sell into the EU, unless they have fewer than
              10 staff and turnover under €2m.
            </p>
            <p className={styles.p}>
              Most ebooks made before then fall short in the same places:
              pictures with no descriptions, text read aloud in the wrong order,
              and missing accessibility metadata, which is the information
              stores use to tell buyers a book is accessible.
            </p>
          </section>

          <section>
            <h2 id="done-before" className={styles.h2}>
              I’ve done this 200 times
            </h2>
            <p className={styles.p}>
              I made more than 200 accessible ePub3 books for The Banner of
              Truth. I took printed books from scan to finished ebook: cleaning
              the text, writing image descriptions, adding accessibility
              metadata and checking every file with EPUBCheck.
            </p>
            {QUOTE ? (
              <figure className={styles.quote}>
                <blockquote>
                  <p>{QUOTE.text}</p>
                </blockquote>
                <figcaption>{QUOTE.cite}</figcaption>
              </figure>
            ) : null}
          </section>

          <section>
            <h2 id="free-check" className={styles.h2}>
              How the free check works
            </h2>
            <ol className={`${styles.list} ${styles.numbered}`}>
              <li>
                Email me one of your ebooks, or tell me which title to buy.
              </li>
              <li>
                I test it against the accessibility requirements, by machine and
                by hand with a screen reader.
              </li>
              <li>
                Within five working days you get a one-page report: what passes,
                what fails, and what it would take to fix.
              </li>
            </ol>
            <p className={styles.p}>No cost and no obligation.</p>
          </section>

          <section>
            <h2 id="what-i-check" className={styles.h2}>
              What I check
            </h2>
            <ul className={`${styles.list} ${styles.bulleted}`}>
              {CHECKS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 id="prices" className={styles.h2}>
              Prices
            </h2>
            <p className={styles.p}>
              Prices are per title. Every file comes back with a passing
              validation report.
            </p>
            <div
              className={`${styles.table} ${styles.prices}`}
              tabIndex={0}
              role="region"
              aria-labelledby="prices"
            >
              <table>
                <thead>
                  <tr>
                    <th scope="col">Fix level</th>
                    <th scope="col">What’s included</th>
                    <th scope="col">Price per title</th>
                  </tr>
                </thead>
                <tbody>
                  {PRICES.map((row) => (
                    <tr key={row.level}>
                      <th scope="row">{row.level}</th>
                      <td>{row.included}</td>
                      <td className={styles.price}>{row.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.p}>
              Backlist of 20 or more titles: 15% off. Turnaround is five working
              days per title, with backlists delivered in monthly batches.
            </p>
          </section>

          <section>
            <h2 id="questions" className={styles.h2}>
              Questions
            </h2>
            <div className={styles.questions}>
              {QUESTIONS.map(({ q, a }) => (
                <details key={q} className={styles.question}>
                  <summary>
                    <span>{q}</span>
                    <span className={styles.icon} aria-hidden="true" />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={styles.end}>
            <h2 id="start" className={styles.h2}>
              Start with one title
            </h2>
            <p className={styles.p}>
              Send me any ebook from your list and I’ll show you exactly where
              it stands.
            </p>
            <a className={styles.button} href={MAIL}>
              Email neil@neilmcardle.com
            </a>
          </section>
        </article>
      </main>
      <Finale signOff />
    </Shell>
  );
}
