"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Adds the `is-shaking` class whenever the wrapped element enters the viewport
// (the first time covers initial load), then removes it when the animation ends
// so it can re-fire on the next scroll-in. Pairs with the
// `.shake-on-view.is-shaking ...` rule in globals.css.
export default function ShakeOnView({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const clear = () => el.classList.remove("is-shaking");

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Restart the animation from scratch each time it enters.
            el.classList.remove("is-shaking");
            void el.offsetWidth; // force reflow
            el.classList.add("is-shaking");
          }
        }
      },
      { threshold: 0.5 }
    );

    io.observe(el);
    el.addEventListener("animationend", clear);
    return () => {
      io.disconnect();
      el.removeEventListener("animationend", clear);
    };
  }, []);

  return (
    <div ref={ref} className={`shake-on-view ${className}`.trim()}>
      {children}
    </div>
  );
}
