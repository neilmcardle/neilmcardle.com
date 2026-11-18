import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Shell from "../_signature/Shell";
import NavMark from "../_signature/NavMark";
import Finale from "../_signature/Finale";
import SignOff from "../_signature/SignOff";
import Rows from "../_home/Rows";
import FaceCard from "../_home/FaceCard";
import LiveToy from "../_home/LiveToy";
import CoinCard from "../_home/CoinCard";
import { COLLECTION, PLAY, TOYS } from "../_home/data";
import { share } from "../shared-metadata";
import styles from "../_home/home.module.css";

const DESCRIPTION =
  "Games, histories, small toys and souvenirs, made alongside the work.";

export const metadata: Metadata = {
  title: "Playground · Neil McArdle",
  description: DESCRIPTION,
  ...share({
    title: "Playground",
    description: DESCRIPTION,
    path: "/playground",
  }),
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function Playground() {
  return (
    <Shell>
      <div className={styles.clip}>
        <div className={styles.page}>
          <header className={styles.top}>
            <Link href="/" aria-label="Neil McArdle, home">
              <NavMark />
            </Link>
          </header>

          <main id="main">
            <h1 className={styles.pageTitle}>Playground</h1>
            <p className={styles.more}>
              {DESCRIPTION} <Link href="/#work">Back to the work</Link>
            </p>

            <section
              className={styles.section}
              style={{ marginTop: 48 }}
              aria-label="Toys"
            >
              <div className={styles.shelf}>
                <figure>
                  <div className={styles.ignitionCard}>
                    <Finale card />
                  </div>
                  <figcaption>
                    <span>Ignition</span> Lift and press
                  </figcaption>
                </figure>
                <figure>
                  <FaceCard />
                  <figcaption>
                    <span>Particles</span> Hover or tap
                  </figcaption>
                </figure>
                <figure className={styles.coinFigure}>
                  <CoinCard />
                  <figcaption>
                    <span>Coin</span> Drag and spin
                  </figcaption>
                </figure>
                {TOYS.map((toy) => (
                  <figure key={toy.embed}>
                    <LiveToy
                      title={toy.title}
                      embed={toy.embed}
                      image={toy.image}
                    />
                    <figcaption>
                      <span>{toy.title}</span> {toy.verb}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className={styles.playRows}>
                <Rows pieces={[...PLAY, ...COLLECTION]} />
              </div>
            </section>
          </main>

          <SignOff bare />
        </div>
      </div>
    </Shell>
  );
}
