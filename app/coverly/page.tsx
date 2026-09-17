import type React from "react";
import Link from "next/link";
import { Archivo } from "next/font/google";
import { CoverMarquee } from "./CoverMarquee";
import { fetchLandingCovers } from "./landing-data";
import {
  BrowseDemo,
  ColourMapDemo,
  CropMarks,
  HeroFan,
  HueRibbon,
  Mark,
  SimilarDemo,
  SoundCard,
  SpecsDemo,
  ViewsCard,
} from "./landing-demos";
import styles from "./landing.module.css";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

function FeatureCard({
  id,
  title,
  desc,
  link,
  flip = false,
  children,
}: {
  id: string;
  title: string;
  desc?: string;
  link?: { label: string; href: string };
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className={`${styles.card} ${flip ? styles.cardFlip : ""}`}
    >
      <div className={styles.cardCopy}>
        <h3 className={`${styles.cardTitle} ${styles.display}`}>{title}</h3>
        {desc ? <p className={styles.cardDesc}>{desc}</p> : null}
        {link ? (
          <Link href={link.href} className={styles.textLink}>
            {link.label}
          </Link>
        ) : null}
      </div>
      <div className={`${styles.booth} ${styles.cardStage}`}>
        <CropMarks />
        {children}
      </div>
    </article>
  );
}

export default async function CoverlyPage() {
  const { covers, count } = await fetchLandingCovers();
  const shown = count || covers.length;

  return (
    <div className={`${styles.page} ${archivo.variable}`}>
      <section className={styles.intro} id="intro">
        <div className={styles.introWall} aria-hidden="true">
          <CoverMarquee
            covers={covers
              .slice(0, 48)
              .map((c) => ({ src: c.src, title: c.title }))}
          />
        </div>
        <div className={styles.introShade} aria-hidden="true" />
        <CropMarks />
        <div className={styles.introMark}>
          <Mark />
          <span className={styles.introWord}>coverly</span>
        </div>
        <a
          href="#hero"
          className={styles.chevron}
          aria-label="Scroll to Coverly"
        >
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
          <Link href="/coverly" className={styles.brand}>
            <Mark />
            <span className={styles.wordmark}>coverly</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary">
            <a href="#product">Product</a>
            <a href="#features">Features</a>
            <Link
              href="/coverly/browse"
              className={`${styles.redButton} ${styles.small}`}
            >
              Browse covers
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section
          id="hero"
          className={styles.shell}
          style={{ scrollMarginTop: 64 }}
        >
          <div className={styles.hero}>
            <div>
              <h1 className={`${styles.heroTitle} ${styles.display}`}>
                Be inspired before you design the cover.
              </h1>
              <p className={styles.lede}>
                Search {shown.toLocaleString("en-GB")} thriller covers by
                sub-genre, type, colour and tone. Collect your comps on a board,
                then export a deck for the cover meeting.
              </p>
              <div className={styles.ctaRow}>
                <Link href="/coverly/browse" className={styles.redButton}>
                  Browse the covers
                </Link>
              </div>
            </div>
            <HeroFan covers={covers} />
          </div>
        </section>

        <section id="product" className={`${styles.shell} ${styles.stageBand}`}>
          <div className={`${styles.booth} ${styles.stage}`}>
            <CropMarks />
            <BrowseDemo covers={covers} count={shown} />
          </div>
        </section>

        <section
          className={`${styles.shell} ${styles.ribbonBand}`}
          aria-label="The catalogue"
        >
          <HueRibbon covers={covers} count={shown} />
        </section>

        <section id="features" className={`${styles.shell} ${styles.band}`}>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Search on the colour map
          </h2>
          <div className={styles.cards}>
            <FeatureCard
              id="colour"
              title="Browse covers on the colour map."
              desc="Try it →"
            >
              <ColourMapDemo covers={covers} />
            </FeatureCard>
            <FeatureCard
              id="similar"
              flip
              title="Find the covers yours will sit beside."
              desc="Open any cover to see its nearest neighbours by palette, type and layout. Follow the thread until the shelf makes sense."
            >
              <SimilarDemo covers={covers} />
            </FeatureCard>
            <FeatureCard
              id="specs"
              title="Take the specs, not just a screenshot."
              desc="Palette hex values, ISBN, imprint and tags on every cover. One click copies what you need for the brief."
            >
              <SpecsDemo covers={covers} />
            </FeatureCard>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.band}`}>
          <h2 className={`${styles.sectionTitle} ${styles.display}`}>
            Small things, done properly.
          </h2>
          <div className={styles.smallCards}>
            <article className={styles.smallCard}>
              <div className={styles.smallCopy}>
                <h3 className={styles.smallTitle}>
                  Three ways to look
                  <span>
                    A grid for scanning, a bookshelf for scale, a colour map for
                    mood.
                  </span>
                </h3>
              </div>
              <div className={`${styles.booth} ${styles.smallStage}`}>
                <ViewsCard covers={covers} />
              </div>
            </article>
            <article className={styles.smallCard}>
              <div className={styles.smallCopy}>
                <h3 className={styles.smallTitle}>
                  A shelf you can hear
                  <span>
                    A soft tick as you move across covers. Off until you want
                    it.
                  </span>
                </h3>
              </div>
              <div className={`${styles.booth} ${styles.smallStage}`}>
                <SoundCard covers={covers} />
              </div>
            </article>
            <article className={styles.smallCard}>
              <div className={styles.smallCopy}>
                <h3 className={styles.smallTitle}>
                  Rights respected
                  <span>
                    Covers belong to their designers and publishers, and owners
                    can ask for removal.
                  </span>
                </h3>
              </div>
              <div className={`${styles.booth} ${styles.smallStage}`}>
                <div className={styles.rightsDemo}>
                  <b>Rights and takedowns</b>
                  <p>
                    Own a cover in the catalogue? Use the takedown form to ask
                    for it to be removed.
                  </p>
                  <Link href="/coverly/takedown" className={styles.textLink}>
                    Request a takedown
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className={`${styles.shell} ${styles.band}`}>
          <article className={styles.maker}>
            <div className={styles.makerCopy}>
              <h3 className={`${styles.cardTitle} ${styles.display}`}>
                Coverly is made by one designer, for cover designers.
              </h3>
              <a
                href="https://neilmcardle.com"
                className={styles.textLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                neilmcardle.com <span aria-hidden="true">&#8599;</span>
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
            Be inspired.
          </h2>
          <Link href="/coverly/browse" className={styles.redButton}>
            Browse the covers
          </Link>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={`${styles.shell} ${styles.footerInner}`}>
          <span>&copy; Coverly {new Date().getFullYear()}</span>
          <nav className={styles.footerLinks} aria-label="Footer">
            <Link href="/coverly/browse">Browse</Link>
            <Link href="/coverly/boards">Boards</Link>
            <Link href="/coverly/takedown">Rights and takedowns</Link>
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
