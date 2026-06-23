'use client';

import React, { useState } from 'react';
import FadeIn from '../FadeIn';
import { FAQ } from '../marketing-content';

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl mb-14">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              Common questions
            </div>
            <h2
              className="mt-3 font-serif font-bold text-white text-balance"
              style={{
                fontSize: 'clamp(2rem, 3vw + 0.75rem, 3.25rem)',
                letterSpacing: '-0.035em',
                lineHeight: 1.1,
              }}
            >
              Things worth knowing.
            </h2>
          </div>
        </FadeIn>

        <FadeIn delay={100}>
          <div className="max-w-3xl divide-y divide-[#2f2f2f]">
            {FAQ.map((item, i) => (
              <div key={i} className="py-6">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start justify-between gap-6 text-left group"
                >
                  <h3
                    className="font-semibold text-white text-balance group-hover:text-white/80 transition-colors"
                    style={{ fontSize: '1.0625rem', lineHeight: 1.4 }}
                  >
                    {item.q}
                  </h3>
                  <span
                    className="text-white/30 flex-shrink-0 mt-0.5 transition-transform duration-200"
                    style={{ transform: open === i ? 'rotate(45deg)' : 'none' }}
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                {open === i && (
                  <p
                    className="mt-4 text-white/60 text-pretty"
                    style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.7 }}
                  >
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
