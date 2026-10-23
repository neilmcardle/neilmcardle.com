import type { Metadata } from "next";
import { Mark } from "../../make-ebook/components/marketing/brand/BrandMark";
import brand from "../../make-ebook/components/marketing/brand/brand.module.css";
import {
  ExportDemo,
  RewriteDemo,
} from "../../make-ebook/components/marketing/brand/demos";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";

export const metadata: Metadata = {
  title: "makeebook · Neil McArdle",
  description: "Brand and product design for makeebook.",
  robots: { index: false, follow: false },
};

export default function MakeebookCase() {
  return (
    <CaseStudy
      hero={
        <section
          className={`${brand.intro} ${styles.hero}`}
          aria-label="makeebook"
        >
          <iframe
            src="/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/library-lamp.jpg"
            title=""
            aria-hidden="true"
            tabIndex={-1}
            loading="eager"
            className={brand.introRain}
          />
          <Mark className={brand.introMark} />
        </section>
      }
      overview="makeebook is an eBook editor for writers. Chapters are written and revised in a quiet, private workspace, then exported as EPUB, PDF and DOCX for Kindle, Apple Books and Kobo. Book Mind reads the whole manuscript and answers questions about it, only when the writer asks."
      frames={[
        {
          kind: "film",
          src: "/home/makeebook-promo.mp4",
          poster: "/home/makeebook-promo-logo.jpg",
          label: "makeebook product film",
        },
        {
          kind: "pair",
          items: [
            {
              src: "/work/makeebook/mark-ink-paper.jpg",
              alt: "The makeebook mark in paper white on printer's ink",
            },
            {
              src: "/work/makeebook/mark-paper.jpg",
              alt: "The makeebook mark in ink on cream paper",
            },
          ],
        },
        {
          kind: "full",
          src: "/work/makeebook/editor.jpg",
          alt: "The makeebook editor with a chapter open and Book Mind answering a question about the ending",
        },
        {
          kind: "custom",
          id: "rewrite",
          node: (
            <div className={styles.demo}>
              <RewriteDemo compact />
            </div>
          ),
        },
        {
          kind: "custom",
          id: "export",
          node: (
            <div className={`${styles.demo} ${styles.demoLarge}`}>
              <ExportDemo />
            </div>
          ),
        },
        {
          kind: "full",
          src: "/work/makeebook/lockup.jpg",
          alt: "The makeebook mark and wordmark in ink on cream paper",
        },
      ]}
    />
  );
}
