'use client';

// ⚠ NOT RENDERED. Kept for future use once real testimonials are collected.
// The quotes in the WALL array below are fabricated placeholders. The section
// copy frames them as real ("unsolicited", "ported from email, Discord, and
// app store reviews with permission") — shipping this with fake content is
// materially misleading advertising. Do NOT re-import in MarketingLandingPage
// until the WALL array contains real, permission-granted quotes (minimum 3),
// and the intro copy honestly reflects where the quotes came from.

import React from 'react';
import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

const WALL: { q: string; n: string; r: string; a: string; c: string }[] = [
  { q: 'I wrote two-thirds of my novel in Word. I finished it in makeEbook in six weeks. The difference is the outliner and the one-click export.', n: 'Amelie R.', r: 'Literary fiction, London', a: 'A', c: 'bg-blue-600' },
  { q: '⌘K with three takes is the only AI writing feature that hasn\u2019t made me angry. It suggests instead of overwrites.', n: 'Jon', r: 'Early Access User', a: 'J', c: 'bg-amber-700' },
  { q: 'Book Mind caught a character\u2019s eye color change between chapters 3 and 7. I had been staring at those pages for a month.', n: 'Daniyar K.', r: 'Thriller, Almaty', a: 'D', c: 'bg-emerald-700' },
  { q: 'I opened it on a plane and kept writing. I didn\u2019t realise until I landed that I\u2019d been offline the whole time.', n: 'Sana Q.', r: 'Poet, Karachi', a: 'S', c: 'bg-[#1a2540]' },
  { q: 'The typography presets alone are worth the price. My EPUB doesn\u2019t look like it was made in 1996 anymore.', n: 'Gregor T.', r: 'Non-fiction, Berlin', a: 'G', c: 'bg-[#5a1a2a]' },
  { q: 'Scrivener without the 40-page manual. I mean that as a compliment to both.', n: 'Rosie M.', r: 'Memoirist, Dublin', a: 'R', c: 'bg-[#2a2a28]' },
  { q: 'The KDP pre-flight flagged my missing AI disclosure before I hit upload. Amazon would have delisted me. I wouldn\u2019t have known why.', n: 'Marcus H.', r: 'Self-published, Toronto', a: 'M', c: 'bg-[#7a4d1a]' },
  { q: 'I think makeEbook is the only software I\u2019ve used this year that felt made by a human who loved the people using it.', n: 'Lena O.', r: 'Memoirist, Lagos', a: 'L', c: 'bg-blue-600' },
  { q: 'I type. It makes an ebook. I don\u2019t think about fonts anymore. That is the entire review.', n: 'Teo A.', r: 'Fantasy, São Paulo', a: 'T', c: 'bg-emerald-700' },
];

export default function WriterWallSection() {
  return (
    <section className={`${SECTION_TIERS.standard.section} bg-[#f3f1e8]`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">05 &middot; Writer wall</div>
            <h2 className="mt-3 font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
              What writers are <em className="font-medium">saying</em>.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              Unpolished, unsolicited. Ported from email, Discord, and app store reviews with permission.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="mt-12 columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
            {WALL.map((q, i) => (
              <div
                key={i}
                className="break-inside-avoid mb-6 bg-white border border-gray-200 rounded-[14px] p-7 shadow-[0_6px_14px_-8px_rgba(20,20,19,.06)]"
              >
                <p className="font-serif text-[18px] leading-[1.4] text-gray-900 m-0 mb-4" style={{ letterSpacing: '-0.01em' }}>
                  <span className="font-serif italic text-blue-600 text-[44px] font-bold leading-[0.2] mr-1 align-[-18px]">&ldquo;</span>
                  {q.q}
                </p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-white text-sm flex-shrink-0 ${q.c}`}>
                    {q.a}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-gray-900">{q.n}</div>
                    <div className="text-[11px] text-gray-400 italic" style={{ fontFamily: 'Georgia, serif' }}>{q.r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
