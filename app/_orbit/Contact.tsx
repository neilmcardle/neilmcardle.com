import { EMAIL, LINKEDIN } from "@/app/_home/data";
import { LinkedInIcon } from "@/components/LinkedInIcon";
import styles from "./orbit.module.css";

export default function Contact() {
  return (
    <nav className={styles.contact} aria-label="Contact">
      <a
        href="https://x.com/BetterNeil"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="@BetterNeil on X (opens in a new tab)"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={LINKEDIN}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Neil McArdle on LinkedIn (opens in a new tab)"
      >
        <LinkedInIcon aria-hidden="true" />
      </a>
      <a href={`mailto:${EMAIL}`} aria-label={`Email ${EMAIL}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="14" rx="2.5" />
          <path d="M3.5 7l8.5 6 8.5-6" />
        </svg>
      </a>
    </nav>
  );
}
