'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

type HeroSectionProps = {
  onPrimaryClick: () => void;
};

/**
 * v2 Hero — copy left, a tight editor preview right (Granola-style single
 * product surface). The preview shows the distraction-free writing canvas with
 * a live cursor and one Book Mind callout, so a visitor feels the tool at a
 * glance without the page leaning maximalist.
 */
export default function HeroSection({ onPrimaryClick }: HeroSectionProps) {
  return (
    <section className="relative pt-10 pb-24 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-28 overflow-hidden">
      {/* Soft tint wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(64,112,255,.04), transparent 50%), radial-gradient(circle at 80% 70%, rgba(180,83,9,.04), transparent 50%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">

          {/* —— Copy —— */}
          <div>
            {/* Eyebrow */}
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              Free to start &middot; No software to install
            </div>

            {/* Headline */}
            <h1
              className="mt-5 font-serif font-bold text-gray-900 text-balance"
              style={{
                fontSize: 'clamp(1.875rem, 3vw, 2.75rem)',
                letterSpacing: '-0.025em',
                lineHeight: 1.08,
              }}
            >
              The{' '}
              <em style={{ fontStyle: 'italic', fontWeight: 500 }}>eBook</em>{' '}
              editor with an AI that reads your whole manuscript.
            </h1>

            {/* Sub */}
            <p
              className="mt-6 max-w-md text-gray-600 text-pretty"
              style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.1875rem)', lineHeight: 1.55 }}
            >
              Write, format, and export Kindle-ready books. Catch continuity errors and check KDP compliance before you upload.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <button
                onClick={onPrimaryClick}
                className="group px-8 py-4 text-base sm:text-lg font-semibold bg-gray-900 text-white rounded-full inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
              >
                Start writing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* —— Editor preview —— */}
          <EditorPreview />
        </div>
      </div>
    </section>
  );
}

/* —— Tight editor preview ————————————————————————————————— */

function EditorPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none lg:justify-self-end">
      {/* Kindle-style reader, matching the Editor Showcase section below. */}
      <div className="flex flex-col bg-[#f7f4ea] border border-gray-200 rounded-[20px] overflow-hidden shadow-[0_44px_70px_-34px_rgba(20,20,19,.30),0_2px_6px_rgba(20,20,19,.06)]">
        {/* Reader top bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-200 bg-white/60">
          <span className="font-mono text-[12px] text-gray-500 font-semibold">9:42</span>
          <span className="hidden sm:inline truncate text-[12.5px] text-gray-500 italic" style={{ fontFamily: 'Georgia, serif' }}>
            Paperwhite &middot; Libre Baskerville &middot; 11pt
          </span>
          <span className="shrink-0 inline-flex items-center gap-1.5 bg-gray-900 text-[#faf9f5] text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-full">
            <span className="relative inline-flex w-1.5 h-1.5">
              <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-60 animate-ping" />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-500" />
            </span>
            Live preview
          </span>
        </div>

        {/* Page */}
        <div className="px-7 sm:px-10 py-10">
          <h3 className="font-serif text-[12px] tracking-[0.35em] uppercase font-medium text-center text-gray-400 mb-2">
            Chapter Seven
          </h3>
          <h2 className="font-serif font-bold text-center leading-[1.1] text-gray-900 mb-7" style={{ fontSize: 'clamp(24px, 3vw, 30px)', letterSpacing: '-0.02em' }}>
            The Midnight Garden
          </h2>
          <div className="max-w-[46ch] mx-auto" style={{ fontFamily: '"Libre Baskerville", Georgia, serif', fontSize: '14px', lineHeight: 1.75, color: '#2a2a28' }}>
            <p className="mb-3.5 text-justify first-letter:font-serif first-letter:font-bold first-letter:text-[54px] first-letter:float-left first-letter:leading-[0.8] first-letter:mr-2.5 first-letter:mt-1 first-letter:text-gray-900">
              The morning light fell across the old manuscript pages, illuminating years of careful revision. She had written this story a hundred times in her mind before committing a single word to paper.
            </p>
            <p className="mb-3.5 text-justify indent-[1.5em]">
              <span style={{ background: 'linear-gradient(transparent 62%, rgba(64,112,255,.22) 62%)' }}>Sarah</span> pressed on, even as the familiar doubt crept in. The story had been waiting too long, and she could feel it in her bones like a forgotten promise.
            </p>
            <p className="text-justify indent-[1.5em]">There was no going back now.</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto px-5 py-3.5 border-t border-gray-200 bg-white/60 flex justify-between font-mono text-[11px] text-gray-400">
          <span>Chapter Seven</span>
          <span>172 / 312</span>
        </footer>
      </div>

      {/* Book Mind, reading the whole manuscript, in the same clean UI. */}
      <div className="absolute -right-4 sm:-right-7 bottom-9 w-[244px] bg-white border border-gray-200/90 rounded-[16px] p-4 shadow-[0_26px_46px_-22px_rgba(20,20,19,.32),0_2px_6px_rgba(20,20,19,.06)]">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="relative inline-flex w-1.5 h-1.5">
            <span className="absolute inline-flex w-full h-full rounded-full bg-blue-500 opacity-60 animate-ping" />
            <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-blue-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">Book Mind</span>
          <span className="ml-auto text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">Continuity</span>
        </div>
        <h4 className="text-[13.5px] font-semibold text-gray-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          Sarah&rsquo;s eyes changed colour
        </h4>
        <p className="text-[12px] leading-[1.5] text-gray-500 m-0" style={{ fontFamily: 'Georgia, serif' }}>
          Green in Chapter 3, blue in Chapter 7. Want to see both passages?
        </p>
      </div>
    </div>
  );
}
