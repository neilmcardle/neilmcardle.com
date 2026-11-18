import type { Metadata, Viewport } from "next";
import Image from "next/image";
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
import Contact from "./_home/Contact";
import Chip from "./_home/Chip";
import { APPS, STORIES, WORK, WRITING, WRITING_PUBLIC } from "./_home/data";
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

          <main id="main">
            <Stack />

            <section id="about" className={styles.about}>
              <h1 className={styles.name}>
                <span>I&rsquo;m</span> Neil McArdle
                <span>, a product designer and builder based in London.</span>
              </h1>
              <p>
                At ABG I took the{" "}
                <Chip id="avis" href="/work/avis">
                  Avis
                </Chip>{" "}
                checkout from five steps to three, live on avis.com, and
                I&rsquo;m also a contractor for{" "}
                <Chip right id="mobbin" href="https://mobbin.com">
                  Mobbin
                </Chip>
                .
              </p>
              <p>
                I design products and build them myself, from the first sketch
                to the code that ships. Right now that&rsquo;s{" "}
                <Chip id="makeebook" href="/work/makeebook">
                  Makeebook
                </Chip>
                , a quiet place to write books, and{" "}
                <Chip right id="coverly" href="/work/coverly">
                  Coverly
                </Chip>
                , a search of over 3,000 book covers.
              </p>
              {WRITING_PUBLIC ? (
                <p>
                  This year I&rsquo;ve been researching{" "}
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
                  . What I want to design next is the tools themselves. I
                  trained as a painter, then took a degree in social psychology,
                  so I care about both the brush and the person holding it.
                </p>
              ) : null}
            </section>

            <section id="work" className={styles.section}>
              <h2 className={styles.label}>Work</h2>
              <Rows pieces={WORK} />
              <h3 className={styles.subLabel}>Apps</h3>
              <Rows pieces={APPS} />
            </section>

            {WRITING_PUBLIC ? (
              <section id="writing" className={styles.section}>
                <h2 className={styles.label}>Writing</h2>
                <Rows pieces={WRITING} />
                <h3 className={styles.subLabel}>Storytelling</h3>
                <Rows pieces={STORIES} />
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
                      style={{ objectPosition: "50% 15%" }}
                      alt="A Bedside Books page: a short story beside an illustration of a boy searching under his bed"
                      loading="lazy"
                      decoding="async"
                    />
                    <span className={styles.quoteProduct}>Bedside Books</span>
                  </span>
                  <span className={styles.quoteBody}>
                    <span className={styles.quoteHead}>
                      <Image
                        className={styles.quoteAvatar}
                        src="/home/moments/tommy-geoco.jpg"
                        alt=""
                        width={80}
                        height={80}
                      />
                      <span className={styles.quoteWho}>
                        <span className={styles.quoteName}>Tommy Geoco</span>
                        <span className={styles.quoteRole}>
                          Design influencer
                        </span>
                      </span>
                    </span>
                    <span className={styles.quoteText}>
                      &ldquo;This is magical dude.&rdquo;
                    </span>
                    <span className={styles.quotePost}>
                      View the post on X
                      <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                      </svg>
                    </span>
                  </span>
                </a>
                <a
                  className={styles.quoteCard}
                  href="https://x.com/evilrabbit_/status/2120660975368196127"
                >
                  <span
                    className={styles.quoteArt}
                    style={{ background: "#c1bdb2" }}
                  >
                    <img
                      style={{ objectFit: "contain" }}
                      src="/home/moments/puddle-high.jpg"
                      alt="A worn green wellie standing over the words Puddle High II"
                      width={1280}
                      height={720}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                  <span className={styles.quoteBody}>
                    <span className={styles.quoteHead}>
                      <Image
                        className={`${styles.quoteAvatar} ${styles.quoteAvatarInset}`}
                        src="/home/moments/evil-rabbit.jpg"
                        alt=""
                        width={80}
                        height={80}
                      />
                      <span className={styles.quoteWho}>
                        <span className={styles.quoteName}>Evil Rabbit</span>
                        <span className={styles.quoteRole}>
                          Founding designer at Vercel
                        </span>
                      </span>
                    </span>
                    <span className={styles.quoteText}>
                      &ldquo;it looks fire! 🔥 love the exploded view&rdquo;
                    </span>
                    <span className={styles.quotePost}>
                      View the post on X
                      <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
                      </svg>
                    </span>
                  </span>
                </a>
              </div>
            </section>

            <section id="play" className={styles.section}>
              <h2 className={styles.label}>Playground</h2>
              <div className={styles.shelf}>
                <figure>
                  <div className={styles.ignitionCard}>
                    <Finale card />
                  </div>
                  <figcaption>
                    <span>Ignition</span> Lift and press
                  </figcaption>
                </figure>
                <figure>
                  <FaceCard />
                  <figcaption>
                    <span>Particles</span> Hover or tap
                  </figcaption>
                </figure>
              </div>
              <p className={styles.more}>
                <Link href="/playground">
                  Everything else in the playground
                </Link>
              </p>
            </section>

            <section id="contact" className={styles.section}>
              <h2 className={styles.label}>Contact</h2>
              <p className={styles.tell}>Tell me more.</p>
              <Contact />
            </section>
          </main>

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
