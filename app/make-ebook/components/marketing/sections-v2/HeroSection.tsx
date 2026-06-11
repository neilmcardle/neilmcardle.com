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
    <div className="relative mx-auto w-full max-w-[460px] lg:max-w-none lg:justify-self-end">
      {/* The writing canvas */}
      <div
        className="relative bg-[#fffdf6] border border-gray-200/80 rounded-[18px] overflow-hidden"
        style={{ boxShadow: '0 44px 70px -34px rgba(20,20,19,.30), 0 2px 6px rgba(20,20,19,.06)' }}
      >
        {/* Slim window bar */}
        <div className="flex items-center gap-2 px-5 h-11 border-b border-gray-100">
          <span className="flex gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
          </span>
          <span className="ml-2 text-[10.5px] font-medium uppercase tracking-[0.16em] text-gray-400">
            Untitled Novel
          </span>
          <span className="ml-auto text-[10.5px] text-gray-300">Saved</span>
        </div>

        {/* The page */}
        <div className="px-7 sm:px-9 py-8" style={{ fontFamily: 'Georgia, serif' }}>
          <div className="text-[9.5px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">
            Chapter Seven &middot; Draft 04
          </div>
          <h3 className="font-serif font-bold leading-[1.1] text-gray-900 mb-4" style={{ fontSize: 'clamp(20px, 2.2vw, 25px)' }}>
            The Midnight Garden
          </h3>
          <div className="space-y-3 text-[13.5px] leading-[1.75] text-[#3d3c36]">
            <p>
              The morning light fell across the old manuscript pages, illuminating years of careful revision.{' '}
              <span className="relative px-0.5" style={{ background: 'linear-gradient(transparent 62%, rgba(64,112,255,.22) 62%)' }}>
                Sarah&rsquo;s blue eyes narrowed
              </span>{' '}
              at the paragraph she had rewritten a hundred times.
            </p>
            <p>
              She pressed on, even as the familiar doubt crept in. The story had been waiting too long.
              <span
                aria-hidden
                className="inline-block align-[-0.12em] ml-0.5 bg-gray-900"
                style={{ width: '2px', height: '1.05em', animation: 'meHeroCaret 1.06s steps(2, end) infinite' }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* The one Book Mind callout */}
      <div
        className="absolute -right-3 sm:-right-6 bottom-10 w-[228px] bg-white border border-gray-200 rounded-[14px] p-4"
        style={{ boxShadow: '0 26px 42px -22px rgba(20,20,19,.30), 0 2px 4px rgba(20,20,19,.06)', transform: 'rotate(2deg)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-700 ring-4 ring-amber-700/15" />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Book Mind &middot; Inconsistency</span>
        </div>
        <h4 className="text-[13px] font-semibold text-gray-900 mb-1" style={{ letterSpacing: '-0.01em' }}>
          Sarah&rsquo;s eyes changed colour
        </h4>
        <p className="text-[12px] leading-[1.5] text-gray-500 m-0" style={{ fontFamily: 'Georgia, serif' }}>
          Chapter 3 says green, Chapter 7 says blue. Want to see both passages?
        </p>
      </div>

      <style>{`@keyframes meHeroCaret { 0%,50% { opacity: 1 } 50.01%,100% { opacity: 0 } }`}</style>
    </div>
  );
}
