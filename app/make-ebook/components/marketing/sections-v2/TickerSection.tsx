'use client';

import React from 'react';

// Italic serif phrases separated by blue dots, scrolling horizontally forever.
// Sits between Hero and Editor Showcase as a breathing band — an editorial
// pause after the dense constellation, before the chapter-hover interaction.
const PHRASES = [
  'Writers who finish.',
  'Amazon-ready, Apple-ready, Kobo-ready.',
  'Scrivener without the friction.',
  'One draft, one tab, one keystroke to export.',
  'Typed, pasted, dictated. Still shipped.',
  'Built for the long sentence and the late night.',
];

export default function TickerSection() {
  // Duplicate the list so translateX(-50%) wraps seamlessly back to the start.
  // Both halves have identical widths, so the loop point is invisible.
  const doubled = [...PHRASES, ...PHRASES];
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-black/5 bg-[#f3f1e8] py-6"
    >
      <div
        className="flex items-center gap-10 whitespace-nowrap will-change-transform"
        style={{ animation: 'tickerScroll 50s linear infinite', width: 'max-content' }}
      >
        {doubled.map((phrase, i) => (
          <React.Fragment key={i}>
            <span
              className="font-serif italic text-gray-700 text-xl sm:text-2xl flex-shrink-0"
              style={{ letterSpacing: '-0.01em' }}
            >
              {phrase}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#141413] flex-shrink-0" />
          </React.Fragment>
        ))}
      </div>
      <style>{`@keyframes tickerScroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </section>
  );
}
