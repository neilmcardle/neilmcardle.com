'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

type HeroSectionProps = {
  onPrimaryClick: () => void;
};

export default function HeroSection({ onPrimaryClick }: HeroSectionProps) {
  return (
    <section className="relative pt-10 pb-32 sm:pt-14 sm:pb-40 lg:pt-16 lg:pb-44 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-20 items-start">

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              For indie fiction authors &middot; Free to start
            </div>
            <h1
              className="mt-5 font-serif font-bold text-white text-balance"
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                letterSpacing: '-0.04em',
                lineHeight: 1.02,
              }}
            >
              Built for the writers who finish.
            </h1>
            <p
              className="mt-6 max-w-md text-white/65 text-pretty"
              style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.1875rem)', lineHeight: 1.55 }}
            >
              The eBook editor built for writing with AI. Write, format, and export Kindle-ready books. Book Mind reads your whole manuscript and keeps your listing safe on Amazon.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <button
                onClick={onPrimaryClick}
                className="group px-8 py-4 text-base sm:text-lg font-semibold bg-white text-gray-900 rounded-full inline-flex items-center gap-2 hover:bg-gray-100 transition-colors"
              >
                Start writing. It&rsquo;s free.
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

const CHECKS: [string, string][] = [
  ['Word count', '86,430 — suitable for literary fiction'],
  ['Narrative consistency', 'strong across all 11 chapters'],
  ['KDP metadata', 'title, author, description complete'],
  ['AI disclosure', 'generated and ready to paste'],
  ['Listing risks', 'none detected'],
];

function HeroVisual() {
  return (
    <>
      <style>{`
        @keyframes bm-in {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bm-cursor {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>

      <div className="border border-[#2f2f2f] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 bg-[#262626] border-b border-[#2f2f2f] flex items-center gap-3">
          <span className="relative inline-flex w-2 h-2 flex-shrink-0">
            <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Book Mind &middot; Pre-flight</span>
        </div>

        <div className="px-6 pt-6 pb-7 space-y-4">
          <div style={{ opacity: 0, animation: 'bm-in 0.35s ease forwards 0.3s' }}>
            <span className="font-mono text-[11px] uppercase tracking-wider text-white/30">Analyzing</span>
            <span className="ml-2 font-serif text-[15px] text-white/80">The Cartographer&rsquo;s Daughter</span>
          </div>

          <div className="font-mono text-[12px] text-white/25" style={{ opacity: 0, animation: 'bm-in 0.35s ease forwards 0.75s' }}>
            11 chapters &middot; 86,430 words
          </div>

          <div className="border-t border-[#2f2f2f]" style={{ opacity: 0, animation: 'bm-in 0.35s ease forwards 1.1s' }} />

          {CHECKS.map(([label, value], i) => (
            <div
              key={i}
              className="flex gap-3.5 items-start"
              style={{ opacity: 0, animation: `bm-in 0.35s ease forwards ${1.3 + i * 0.55}s` }}
            >
              <span className="font-mono text-emerald-400 text-[12px] mt-0.5 flex-shrink-0">✓</span>
              <p className="m-0 text-[14.5px] leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="text-white/40">{label}:</span>
                {' '}
                <span className="text-white/75">{value}</span>
              </p>
            </div>
          ))}

          <div className="border-t border-[#2f2f2f]" style={{ opacity: 0, animation: `bm-in 0.35s ease forwards ${1.3 + CHECKS.length * 0.55}s` }} />

          <div style={{ opacity: 0, animation: `bm-in 0.35s ease forwards ${1.6 + CHECKS.length * 0.55}s` }}>
            <p className="m-0 text-[15.5px] text-white" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              Ready to upload to KDP.
              <span
                className="inline-block w-[2px] h-[15px] bg-white/60 ml-1 align-middle"
                style={{ animation: 'bm-cursor 1s step-end infinite' }}
              />
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
