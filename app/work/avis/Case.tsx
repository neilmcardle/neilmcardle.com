import { media } from "@/lib/media";
import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import { CoverageParts, PagesFlow, StepsDiagram, SystemSheet } from "./Parts";

export default function AvisCase({ variant }: { variant?: "signature" }) {
  return (
    <CaseStudy
      variant={variant}
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
      frames={[
        {
          kind: "film",
          src: media("/work/avis/avis-3-step-c.mp4"),
          poster: "/work/avis/three-steps-start.jpg",
          label:
            "Booking an Avis car in three steps: searching, picking a vehicle and rate, then reviewing the booking and adding protection",
        },
        { kind: "custom", id: "steps", node: <StepsDiagram /> },
        { kind: "custom", id: "pages", node: <PagesFlow /> },
        { kind: "custom", id: "parts", node: <CoverageParts /> },
        { kind: "custom", id: "system", node: <SystemSheet /> },
        {
          kind: "full",
          src: "/work/avis/end-logo.jpg",
          alt: "The Avis logo in red on white",
        },
      ]}
    />
  );
}
