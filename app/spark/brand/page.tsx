import type { Metadata } from "next";
import Link from "next/link";
import { Caret, Mark } from "../landing-demos";
import styles from "../landing.module.css";

export const metadata: Metadata = {
  title: "Spark brand direction",
  robots: { index: false, follow: false },
};

const AUDIT = [
  {
    head: "Two front doors that disagree",
    body: "The landing leads with the N mark, a small Inter “Spark” and “A course built for designers, by a designer.” The curriculum leads with the bolt and “BECOME AN ENGINEER” in Playfair Black capitals. Different headline, different type, different lockup.",
    where: "app/spark/page.tsx, CurriculumIndex.tsx",
  },
  {
    head: "The same recipe as makeebook",
    body: "Near-black ink, one warm accent and an italic display serif is the dark-and-accent formula makeebook uses, and Playfair is the face makeebook has just retired. Three products from one designer should be siblings, not twins.",
    where: "--spark-ink, --spark-gold, font-serif",
  },
  {
    head: "The best part is hidden",
    body: "Nine interactive widgets, including the useState cycle, the async timeline and the N+1 waterfall, only appear inside lessons. The landing is a headline, a button and an email field, so a visitor never sees how Spark teaches.",
    where: "components/spark/*",
  },
  {
    head: "Gold does every job",
    body: "Gold is the main button, the progress bars, the eyebrows, the links, the mark and the current module. When everything is gold, nothing reads as the one thing to do next.",
    where: "94 uses of the gold tokens",
  },
  {
    head: "Light reader in a dark shell",
    body: "Lessons are read on paper, but the landing, the index and the lesson sidebar are black. Moving between them changes the whole room.",
    where: "LessonShell.tsx",
  },
  {
    head: "Copy drift",
    body: "The page title uses an em dash, the description says the course was “built from a spark”, and the + marker is used for headings, prompts and status alike.",
    where: "metadata, spark-eyebrow",
  },
  {
    head: "Widgets carry the old palette in raw values",
    body: "Most widgets use the --spark tokens, but several hardcode gold and terracotta as rgba values and reach for font-serif, so a token swap alone will not finish a rebrand.",
    where: "Check.tsx, ClampPlayground.tsx, SpringBench.tsx",
  },
];

const PALETTE = [
  {
    name: "Screen",
    hex: "#0B0F0C",
    use: "The page ground. The black of a powered-on CRT.",
  },
  {
    name: "Panel",
    hex: "#121815",
    use: "Cards, windows and the lesson reading column.",
  },
  {
    name: "Deep",
    hex: "#080C09",
    use: "Demo stages, always behind the grid.",
  },
  {
    name: "Editor",
    hex: "#070A08",
    use: "Code surfaces, a shade below everything else.",
  },
  {
    name: "Rule",
    hex: "#1F2C24",
    use: "The 24px grid, hairlines and card borders.",
  },
  {
    name: "Phosphor White",
    hex: "#D6F4DE",
    use: "Type. 16.4:1 on Screen.",
  },
  {
    name: "Phosphor Mid",
    hex: "#9CBFA6",
    use: "Secondary text. 9.6:1 on Screen.",
  },
  {
    name: "Phosphor Dim",
    hex: "#7FA389",
    use: "Labels and specs. 6.9:1 on Screen.",
  },
  {
    name: "Phosphor",
    hex: "#3BE86B",
    use: "The one action per view, focus rings and the mark. Buttons carry Screen-black type at 11.8:1. 11.9:1 on Screen.",
  },
  {
    name: "Run",
    hex: "#4EFF91",
    use: "Code that is executing: the running line, its number, the play marker, live values, the terminal. 15.2:1 on Editor.",
  },
  {
    name: "Amber",
    hex: "#FFB84D",
    use: "The line being explained, and the terminal's power light. The second phosphor every terminal had. 11.2:1 on Screen.",
  },
  {
    name: "Alert",
    hex: "#FF6B5E",
    use: "Wrong answers and errors only. 6.9:1 on Screen.",
  },
];

const RULES = [
  {
    head: "Show the working",
    body: "Every demo puts the code next to what it does. A visitor should never see a result without the line that made it.",
  },
  {
    head: "One phosphor at a time",
    body: "Phosphor green marks the one action per view and focus rings. Run marks code that is executing. Amber marks the line being explained. Nothing else glows.",
  },
  {
    head: "The grid is the stage",
    body: "The 24px grid sits behind demos and the intro. Scanlines lie over the whole page at low strength, and heavier inside the terminal and the maker plate.",
  },
  {
    head: "Number like a gutter",
    body: "Sequences use two-digit mono numerals, 01, 02, 03, the way an editor numbers lines.",
  },
  {
    head: "Running code is brighter",
    body: "When code runs, the executing line turns Run and a small play marker moves from line to line. Amber marks a line being explained, never one that is running.",
  },
  {
    head: "Code is shown as typed",
    body: "Ligatures stay off, so == and === look different. Learners have to see the characters they will type.",
  },
  {
    head: "The terminal is the way around",
    body: "A working terminal in a beige case opens the course and then follows the reader as a window in the corner, draggable anywhere, minimised with the traffic lights or the backtick key. It answers where, resume, next, toc, go, find and progress against the real curriculum.",
  },
  {
    head: "The caret means your turn",
    body: "A blinking caret appears only where the page invites the reader to write: the intro and the final call to start.",
  },
  {
    head: "Plain words",
    body: "Say what literally happens. No metaphors, no undefined terms, no em dashes.",
  },
];

const REJECTED = [
  {
    head: "The engineering pad",
    body: "Pad green paper with an Arc blue accent read as careful and quiet, but it was a stationery brand for a course about screens. The terminal says the same thing about showing your working, and it is the room a designer learning to code actually sits in.",
  },
  {
    head: "Hacker green",
    body: "Neon on black with no type discipline reads as a costume. The terminal here is a frame around plain teaching: high contrast text, one action per view, no fake glitching over anything a learner has to read.",
  },
  {
    head: "Design tool chrome",
    body: "Canvas grey and selection handles would lean on another company's product, and Spark is about the step after the canvas.",
  },
];

const ROLLOUT = [
  {
    head: "Tokens",
    body: "The --spark set in globals.css is now the pad set. Every gold use became Arc, Arc Light on code surfaces, Graphite or Pass, by role.",
  },
  {
    head: "Landing and curriculum",
    body: "One front door. The landing is this composition and the curriculum index uses the pad list with gutter numbers.",
  },
  {
    head: "Lesson reader",
    body: "The black sidebar is now Pad beside a Sheet reading column, headings are JetBrains Mono 800 and the progress spine is Arc.",
  },
  {
    head: "The terminal",
    body: "SparkTerminal ships in the Spark layout, so every page carries it: the cabinet opens the landing, the dock follows you through the lessons.",
  },
  {
    head: "Widgets",
    body: "Raw gold and terracotta values and font-serif were swapped for tokens, and every widget now sits on a grid stage.",
  },
];

export default function SparkDirectionPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={`${styles.shell} ${styles.navInner}`}>
          <Link href="/spark" className={styles.brand}>
            <Mark />
            <span className={styles.wordmark}>spark</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Sections">
            <a href="#audit">Audit</a>
            <a href="#palette">Palette</a>
            <a href="#type">Type</a>
            <Link
              href="/spark"
              className={`${styles.arcButton} ${styles.small}`}
            >
              See the landing
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>
            Spark · Brand direction · September 2026
          </p>
          <h1 className={`${styles.heroTitle} ${styles.display}`}>
            Show your working.
          </h1>
          <p className={styles.dirBody}>
            Spark teaches designers to write software, starting from an empty
            file, <strong>one line explained at a time</strong>. It looks like
            the machine people learned on: a green screen terminal. Phosphor
            green on black, scanlines, a blinking caret, line numbers down the
            margin, and a working terminal on the front page. The grid stays,
            the type stays, the mark stays. Only the light changed.
          </p>
        </section>

        <section id="audit" className={styles.dirSection}>
          <p className={styles.dirEyebrow}>00 · Audit</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            What Spark looked like before.
          </h2>
          <div className={styles.rules}>
            {AUDIT.map((a, i) => (
              <div key={a.head} className={styles.rule}>
                <span className={styles.cardNo}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <b>{a.head}</b>
                {a.body}
                <em>{a.where}</em>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>01 · Positioning</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            For designers who want to build it themselves.
          </h2>
          <div className={styles.rules}>
            <div className={styles.rule}>
              <b>Audience</b>
              Designers who know nothing about engineering and want to build
              their own products, not only prompt them.
            </div>
            <div className={styles.rule}>
              <b>Promise</b>
              Read and write real code one line at a time, until you can start
              from an empty file.
            </div>
            <div className={styles.rule}>
              <b>Headline</b>
              Spark is your path to Design Engineer.
            </div>
            <div className={styles.rule}>
              <b>Relationship to the other two</b>
              makeebook is ink and lamplight for writers. Coverly is paper and
              booth grey for cover designers. Spark is the engineering pad for
              designers learning to build.
            </div>
          </div>
        </section>

        <section id="palette" className={styles.dirSection}>
          <p className={styles.dirEyebrow}>02 · Palette</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            Green screen, one phosphor.
          </h2>
          <div className={styles.palette}>
            {PALETTE.map((p) => (
              <div key={p.name} className={styles.paletteCard}>
                <div
                  className={styles.paletteChip}
                  style={{ background: p.hex }}
                />
                <div className={styles.paletteInfo}>
                  <b>{p.name}</b>
                  <span className={styles.mono}>{p.hex}</span>
                  <span>{p.use}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="type" className={styles.dirSection}>
          <p className={styles.dirEyebrow}>03 · Typography</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            The code face is the display face.
          </h2>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Display
              <br />
              JetBrains Mono 800
              <br />
              tracking -4.5%
            </div>
            <div
              className={styles.display}
              style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)", lineHeight: 1 }}
            >
              Start from an empty file.
            </div>
          </div>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Interface and lessons
              <br />
              Inter 400 / 500 / 600
            </div>
            <div style={{ fontSize: 19, lineHeight: 1.6, maxWidth: "34em" }}>
              Whenever something changes, React runs your component function
              again from the top to work out what should now be displayed. Each
              of those runs is called a render.
            </div>
          </div>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Code
              <br />
              JetBrains Mono 400
              <br />
              ligatures off
            </div>
            <div
              className={styles.mono}
              style={{ fontSize: 16, color: "var(--graphite)" }}
            >
              {'if (count === 0) return "Nothing yet"; // == is not ==='}
            </div>
          </div>
          <p className={styles.dirBody}>
            Learners spend the course reading JetBrains Mono. Setting the
            headlines in its heaviest weight means the brand is written in the
            type they are learning to write in, and it keeps Spark apart from
            makeebook&rsquo;s serif and Coverly&rsquo;s condensed sans. Both
            faces are already loaded by the site.
          </p>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>04 · Mark</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            Your mark stays.
          </h2>
          <p className={styles.dirBody}>
            The bolt already says spark. It is Phosphor green on Screen and
            Panel, and Screen black on Phosphor, in one colour only. The
            wordmark is lowercase <strong>spark</strong> in JetBrains Mono 800,
            matching the lowercase makeebook and coverly wordmarks.
          </p>
          <div className={styles.markRow}>
            {[
              { bg: "#0B0F0C", fg: "#3BE86B", ink: "#D6F4DE", label: "Screen" },
              { bg: "#121815", fg: "#3BE86B", ink: "#D6F4DE", label: "Panel" },
              {
                bg: "#3BE86B",
                fg: "#07120B",
                ink: "#07120B",
                label: "Phosphor",
              },
              { bg: "#070A08", fg: "#4EFF91", ink: "#D6F4DE", label: "Editor" },
            ].map((m) => (
              <div
                key={m.label}
                className={styles.markTile}
                style={{ background: m.bg, border: "1px solid var(--rule)" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: m.ink,
                  }}
                >
                  <span style={{ color: m.fg, display: "flex" }}>
                    <Mark className={styles.markGlyph} />
                  </span>
                  <span className={styles.wordmark}>spark</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>05 · Rules</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            How the pieces behave.
          </h2>
          <div className={styles.rules}>
            {RULES.map((r) => (
              <div key={r.head} className={styles.rule}>
                <b>{r.head}</b>
                {r.body}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>06 · Considered and set aside</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            What this is not.
          </h2>
          <div className={styles.rules}>
            {REJECTED.map((r) => (
              <div key={r.head} className={styles.rule}>
                <b>{r.head}</b>
                {r.body}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>07 · Rollout</p>
          <h2 className={`${styles.sectionHead} ${styles.display}`}>
            What changed in the product.
          </h2>
          <div className={styles.rules}>
            {ROLLOUT.map((r) => (
              <div key={r.head} className={styles.rule}>
                <b>{r.head}</b>
                {r.body}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.final}>
          <h2 className={`${styles.finalTitle} ${styles.display}`}>
            See it applied
            <Caret />
          </h2>
          <Link href="/spark" className={styles.arcButton}>
            Open the landing
          </Link>
        </section>
      </main>
    </div>
  );
}
