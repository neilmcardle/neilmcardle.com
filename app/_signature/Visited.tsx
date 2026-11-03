"use client";

import { useEffect } from "react";

export const VISITED = "nm:visited";
export const RETURNING = "nm:back";
const SPOTS = "nm:spots";

const read = (): Record<string, number> => {
  try {
    return JSON.parse(sessionStorage.getItem(SPOTS) || "{}");
  } catch {
    return {};
  }
};

export default function Visited() {
  useEffect(() => {
    try {
      sessionStorage.setItem(VISITED, "1");
      if (sessionStorage.getItem(RETURNING) === "1") {
        sessionStorage.removeItem(RETURNING);
        const y = read()[location.pathname];
        if (y) {
          history.scrollRestoration = "manual";
          requestAnimationFrame(() =>
            window.scrollTo({ top: y, behavior: "instant" }),
          );
        }
      }
    } catch {}

    const save = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link || link.getAttribute("href")?.startsWith("#")) return;
      try {
        sessionStorage.setItem(
          SPOTS,
          JSON.stringify({ ...read(), [location.pathname]: window.scrollY }),
        );
      } catch {}
    };
    document.addEventListener("click", save, true);
    return () => document.removeEventListener("click", save, true);
  }, []);
  return null;
}
