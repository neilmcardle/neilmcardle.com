import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Shell from "./_signature/Shell";
import NavMark from "./_signature/NavMark";
import Finale from "./_signature/Finale";
import ToTop from "./_signature/ToTop";
import Stack from "./_home/Stack";
import Rows from "./_home/Rows";
import Rail from "./_home/Rail";
import TopNav from "./_home/TopNav";
import FaceCard from "./_home/FaceCard";
import CoinCard from "./_home/CoinCard";
import Contact from "./_home/Contact";
import Chip from "./_home/Chip";
import { PLAY, WORK, WRITING, WRITING_PUBLIC } from "./_home/data";
import { SITE_DESCRIPTION, SITE_TITLE, share } from "./shared-metadata";
import styles from "./_home/home.module.css";

export const metadata: Metadata = share({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function Homepage() {
  return (
    <Shell>
      <Rail />
      <div className={styles.clip}>
        <div className={styles.page}>
          <header className={styles.top}>
            <Link href="/" aria-label="Neil McArdle">
              <NavMark />
            </Link>
            <TopNav />
          </header>

          <Stack />

          <section id="about" className={styles.about}>
            <h1 className={styles.name}>
              <span>I&rsquo;m</span> Neil McArdle
              <span>, a product designer and builder based in London.</span>
            </h1>
            <p>
              I design products and build them myself, from the first sketch to
              the code that ships. Right now that&rsquo;s{" "}
              <Chip id="makeebook" href="/work/makeebook">
                makeebook
              </Chip>
              , a quiet place to write books, and{" "}
              <Chip right id="coverly" href="/work/coverly">
                coverly
              </Chip>
              , a search of 3,079 book covers.
            </p>
            <p>
              Before that I took the{" "}
              <Chip id="avis" href="/work/avis">
                Avis
              </Chip>{" "}
              checkout from five steps to three. It&rsquo;s live on avis.com.
            </p>
            <p>
              I also work with{" "}
              <Chip right id="mobbin" href="https://mobbin.com">
                Mobbin
              </Chip>
              , the library of real app screens designers use for reference.
            </p>
            {WRITING_PUBLIC ? (
              <p>
                What I want to design next is the tools themselves. I trained as
                a painter, then took a degree in social psychology, so I care
                about both the brush and the person holding it. This year
                I&rsquo;ve been researching{" "}
                <Link
                  className={styles.inlineLink}
                  href="/writing/history-of-design-tools"
                >
                  where design tools came from
                </Link>{" "}
                and{" "}
                <Link
                  className={styles.inlineLink}
                  href="/writing/what-designers-are-saying"
                >
                  what designers say they&rsquo;re becoming
                </Link>
                .
              </p>
            ) : null}
          </section>

          <section id="work" className={styles.section}>
            <h2 className={styles.label}>Work</h2>
            <Rows pieces={WORK} />
          </section>

          {WRITING_PUBLIC ? (
            <section id="writing" className={styles.section}>
              <h2 className={styles.label}>Writing</h2>
              <Rows pieces={WRITING} />
            </section>
          ) : null}

          <section id="moments" className={styles.section}>
            <h2 className={styles.label}>Moments</h2>
            <div className={styles.moments}>
              <a
                className={styles.quoteCard}
                href="https://x.com/designertom/status/2107851337434087724"
              >
                <span className={styles.quoteArt}>
                  <img
                    src="/home/moments/bedside-books.jpg"
                    alt="A Bedside Books page: a short story beside an illustration of a boy searching under his bed"
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className={styles.quoteBody}>
                  <span className={styles.quoteText}>
                    &ldquo;This is magical dude.&rdquo;
                  </span>
                  <span className={styles.quoteWho}>
                    <span>Tommy Geoco</span> @designertom on X
                  </span>
                  <span className={styles.quoteOn}>
                    On <span>Bedside Books</span>, where a parent and child make
                    a picture book together.
                  </span>
                </span>
              </a>
              <a
                className={styles.quoteCard}
                href="https://x.com/BetterNeil/status/2103252962009284632"
              >
                <span className={`${styles.quoteArt} ${styles.quotePlain}`}>
                  <img
                    src="/home/dive-radio-jit.jpg"
                    alt="SpeakUI demoed live on Dive Radio, with Neil, Ridd and Tommy Geoco on camera"
                    width={1280}
                    height={720}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className={styles.quoteBody}>
                  <span className={styles.quoteText}>
                    &ldquo;Demo available?&rdquo;
                  </span>
                  <span className={styles.quoteWho}>
                    <span>Tommy Geoco</span> @designertom on X
                  </span>
                  <span className={`${styles.quoteText} ${styles.quoteReply}`}>
                    &ldquo;Thank you for sharing!!&rdquo;
                  </span>
                  <span className={styles.quoteWho}>
                    <span>Ridd</span> @ridd_design, co-host
                  </span>
                  <span className={styles.quoteOn}>
                    On <span>SpeakUI</span>, my voice-driven UI editor, shown on
                    Dive Radio.
                  </span>
                </span>
              </a>
            </div>
          </section>

          <section id="interactions" className={styles.section}>
            <h2 className={styles.label}>Interactions</h2>
            <div className={styles.shelf}>
              <figure>
                <FaceCard />
                <figcaption>
                  <span>Particles</span> Hover or tap
                </figcaption>
              </figure>
              <figure>
                <div className={styles.ignitionCard}>
                  <Finale card />
                </div>
                <figcaption>
                  <span>Ignition</span> Lift and press
                </figcaption>
              </figure>
              <figure className={styles.coinFigure}>
                <CoinCard />
                <figcaption>
                  <span>Coin</span> Drag and spin
                </figcaption>
              </figure>
            </div>
          </section>

          <section id="play" className={styles.section}>
            <h2 className={styles.label}>Playground</h2>
            <Rows pieces={PLAY} />
          </section>

          <section id="contact" className={styles.section}>
            <h2 className={styles.label}>Contact</h2>
            <p className={styles.tell}>Tell me more.</p>
            <Contact />
          </section>

          <footer className={styles.sign}>
            <span className={styles.signName}>
              <img src="/home/face-small.png" alt="" width={78} height={144} />
              Neil McArdle, 2026
            </span>
            <ToTop className={styles.toTop} />
          </footer>
        </div>
      </div>
    </Shell>
  );
}
