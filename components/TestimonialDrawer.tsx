"use client";

import { useState } from "react";

interface Props {
  quote: string;
  name: string;
  org: string;
}

// A testimonial that lives in a drawer tucked behind the client-work card above.
// Collapsed, only the pull handle shows; clicking it slides the quote down. The
// quote region animates via grid-template-rows (0fr -> 1fr) so it eases to its
// natural height without measuring. Client component for the open/close state.
export default function TestimonialDrawer({ quote, name, org }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative z-0 overflow-hidden rounded-b-[1.5rem] border-x border-b border-white/5 bg-[#0c0c0e] shadow-[inset_0_11px_18px_-10px_rgba(0,0,0,0.9)] ${open ? "testimonial-drawer-stretch" : ""}`}>
      {/* Collapsible quote. */}
      <div
        className="grid"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          transitionProperty: "grid-template-rows",
          // Slow-mo "sheet" height reveal on open that finishes before the
          // root's scaleY bounce peaks, so the bottom edge reads as stretching
          // past and settling. Close snaps back at a normal pace. The overshoot
          // lives in the transform, not here.
          transitionDuration: open ? "1200ms" : "450ms",
          transitionTimingFunction: "cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        <div className="overflow-hidden">
          <figure className="relative px-6 pt-7 pb-3 sm:px-7">
            <blockquote
              className="relative text-cream/60"
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                lineHeight: 1.35,
                fontWeight: 500,
                letterSpacing: "-0.01em",
              }}
            >
              {quote}
            </blockquote>
            <figcaption className="mt-5 flex flex-col gap-1">
              <span
                className="text-cream/75"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                }}
              >
                {name}
              </span>
              <span
                className="text-tan"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                {org}
              </span>
            </figcaption>
            <span
              className="absolute bottom-1 right-6 text-gold/35 select-none"
              style={{
                fontFamily: "var(--font-playfair)",
                fontSize: "4rem",
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              &rdquo;
            </span>
          </figure>
        </div>
      </div>

      {/* Pull handle — the only part visible when collapsed. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Hide testimonial" : "Read the testimonial"}
        className="group/handle flex w-full flex-col items-center gap-1.5 py-3 text-tan transition-colors hover:text-cream"
      >
        <span className="block h-1 w-8 rounded-full bg-white/20 transition-colors group-hover/handle:bg-white/35" />
        <svg
          className={`h-3 w-3 transition-transform duration-500 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  );
}
