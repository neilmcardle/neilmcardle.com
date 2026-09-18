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
    name: "Pad",
    hex: "#E8EEDD",
    use: "Page ground. The pale green of an engineering computation pad.",
  },
  {
    name: "Pad Deep",
    hex: "#DDE5CF",
    use: "Stages that hold demos, always with the grid.",
  },
  {
    name: "Grid",
    hex: "#C9D5B7",
    use: "The 24px grid, hairlines and rules.",
  },
  {
    name: "Sheet",
    hex: "#F8F9F4",
    use: "Windows, cards and the lesson page.",
  },
  {
    name: "Graphite",
    hex: "#1B1F19",
    use: "Type. 14.1:1 on Pad.",
  },
  {
    name: "Pencil",
    hex: "#4E5648",
    use: "Secondary text. 6.4:1 on Pad.",
  },
  {
    name: "Arc",
    hex: "#3D2BD8",
    use: "The one action per view, the line being explained, focus rings. 7.0:1 on Pad, Sheet on Arc 7.8:1.",
  },
  {
    name: "Editor",
    hex: "#15171A",
    use: "Code surfaces. Arc Light #A99CFF marks keywords and the active line at 7.6:1.",
  },
  {
    name: "Pass",
    hex: "#1D7A45",
    use: "Correct answers and saved states only. 5.1:1 on Sheet.",
  },
  {
    name: "Redline",
    hex: "#B73A26",
    use: "Wrong answers and errors only. 5.4:1 on Sheet.",
  },
];

const RULES = [
  {
    head: "Show the working",
    body: "Every demo puts the code next to what it does. A visitor should never see a result without the line that made it.",
  },
  {
    head: "Arc means act or explain",
    body: "Arc marks the one action per view, the line currently being explained and focus rings. It is never decoration, never a background wash.",
  },
  {
    head: "The grid is the stage",
    body: "The 24px pad grid sits behind demos and the intro. It never sits behind text someone has to read.",
  },
  {
    head: "Number like a gutter",
    body: "Sequences use two-digit mono numerals, 01, 02, 03, the way an editor numbers lines.",
  },
  {
    head: "Code is shown as typed",
    body: "Ligatures stay off, so == and === look different. Learners have to see the characters they will type.",
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
    head: "Keep the dark ink and gold",
    body: "It is the makeebook formula, and a black shell around a paper reader flips the room every time a learner opens a lesson.",
  },
  {
    head: "Terminal green on black",
    body: "The hacker look tells designers that code belongs to someone else, which is the opposite of what Spark is for.",
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
            file. Engineers have long worked problems out on computation pads:
            pale green paper with a faint grid, where every step is written down
            so someone else can follow it. That is how Spark teaches,{" "}
            <strong>one line explained at a time</strong>, and it gives the
            brand its details: pad green, the grid, graphite, line numbers in
            the margin, the caret, and Arc, the blue violet of an electric
            spark, for the one thing to do next.
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
            Pad green, graphite, one Arc.
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
            The bolt already says spark. It moves from gold to Arc and is used
            in one colour only. The wordmark becomes lowercase{" "}
            <strong>spark</strong> in JetBrains Mono 800, matching the lowercase
            makeebook and coverly wordmarks.
          </p>
          <div className={styles.markRow}>
            {[
              { bg: "#E8EEDD", fg: "#3D2BD8", ink: "#1B1F19", label: "Pad" },
              { bg: "#F8F9F4", fg: "#3D2BD8", ink: "#1B1F19", label: "Sheet" },
              { bg: "#3D2BD8", fg: "#F8F9F4", ink: "#F8F9F4", label: "Arc" },
              { bg: "#15171A", fg: "#A99CFF", ink: "#E8EEDD", label: "Editor" },
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
