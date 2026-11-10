import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Shell from "../../_signature/Shell";
import Header from "../../_signature/Header";
import Finale from "../../_signature/Finale";
import shell from "../../_signature/signature.module.css";
import { share } from "../../shared-metadata";
import Companies from "./Companies";
import { AS_OF, COMPANIES, SOURCE } from "./rows";
import styles from "./companies.module.css";

const PATH = "/explorations/how-companies-started";
const TITLE = "How the World's 100 Biggest Companies Started";
const DESCRIPTION =
  "Apple started on $1,300. Dell on $1,000. See what it cost to start each of the world's 100 most valuable companies, with filters by sector, country and era.";

export const metadata: Metadata = {
  title: `${TITLE} | Free Tool`,
  description: DESCRIPTION,
  ...share({ title: TITLE, description: DESCRIPTION, path: PATH }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

const asOf = new Date(`${AS_OF}T12:00:00Z`).toLocaleDateString("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: TITLE,
  description: DESCRIPTION,
  url: `https://neilmcardle.com${PATH}`,
  dateModified: AS_OF,
  creator: { "@type": "Person", name: "Neil McArdle" },
  isBasedOn: SOURCE,
  citation: SOURCE,
  variableMeasured: [
    "Market capitalisation (US$ billions)",
    "Year founded",
    "Starting cost",
    "Sector",
    "Country",
  ],
};

export default function Page() {
  return (
    <Shell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Header back="/#play" backLabel="Playground" />
      <main id="main" className={`${shell.wrap} ${styles.page}`}>
        <h1 className={styles.title}>{TITLE}</h1>
        <p className={styles.intro}>
          What it cost to start each of the 100 most valuable public companies,
          from a sold camper van to a state-backed joint venture.
        </p>
        <Companies companies={COMPANIES} />
        <div className={styles.notes}>
          <p>
            Tiny start: under about $10k.
            <br />
            Small: $10k to $1m.
            <br />
            Big: $1m or more.
            <br />
            Not a startup: began as a state body, a merger or a spin-off.
          </p>
          <p>
            Market caps are a snapshot and change daily. Starting costs are
            approximate, in the money of the day, and often based on
            founders&rsquo; recollections.
          </p>
          <p>Market values as of {asOf}.</p>
          <p>
            Sources: market values from{" "}
            <a href={SOURCE} rel="noopener">
              CompaniesMarketCap
            </a>
            , founding stories from each company&rsquo;s published history.
          </p>
          <p>
            <Link href="/#play">More things I&rsquo;ve made in Playground</Link>
          </p>
        </div>
      </main>
      <Finale signOff />
    </Shell>
  );
}
