"use client";

import React from "react";
import styles from "../styles/studio.module.css";

export default function AccountAvatar({ email }: { email?: string | null }) {
  const initial = (email?.trim()[0] ?? "").toUpperCase();
  return (
    <span className={styles.avatar} aria-hidden="true">
      {initial || (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0116 0" />
        </svg>
      )}
    </span>
  );
}
