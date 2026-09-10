"use client";

import { useLayoutEffect } from "react";
import styles from "./home.module.css";
import SiteMenu from "./SiteMenu";
import { syncTheme } from "./theme";

export default function SitePage({ children }: { children: React.ReactNode }) {
  useLayoutEffect(() => {
    syncTheme();
  }, []);

  return (
    <div className={`${styles.page} ${styles.glass} ${styles.themed}`}>
      <SiteMenu themeToggle />
      <div className={styles.shell}>{children}</div>
    </div>
  );
}
