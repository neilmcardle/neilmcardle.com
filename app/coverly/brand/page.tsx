import type { Metadata } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import { CropMarks, Mark } from "../landing-demos";
import styles from "../landing.module.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Coverly brand direction",
  robots: { index: false, follow: false },
};

const PALETTE = [
  {
    name: "Proof Paper",
    hex: "#F3F2EE",
    use: "Page ground. Warm enough to feel like stock, neutral enough to leave covers alone.",
    ink: "#121212",
  },
  {
    name: "Booth Grey",
    hex: "#C8C8C5",
    use: "Every surface a cover sits on. The neutral surround print viewing booths use, so colour judgements stay honest.",
    ink: "#121212",
  },
  {
    name: "Press Black",
    hex: "#121212",
    use: "Type, chips that are on, and the deck header. 16.7:1 on Proof Paper.",
    ink: "#F3F2EE",
  },
  {
    name: "Proof Red",
    hex: "#BE2D18",
    use: "The one primary action per view and focus rings. Paper on red at 5.24:1, and usable as a text colour on Proof Paper.",
    ink: "#F3F2EE",
  },
  {
    name: "Lightbox",
    hex: "#0B0B0C",
    use: "The immersive moments: the intro wall and full-screen cover views.",
    ink: "#F3F2EE",
  },
  {
    name: "Rule",
    hex: "#DAD9D4",
    use: "Hairlines, card borders, table rules.",
    ink: "#121212",
  },
  {
    name: "Graphite",
    hex: "#5E5D59",
    use: "Secondary text. 5.9:1 on Proof Paper.",
    ink: "#F3F2EE",
  },
  {
    name: "Approved",
    hex: "#1F9D55",
    use: "Success only: copied, saved, exported. Never decorative.",
    ink: "#F3F2EE",
  },
];

const RULES = [
  {
    head: "Covers are the colour",
    body: "The interface stays grey, black and paper so every cover is judged against the same neutral. Brand colour never sits directly behind a cover.",
  },
  {
    head: "One red per view",
    body: "Proof Red marks the single most important action on a screen, the way a red pen marks the one change that matters on a proof.",
  },
  {
    head: "Crop marks, not decoration",
    body: "Corner crop marks frame stages and the intro. They say print production without illustrations, gradients or stock imagery.",
  },
  {
    head: "Shuffle and settle",
    body: "Covers move like cards on a table: 240ms out, a slight overshoot to settle (cubic-bezier 0.34, 1.36, 0.64, 1). No looping bounces.",
  },
  {
    head: "Speak the trade",
    body: "Comps, the brief, the cover meeting, sub-genre, full-bleed art. Plain, precise and visual. Never hype, never em dashes.",
  },
  {
    head: "Specs are content",
    body: "Hex values, ISBNs and imprints are set in mono and treated as useful information, not fine print.",
  },
];

const REJECTED = [
  {
    head: "Dark ink and a bright accent",
    body: "Too close to makeebook. Two products from one designer should be siblings, not twins, and a dark surround shifts how cover colours read.",
  },
  {
    head: "A colourful, gradient-led UI",
    body: "It competes with the covers. Designers need to see a cover the way a buyer will, not tinted by the tool around it.",
  },
  {
    head: "A literary serif display face",
    body: "That is makeebook's voice. Coverly serves designers, and condensed sans display type is the vernacular of the thriller covers in the catalogue.",
  },
];

export default function CoverlyBrandPage() {
  return (
    <div className={`${styles.page} ${archivo.variable}`}>
      <header className={styles.nav}>
        <div className={`${styles.shell} ${styles.navInner}`}>
          <Link href="/coverly" className={styles.brand}>
            <Mark />
            <span className={styles.wordmark}>coverly</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Sections">
            <a href="#palette">Palette</a>
            <a href="#type">Type</a>
            <Link
              href="/coverly"
              className={`${styles.redButton} ${styles.small}`}
            >
              See the landing
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>
            Coverly · Brand direction · September 2026
          </p>
          <h1 className={`${styles.heroTitle} ${styles.display}`}>
            The viewing booth.
          </h1>
          <p className={styles.dirBody}>
            Coverly is comparable research for book cover designers:{" "}
            <strong>be inspired before you design the cover.</strong> Print
            designers check proofs in a viewing booth, a neutral grey box with
            calibrated light, so colour is judged honestly. Coverly should do
            the same job for a whole genre. The brand steps back so the covers
            can be seen as a buyer will see them, and borrows its details from
            print production: proof paper, booth grey, press black, the red pen
            and the crop mark.
          </p>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>01 · Positioning</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            For the person who has to design the next one.
          </h2>
          <div className={styles.rules}>
            <div className={styles.rule}>
              <b>Audience</b>
              Freelance cover designers, in-house art directors and
              self-publishing authors briefing a designer, starting with
              thrillers.
            </div>
            <div className={styles.rule}>
              <b>Promise</b>
              Find your comps in minutes, understand why they work, and walk
              into the cover meeting with a deck.
            </div>
            <div className={styles.rule}>
              <b>Headline</b>
              Be inspired before you design the cover.
            </div>
            <div className={styles.rule}>
              <b>Relationship to makeebook</b>
              Same maker, same care. makeebook is ink and lamplight for writers,
              Coverly is paper and booth grey for designers.
            </div>
          </div>
        </section>

        <section id="palette" className={styles.dirSection}>
          <p className={styles.dirEyebrow}>02 · Palette</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Neutral on purpose, red with intent.
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
                  <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
                    {p.use}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="type" className={styles.dirSection}>
          <p className={styles.dirEyebrow}>03 · Typography</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Cover type for headlines, quiet type for work.
          </h2>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Display
              <br />
              Archivo 700
              <br />
              width 72%
            </div>
            <div
              className={styles.display}
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                lineHeight: 0.95,
              }}
            >
              Find your comps.
            </div>
          </div>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Interface
              <br />
              Inter 400 / 500 / 600
            </div>
            <div style={{ fontSize: 20, lineHeight: 1.5, maxWidth: "34em" }}>
              Search by sub-genre, type, colour and tone. Collect covers on a
              board and export a comparison deck.
            </div>
          </div>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Specs
              <br />
              JetBrains Mono 400
            </div>
            <div className={styles.mono} style={{ fontSize: 16 }}>
              #E8340C #A6371A #F7CB89 · ISBN 9781538753057 · Grand Central ·
              2022
            </div>
          </div>
          <p className={styles.dirBody}>
            Archivo&rsquo;s width axis lets headlines run condensed like the
            thriller covers in the catalogue, without licensing a separate
            condensed family. Wordmark: Archivo 700 at 72% width, lowercase{" "}
            <strong>coverly</strong>.
          </p>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>04 · Mark</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Your mark stays.
          </h2>
          <p className={styles.dirBody}>
            The existing Coverly mark reads as covers fanned around a spine and
            as a registration target, which suits this direction exactly. It is
            used in one colour only: Press Black on paper and grey, Proof Paper
            on Lightbox and red. If you want a new mark, as you supplied for
            makeebook, the direction holds with any single-colour mark.
          </p>
          <div className={styles.markRow}>
            {[
              { bg: "#F3F2EE", fg: "#121212", label: "Proof Paper" },
              { bg: "#C8C8C5", fg: "#121212", label: "Booth Grey" },
              { bg: "#0B0B0C", fg: "#F3F2EE", label: "Lightbox" },
              { bg: "#BE2D18", fg: "#F3F2EE", label: "Proof Red" },
            ].map((m) => (
              <div
                key={m.label}
                className={styles.markTile}
                style={{
                  background: m.bg,
                  color: m.fg,
                  border: "1px solid var(--rule)",
                }}
              >
                <div
                  style={{ display: "grid", justifyItems: "center", gap: 12 }}
                >
                  <Mark />
                  <span className={styles.wordmark}>coverly</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>05 · Surfaces and motifs</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            A grey stage for every cover.
          </h2>
          <div className={styles.rules}>
            {RULES.map((r) => (
              <div key={r.head} className={styles.rule}>
                <b>{r.head}</b>
                {r.body}
              </div>
            ))}
          </div>
          <div className={styles.booth} style={{ height: 220, marginTop: 12 }}>
            <CropMarks />
          </div>
        </section>

        <section className={styles.dirSection}>
          <p className={styles.dirEyebrow}>06 · Considered and set aside</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
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

        <section className={styles.final} style={{ paddingBottom: 120 }}>
          <h2 className={`${styles.finalTitle} ${styles.display}`}>
            See it applied.
          </h2>
          <Link href="/coverly" className={styles.redButton}>
            Open the landing
          </Link>
        </section>
      </main>
    </div>
  );
}
