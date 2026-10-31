import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { media } from "@/lib/media";
import { PODIUM_STILLS } from "../../_signature/data/podium";
import { SHOWCASE } from "../../_signature/data/showcase";
import CaseLayout from "../../_signature/CaseLayout";
import Stills from "../../_signature/Stills";
import styles from "../../_signature/podium.module.css";

export const metadata: Metadata = {
  title: "Podium · Neil McArdle",
  description: SHOWCASE.Podium.what,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0c",
};

export default function PodiumPage() {
  return (
    <CaseLayout
      hero={
        <section className={styles.hero} aria-label="Podium">
          <Image
            className={styles.art}
            src="/home/podium/keyart.jpg"
            alt="A boy in a blue hoodie stands alone on a wet concrete deck below a tower block in the fog"
            fill
            priority
            sizes="100vw"
          />
          <Image
            className={styles.logo}
            src="/home/podium/logo.png"
            alt="Podium"
            width={624}
            height={304}
            sizes="320px"
          />
        </section>
      }
      title="Podium"
      overview={SHOWCASE.Podium.what}
      facts={[
        { label: "Type", value: SHOWCASE.Podium.type },
        { label: "Role", value: SHOWCASE.Podium.role },
        { label: "Status", value: SHOWCASE.Podium.status },
      ]}
      frames={[
        {
          kind: "film",
          src: media("/home/podium/trailer-02.mp4"),
          poster: "/home/podium/trailer-02-poster.jpg",
          label: "Podium trailer",
        },
      ]}
    >
      <section className={styles.stills} aria-labelledby="podium-stills">
        <h2 className={styles.heading} id="podium-stills">
          Stills
        </h2>
        <Stills items={PODIUM_STILLS} label="Podium stills" />
      </section>
    </CaseLayout>
  );
}
