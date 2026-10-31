import type React from "react";
import { heavy } from "./fonts";
import styles from "./signature.module.css";

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${heavy.variable} ${styles.root}`}>
      <style>{"html,body{background:#0d0d0c}"}</style>
      {children}
    </div>
  );
}
