'use client';

import React from 'react';

// Italic serif phrases separated by dots, scrolling horizontally forever.
// Sits between Hero and Editor Showcase as a breathing band.
//
// Firefox on iPhone (WebKit under the hood) is fussy about translate-
// percentage animations. The most reliable cross-mobile pattern:
//  • <style> declared BEFORE the animated element so the animation
//    rule is available on first paint.
//  • `display: inline-flex` on the track (auto-sizes to its contents
//    without needing `width: max-content`, which has quirky behaviour
//    in older WebKit builds).
//  • `padding` between phrases rather than `gap` (mobile WebKit has
//    intermittent `gap` bugs inside inline-flex).
//  • `translateX` over `translate3d` — both hit the compositor on iOS
//    WebKit; the simpler form has fewer edge cases.
const PHRASES = [
  'Writers who finish.',
  'Amazon-ready, Apple-ready, Kobo-ready.',
  'Scrivener without the friction.',
  'One draft, one tab, one keystroke to export.',
  'Typed, pasted, dictated. Still shipped.',
  'Built for the long sentence and the late night.',
];

function Group({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <span className="bm-ticker__group" aria-hidden={ariaHidden || undefined}>
      {PHRASES.map((phrase, i) => (
        <React.Fragment key={i}>
          <span className="bm-ticker__phrase">{phrase}</span>
          <span className="bm-ticker__dot" />
        </React.Fragment>
      ))}
    </span>
  );
}

export default function TickerSection() {
  return (
    <>
      <style>{`
        .bm-ticker {
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          background: transparent;
          padding: 1.5rem 0;
        }
        .bm-ticker__track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: bm-ticker-scroll 100s linear infinite;
        }
        @media (min-width: 640px) {
          .bm-ticker__track {
            animation-duration: 80s;
          }
        }
        .bm-ticker__group {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
        }
        .bm-ticker__phrase {
          font-family: Georgia, 'Times New Roman', serif;
          font-style: italic;
          color: rgba(20, 20, 19, 0.6);
          font-size: 1.25rem;
          letter-spacing: -0.01em;
          padding: 0 1.25rem;
          flex-shrink: 0;
        }
        @media (min-width: 640px) {
          .bm-ticker__phrase {
            font-size: 1.5rem;
          }
        }
        .bm-ticker__dot {
          display: inline-block;
          width: 0.375rem;
          height: 0.375rem;
          border-radius: 9999px;
          background: #141413;
          flex-shrink: 0;
        }
        @keyframes bm-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <section className="bm-ticker" aria-hidden>
        <div className="bm-ticker__track">
          <Group />
          <Group ariaHidden />
        </div>
      </section>
    </>
  );
}
