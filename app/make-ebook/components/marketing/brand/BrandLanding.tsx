"use client";

import Image from "next/image";
import Link from "next/link";
import { BrandFooter } from "./BrandFooter";
import { BrandNav } from "./BrandNav";
import { Gull } from "./Gull";
import { HeroVideo } from "./HeroVideo";
import { KindlePreview } from "./KindlePreview";
import { Mark } from "./BrandMark";
import styles from "./brand.module.css";
import {
  ChapterListVisual,
  CoversVisual,
  ExportVisual,
  PreflightVisual,
  PrivacyVisual,
  ReaderSpreadVisual,
  RewriteVisual,
} from "./visuals";

const SIGNIN = "/make-ebook/signin";

const ROWS = [
  {
    eyebrow: "Chapters",
    title: "Every chapter, in one place",
    body: "Paste a manuscript and it splits into chapters you can reorder, rename, lock, and mark complete. Word counts update as you write, so you always know how far there is left to go.",
    visual: <ChapterListVisual />,
    flip: true,
  },
  {
    eyebrow: "Pre-flight",
    title: "Ships without costing you the listing",
    body: "Book Mind reads the whole manuscript before you export and checks it against the patterns Amazon flags. Uniform chapters, thin word counts, missing metadata, absent disclosure. You see the problems while they are still fixable.",
    visual: <PreflightVisual />,
    flip: false,
  },
  {
    eyebrow: "Book Mind AI",
    title: "Rewrite with AI",
    body: "Select a sentence and ask for something different. Book Mind returns several takes instead of overwriting your work with its first guess. Keep the one that sounds like you, or leave the page exactly as it was.",
    visual: <RewriteVisual />,
    flip: true,
  },
  {
    eyebrow: "Free cover generator",
    title: "A cover drawn from the book you wrote",
    body: "Your title, your author name, your genre, set in type that suits the work. Pick a colour, and the cover is ready for the store listing without opening another tool.",
    visual: <CoversVisual />,
    flip: false,
  },
  {
    eyebrow: "Export",
    title: "One book, three formats",
    body: "Export EPUB for Kindle, Kobo, and Apple Books, PDF for print and proofing, DOCX for editors and agents. Open standards throughout, so nothing you make here is trapped here.",
    visual: <ExportVisual />,
    flip: true,
  },
  {
    eyebrow: "Local first",
    title: "Your book stays yours",
    body: "The editor is local first and works offline. Nothing leaves the browser unless you turn on sync, and the account is optional. Close the tab and your manuscript is still where you left it.",
    visual: <PrivacyVisual />,
    flip: false,
  },
];

const PLANS = [
  {
    label: "Free",
    price: "$0",
    note: "Begin without a card.",
    cta: "Start free",
    featured: false,
  },
  {
    label: "Pro · Most flexible",
    price: "$9 / month",
    note: "A simple monthly route.",
    cta: "Start with Pro",
    featured: true,
  },
  {
    label: "Lifetime",
    price: "$149",
    note: "A one-time path.",
    cta: "Start with Lifetime",
    featured: false,
  },
];

type BrandLandingProps = {
  onStartWriting: () => void;
  hideNav?: boolean;
};

export default function BrandLanding({
  onStartWriting,
  hideNav = false,
}: BrandLandingProps) {
  return (
    <div className={styles.page}>
      <section id="intro" className={styles.intro}>
        <iframe
          src="/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/pier.jpg"
          title=""
          aria-hidden="true"
          tabIndex={-1}
          loading="eager"
          className={styles.introRain}
        />
        <Mark className={styles.introMark} />
        <a
          href="#hero"
          className={styles.introChevron}
          aria-label="Scroll to the product"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
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

      {!hideNav && <BrandNav onStartWriting={onStartWriting} onLanding />}

      <main>
        <section id="hero" className={styles.hero}>
          <HeroVideo />
          <div className={styles.heroScrim} />
          <div className={`${styles.shell} ${styles.heroContent}`}>
            <div className={styles.heroCopy}>
              <h1 className={styles.h1}>
                From manuscript to{" "}
                <span className={styles.nowrap}>store-ready</span> ebook.
              </h1>
              <p className={styles.lede}>
                Write, preview and export from your private workspace.
              </p>
              <div className={styles.ctaRow}>
                <button
                  type="button"
                  onClick={onStartWriting}
                  className={styles.cta}
                >
                  Start writing <span aria-hidden="true">&rarr;</span>
                </button>
                <span className={styles.free}>It&rsquo;s free.</span>
              </div>
            </div>
          </div>
        </section>

        <div className={styles.shell}>
          <section
            id="product"
            className={`${styles.section} ${styles.readerSection}`}
          >
            <div className={`${styles.row} ${styles.reader}`}>
              <div className={styles.readerCopy}>
                <p className={styles.eyebrow}>The editor</p>
                <h2 className={styles.h2}>
                  Nothing should come between you and your manuscript.
                </h2>
                <p className={styles.body}>
                  Write peacefully in the editor and then preview your book the
                  way your readers will see it.
                </p>
              </div>
              <div className={styles.rowVisual}>
                <ReaderSpreadVisual />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.row}>
              <div>
                <p className={`${styles.eyebrow} ${styles.perch}`}>
                  eReader preview
                  <Gull />
                </p>
                <h2 className={styles.h2}>
                  See it on the device before you export.
                </h2>
                <p className={styles.body}>
                  Switch between Kindle, iPad and phone while you write. Page
                  breaks, line lengths and chapter openings appear as they will
                  in the store copy, not as they look in a text editor.
                </p>
              </div>
              <div className={styles.rowVisual}>
                <KindlePreview />
              </div>
            </div>
          </section>

          {ROWS.map((row) => (
            <section key={row.eyebrow} className={styles.section}>
              <div
                className={`${styles.row} ${row.flip ? styles.rowFlip : ""}`}
              >
                <div>
                  <p className={styles.eyebrow}>{row.eyebrow}</p>
                  <h2 className={styles.h2}>{row.title}</h2>
                  <p className={styles.body}>{row.body}</p>
                </div>
                <div className={styles.rowVisual}>{row.visual}</div>
              </div>
            </section>
          ))}

          <section id="pricing" className={styles.section}>
            <h2 className={styles.h2}>Choose how you finish.</h2>
            <div className={styles.plans}>
              {PLANS.map((plan) => (
                <div
                  key={plan.label}
                  className={`${styles.plan} ${plan.featured ? styles.planFeatured : ""}`}
                >
                  <p className={styles.planLabel}>{plan.label}</p>
                  <p className={styles.price}>{plan.price}</p>
                  <div className={styles.planFoot}>
                    <p className={styles.planNote}>{plan.note}</p>
                    <button
                      type="button"
                      onClick={onStartWriting}
                      className={styles.planCta}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className={styles.closing}>
          <Image
            src="/make-ebook/brand/writer-library.jpg"
            alt=""
            fill
            sizes="100vw"
            className={styles.closingImage}
          />
          <div className={styles.closingScrim} />
          <div className={styles.closingContent}>
            <h2 className={styles.closingTitle}>
              Write the book you&rsquo;ve been putting off.
            </h2>
            <p className={styles.closingSub}>
              The blank page has waited long enough.
            </p>
            <div className={styles.closingCtas}>
              <button
                type="button"
                onClick={onStartWriting}
                className={styles.cta}
              >
                Start writing. It&rsquo;s free.
              </button>
              <Link href={SIGNIN} className={styles.ctaGhost}>
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BrandFooter />
    </div>
  );
}
