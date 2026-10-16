"use client";

import { useEffect } from "react";

const TARGETS: Record<string, string> = {
  speakui: '[data-group="demo"]',
  "book-covers": '[data-group="covers"]',
  paintings: '[data-group="paintings"]',
};

export default function WorkScroll() {
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("work");
    if (!id || id === "all") return;
    const target = document.querySelector(
      TARGETS[id] ?? `[data-item="${CSS.escape(id)}"]`,
    );
    if (!target) return;
    let timer = 0;
    const go = () => {
      timer = window.setTimeout(
        () => target.scrollIntoView({ block: "start", behavior: "instant" }),
        50,
      );
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", go);
    };
  }, []);

  return null;
}
