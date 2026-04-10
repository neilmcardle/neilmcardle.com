'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

type FinalCtaSectionProps = {
  onCtaClick: () => void;
};

export default function FinalCtaSection({ onCtaClick }: FinalCtaSectionProps) {
  return (
    <section className={`${SECTION_TIERS.cinematic.section} border-t border-gray-200`}>
      <FadeIn>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <h2 className="font-serif font-bold text-gray-900 text-balance max-w-4xl" style={SECTION_TIERS.cinematic.title}>
            The book is still waiting for&nbsp;you.
          </h2>
          <p className="mt-8 text-xl sm:text-2xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
            Free, in your browser, no install. Open the editor and write the first sentence.
          </p>
          <div className="mt-10 sm:mt-12">
            <button
              onClick={onCtaClick}
              className="group px-8 py-4 text-base sm:text-lg font-semibold bg-gray-900 text-white rounded-full inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              Start writing
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
