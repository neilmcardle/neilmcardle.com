import Image from "next/image";
import Link from "next/link";
import styles from "./home.module.css";
import { PAINTINGS } from "@/app/paintings/paintings";

export default function Paintings() {
  const featured = PAINTINGS.filter((p) => p.featured);

  return (
    <ul className={styles.paintingRow}>
      {featured.map((p) => (
        <li key={p.slug}>
          <Link href="/paintings" className={styles.painting}>
            <span className={styles.paintingFrame}>
              <Image
                src={p.image}
                alt={p.title}
                width={640}
                height={800}
                className={styles.paintingImg}
              />
            </span>
            <span className={styles.paintingTitle}>
              {p.title}
              {p.status === "sold" && (
                <span className={styles.soldDot} role="img" aria-label="Sold" />
              )}
            </span>
            <span className={styles.paintingMeta}>
              {p.year} · {p.medium}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
