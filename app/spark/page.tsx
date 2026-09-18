import type React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getCurriculum, loadModule } from "@/lib/spark/content";
import { PHASES } from "@/lib/spark/curriculum";
import {
  Caret,
  CheckDemo,
  LessonSteps,
  Mark,
  ReadAlong,
  StateDemo,
  Waitlist,
  type LessonSection,
} from "./landing-demos";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "Spark: your path to Design Engineer",
  description:
    "A course that teaches designers to write real software, one line at a time. Start from an empty file and finish with a full-stack app. No code needed to begin.",
};

const FIRST = "make-a-real-file-yours";

function firstParagraph(content: string) {
  const para =
    content
      .replace(/```[\s\S]*?```/g, "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !p.startsWith("<") && !p.startsWith("-")) ?? "";
  const plain = para.replace(/[_*]/g, "").replace(/\s+/g, " ");
  if (plain.length <= 230) return plain;
  const cut = plain.slice(0, 230);
  return `${cut.slice(0, cut.lastIndexOf(". ") + 1) || cut}`;
}

function FeatureCard({
  id,
  number,
  title,
  desc,
  flip = false,
  children,
}: {
  id: string;
  number: string;
  title: string;
  desc: string;
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className={`${styles.card} ${flip ? styles.cardFlip : ""}`}
    >
      <div className={styles.cardCopy}>
        <span className={styles.cardNo}>{number}</span>
        <h3 className={`${styles.cardTitle} ${styles.display}`}>{title}</h3>
        <p className={styles.cardDesc}>{desc}</p>
      </div>
      <div className={`${styles.stage} ${styles.cardStage}`}>{children}</div>
    </article>
  );
}

export default async function SparkPage() {
  const [modules, first] = await Promise.all([
    getCurriculum(),
    loadModule(FIRST),
  ]);

  const hours = Math.round(modules.reduce((t, m) => t + m.minutes, 0) / 60);
  const sections: LessonSection[] = first.sections
    .filter((s) => s.title !== "Checkpoint")
    .map((s) => ({ title: s.title, lede: firstParagraph(s.content) }))
    .filter((s) => s.lede);

  const phases = PHASES.map((phase, index) => ({
    phase,
    index,
    modules: modules.filter((m) => m.phase.id === phase.id),
  })).filter((g) => g.modules.length > 0);

  return (
    <div className={`${styles.page} spark-page`}>
      <section className={styles.intro} id="intro">
        <div className={styles.introGutter} aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <div className={styles.introMark}>
          <Mark className={styles.introGlyph} />
          <span className={styles.introWord}>
            spark
            <Caret />
          </span>
        </div>
        <a href="#hero" className={styles.chevron} aria-label="Scroll to Spark">
          <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M4 7l6 6 6-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </section>

      <header className={styles.nav}>
        <div className={`${styles.shell} ${styles.navInner}`}>
          <Link href="/spark" className={styles.brand}>
            <Mark />
            <span className={styles.wordmark}>spark</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary">
            <a href="#how">How it works</a>
            <a href="#curriculum">Curriculum</a>
            <Link
              href="/spark/lessons"
              className={`${styles.arcButton} ${styles.small}`}
            >
              Start reading
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section id="hero" className={`${styles.shell} ${styles.hero}`}>
          <h1 className={`${styles.heroTitle} ${styles.display}`}>
            Spark is your path to Design Engineer.
          </h1>
          <div className={styles.heroFoot}>
            <p className={styles.lede}>
              Most designers can prompt their way to an app. Few can start from
              an empty file and write one. Spark teaches you how, one line at a
              time.
            </p>
            <div className={styles.ctaCol}>
              <div className={styles.ctaRow}>
                <Link
                  href={`/spark/lessons/${FIRST}`}
                  className={styles.arcButton}
                >
                  Start module 1
                </Link>
                <a href="#curriculum" className={styles.textLink}>
                  See the curriculum
                </a>
              </div>
              <p className={styles.fine}>
                Free while it is being written. No code needed to begin.
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.stageBand}`}>
          <div className={`${styles.stage} ${styles.heroStage}`}>
            <ReadAlong />
          </div>
          <p className={styles.stageCaption}>
            The first file in module 1. Every line gets explained before you
            move on.
          </p>
        </section>

        <section id="how" className={`${styles.shell} ${styles.band}`}>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            How the course works
          </h2>
          <div className={styles.cards}>
            <FeatureCard
              id="sections"
              number="01"
              title="One idea at a time."
              desc="Every module is split into short sections that each fit on a phone screen. Read one, and move on when it makes sense."
            >
              <LessonSteps moduleTitle={first.meta.title} sections={sections} />
            </FeatureCard>
            <FeatureCard
              id="try"
              number="02"
              flip
              title="Try it in the page."
              desc="Change something and watch what the code does with it, next to the line that does it."
            >
              <StateDemo />
            </FeatureCard>
            <FeatureCard
              id="check"
              number="03"
              title="Check you have it."
              desc="Short questions at the end of each module, with the reasoning behind every answer."
            >
              <CheckDemo />
            </FeatureCard>
          </div>
        </section>

        <section id="curriculum" className={`${styles.shell} ${styles.band}`}>
          <div className={styles.curriculumHead}>
            <h2 className={`${styles.sectionHead} ${styles.display}`}>
              The whole course, in order
            </h2>
            <p className={styles.curriculumMeta}>
              {modules.length} modules · {phases.length} phases · about {hours}{" "}
              hours of reading
            </p>
          </div>
          <div className={styles.pad}>
            {phases.map(({ phase, index, modules: group }) => (
              <div key={phase.id} className={styles.phase}>
                <h3 className={styles.phaseName}>
                  <span>Phase {index}</span>
                  {phase.name}
                </h3>
                <ol className={styles.moduleList}>
                  {group.map((m) => (
                    <li key={m.slug}>
                      <Link
                        href={`/spark/lessons/${m.slug}`}
                        className={styles.moduleRow}
                      >
                        <span className={styles.moduleNo}>
                          {String(m.module).padStart(2, "0")}
                        </span>
                        <span className={styles.moduleText}>
                          <span className={styles.moduleTitle}>{m.title}</span>
                          {m.promise && (
                            <span className={styles.modulePromise}>
                              {m.promise}
                            </span>
                          )}
                        </span>
                        <span className={styles.moduleMins}>
                          {m.minutes} min
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className={`${styles.shell} ${styles.band}`}>
          <article className={styles.maker}>
            <div className={styles.makerCopy}>
              <h3 className={`${styles.cardTitle} ${styles.display}`}>
                Spark is written by one designer, for designers.
              </h3>
              <a
                href="https://neilmcardle.com"
                className={styles.textLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                neilmcardle.com
              </a>
            </div>
            <div
              className={styles.makerPhoto}
              role="img"
              aria-label="Neil McArdle"
              style={{ backgroundImage: "url(/make-ebook/brand/neil.jpg)" }}
            />
          </article>
        </section>

        <section className={`${styles.shell} ${styles.final}`}>
          <h2 className={`${styles.finalTitle} ${styles.display}`}>
            Write your first line
            <Caret />
          </h2>
          <Link href={`/spark/lessons/${FIRST}`} className={styles.arcButton}>
            Start module 1
          </Link>
          <div className={styles.waitBlock}>
            <p className={styles.waitLabel}>
              Spark is still being written. Leave your email to hear when it is
              finished.
            </p>
            <Waitlist />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.shell} ${styles.footerInner}`}>
          <span>&copy; Spark {new Date().getFullYear()}</span>
          <nav className={styles.footerLinks} aria-label="Footer">
            <Link href="/spark/lessons">Curriculum</Link>
            <Link href="/privacy">Privacy</Link>
            <a
              href="https://neilmcardle.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              neilmcardle.com
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
