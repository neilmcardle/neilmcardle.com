"use client";

import { useEffect } from "react";
import Link from "next/link";
import { BrandPage } from "./components/marketing/brand/BrandPage";
import brand from "./components/marketing/brand/brand.module.css";
import ui from "./components/marketing/brand/page.module.css";

export default function MakeEbookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("makeebook error boundary caught:", error);
  }, [error]);

  return (
    <BrandPage>
      <main id="main-content" className={`${brand.shell} ${ui.status}`}>
        <div className={ui.statusCopy}>
          <p className={ui.statusEyebrow}>Something went wrong</p>
          <h1 className={ui.statusTitle}>Even the best drafts have typos.</h1>
          <p className={ui.statusBody}>
            Something on this page misbehaved. Your work is safe. Try again, or
            head back to the editor.
          </p>
          {error.digest && (
            <p className={ui.statusRef}>Reference: {error.digest}</p>
          )}
          <div className={ui.statusActions}>
            <button type="button" onClick={reset} className={brand.cta}>
              Try again
            </button>
            <Link href="/make-ebook" className={brand.ctaGhost}>
              Back to the homepage
            </Link>
          </div>
        </div>
      </main>
    </BrandPage>
  );
}
