"use client"

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ClientFooterWrapper() {
  const pathname = usePathname();
  // Don't show footer on certain full-screen pages
  if (pathname.startsWith("/make-ebook") || pathname.startsWith("/coverly")) return null;
  return <Footer />;
}