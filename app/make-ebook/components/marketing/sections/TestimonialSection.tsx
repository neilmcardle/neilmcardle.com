'use client';

import React from 'react';

import { SECTION_TIERS } from '../sectionTiers';
import { TESTIMONIALS } from '../marketing-content';

export default function TestimonialSection() {
  const t = TESTIMONIALS[0];
  if (!t) return null;

  return (
    <section className={SECTION_TIERS.intimate.section}>
      <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16">
        <blockquote
          className="font-serif text-gray-800 text-balance"
          style={{
            fontSize: 'clamp(1.5rem, 2vw + 0.75rem, 2.25rem)',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
          }}
        >
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <p className="mt-6 text-sm text-gray-500 uppercase tracking-widest">
          {t.author} &middot; {t.role}
        </p>
      </div>
    </section>
  );
}
