"use client"

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientFooterWrapper() {
  const pathname = usePathname();
  const isMakeEbookDomain = typeof window !== "undefined" && window.location.hostname.includes("makeebook.ink");
  // Don't show footer on make-ebook, coverly, icon-animator, or promptr pages —
  // these are standalone tools with their own chrome.
  if (isMakeEbookDomain || pathname === "/" || pathname.startsWith("/make-ebook") || pathname.startsWith("/coverly") || pathname.startsWith("/icon-animator") || pathname.startsWith("/promptr")) return null;
  return <Footer />;
}
