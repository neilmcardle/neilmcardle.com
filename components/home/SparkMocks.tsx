"use client";

import { Caret, CheckDemo, Mark, StateDemo } from "@/app/spark/landing-demos";
import sp from "@/app/spark/landing.module.css";
import styles from "./home.module.css";

export default function SparkMocks() {
  return (
    <div className={`${styles.spStack} spark-page`}>
      <div className={`${sp.intro} ${styles.spIntro}`}>
        <div className={sp.introGutter} aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <div className={sp.introMark}>
          <Mark className={`${sp.introGlyph} ${styles.spGlyph}`} />
          <span className={`${sp.introWord} ${styles.spWord}`}>
            spark
            <Caret />
          </span>
        </div>
      </div>
      <div className={`${sp.stage} ${sp.cardStage} ${styles.spStage}`}>
        <StateDemo />
      </div>
      <div className={`${sp.stage} ${sp.cardStage} ${styles.spStage}`}>
        <CheckDemo />
      </div>
    </div>
  );
}
