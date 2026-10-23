import Image from "next/image";
import styles from "./home.module.css";

const SHOTS = [
  "A blank canvas, ready to draw",
  "Suggestions for a shape it isn't sure about",
  "A finished sign in wireframe",
  "Editing an image placeholder",
  "Renaming a screen",
  "Choosing a layout grid",
  "Elements snapped to the grid",
  "Share as an image, a spec for AI or HTML",
  "The share sheet with the exported PNG",
];

export default function DoodleWireShots() {
  return (
    <ul className={styles.dwShots} aria-label="DoodleWire screens">
      {SHOTS.map((caption, i) => (
        <li key={caption} className={styles.dwShot}>
          <Image
            src={`/doodlewire/flat/${i + 1}.jpg`}
            alt={`DoodleWire: ${caption}`}
            width={1360}
            height={1700}
            sizes="(max-width: 600px) 60vw, 252px"
          />
        </li>
      ))}
    </ul>
  );
}
