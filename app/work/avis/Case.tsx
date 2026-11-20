import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { AVIS } from "./chapters";
import { CASES } from "../cases";

export default function AvisCase({ home }: { home?: string }) {
  return (
    <CaseStudy
      home={home}
      hero={
        <section className={styles.hero} aria-label="Avis checkout">
          <Image
            className={styles.heroImage}
            src="/work/avis/hero-cover.jpg"
            alt="Five steps. Now three. Over Avis red, the protection bundle card beside the new review and checkout page"
            fill
            priority
            sizes="100vw"
          />
        </section>
      }
      title="3-Step Checkout"
      overview={CASES["avis"].overview}
      facts={[
        { label: "When", value: CASES["avis"].when },
        { label: "Company", value: "Avis Budget Group" },
        { label: "Role", value: "Product design, checkout" },
        { label: "Result", value: "Better step progression in A/B tests" },
        {
          label: "Live",
          value: (
            <a href="https://www.avis.com" target="_blank" rel="noreferrer">
              avis.com
            </a>
          ),
        },
      ]}
      brief={<Story chapters={AVIS} />}
      frames={[]}
    />
  );
}
