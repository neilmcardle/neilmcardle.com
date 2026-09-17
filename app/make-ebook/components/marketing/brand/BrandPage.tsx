import type React from "react";
import { BrandFooter } from "./BrandFooter";
import { BrandNav } from "./BrandNav";
import styles from "./brand.module.css";
import page from "./page.module.css";

export function BrandPage({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${styles.page} ${page.frame}`}>
      <BrandNav />
      {children}
      <BrandFooter />
    </div>
  );
}

export function RainStage({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className={page.stage}>
      <iframe
        src="/make-ebook/brand/rain-on-glass.html?bg=/make-ebook/brand/library-window.jpg"
        title=""
        aria-hidden="true"
        tabIndex={-1}
        loading="eager"
        className={page.rain}
      />
      <div className={page.scrim} aria-hidden="true" />
      {children}
    </main>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  return <div className={page.card}>{children}</div>;
}
