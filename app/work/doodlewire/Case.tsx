import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";
import Story from "../Story";
import { DOODLEWIRE } from "./chapters";
import { CASES } from "../cases";

export default function DoodleWireCase({ home }: { home?: string }) {
  return (
    <CaseStudy
      home={home}
      hero={
        <section className={styles.hero} aria-label="DoodleWire">
          <Image
            className={styles.heroImage}
            src="/work/doodlewire/hero.jpg"
            alt="The DoodleWire mark on a layout grid"
            fill
            priority
            sizes="100vw"
          />
        </section>
      }
      facts={[
        { label: "When", value: CASES["doodlewire"].when },
        {
          label: "Live",
          value: (
            <a
              href="https://apps.apple.com/us/app/doodlewire/id6771274835"
              rel="noopener"
            >
              App Store
            </a>
          ),
        },
      ]}
      overview={CASES["doodlewire"].overview}
      brief={<Story chapters={DOODLEWIRE} />}
      frames={[
        {
          kind: "pair",
          items: [
            {
              src: "/work/doodlewire/ipad-dashboard-flat.jpg",
              alt: "A dashboard wireframe drawn in DoodleWire on iPad",
            },
            {
              src: "/work/doodlewire/ipad-grids-flat.jpg",
              alt: "The same dashboard wireframe with the layout grid showing",
            },
          ],
        },
        {
          kind: "full",
          src: "/work/doodlewire/lockup.jpg",
          alt: "The DoodleWire mark and wordmark in black on white",
        },
      ]}
    />
  );
}
