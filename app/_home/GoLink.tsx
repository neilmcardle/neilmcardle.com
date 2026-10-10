import type { ReactNode } from "react";
import styles from "./home.module.css";

export default function GoLink({
  href,
  label,
  newTab = false,
  lead,
}: {
  href: string;
  label: string;
  newTab?: boolean;
  lead?: ReactNode;
}) {
  const text = newTab ? `${label} (opens in a new tab)` : label;
  return (
    <a
      className={styles.go}
      href={href}
      aria-label={text}
      title={text}
      {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {lead}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {newTab ? (
          <>
            <path d="M12.5 9.5v2.75a1.25 1.25 0 01-1.25 1.25h-7.5a1.25 1.25 0 01-1.25-1.25v-7.5A1.25 1.25 0 013.75 3.5H6.5" />
            <path d="M9.5 2.5h4v4M13.5 2.5L8 8" />
          </>
        ) : (
          <path d="M5 11l6-6M6 5h5v5" />
        )}
      </svg>
    </a>
  );
}
