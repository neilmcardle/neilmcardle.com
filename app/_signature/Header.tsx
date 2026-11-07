import type React from "react";
import Link from "next/link";
import BackLink from "./BackLink";
import shell from "./signature.module.css";
import { WRITING_PUBLIC } from "@/app/_home/data";
import styles from "./header.module.css";

export default function Header({
  home = "/",
  brand = true,
  contact = "#contact",
  mark,
  role = true,
  back,
  backLabel = "Work",
}: {
  role?: boolean;
  back?: string;
  backLabel?: string;
  home?: string;
  brand?: boolean;
  contact?: string;
  mark?: React.ReactNode;
}) {
  return (
    <header className={`${shell.wrap} ${styles.header}`}>
      {back ? (
        <BackLink fallback={back} label={backLabel} />
      ) : mark ? (
        <Link
          className={styles.brand}
          href={home}
          aria-label="Neil McArdle, Product Designer, London"
        >
          {mark}
          {role ? (
            <span className={styles.role}>Product Designer, London</span>
          ) : null}
        </Link>
      ) : brand ? (
        <Link className={styles.brand} href={home} aria-label="Neil McArdle">
          <svg viewBox="18 18 27 27" aria-hidden="true">
            <path d="M45 45L32 31.2985V18H45V45Z" />
            <path d="M18 18L32 31.6343L32 45L18 45L18 18Z" />
          </svg>
          <span className={styles.name}>Neil McArdle</span>
        </Link>
      ) : (
        <span />
      )}
      <nav className={styles.nav}>
        <Link href={`${home}#work`}>Work</Link>
        {WRITING_PUBLIC ? (
          <Link className={styles.extra} href={`${home}#writing`}>
            Writing
          </Link>
        ) : null}
        <Link href={`${home}#play`}>Playground</Link>
        <a href={contact}>Contact</a>
      </nav>
    </header>
  );
}
