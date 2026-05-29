"use client"

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientFooterWrapper() {
  const pathname = usePathname();
  const isMakeEbookDomain = typeof window !== "undefined" && window.location.hostname.includes("makeebook.ink");
  if (isMakeEbookDomain || pathname === "/" || pathname.startsWith("/make-ebook") || pathname.startsWith("/icon-animator") || pathname.startsWith("/promptr") || pathname.startsWith("/kids-academy") || pathname.startsWith("/paintings") || pathname.startsWith("/tessera")) return null;
  return <Footer />;
}
