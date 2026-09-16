"use client";

import Link from "next/link";
import { openCookieConsent } from "@/components/CookieConsent";
import styles from "./brand.module.css";

export function BrandFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.shell} ${styles.footerInner}`}>
        <span>&copy; makeebook {new Date().getFullYear()}</span>
        <nav className={styles.footerLinks} aria-label="Footer">
          <Link href="/make-ebook/blog" className={styles.footerLink}>
            Blog
          </Link>
          <a
            href="https://x.com/makeEbook"
            className={styles.footerLink}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="makeebook on X"
          >
            @makeebook
          </a>
          <a
            href="https://makeebook.ink/privacy"
            className={styles.footerLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy
          </a>
          <a
            href="https://makeebook.ink/terms"
            className={styles.footerLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms
          </a>
          <button
            type="button"
            onClick={openCookieConsent}
            className={styles.footerLink}
          >
            Cookie preferences
          </button>
        </nav>
        <span>
          A{" "}
          <a
            href="https://neilmcardle.com"
            className={`${styles.footerLink} ${styles.footerHome}`}
          >
            neilmcardle.com
          </a>{" "}
          project.
        </span>
      </div>
    </footer>
  );
}
