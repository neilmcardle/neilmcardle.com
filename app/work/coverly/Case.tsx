import Link from "next/link";
import { media } from "@/lib/media";
import { CoverMarquee } from "../../coverly/CoverMarquee";
import { fetchLandingCovers } from "../../coverly/landing-data";
import { Mark } from "../../coverly/landing-demos";
import coverly from "../../coverly/landing.module.css";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { COVERLY } from "./chapters";
import SimilarRow from "./SimilarRow";
import { CASES } from "../cases";

export default async function CoverlyCase({ home }: { home?: string }) {
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
      home={home}
      hero={
        <section
          className={`${coverly.page} ${coverly.intro} ${styles.hero}`}
          aria-label="coverly"
        >
          <div className={coverly.introWall} aria-hidden="true">
            <CoverMarquee
              covers={covers
                .slice(0, 20)
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
      facts={[
        { label: "When", value: CASES["coverly"].when },
        { label: "Live", value: <Link href="/coverly">Open coverly</Link> },
      ]}
      overview={CASES["coverly"].overview}
      brief={<Story chapters={COVERLY} />}
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
