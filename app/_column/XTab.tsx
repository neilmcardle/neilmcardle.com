import type { ReactNode } from "react";
import { EMAIL, LINKEDIN } from "@/app/_home/data";
import { LinkedInIcon } from "@/components/LinkedInIcon";
import styles from "./column.module.css";

type Tab = {
  href: string;
  value: string;
  aria: string;
  external: boolean;
  icon: ReactNode;
};

const TABS: Tab[] = [
  {
    href: LINKEDIN,
    value: "in/neilmcardle",
    aria: "Neil McArdle on LinkedIn (opens in a new tab)",
    external: true,
    icon: <LinkedInIcon className={styles.xTabIcon} aria-hidden="true" />,
  },
  {
    href: `mailto:${EMAIL}`,
    value: EMAIL,
    aria: `Email ${EMAIL}`,
    external: false,
    icon: (
      <svg
        className={styles.xTabIcon}
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
    ),
  },
  {
    href: "https://x.com/BetterNeil",
    value: "x.com/BetterNeil",
    aria: "Follow @BetterNeil on X (opens in a new tab)",
    external: true,
    icon: (
      <svg
        className={styles.xTabIcon}
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function XTab() {
  return (
    <nav className={styles.socialTabs} aria-label="Contact">
      {TABS.map((tab) => (
        <a
          key={tab.href}
          className={styles.xTab}
          href={tab.href}
          aria-label={tab.aria}
          {...(tab.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          <span className={styles.xTabReveal} aria-hidden="true">
            <span className={styles.xTabInner}>
              <span className={styles.xTabText}>
                <span className={styles.xTabHandle}>{tab.value}</span>
              </span>
              <span className={styles.xTabRule} />
            </span>
          </span>
          {tab.icon}
        </a>
      ))}
    </nav>
  );
}
