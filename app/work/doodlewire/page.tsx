import type { Metadata } from "next";
import Image from "next/image";
import styles from "../case.module.css";
import CaseStudy from "../CaseStudy";

export const metadata: Metadata = {
  title: "DoodleWire · Neil McArdle",
  description: "Brand and product design for DoodleWire.",
  robots: { index: false, follow: false },
};

export default function DoodleWireCase() {
  return (
    <CaseStudy
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
              src: "/work/doodlewire/phone-pink.jpg",
              alt: "DoodleWire on an iPhone, editing an image placeholder",
            },
            {
              src: "/work/doodlewire/phone-black.jpg",
              alt: "DoodleWire on an iPhone, snapping elements to the grid",
            },
          ],
        },
        {
          kind: "full",
          src: "/work/doodlewire/desk-phone.jpg",
          alt: "An iPhone showing a DoodleWire sign in wireframe on a desk beside a notebook and coffee",
        },
        {
          kind: "pair",
          items: [
            {
              src: "/work/doodlewire/ipad-dashboard.jpg",
              alt: "A dashboard wireframe drawn in DoodleWire on iPad",
            },
            {
              src: "/work/doodlewire/ipad-grids.jpg",
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
