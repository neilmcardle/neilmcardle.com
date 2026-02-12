"use client"

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientFooterWrapper() {
  const pathname = usePathname();
  const isMakeEbookDomain = typeof window !== "undefined" && window.location.hostname.includes("makeebook.ink");
  // Don't show footer on make-ebook or coverly pages
  if (isMakeEbookDomain || pathname.startsWith("/make-ebook") || pathname.startsWith("/coverly")) return null;
  return <Footer />;
}
