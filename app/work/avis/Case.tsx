import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { AVIS } from "./chapters";

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
      overview="At Avis Budget Group I redesigned the booking flow, taking it from five steps to three: make a reservation, pick your vehicle, then review and checkout. I designed the review and checkout page, now live on avis.com. Conversion rose by 5% during testing."
      facts={[
        { label: "Company", value: "Avis Budget Group" },
        { label: "Role", value: "Product design, checkout" },
        { label: "Result", value: "Conversion up 5% in testing" },
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
