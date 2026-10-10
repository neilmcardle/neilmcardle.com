"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { INSIDE_KEY } from "./BackLink";

export default function NavTracker() {
  const pathname = usePathname();
  const first = useRef<string | null>(null);

  useEffect(() => {
    try {
      if (first.current === null) {
        first.current = pathname;
        let fromSite = false;
        try {
          fromSite = new URL(document.referrer).origin === location.origin;
        } catch {}
        sessionStorage.setItem(INSIDE_KEY, fromSite ? "1" : "0");
      } else if (pathname !== first.current) {
        sessionStorage.setItem(INSIDE_KEY, "1");
      }
    } catch {}
  }, [pathname]);

  return null;
}
