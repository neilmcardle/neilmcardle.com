import type { Metadata } from "next";
import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import { CoverageParts, PagesFlow, StepsDiagram } from "./Parts";

export const metadata: Metadata = {
  title: "Avis checkout · Neil McArdle",
  description: "Redesigning the Avis car rental checkout.",
  robots: { index: false, follow: false },
};

export default function AvisCase() {
  return (
    <CaseStudy
      hero={
        <section className={styles.hero} aria-label="Avis checkout">
          <Image
            className={styles.heroImage}
            src="/work/avis/hero-logo.jpg"
            alt="The Avis logo in red on a light grey background"
            fill
            priority
            sizes="100vw"
          />
        </section>
      }
      overview="At Avis Budget Group I redesigned the booking flow, taking it from five steps to three: make a reservation, pick your vehicle, then review and checkout. I designed the review and checkout page, now live on avis.com. Conversion rose by 5% during testing."
      frames={[
        {
          kind: "film",
          src: "/work/avis/three-steps.mp4",
          poster: "/work/avis/three-steps-start.jpg",
          label:
            "Booking an Avis car in three steps: searching, picking a vehicle and rate, then reviewing the booking and adding protection",
        },
        { kind: "custom", id: "steps", node: <StepsDiagram /> },
        { kind: "custom", id: "pages", node: <PagesFlow /> },
        { kind: "custom", id: "parts", node: <CoverageParts /> },
        {
          kind: "full",
          src: "/work/avis/end-logo.jpg",
          alt: "The Avis logo in red on white",
        },
      ]}
    />
  );
}
