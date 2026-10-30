import { media } from "@/lib/media";
import type { Metadata } from "next";
import { CoverMarquee } from "../../coverly/CoverMarquee";
import { fetchLandingCovers } from "../../coverly/landing-data";
import { Mark } from "../../coverly/landing-demos";
import coverly from "../../coverly/landing.module.css";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import SimilarRow from "./SimilarRow";

export const metadata: Metadata = {
  title: "coverly · Neil McArdle",
  description: "Brand and product design for coverly.",
  robots: { index: false, follow: false },
};

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
    <CaseStudy
      hero={
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
      }
      overview="coverly is a library of over 3,000 thriller covers, tagged by sub-genre, type, colour and tone, so designers can find their comps before the cover meeting. The brand borrows from the print viewing booth, where proofs are judged under neutral grey and even light, and lets the covers carry all the colour."
      frames={[
        {
          kind: "film",
          src: media("/home/coverly-promo.mp4"),
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
        {
          kind: "custom",
          id: "similar",
          node: <SimilarRow covers={similar} />,
        },
        {
          kind: "full",
          src: "/work/coverly/cover-count-plain.jpg",
          alt: "3,079 cover designs",
        },
        {
          kind: "full",
          src: "/work/coverly/lockup.jpg",
          alt: "The coverly mark and wordmark in black on white",
        },
      ]}
    />
  );
}
