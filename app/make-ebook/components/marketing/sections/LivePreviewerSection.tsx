'use client';

import React from 'react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import InteractiveLivePreview from '../InteractiveLivePreview';

const FEATURES = [
  'Switch between Kindle, iPad, and Phone instantly',
  'Typography and layout rendered in real time',
  'Catch formatting issues before you export',
];

export default function LivePreviewerSection() {
  return (
    <section className={SECTION_TIERS.standard.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Interactive Live Preview */}
          <FadeIn>
            <div className="relative flex justify-center lg:justify-start">
              <InteractiveLivePreview />
            </div>
          </FadeIn>

          {/* Text side */}
          <FadeIn delay={150}>
            <div>
              <h2 className="font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
                See your book before you ship it.
              </h2>
              <p className="mt-5 text-lg sm:text-xl text-gray-600 text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
                Preview on Kindle, iPad, and phone, live as you write. No guessing, no surprises on publish day.
              </p>
              <ul className="mt-8 space-y-4">
                {FEATURES.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
