"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import ParticleMark from "@/app/_home/ParticleMark";
import home from "@/app/_home/home.module.css";
import Contact from "./Contact";
import LostCloud from "./LostCloud";
import styles from "./orbit.module.css";
import status from "./status.module.css";

export default function StatusPage({
  line,
  note,
  actions,
}: {
  line: ReactNode;
  note?: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className={`${styles.orbit} ${status.page}`}>
      <header className={styles.top}>
        <div className={styles.wordmark}>
          <span className={home.mark}>
            <ParticleMark spin />
          </span>
          <Link href="/">
            <span className={styles.name}>Neil McArdle</span>{" "}
            <span className={styles.role}>
              Senior Digital Product Designer, London, UK
            </span>
          </Link>
        </div>
        <Contact />
      </header>

      <main className={status.main}>
        <LostCloud className={status.cloud} />
        <h1 className={status.line}>{line}</h1>
        {note ? <p className={status.note}>{note}</p> : null}
        <div className={status.actions}>{actions}</div>
      </main>
    </div>
  );
}

export function StatusLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${styles.back} ${status.pill}`}>
      {children}
    </Link>
  );
}

export function StatusButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.back} ${status.pill}`}
    >
      {children}
    </button>
  );
}
