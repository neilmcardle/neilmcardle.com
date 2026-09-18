import Image from "next/image";
import styles from "./home.module.css";

const SHOTS = [
  "Share doodle love",
  "Create wireframes",
  "Edit doodles",
  "Add multiple pages",
  "Align doodles to the layout",
  "Snap doodles to the grid",
  "Correct your doodles",
];

export default function DoodleWireShots() {
  return (
    <ul
      className={styles.dwShots}
      aria-label="DoodleWire App Store screenshots"
    >
      {SHOTS.map((caption, i) => (
        <li key={caption} className={styles.dwShot}>
          <Image
            src={`/doodlewire/appstore/${i + 1}.jpg`}
            alt={`DoodleWire screenshot: ${caption}`}
            width={828}
            height={1792}
            sizes="252px"
          />
        </li>
      ))}
    </ul>
  );
}
