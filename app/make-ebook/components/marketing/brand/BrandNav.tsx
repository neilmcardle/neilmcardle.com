"use client";

import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "./BrandMark";
import styles from "./brand.module.css";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#pricing", label: "Pricing" },
  { href: "/make-ebook/signin", label: "Sign in" },
];

type BrandNavProps = {
  onStartWriting: () => void;
};

export function BrandNav({ onStartWriting }: BrandNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.nav}>
      <div className={`${styles.shell} ${styles.navInner}`}>
        <Link href="/make-ebook" className={styles.brand}>
          <Wordmark />
        </Link>
        <nav className={styles.links} aria-label="Primary">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className={styles.link}>
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="lab-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            {open ? (
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M3 7h14M3 13h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>
      <div
        id="lab-menu"
        className={`${styles.menu} ${open ? styles.menuOpen : ""}`}
      >
        {LINKS.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={styles.menuLink}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        <button
          type="button"
          className={styles.cta}
          onClick={() => {
            setOpen(false);
            onStartWriting();
          }}
        >
          Start writing. It&rsquo;s free.
        </button>
      </div>
    </header>
  );
}
