'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

type HeroSectionProps = {
  onPrimaryClick: () => void;
  onWatchTourClick: () => void;
};

export default function HeroSection({ onPrimaryClick, onWatchTourClick }: HeroSectionProps) {
  return (
    <section className="pt-20 pb-24 sm:pt-32 sm:pb-36 lg:pt-40 lg:pb-44">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* Headline */}
        <h1
          className="font-serif font-bold text-gray-900"
          style={{
            fontSize: 'clamp(3rem, 12.5vw, 8rem)',
            letterSpacing: '-0.045em',
            lineHeight: 0.94,
          }}
        >
          <span className="block">Write the book</span>
          <span className="block">you&rsquo;ve been</span>
          <span className="block">putting off.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="mt-8 sm:mt-10 max-w-xl text-gray-600 text-pretty"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(1.0625rem, 1.25vw + 0.625rem, 1.4375rem)',
            lineHeight: 1.55,
          }}
        >
          A free, browser-based editor with an AI editorial brain that catches inconsistencies, edits inline, and turns rough drafts into store-ready EPUBs.
        </p>

        {/* CTAs */}
        <div className="mt-10 sm:mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <button
            onClick={onPrimaryClick}
            className="group px-8 py-4 text-base sm:text-lg font-semibold bg-gray-900 text-white rounded-full inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            Start writing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onWatchTourClick}
            className="group inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium underline-offset-4 decoration-gray-300 hover:underline"
          >
            Watch a 60-second tour
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </button>
        </div>

      </div>
    </section>
  );
}
