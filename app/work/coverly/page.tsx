import type { Metadata } from "next";
import Image from "next/image";
import { CoverMarquee } from "../../coverly/CoverMarquee";
import { fetchLandingCovers } from "../../coverly/landing-data";
import { Mark } from "../../coverly/landing-demos";
import coverly from "../../coverly/landing.module.css";
import styles from "../case.module.css";
import NMark from "../NMark";
import SimilarRow from "./SimilarRow";

export const metadata: Metadata = {
  title: "coverly · Neil McArdle",
  description: "Brand and product design for coverly.",
  robots: { index: false, follow: false },
};

type Frame =
  | { kind: "full"; src: string; alt: string }
  | { kind: "pair"; items: { src: string; alt: string }[] }
  | { kind: "film"; src: string; poster: string; label: string }
  | { kind: "similar" };

const FRAMES: Frame[] = [
  {
    kind: "film",
    src: "/home/coverly-promo.mp4",
    poster: "/home/coverly-promo.jpg",
    label: "coverly product film",
  },
  {
    kind: "pair",
    items: [
      {
        src: "/work/coverly/mark-cream-paper.jpg",
        alt: "The coverly mark in black on cream paper",
      },
      {
        src: "/work/coverly/mark-black-paper.jpg",
        alt: "The coverly mark in paper white on black",
      },
    ],
  },
  { kind: "similar" },
  {
    kind: "full",
    src: "/work/coverly/cover-count-plain.jpg",
    alt: "3,079 cover designs",
  },
  {
    kind: "full",
    src: "/work/coverly/framed.jpg",
    alt: "A framed black coverly poster on the wall of a design studio",
  },
  {
    kind: "full",
    src: "/work/coverly/lockup.jpg",
    alt: "The coverly mark and wordmark in black on white",
  },
];

const SIZES = "(max-width: 1440px) 100vw, 1400px";

export default async function CoverlyCase() {
  const { covers } = await fetchLandingCovers();
  const domestic = covers.filter((c) =>
    /wife|husband|wives|family|marri|dollhouse|mistress/i.test(c.title),
  );
  const similar = (domestic.length >= 9 ? domestic : covers)
    .slice(0, 9)
    .map((c) => ({
      id: c.id,
      isbn13: null,
      title: c.title,
      author: c.author,
      imprint: null,
      year: null,
      image_url: c.src,
      palette: null,
    }));

  return (
    <div className={styles.page}>
      <header className={styles.bar}>
        <NMark />
      </header>

      <section
        className={`${coverly.page} ${coverly.intro} ${styles.hero}`}
        aria-label="coverly"
      >
        <div className={coverly.introWall} aria-hidden="true">
          <CoverMarquee
            covers={covers
              .slice(0, 48)
              .map((c) => ({ src: c.src, title: c.title }))}
          />
        </div>
        <div className={coverly.introShade} aria-hidden="true" />
        <div className={coverly.introMark}>
          <Mark />
          <span className={coverly.introWord}>coverly</span>
        </div>
      </section>

      <section className={styles.overview}>
        <h2 className={styles.label}>Overview</h2>
        <p className={styles.text}>
          coverly is a library of over 3,000 thriller covers, tagged by
          sub-genre, type, colour and tone, so designers can find their comps
          before the cover meeting. The brand borrows from the print viewing
          booth, where proofs are judged under neutral grey and even light, and
          lets the covers carry all the colour.
        </p>
      </section>

      <div className={styles.frames}>
        {FRAMES.map((frame) => {
          if (frame.kind === "pair")
            return (
              <div key={frame.items[0].src} className={styles.pair}>
                {frame.items.map((item) => (
                  <Image
                    key={item.src}
                    className={styles.frame}
                    src={item.src}
                    alt={item.alt}
                    width={1360}
                    height={1700}
                    sizes="(max-width: 1440px) 50vw, 680px"
                  />
                ))}
              </div>
            );
          if (frame.kind === "similar")
            return <SimilarRow key="similar" covers={similar} />;
          if (frame.kind === "film")
            return (
              <video
                key={frame.src}
                className={styles.frame}
                src={frame.src}
                poster={frame.poster}
                aria-label={frame.label}
                controls
                playsInline
                preload="none"
              />
            );
          return (
            <Image
              key={frame.src}
              className={styles.frame}
              src={frame.src}
              alt={frame.alt}
              width={2400}
              height={1350}
              sizes={SIZES}
            />
          );
        })}
      </div>
    </div>
  );
}
