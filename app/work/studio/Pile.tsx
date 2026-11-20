import Image from "next/image";
import styles from "./studio.module.css";

const CARDS = [
  {
    src: "/work/studio/before.jpg",
    alt: "The studio before, with no name in view",
    width: 1440,
    height: 900,
    place: styles.before,
  },
  {
    src: "/work/studio/profile-card.jpg",
    alt: "The profile card",
    width: 1200,
    height: 1131,
    place: styles.card,
  },
  {
    src: "/work/studio/drawer.jpg",
    alt: "The drawer before and after being rebuilt",
    width: 1300,
    height: 512,
    place: styles.drawer,
  },
  {
    src: "/work/studio/outline-editor.jpg",
    alt: "The outline editor over the studio",
    width: 1440,
    height: 900,
    place: styles.editor,
  },
  {
    src: "/work/studio/name-tag.jpg",
    alt: "The name tag above the character on a phone",
    width: 416,
    height: 726,
    place: styles.phone,
  },
];

export default function Pile() {
  return (
    <div className={styles.pile}>
      {CARDS.map((card, index) => (
        <figure key={card.src} className={`${styles.shot} ${card.place}`}>
          <Image
            data-zoom=""
            src={card.src}
            alt={card.alt}
            width={card.width}
            height={card.height}
            priority={index > 2}
            sizes="(max-width: 900px) 50vw, 560px"
          />
        </figure>
      ))}
    </div>
  );
}
