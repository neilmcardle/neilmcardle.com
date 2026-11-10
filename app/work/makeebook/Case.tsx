import { Mark } from "../../make-ebook/components/marketing/brand/BrandMark";
import brand from "../../make-ebook/components/marketing/brand/brand.module.css";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { MAKEEBOOK } from "./chapters";

export default function MakeebookCase({ home }: { home?: string }) {
  return (
    <CaseStudy
      home={home}
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
      facts={[
        { label: "When", value: "2024 to now" },
        {
          label: "Live",
          value: (
            <a href="https://makeebook.ink" rel="noopener">
              makeebook.ink
            </a>
          ),
        },
      ]}
      overview="makeebook is an eBook editor for writers. Chapters are written and revised in a quiet, private workspace, then exported as EPUB, PDF and DOCX for Kindle, Apple Books and Kobo. Book Mind reads the whole manuscript and answers questions about it, only when the writer asks."
      brief={<Story chapters={MAKEEBOOK} />}
      frames={[]}
    />
  );
}
