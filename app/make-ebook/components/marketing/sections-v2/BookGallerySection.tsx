'use client';

import React from 'react';
import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

type Book = { t: string; a: string; bg: string; fg: string; g: string };

const BOOKS: Book[] = [
  { t: "The Cartographer's Daughter", a: 'Imogen Hollings', bg: '#1a2540', fg: '#f5ecd5', g: 'Literary fiction' },
  { t: 'A Quiet Conspiracy of Moths', a: 'Arjun Mehta', bg: '#7a1a1a', fg: '#f5e8c7', g: 'Short stories' },
  { t: 'Fieldnotes From Somewhere', a: 'Lena Okafor', bg: '#f0e9da', fg: '#3a2d14', g: 'Memoir' },
  { t: "The Lamplighter's Ledger", a: 'Finn Dubhán', bg: '#0e3a2e', fg: '#e8d7a8', g: 'Historical fiction' },
  { t: 'Ordinary Miracles', a: 'Clara Bellamy', bg: '#2a2a28', fg: '#d4c8a8', g: 'Essays' },
  { t: 'Where the River Forgets', a: 'Yusra Adil', bg: '#8a4d1a', fg: '#f5ecd5', g: 'Literary fiction' },
  { t: 'Small Instructions for Surviving', a: 'P. W. Renshaw', bg: '#e8d8c0', fg: '#5a2318', g: 'Non-fiction' },
  { t: 'Halcyon, After', a: 'Marieke Vos', bg: '#232a3d', fg: '#e8c4b0', g: 'Speculative' },
  { t: 'The Copper Apprentice', a: 'Teo Almeida', bg: '#c8a460', fg: '#1a1a1a', g: 'Fantasy' },
  { t: 'Midnight & Other Small Hours', a: 'Sana Qureshi', bg: '#3a1a3a', fg: '#f5d9a8', g: 'Poetry' },
  { t: 'A Shelf of Borrowed Weather', a: 'Nico Hartwell', bg: '#e3ded0', fg: '#1a3a4a', g: 'Essays' },
  { t: "The Glassblower's Epilogue", a: 'Rosa Benítez', bg: '#5a1a2a', fg: '#f0dcc8', g: 'Literary fiction' },
];

export default function BookGallerySection() {
  return (
    <section className={SECTION_TIERS.standard.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">04 &middot; Covers</div>
            <h2 className="mt-3 font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
              Generate your book cover inside makeEbook.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              Choose a cover using your title, author, genre. Pick the colour you want, and the style that fits the book you&rsquo;ve written.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-7 gap-y-8">
            {BOOKS.map((b, i) => (
              <div key={i} className={`group cursor-pointer ${i >= 4 ? 'hidden sm:block' : ''}`}>
                <div
                  className="relative aspect-[2/3] rounded-[4px] overflow-hidden p-5 flex flex-col justify-center items-center text-center transition-all duration-500 group-hover:-translate-y-2 group-hover:-rotate-1"
                  style={{
                    background: b.bg,
                    color: b.fg,
                    boxShadow:
                      '0 12px 24px -12px rgba(0,0,0,.35), inset -3px 0 8px rgba(0,0,0,.18), inset 3px 0 8px rgba(255,255,255,.04)',
                  }}
                >
                  <span className="absolute left-1.5 top-0 bottom-0 w-px bg-black/15" />
                  <div className="text-[9px] uppercase tracking-[0.28em] font-semibold opacity-75 mb-3">
                    {b.a.split(' ').pop()}
                  </div>
                  <div className="w-7 h-px bg-current opacity-50 mb-2.5" />
                  <div className="font-serif font-bold text-[17px] sm:text-[18px] leading-[1.05] text-balance">{b.t}</div>
                  <div className="w-7 h-px bg-current opacity-50 mt-2.5 mb-2.5" />
                  <div className="text-[9px] uppercase tracking-[0.28em] font-semibold opacity-50">makeEbook</div>
                </div>
                <div className="mt-3 text-[12px] text-gray-500">
                  <div className="text-gray-900 font-medium text-[13px]">{b.t}</div>
                  {b.a} &middot; {b.g}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
