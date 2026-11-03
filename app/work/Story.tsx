import type { ReactNode } from "react";
import card from "../_signature/case.module.css";
import shell from "../_signature/signature.module.css";
import styles from "./story.module.css";

export type Chapter = {
  label: string;
  title?: string;
  body: ReactNode;
  instead?: ReactNode;
  visual?: ReactNode;
};

export default function Story({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className={`${shell.wrap} ${styles.story}`}>
      {chapters.map((chapter) => (
        <section key={chapter.label} className={styles.chapter}>
          <div className={styles.words}>
            <h2 className={styles.label}>{chapter.label}</h2>
            <div className={styles.copy}>
              {chapter.title ? (
                <h3 className={styles.title}>{chapter.title}</h3>
              ) : null}
              <p className={chapter.title ? styles.body : styles.lead}>
                {chapter.body}
              </p>
              {chapter.instead ? (
                <p className={styles.instead}>Instead of {chapter.instead}</p>
              ) : null}
            </div>
          </div>
          {chapter.visual ? (
            <div className={`${card.card} ${styles.visual}`}>
              {chapter.visual}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
