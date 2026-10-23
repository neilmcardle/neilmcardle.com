"use client";

import { useEffect } from "react";
import { reveal, targetFor } from "./targets";

export default function WorkScroll() {
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("work");
    if (!id || id === "all") return;
    const target = targetFor(id);
    if (!target) return;
    reveal(target);
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
