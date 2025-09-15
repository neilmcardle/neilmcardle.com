"use client"

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export default function ClientFooterWrapper() {
  const pathname = usePathname();
  // Don't show footer on /make-ebook (or subpaths—add startsWith if needed)
  if (pathname === "/make-ebook") return null;
  return <Footer />;
}