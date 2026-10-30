import Image from "next/image";
import styles from "./avis.module.css";

const BEFORE = [
  { name: "Make a reservation" },
  { name: "Pick your vehicle" },
  { name: "Protections", moved: true },
  { name: "Add-ons", moved: true },
  { name: "Review & Book" },
];

const AFTER = ["Make a reservation", "Pick your vehicle", "Review & Checkout"];

export function StepsDiagram() {
  return (
    <section className={styles.section} aria-labelledby="avis-steps">
      <div className={styles.head}>
        <h2 id="avis-steps" className={styles.label}>
          Five steps to three
        </h2>
        <p className={styles.text}>
          Protections and add-ons each had their own step. Now both sit on the
          review and checkout page.
        </p>
      </div>
      <div className={styles.plate}>
        <div className={styles.flow}>
          <p className={styles.flowName}>Before</p>
          <ol className={`${styles.steps} ${styles.five}`}>
            {BEFORE.map((step, i) => (
              <li
                key={step.name}
                className={styles.step}
                data-moved={step.moved || undefined}
              >
                <span className={styles.num}>{i + 1}</span>
                {step.name}
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.flow}>
          <p className={styles.flowName}>After</p>
          <ol className={`${styles.steps} ${styles.three}`}>
            {AFTER.map((name, i) => (
              <li key={name} className={styles.step}>
                <span className={styles.num}>{i + 1}</span>
                <span className={styles.stepBody}>
                  {name}
                  {i === 2 ? (
                    <span className={styles.inside}>
                      <span className={styles.chip} data-moved>
                        Protections
                      </span>
                      <span className={styles.chip} data-moved>
                        Add-ons
                      </span>
                      <span className={styles.chip}>Payment</span>
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

const PAGES = [
  {
    src: "/work/avis/pages/step-1-fold.jpg",
    name: "Make a reservation",
    alt: "The top of the Avis homepage, with the pick-up location and dates",
  },
  {
    src: "/work/avis/pages/step-2-fold.jpg",
    name: "Pick your vehicle",
    alt: "The top of the results page, with filters and the first vehicles and their daily prices",
  },
  {
    src: "/work/avis/pages/step-3-fold.jpg",
    name: "Review & Checkout",
    alt: "The top of the review and checkout page, with the booking form beside the booking summary",
  },
];

export function PagesFlow() {
  return (
    <ol className={styles.pages} aria-label="The three steps">
      {PAGES.map((page, i) => (
        <li key={page.src} className={styles.page}>
          {i > 0 ? (
            <svg
              className={styles.arrow}
              viewBox="0 0 32 16"
              aria-hidden="true"
            >
              <path d="M1 8h28M22 1.5 28.5 8 22 14.5" />
            </svg>
          ) : null}
          <span className={styles.pageName}>
            <span className={styles.num}>{i + 1}</span>
            {page.name}
          </span>
          <Image
            className={styles.pageImage}
            src={page.src}
            alt={page.alt}
            width={2880}
            height={2000}
            sizes="(max-width: 899px) 90vw, 440px"
          />
        </li>
      ))}
    </ol>
  );
}

type Part = {
  src: string;
  width: number;
  height: number;
  span: 1 | 2 | 4;
  tall?: boolean;
  alt: string;
  caption: string;
};

const PARTS: Part[] = [
  {
    src: "/work/avis/parts/bundle.jpg",
    width: 856,
    height: 246,
    span: 4,
    alt: "The Essential Protection card, marked Most Popular Bundle, listing what it covers with a daily price, the original price struck through and 10% off",
    caption:
      "Protection bundle. The most popular cover, with its daily price and saving.",
  },
  {
    src: "/work/avis/parts/confirmed.jpg",
    width: 847,
    height: 73,
    span: 2,
    alt: "A green banner reading: Your protection is selected. Thank you for protecting your trip.",
    caption: "Confirmation once protection is chosen.",
  },
  {
    src: "/work/avis/parts/summary.jpg",
    width: 424,
    height: 462,
    span: 2,
    tall: true,
    alt: "The booking summary from Protections and Add-ons down: savings, each tax and fee itemised, and the total",
    caption:
      "The summary totals protections, add-ons, savings, taxes and fees.",
  },
  {
    src: "/work/avis/parts/more-protection.jpg",
    width: 856,
    height: 108,
    span: 2,
    alt: "A collapsed row titled More protection options, with the line: Add additional coverage for extra peace of mind",
    caption: "More cover, folded away until it's needed.",
  },
  {
    src: "/work/avis/parts/addon.jpg",
    width: 208,
    height: 192,
    span: 1,
    alt: "The Mobile WiFi add-on card with a details link, a daily price and an empty checkbox",
    caption: "An add-on: name, details, daily price and a checkbox.",
  },
  {
    src: "/work/avis/parts/addon-selected.jpg",
    width: 203,
    height: 184,
    span: 1,
    alt: "The Mobile WiFi add-on card with its checkbox ticked",
    caption: "The same add-on, selected.",
  },
  {
    src: "/work/avis/parts/included.jpg",
    width: 203,
    height: 165,
    span: 1,
    alt: "The Roadside Assistance add-on card, tinted green with an Included in bundle badge",
    caption: "Roadside Assistance, marked as included in the bundle.",
  },
  {
    src: "/work/avis/parts/child-seats.jpg",
    width: 203,
    height: 189,
    span: 1,
    alt: "The Child Safety Seats add-on card with a quantity stepper set to 2",
    caption: "Child seats, chosen by quantity.",
  },
  {
    src: "/work/avis/parts/fuel.jpg",
    width: 203,
    height: 165,
    span: 1,
    alt: "The Fuel Plan add-on card, priced at an estimated amount per gallon",
    caption: "Fuel Plan, priced per gallon.",
  },
  {
    src: "/work/avis/parts/etoll.jpg",
    width: 203,
    height: 165,
    span: 1,
    alt: "The e-Toll Unlimited add-on card with its checkbox ticked",
    caption: "Ticking an add-on updates the total straight away.",
  },
];

export function CoverageParts() {
  return (
    <section className={styles.section} aria-labelledby="avis-parts">
      <div className={styles.head}>
        <h2 id="avis-parts" className={styles.label}>
          Protections and add-ons
        </h2>
        <p className={styles.text}>
          On the new checkout, protections and add-ons had to sit alongside the
          booking form. Each became a small component with its own states.
        </p>
      </div>
      <ul className={styles.parts}>
        {PARTS.map((part) => (
          <li
            key={part.src}
            className={styles.part}
            data-span={part.span}
            data-tall={part.tall || undefined}
          >
            <span className={styles.partArt}>
              <Image
                className={styles.partImage}
                src={part.src}
                alt={part.alt}
                width={part.width}
                height={part.height}
                style={{ width: `calc(var(--z) * ${part.width}px)` }}
                sizes="(max-width: 899px) 90vw, 1000px"
              />
            </span>
            <span className={styles.caption}>{part.caption}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SystemSheet() {
  return (
    <section className={styles.section} aria-labelledby="avis-system">
      <div className={styles.head}>
        <h2 id="avis-system" className={styles.label}>
          The system behind the cards
        </h2>
        <p className={styles.text}>
          Under the cards is a small system: one 16px rhythm, 8px corners and a
          28px row pitch.
        </p>
      </div>
      <Image
        className={styles.sheet}
        src="/work/avis/system-sheet.png"
        alt="A black and white dimensional drawing of the protection bundle card: a plan view with every padding, gap and radius labelled as a variable, the card inside its panel, an exploded view of its layers, close-ups of the header and the price column, and tables of the values"
        width={3520}
        height={2196}
        sizes="(max-width: 899px) 100vw, 1300px"
      />
    </section>
  );
}
