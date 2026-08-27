"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { NavCapsule } from "./nav-capsule";
import { LikesButton } from "./likes-button";
import { SoundToggle } from "./sound-toggle";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "./logomark";

export function CoverlyAppHeader() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        "--coverly-header-h",
        `${Math.round(el.getBoundingClientRect().height)}px`,
      );
    publish();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(publish);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
    >
      <a
        href="#coverly-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
      >
        Skip to covers
      </a>
      <div className="relative flex w-full flex-wrap items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/coverly/browse" aria-label="Coverly home">
          <svg
            viewBox={LOGOMARK_VIEWBOX}
            className="h-5 w-auto text-foreground"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={LOGOMARK_PATH} />
          </svg>
        </Link>

        <div className="order-last flex w-full justify-center pt-3 md:absolute md:left-1/2 md:order-none md:w-auto md:-translate-x-1/2 md:pt-0">
          <NavCapsule
            items={[
              { href: "/coverly/browse", label: "Browse", icon: "grid" },
              { href: "/coverly/boards", label: "Boards", icon: "layout" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <SoundToggle />
          <LikesButton />
        </div>
      </div>
    </header>
  );
}
