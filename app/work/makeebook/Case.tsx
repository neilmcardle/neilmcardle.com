import { Mark } from "../../make-ebook/components/marketing/brand/BrandMark";
import brand from "../../make-ebook/components/marketing/brand/brand.module.css";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { MAKEEBOOK } from "./chapters";
import { CASES } from "../cases";

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
        { label: "When", value: CASES["makeebook"].when },
        {
          label: "Live",
          value: (
            <a href="https://makeebook.ink" rel="noopener">
              makeebook.ink
            </a>
          ),
        },
      ]}
      overview={CASES["makeebook"].overview}
      brief={<Story chapters={MAKEEBOOK} />}
      frames={[]}
    />
  );
}
