import type React from "react";
import { heavy } from "./fonts";
import JumpBar from "./JumpBar";
import styles from "./signature.module.css";
import Visited from "./Visited";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${heavy.variable} ${styles.root}`}>
      <style>{"html,body{background:#0d0d0c}"}</style>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <Visited />
      {children}
      <JumpBar />
    </div>
  );
}
