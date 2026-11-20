import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { STORIES, WRITING } from "../_home/data";
import { CV_PDF, EDUCATION, EXPERIENCE, PROJECTS } from "../_home/experience";
import { share } from "../shared-metadata";
import styles from "./cv.module.css";

const description =
  "Neil McArdle, senior product designer in London. Experience, work and writing.";

export const metadata: Metadata = {
  title: "CV · Neil McArdle",
  description,
  ...share({ title: "CV · Neil McArdle", description, path: "/cv" }),
};

export const viewport: Viewport = {
  themeColor: "#fafafa",
};

const email = ["neil", ["neilmcardle", "com"].join(".")].join("@");

const WRITES = [...WRITING, ...STORIES].map((p) => ({
  title: p.title,
  href: `https://neilmcardle.com${p.href}`,
  show: `neilmcardle.com${p.href}`,
}));

function Links({
  rows,
}: {
  rows: { title: string; href: string; show: string }[];
}) {
  return (
    <ul className={styles.list}>
      {rows.map((row) => (
        <li key={row.title} className={styles.pair}>
          <span className={styles.name}>{row.title}</span>
          <a href={row.href} className={styles.url}>
            {row.show}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function CvPage() {
  return (
    <div className={styles.page}>
      <main className={styles.sheet}>
        <header className={styles.head}>
          <span className={styles.who}>
            <svg
              viewBox="18 18 27 27"
              className={styles.mark}
              aria-hidden="true"
            >
              <path d="M45 45L32 31.2985V18H45V45Z" />
              <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
            </svg>
            Neil McArdle
          </span>
          <span className={styles.tools}>
            <Link href="/" className={styles.back}>
              neilmcardle.com
            </Link>
            <a href={CV_PDF} download className={styles.download}>
              Download PDF
            </a>
          </span>
        </header>

        <h1 className={styles.say}>
          I&rsquo;m Neil, a product designer and builder in London.{" "}
          <span className={styles.keep}>I design at Avis.</span>
        </h1>

        <p className={styles.contact}>
          <a href={`mailto:${email}`}>{email}</a>
          <a href="https://neilmcardle.com">neilmcardle.com</a>
          <a href="https://www.linkedin.com/in/neilmcardle/">
            linkedin.com/in/neilmcardle
          </a>
          <a href="https://github.com/neilmcardle">github.com/neilmcardle</a>
        </p>

        <section className={styles.section}>
          <h2 className={styles.label}>Projects</h2>
          <Links rows={PROJECTS} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.label}>Experience</h2>
          <ul className={styles.list}>
            {EXPERIENCE.map((role) => (
              <li key={role.id} className={styles.role}>
                <p className={styles.pair}>
                  <span className={styles.name}>{role.company}</span>
                  <span className={styles.when}>{role.when}</span>
                </p>
                <p className={styles.title}>{role.title}</p>
                <p className={styles.note}>{role.note}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.label}>Writing</h2>
          <Links rows={WRITES} />
        </section>

        <section className={styles.section}>
          <h2 className={styles.label}>Education</h2>
          <ul className={styles.list}>
            {EDUCATION.map((e) => (
              <li key={e.course} className={styles.role}>
                <p className={styles.pair}>
                  <span className={styles.name}>{e.course}</span>
                  <span className={styles.when}>{e.when}</span>
                </p>
                <p className={styles.title}>{e.school}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
