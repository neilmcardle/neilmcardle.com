import Link from "next/link";
import styles from "./studio.module.css";

export default function StudioChrome() {
  return (
    <header className={styles.masthead}>
      <Link href="/studio" className={styles.wordmark}>
        Signal &amp; Noise
      </Link>
      <p className={styles.tagline}>Design exploration</p>
    </header>
  );
}
