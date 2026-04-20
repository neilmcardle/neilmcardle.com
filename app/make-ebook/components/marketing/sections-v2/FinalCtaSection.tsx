'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import FadeIn from '../FadeIn';

/**
 * v2 Final CTA — cinematic, with a huge ghosted "finish." word in the backdrop.
 * Drop-in replacement for v1 FinalCtaSection.
 */
type Props = { onPrimaryClick: () => void };

export default function FinalCtaSection({ onPrimaryClick }: Props) {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 bg-[#141413] text-[#faf9f5] overflow-hidden text-center">
      <div
        aria-hidden
        className="hidden sm:block absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 font-serif italic font-bold leading-none pointer-events-none z-0 text-white"
        style={{ fontSize: 'min(32vw, 540px)', letterSpacing: '0.05em', opacity: 0.03 }}
      >
        finish.
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <h2
            className="font-serif font-bold text-white mx-auto text-balance"
            style={{
              fontSize: 'clamp(2.75rem, 7vw, 6.75rem)',
              letterSpacing: '-0.04em',
              lineHeight: 0.98,
              maxWidth: '14ch',
            }}
          >
            Write the book you&rsquo;ve <em className="font-medium">been putting off.</em>
          </h2>
        </FadeIn>
        <FadeIn delay={120}>
          <p className="mt-8 text-xl text-white/60 max-w-xl mx-auto" style={{ fontFamily: 'Georgia, serif' }}>
            The blank page has waited long enough.
          </p>
        </FadeIn>
        <FadeIn delay={240}>
          <div className="mt-12 inline-flex items-center gap-5">
            <button
              onClick={onPrimaryClick}
              className="group px-8 py-4 text-base font-semibold bg-[#faf9f5] text-gray-900 rounded-full inline-flex items-center gap-2 hover:bg-white transition-colors"
            >
              Start writing. It&rsquo;s free.
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
