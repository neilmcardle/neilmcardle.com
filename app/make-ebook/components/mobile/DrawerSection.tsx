"use client";

import React from "react";
import CollapsibleSection from "../CollapsibleSection";
import styles from "../../styles/studio.module.css";

interface DrawerSectionProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  alert?: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export default function DrawerSection({
  icon,
  label,
  count,
  alert = false,
  open,
  onToggle,
  children,
}: DrawerSectionProps) {
  return (
    <section className={styles.drawerSection}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`${styles.drawerRow} ${open ? styles.drawerRowOpen : ""}`}
      >
        <span className={styles.drawerRowLead}>
          <span className={styles.drawerRowIcon}>{icon}</span>
          <span className={styles.drawerLabel}>{label}</span>
          {count !== undefined && (
            <span className={styles.panelCount}>{count}</span>
          )}
          {alert && (
            <span className={styles.drawerAlert} aria-label="Action needed" />
          )}
        </span>
        <svg
          className={`${styles.drawerChevron} ${open ? styles.drawerChevronOpen : ""}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <CollapsibleSection expanded={open}>
        <div className={styles.drawerSectionBody}>{children}</div>
      </CollapsibleSection>
    </section>
  );
}
