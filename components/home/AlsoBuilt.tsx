import Link from "next/link";
import styles from "./home.module.css";

const ITEMS: { name: string; line: string; href: string }[] = [
  {
    name: "Icon Animator",
    line: "SVG icon animation presets. Tune the timing, copy the CSS out.",
    href: "/icon-animator",
  },
  {
    name: "Promptr",
    line: "Write a prompt, score it against a rubric, rewrite it.",
    href: "/promptr",
  },
];

export default function AlsoBuilt() {
  return (
    <ul className={styles.shelf}>
      {ITEMS.map((item) => (
        <li key={item.name}>
          <Link href={item.href} className={styles.shelfItem}>
            <span className={styles.shelfName}>{item.name}</span>
            <span className={styles.shelfLine}>{item.line}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
