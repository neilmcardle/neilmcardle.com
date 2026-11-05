import Link from "next/link";
import { media } from "@/lib/media";
import { CoverageParts, PagesFlow, StepsDiagram } from "./Parts";
import type { Chapter } from "../Story";
import styles from "../story.module.css";

export const AVIS: Chapter[] = [
  {
    label: "The problem",
    body: "Booking a car took five steps, with car insurance and extras each on a page of their own. We believed the length was losing people to decision fatigue and decided to reduce down to three steps.",
    visual: <StepsDiagram />,
  },
  {
    label: "Decision 1",
    title: "Fold protection and add-ons into checkout",
    body: "Protection and add-ons moved onto the review and checkout page, so booking takes three steps: make a reservation, pick your vehicle, review and checkout.",
    instead:
      "a page of their own. There are only a few protection products, so a whole step for them was friction people didn't need.",
    visual: <PagesFlow />,
  },
  {
    label: "Decision 2",
    title: "Make the bundle a recommendation",
    body: "The Essential bundle leads as a single card, marked most popular, with what it covers, its daily price and the saving. Choosing it shows a clear confirmation.",
    instead:
      "a plain choice between No protection and one bundle, which hid the cover some people wanted.",
    visual: (
      <CoverageParts
        only={[{ name: "bundle" }, { name: "confirmed", span: 4 }]}
      />
    ),
  },
  {
    label: "Decision 3",
    title: "Fold extra cover away",
    body: "The individual protection items sit in one closed row under the bundle until someone wants them.",
    instead: "showing every item open.",
    visual: <CoverageParts only={[{ name: "more-protection", span: 4 }]} />,
  },
  {
    label: "The parts",
    title: "Protections and add-ons",
    body: "On the new checkout, protections and add-ons had to sit alongside the booking form. Each became a small component with its own states.",
    visual: (
      <CoverageParts
        only={[
          { name: "summary" },
          { name: "addon" },
          { name: "addon-selected" },
          { name: "included" },
          { name: "child-seats" },
          { name: "fuel" },
          { name: "etoll" },
        ]}
      />
    ),
  },
  {
    label: "The result",
    body: "A/B tests against the existing checkout, with conversion as the main measure. The three-step version lifted conversion 5%, and a second round refined how protection is presented.",
    visual: (
      <video
        className={styles.film}
        src={media("/work/avis/avis-3-step-c.mp4")}
        poster="/work/avis/three-steps-start.jpg"
        aria-label="Booking an Avis car in three steps: searching, picking a vehicle and rate, then reviewing the booking and adding protection"
        controls
        playsInline
        preload="none"
      />
    ),
  },
  {
    label: "What I led",
    body: "I led the design of the review and checkout page, now live on avis.com: the flow, the layout, and the interaction and motion. I worked with a product manager, a data analyst and a front-end developer.",
  },
  {
    label: "Where I took it next",
    body: (
      <>
        On my own time I kept going: a concept for a console that spots a broken
        checkout and ships the fix, with sample data.{" "}
        <Link href="/explorations/self-healing-checkout">
          See the self-healing checkout
        </Link>
        .
      </>
    ),
  },
];
