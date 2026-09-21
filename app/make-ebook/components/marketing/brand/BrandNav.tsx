"use client";

import Link from "next/link";
import { useState } from "react";
import { Wordmark } from "./BrandMark";
import styles from "./brand.module.css";

const SIGNUP = "/make-ebook/signin?mode=signup";

type BrandNavProps = {
  onStartWriting?: () => void;
  onLanding?: boolean;
};

export function BrandNav({ onStartWriting, onLanding = false }: BrandNavProps) {
  const [open, setOpen] = useState(false);
  const home = onLanding ? "" : "/make-ebook";
  const links = [
    { href: `${home}#product`, label: "Product" },
    { href: `${home}#pricing`, label: "Pricing" },
    { href: "/make-ebook/signin?mode=signin", label: "Sign in" },
  ];

  return (
    <header className={styles.nav}>
      <div className={`${styles.shell} ${styles.navInner}`}>
        <Link href="/make-ebook" className={styles.brand}>
          <Wordmark />
        </Link>
        <nav className={styles.links} aria-label="Primary">
          {links.map((l) => (
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
        {links.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className={styles.menuLink}
            onClick={() => setOpen(false)}
          >
            {l.label}
          </Link>
        ))}
        {onStartWriting ? (
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
        ) : (
          <Link
            href={SIGNUP}
            className={styles.cta}
            onClick={() => setOpen(false)}
          >
            Start writing. It&rsquo;s free.
          </Link>
        )}
      </div>
    </header>
  );
}
