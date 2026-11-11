import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Shell from "../_signature/Shell";
import Header from "../_signature/Header";
import Finale from "../_signature/Finale";
import { share } from "../shared-metadata";
import { SECTIONS } from "./everything";
import styles from "./everything.module.css";

const description = "Everything else I have designed and built, with links.";

export const metadata: Metadata = {
  title: "Everything else · Neil McArdle",
  description,
  ...share({
    title: "Everything else · Neil McArdle",
    description,
    path: "/work",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function WorkPage() {
  return (
    <Shell>
      <Header />
      <main id="main" className={styles.page}>
        <h1 className={styles.title}>Everything else</h1>
        <p className={styles.intro}>
          My main work is on the <Link href="/">homepage</Link>. This is the
          rest of what I have designed and built.
        </p>
        {SECTIONS.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={styles.label}>{section.title}</h2>
            <ul className={styles.list}>
              {section.entries.map((entry) => (
                <li key={entry.name} className={styles.entry}>
                  {entry.href ? (
                    <Link className={styles.name} href={entry.href}>
                      {entry.name}
                    </Link>
                  ) : (
                    <span className={styles.name}>{entry.name}</span>
                  )}
                  <span className={styles.line}>{entry.line}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
      <Finale copyEmail />
    </Shell>
  );
}
