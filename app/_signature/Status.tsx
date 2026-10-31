import type React from "react";
import Shell from "./Shell";
import Header from "./Header";
import shell from "./signature.module.css";
import styles from "./status.module.css";

export default function Status({
  code,
  line,
  note,
  actions,
}: {
  code: string;
  line: string;
  note?: string;
  actions: React.ReactNode;
}) {
  return (
    <Shell>
      <Header contact="/#contact" />
      <main className={`${shell.wrap} ${styles.main}`}>
        <p className={`${shell.heavy} ${styles.code}`} aria-hidden="true">
          {code}
        </p>
        <h1 className={styles.line}>{line}</h1>
        {note ? <p className={styles.note}>{note}</p> : null}
        <div className={styles.actions}>{actions}</div>
      </main>
    </Shell>
  );
}
