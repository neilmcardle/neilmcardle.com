'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import { HOW_IT_WORKS } from '../marketing-content';

export default function HowItWorksSection() {
  return (
    <section className={SECTION_TIERS.cinematic.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl mb-20 sm:mb-24">
            <h2 className="font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.cinematic.title}>
              Three steps to published.
            </h2>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
              No formatting headaches. No technical setup. Just write.
            </p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {HOW_IT_WORKS.map((item, index) => (
            <FadeIn key={index} delay={index * 120}>
              <div className="relative pt-20">
                <div className="font-playfair select-none pointer-events-none absolute top-0 -left-2 text-gray-200 font-bold leading-none" style={{ fontSize: '9rem', letterSpacing: '-0.06em', zIndex: 0 }}>{item.step}</div>
                <h3 className="relative text-xl font-semibold text-gray-900 mb-3 text-balance" style={{ letterSpacing: '-0.02em', zIndex: 1, position: 'relative' }}>{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-pretty" style={{ position: 'relative', zIndex: 1 }}>{item.description}</p>
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-4 text-gray-300">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
