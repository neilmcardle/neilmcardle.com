import Link from "next/link";
import HeroField from "./HeroField";
import styles from "./studio.module.css";

type Entry = {
  title: string;
  note: string;
  go: string;
  href?: string;
};

const SERIES: Entry[] = [
  {
    title: "The Lab",
    note: "Seven rules, drawn in your browser from a seed number. Reroll until one stops you.",
    href: "/studio/lab",
    go: "Draw a poster",
  },
  {
    title: "Prints",
    note: "Print shop orders will be available soon.",
    go: "Coming soon\u2026",
  },
  {
    title: "Series 01",
    note: "Thirty-four works in two volumes, graphical for print and in motion.",
    href: "/studio/series-01",
    go: "Read the series",
  },
];

export default function StudioHome() {
  return (
    <>
      <section className={`${styles.intro} ${styles.introHome} ${styles.lock}`}>
        <HeroField className={styles.field} />
        <h1 className={styles.title}>
          <span>Rules,</span> <span>then</span> <span>outcomes</span>
        </h1>
      </section>

      <ul className={styles.list}>
        {SERIES.map((item) => {
          const body = (
            <>
              <h2 className={styles.cardTitle}>{item.title}</h2>
              <p className={styles.cardNote}>{item.note}</p>
              <span className={styles.cardGo}>{item.go}</span>
            </>
          );

          return (
            <li key={item.title} className={styles.listItem}>
              {item.href ? (
                <Link href={item.href} className={styles.card}>
                  {body}
                </Link>
              ) : (
                <div className={`${styles.card} ${styles.cardSoon}`}>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className={styles.foot}>
        <Link href="/">neilmcardle.com</Link>
      </footer>
    </>
  );
}
