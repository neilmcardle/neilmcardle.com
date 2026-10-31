import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";

export default function DoodleWireCase({ variant }: { variant?: "signature" }) {
  return (
    <CaseStudy
      variant={variant}
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
      overview="DoodleWire is a phone sketchpad for interface ideas. Draw a screen with your finger, and the ink snaps into a clean low-fidelity wireframe on an 8pt grid. Share it as an image, as a spec for AI tools or as a single HTML file."
      frames={[
        {
          kind: "pair",
          items: [
            {
              src: "/work/doodlewire/flat-edit.jpg",
              alt: "DoodleWire on iPhone, editing an image placeholder",
            },
            {
              src: "/work/doodlewire/flat-grid.jpg",
              alt: "DoodleWire on iPhone, a sign-in wireframe snapped to the layout grid",
            },
          ],
        },
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
