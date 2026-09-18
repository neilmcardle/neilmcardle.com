import Link from "next/link";
import brand from "../components/marketing/brand/brand.module.css";
import styles from "./blog.module.css";

export function BlogCta() {
  return (
    <div className={styles.ctaPanel}>
      <h2 className={styles.ctaTitle}>Ready to write your ebook?</h2>
      <p className={styles.ctaText}>
        Start writing for free in your browser. No signup required.
      </p>
      <Link href="/make-ebook" className={brand.cta}>
        Start writing
      </Link>
    </div>
  );
}
