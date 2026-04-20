'use client';

import React from 'react';

// Italic serif phrases separated by dots, scrolling horizontally forever.
// Sits between Hero and Editor Showcase as a breathing band.
//
// Mobile note: Firefox on iOS is finicky with animating `width: max-content`
// under `will-change: transform`. The pattern below uses two fixed-sibling
// flex rows (the phrase group, duplicated) inside a `flex` parent that's
// animated with `translate3d`. `translate3d` nudges every mobile browser
// onto the GPU layer, which is what makes the animation actually play.
const PHRASES = [
  'Writers who finish.',
  'Amazon-ready, Apple-ready, Kobo-ready.',
  'Scrivener without the friction.',
  'One draft, one tab, one keystroke to export.',
  'Typed, pasted, dictated. Still shipped.',
  'Built for the long sentence and the late night.',
];

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="flex items-center gap-10 pr-10 flex-shrink-0" aria-hidden={ariaHidden || undefined}>
      {PHRASES.map((phrase, i) => (
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
  );
}

export default function TickerSection() {
  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-black/5 bg-[#f3f1e8] py-6"
    >
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          animation: 'tickerScroll 50s linear infinite',
          willChange: 'transform',
        }}
      >
        <Track />
        <Track ariaHidden />
      </div>
      <style>{`
        @keyframes tickerScroll {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </section>
  );
}
