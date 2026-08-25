"use client";

import Link from "next/link";
import { NavCapsule } from "./nav-capsule";
import { LikesButton } from "./likes-button";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "./logomark";

export function CoverlyAppHeader() {
  return (
    <header>
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
          <LikesButton />
        </div>
      </div>
    </header>
  );
}
