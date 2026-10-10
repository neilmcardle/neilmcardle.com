"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import BackLink from "@/components/BackLink";
import ParticleMark from "@/app/_home/ParticleMark";
import home from "@/app/_home/home.module.css";
import Contact from "./Contact";
import Role from "./Role";
import LostCloud from "./LostCloud";
import styles from "./orbit.module.css";
import status from "./status.module.css";

export default function StatusPage({
  line,
  note,
  code,
  actions,
}: {
  line: ReactNode;
  note?: ReactNode;
  code?: ReactNode;
  actions?: ReactNode;
}) {
  const [formed, setFormed] = useState(false);
  return (
    <div className={`${styles.orbit} ${status.page}`}>
      <header className={styles.top}>
        <div className={styles.wordmark}>
          <span className={home.mark}>
            <ParticleMark spin />
          </span>
          <Link href="/">
            <span className={styles.name}>Neil McArdle</span> <Role />
          </Link>
        </div>
        <Contact />
      </header>

      <main className={status.main}>
        <BackLink
          className={status.cloudLink}
          aria-label="Wander back"
          onMouseEnter={() => setFormed(true)}
          onMouseLeave={() => setFormed(false)}
          onFocus={() => setFormed(true)}
          onBlur={() => setFormed(false)}
        >
          <LostCloud className={status.cloud} formed={formed} />
        </BackLink>
        <h1 className={status.line}>{line}</h1>
        {note ? <p className={status.note}>{note}</p> : null}
        {code ? <p className={status.code}>{code}</p> : null}
        {actions ? <div className={status.actions}>{actions}</div> : null}
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
