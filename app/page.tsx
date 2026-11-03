import type { Metadata, Viewport } from "next";
import Shell from "./_signature/Shell";
import Header from "./_signature/Header";
import NavMark from "./_signature/NavMark";
import Intro from "./_signature/Intro";
import HeroFilm from "./_signature/HeroFilm";
import Work from "./_signature/Work";
import Moments from "./_signature/Moments";
import Playground from "./_signature/Playground";
import Index from "./_signature/Index";
import Finale from "./_signature/Finale";
import { wide } from "./_signature/fonts";
import { SITE_DESCRIPTION, SITE_TITLE, share } from "./shared-metadata";
import styles from "./home.module.css";

export const metadata: Metadata = share({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function Homepage() {
  return (
    <div className={wide.variable}>
      <Shell>
        <Intro fast />
        <div className={styles.top}>
          <Header mark={<NavMark />} role={false} />
        </div>
        <HeroFilm
          lead={["makeebook", "avis"]}
          card={{
            name: "Neil McArdle",
            line: "Product designer and builder.",
            place: "London",
          }}
        />
        <Work only={["/work/makeebook", "/work/coverly", "/work/avis"]} />
        <Moments />
        <Playground
          lead={[
            {
              title: "DoodleWire",
              line: "Wireframe from your phone",
              href: "/work/doodlewire",
              local: true,
              preview: "/home/leads/doodlewire.jpg",
            },
          ]}
          more={<Index rest />}
        />
        <Finale copyEmail />
      </Shell>
    </div>
  );
}
