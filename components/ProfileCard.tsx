"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";

interface Client {
  name: string;
  note: string;
}

// The hero portrait. The "Clients and experience" credentials live in a bottom
// sheet that rises from within the card (clipped by its rounded overflow) when
// the toggle chip is tapped. The sheet can be swiped down to dismiss. A client
// component because the homepage is server-rendered and this needs local state.
export default function ProfileCard({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [dragY, setDragY] = useState(0);
  const dragging = useRef(false);
  const startY = useRef(0);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    startY.current = e.clientY;
    setDragY(0);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dy = e.clientY - startY.current;
    // Only track downward drag; upward does nothing (sheet is already up).
    setDragY(dy > 0 ? dy : 0);
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    // Past the threshold, dismiss; otherwise snap back open.
    if (dragY > 64) setOpen(false);
    setDragY(0);
  };

  // While dragging, follow the finger and drop the transition so it tracks 1:1.
  const sheetStyle =
    dragging.current && dragY > 0
      ? { transform: `translateY(${dragY}px)`, transition: "none" as const }
      : undefined;

  return (
    <div className="relative w-full aspect-square">
      <div className="soft-card gold-trace absolute inset-0 overflow-hidden rounded-[1.75rem]">
        <Image
          src="/me.png"
          alt="Neil McArdle"
          fill
          sizes="(max-width: 1024px) 440px, 520px"
          className="object-cover grayscale contrast-125"
          priority
        />
        {/* "Thinking..." label — LLM streaming aesthetic, a nod to the AI work. */}
        <div
          className="absolute top-5 left-5 flex items-center gap-2"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cream/80 animate-pulse" />
          <span className="thinking-shimmer text-[11px] font-medium tracking-wide">
            Thinking...
          </span>
        </div>
        {/* Social icons — floated bottom-right over the photo. */}
        <div
          className="absolute bottom-5 right-5 flex items-center gap-5"
          style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
        >
          <a
            href="https://www.linkedin.com/in/neilmcardle/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex p-2 -m-2 text-cream hover:text-tan transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
            </svg>
          </a>
          <a
            href="https://github.com/neilmcardle"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="inline-flex p-2 -m-2 text-cream hover:text-tan transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <a
            href="https://x.com/BetterNeil"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X"
            className="inline-flex p-2 -m-2 text-cream hover:text-tan transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>

        {/* Scrim — dims the photo while the sheet is up; tap to dismiss. */}
        <button
          type="button"
          aria-label="Close clients and experience"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`profile-scrim absolute inset-0 z-10 bg-black/45 ${open ? "is-open" : ""}`}
        />

        {/* Bottom sheet. */}
        <div
          className={`profile-sheet absolute inset-x-0 bottom-0 z-20 rounded-t-[1.5rem] border-t border-white/10 bg-[#16161a]/95 backdrop-blur-sm shadow-[0_-16px_40px_-12px_rgba(0,0,0,0.7)] ${open ? "is-open" : ""}`}
          style={sheetStyle}
        >
          {/* Grab handle — drag down to dismiss. */}
          <div
            className="sheet-grip flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="block w-10 h-1.5 rounded-full bg-white/25" />
          </div>
          <div className="px-6 sm:px-8 pb-6 sm:pb-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="icon-chip w-8 h-8">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="3.2" />
                  <path d="M5.5 20a6.5 6.5 0 0113 0" />
                </svg>
              </span>
              <h3
                className="text-tan"
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                }}
              >
                Clients and experience
              </h3>
            </div>
            <ul className="border-t border-white/10">
              {clients.map((c, i) => (
                <li
                  key={c.name}
                  className="sheet-row flex items-baseline justify-between gap-3 py-3 border-b border-white/10"
                  style={{ animationDelay: `${0.12 + i * 0.07}s` }}
                >
                  <span
                    className="text-cream"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "0.9375rem",
                      fontWeight: 500,
                      lineHeight: 1.2,
                    }}
                  >
                    {c.name}
                  </span>
                  <span
                    className="text-tan text-right shrink-0"
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: "0.625rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Toggle — a plain white glyph in the bottom-left, above the sheet and
          scrim so it works in either state. Drop-shadow keeps it legible over
          the photo, matching the social icons. */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-pressed={open}
        aria-label={open ? "Hide clients and experience" : "Show clients and experience"}
        className="absolute bottom-5 left-5 z-30 inline-flex p-2 -m-2 text-white hover:text-cream transition-colors"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))" }}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9h18M8 14h5M8 17h8" />
          </svg>
        )}
      </button>
    </div>
  );
}
