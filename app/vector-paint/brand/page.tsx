import type { Metadata } from "next";
import Link from "next/link";
import Mark from "../components/mark";
import styles from "./brand.module.css";

export const metadata: Metadata = {
  title: "Vector Paint brand direction",
  robots: { index: false, follow: false },
};

const NAMES = [
  {
    name: "vector paint",
    pick: true,
    body: "Keep it. Vector is the reason a 100 cm canvas stays as sharp as the screen, and the name already sits on the homepage. The tagline does the explaining for parents.",
  },
  {
    name: "fridgedoor",
    pick: false,
    body: "Tells the whole story in one word. Warmer for parents, but loses the craft signal and needs a domain and trademark check.",
  },
  {
    name: "wallworthy",
    pick: false,
    body: "Speaks to the parent's decision, not the child's fun. Good for a print shop, weaker as the name of a drawing tool.",
  },
];

const CHROME = [
  {
    name: "Fridge White",
    hex: "#FBF7EF",
    use: "Page ground. Warm enamel, not screen white, so the white drawing page reads as paper on top of it.",
  },
  {
    name: "Gallery Wall",
    hex: "#ECE5D8",
    use: "The wall every print is previewed on, and the stage behind demos. Ink on wall 14.0:1.",
  },
  {
    name: "Crayon Black",
    hex: "#1C1917",
    use: "Type and icons. 16.4:1 on Fridge White. Also the first paint pot.",
  },
  {
    name: "Pencil",
    hex: "#5B544C",
    use: "Secondary text and specs. 7.0:1 on Fridge White.",
  },
  {
    name: "Pot Blue",
    hex: "#2350D8",
    use: "The one grown-up action per view: order, continue, pay. Fridge White on it 6.1:1. Focus rings.",
  },
  {
    name: "Masking Tape",
    hex: "#EFE2B8",
    use: "Only ever tape. Holds drawings to the wall in previews and marks the gallery.",
  },
];

const POTS = [
  { name: "Crayon", hex: "#1C1917" },
  { name: "Tomato", hex: "#E8412A" },
  { name: "Tangerine", hex: "#FF8A1F" },
  { name: "Sunshine", hex: "#FFC72C" },
  { name: "Leaf", hex: "#2FA35B" },
  { name: "Sky", hex: "#3BA7F0" },
  { name: "Grape", hex: "#8B4FD6" },
  { name: "Bubblegum", hex: "#FF6FB1" },
  { name: "Cocoa", hex: "#8A5A3C" },
  { name: "Chalk", hex: "#FFFFFF" },
];

const RULES = [
  {
    head: "The child's colours stay on the page",
    body: "Paint pot colours appear only in the palette and the drawing. The interface around them is paper, ink and one blue, so the art is always the loudest thing on screen.",
  },
  {
    head: "Two hands, two surfaces",
    body: "The child holds the brush: big pots, no words needed, undo always in reach. The parent holds the card: ordering, deleting and sharing sit behind a grown-up check and read like a calm shop.",
  },
  {
    head: "Tape, not frames",
    body: "Masking tape corners are the motif, the way crop marks are Coverly's. Drawings are taped up at a slight tilt in the gallery and straighten when chosen.",
  },
  {
    head: "Stick and settle",
    body: "Things land like a drawing slapped on the fridge: 400ms, a small overshoot (cubic-bezier 0.34, 1.4, 0.64, 1). Never a looping bounce, never confetti.",
  },
  {
    head: "Thumb sized, always",
    body: "Every control a child touches is at least 56px. Nothing important lives at the screen edge where small palms rest.",
  },
  {
    head: "Say it like a parent would",
    body: "Plain and warm. Canvas, wall, keepsake, delivered to your door. Never cute baby talk, never urgency, never em dashes.",
  },
];

const REJECTED = [
  {
    head: "Rainbow chrome",
    body: "Every kids' app does it, and it fights the drawing. When the whole screen is colourful, the child's colour choices stop meaning anything.",
  },
  {
    head: "Dark ink and a bright accent",
    body: "That is makeebook. A dark surround also makes a child's colours look like a screen, not a painting.",
  },
  {
    head: "A cartoon mascot",
    body: "Charming for the child, but it makes the shop feel like a toy to the parent spending £60 on a canvas.",
  },
];

function KidSun() {
  return (
    <svg viewBox="0 0 300 400" aria-hidden>
      <rect width="300" height="400" fill="#fff" />
      <path
        d="M0 300C60 280 110 310 170 296S260 280 300 292V400H0Z"
        fill="#2FA35B"
      />
      <circle cx="210" cy="92" r="42" fill="#FFC72C" />
      <g stroke="#FFC72C" strokeWidth="10" strokeLinecap="round">
        <path d="M210 26v-14M210 172v-14M144 92h-14M290 92h-14M163 45l-10-10M267 149l-10-10M257 45l10-10M153 149l10-10" />
      </g>
      <path
        d="M70 300V196l58-52 58 52v104"
        fill="#E8412A"
        stroke="#1C1917"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M58 204l70-66 70 66"
        fill="none"
        stroke="#1C1917"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="110"
        y="240"
        width="36"
        height="60"
        rx="4"
        fill="#3BA7F0"
        stroke="#1C1917"
        strokeWidth="7"
      />
    </svg>
  );
}

function KidCat() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden>
      <rect width="400" height="300" fill="#fff" />
      <path
        d="M40 250C110 236 290 236 360 250"
        stroke="#8B4FD6"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M140 230C130 150 160 120 200 120S272 150 262 230Z"
        fill="#FF8A1F"
        stroke="#1C1917"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <path
        d="M160 132l-6-48 36 34M240 132l6-48-36 34"
        fill="#FF8A1F"
        stroke="#1C1917"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <circle cx="182" cy="160" r="7" fill="#1C1917" />
      <circle cx="220" cy="160" r="7" fill="#1C1917" />
      <path
        d="M194 180q7 8 14 0"
        stroke="#1C1917"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M262 214c40-6 58-40 44-70"
        stroke="#FF8A1F"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M60 70q20-30 40 0t40 0"
        stroke="#FF6FB1"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function Tape() {
  return (
    <>
      <span className={`${styles.tape} ${styles.tapeLeft}`} />
      <span className={`${styles.tape} ${styles.tapeRight}`} />
    </>
  );
}

export default function VectorPaintBrandPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={`${styles.shell} ${styles.navInner}`}>
          <Link href="/vector-paint" className={styles.brand}>
            <Mark />
            <span className={styles.wordmark}>vector paint</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Sections">
            <a href="#palette">Palette</a>
            <a href="#type">Type</a>
            <Link
              href="/vector-paint"
              className={`${styles.button} ${styles.small}`}
            >
              Open the app
            </Link>
          </nav>
        </div>
      </header>

      <main className={styles.shell}>
        <section className={styles.section}>
          <p className={styles.eyebrow}>
            Vector Paint · Brand direction · September 2026
          </p>
          <h1 className={`${styles.heroTitle} ${styles.display}`}>
            From the fridge
            <br />
            to the wall.
          </h1>
          <p className={styles.body}>
            Every child&rsquo;s best drawing ends up on the fridge door, held by
            a magnet, curling at the corners, gone by spring. Vector Paint gives
            children a proper place to draw and gives parents a way to keep the
            good ones:{" "}
            <strong>
              printed on canvas, sharp at any size, delivered to your door.
            </strong>{" "}
            The brand borrows from the fridge door and the classroom wall: warm
            paper, masking tape, poster paint pots and one grown-up blue for the
            moments that cost money.
          </p>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>01 · Positioning</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Made for the child. Bought by the parent.
          </h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <b>The child</b>
              Three to nine, usually on an iPad or a parent&rsquo;s laptop.
              Wants big colours, fat brushes and to never lose what they made.
            </div>
            <div className={styles.card}>
              <b>The parent</b>
              Wants the drawing kept, not another app to police. Will pay for a
              canvas that looks like it belongs on the wall, and for a gift for
              grandparents.
            </div>
            <div className={styles.card}>
              <b>Promise</b>
              Draw anything. Keep the best ones on canvas, printed crisp at any
              size, with UK delivery in about a week.
            </div>
            <div className={styles.card}>
              <b>Relationship to the rest</b>
              Same maker, same care. makeebook is ink and lamplight, Coverly is
              booth grey, Spark is a green screen. Vector Paint is the fridge
              door.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>02 · Name</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Keep the name, let the line explain it.
          </h2>
          <div className={styles.nameRow}>
            {NAMES.map((n) => (
              <div key={n.name} className={styles.nameCard}>
                {n.pick && <span className={styles.pick}>Recommended</span>}
                <span className={styles.wordmark}>{n.name}</span>
                <p>{n.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="palette" className={styles.section}>
          <p className={styles.eyebrow}>03 · Palette</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Quiet paper around loud paint.
          </h2>
          <div className={styles.swatches}>
            {CHROME.map((c) => (
              <div key={c.name} className={styles.swatch}>
                <div className={styles.chip} style={{ background: c.hex }} />
                <div className={styles.swatchInfo}>
                  <b>{c.name}</b>
                  <span className={styles.mono}>{c.hex}</span>
                  <p>{c.use}</p>
                </div>
              </div>
            ))}
          </div>
          <p className={styles.body}>
            The paint pots belong to the child. They appear in the palette and
            on the page, never in buttons, backgrounds or badges.
          </p>
          <div className={styles.pots}>
            {POTS.map((p) => (
              <div key={p.name} className={styles.pot}>
                <span
                  className={styles.potBlob}
                  style={{ background: p.hex }}
                />
                {p.name}
              </div>
            ))}
          </div>
        </section>

        <section id="type" className={styles.section}>
          <p className={styles.eyebrow}>04 · Typography</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            A face with a bit of wobble in it.
          </h2>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Display
              <br />
              Bricolage Grotesque 800
              <br />
              optical size 96
            </div>
            <div
              className={styles.display}
              style={{
                fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
                lineHeight: 0.95,
              }}
            >
              Draw something big.
            </div>
          </div>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Interface
              <br />
              Inter 400 / 500 / 600
            </div>
            <div style={{ fontSize: 20, lineHeight: 1.5, maxWidth: "34em" }}>
              Choose a size and we&rsquo;ll print it on canvas, stretch it over
              a 4 cm frame and send it to your door.
            </div>
          </div>
          <div className={styles.typeRow}>
            <div className={styles.typeMeta}>
              Specs
              <br />
              JetBrains Mono 400
            </div>
            <div className={styles.mono} style={{ fontSize: 16 }}>
              50 × 70 cm · 5906 × 8268 px · 300 dpi · 4 cm bars
            </div>
          </div>
          <p className={styles.body}>
            Bricolage Grotesque has the irregular, slightly hand-cut shapes of
            poster lettering on a classroom wall, but it is set tight and heavy
            so it reads grown-up to the parent. Wordmark: Bricolage 800,
            lowercase <strong>vector paint</strong>.
          </p>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>05 · Mark</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            One stroke, drawn in one go.
          </h2>
          <p className={styles.body} style={{ marginTop: 0, marginBottom: 28 }}>
            A V drawn the way a child draws it, one thick line without lifting
            the brush, that ends in a loop like a picture hook. The drawing and
            the hanging in a single gesture. One colour only.
          </p>
          <div className={styles.markRow}>
            {[
              { bg: "#FBF7EF", fg: "#1C1917", label: "Fridge White" },
              { bg: "#ECE5D8", fg: "#1C1917", label: "Gallery Wall" },
              { bg: "#1C1917", fg: "#FBF7EF", label: "Crayon Black" },
              { bg: "#2350D8", fg: "#FBF7EF", label: "Pot Blue" },
            ].map((m) => (
              <div
                key={m.label}
                className={styles.markTile}
                style={{ background: m.bg, color: m.fg }}
              >
                <div className={styles.markStack}>
                  <Mark size={64} />
                  <span className={styles.wordmark}>vector paint</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>06 · Surfaces and motifs</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Taped up today, on canvas next week.
          </h2>
          <div className={styles.grid}>
            {RULES.map((r) => (
              <div key={r.head} className={styles.card}>
                <b>{r.head}</b>
                {r.body}
              </div>
            ))}
          </div>
          <div className={styles.wallStage}>
            <div
              className={styles.taped}
              style={{ ["--tilt" as string]: "-3deg" }}
            >
              <Tape />
              <KidSun />
            </div>
            <div
              className={styles.taped}
              style={{ ["--tilt" as string]: "2deg" }}
            >
              <Tape />
              <KidCat />
            </div>
            <span className={styles.arrow}>then, the good one</span>
            <div className={`${styles.taped} ${styles.canvasPrint}`}>
              <KidSun />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <p className={styles.eyebrow}>07 · Considered and set aside</p>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            What this is not.
          </h2>
          <div className={styles.grid}>
            {REJECTED.map((r) => (
              <div key={r.head} className={styles.card}>
                <b>{r.head}</b>
                {r.body}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.final}>
          <h2 className={`${styles.finalTitle} ${styles.display}`}>
            See it applied.
          </h2>
          <Link href="/vector-paint" className={styles.button}>
            Open the app
          </Link>
        </section>
      </main>
    </div>
  );
}
