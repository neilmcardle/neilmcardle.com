'use client';

import React from 'react';
import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

const ROWS: { feat: string; sub: string; us: React.ReactNode; scrivener: React.ReactNode; vellum: React.ReactNode; word: React.ReactNode }[] = [
  { feat: 'Runs in the browser', sub: 'No install, no license keys', us: <Check />, scrivener: <NoMark />, vellum: <NoMark />, word: <Partial>365 only</Partial> },
  { feat: 'Native EPUB export', sub: 'Kindle, Kobo, Apple Books ready', us: <Check />, scrivener: <Partial>with fiddling</Partial>, vellum: <Check />, word: <NoMark /> },
  { feat: 'Drag-and-drop chapters', sub: 'See the whole book at a glance', us: <Check />, scrivener: <Check />, vellum: <NoMark />, word: <NoMark /> },
  { feat: 'AI reads whole manuscript', sub: 'Not just a chat sidebar', us: <Check />, scrivener: <NoMark />, vellum: <NoMark />, word: <Partial>Copilot, one page</Partial> },
  { feat: '⌘K inline rewrite with takes', sub: 'Three versions, keep one', us: <Check />, scrivener: <NoMark />, vellum: <NoMark />, word: <NoMark /> },
  { feat: 'Amazon KDP pre-flight', sub: 'Catches what gets books delisted', us: <Check />, scrivener: <NoMark />, vellum: <NoMark />, word: <NoMark /> },
  { feat: 'Works offline', sub: 'PWA, even on the plane', us: <Check />, scrivener: <Check />, vellum: <Check />, word: <Partial>desktop only</Partial> },
  { feat: 'Price to start', sub: 'Reasonable first touch', us: <strong>Free</strong>, scrivener: '$59 one-time', vellum: '$250 one-time', word: '$7/mo' },
];

function Check() { return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs">✓</span>; }
function NoMark() { return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-[#3a3a3a] text-white/25 text-xs">–</span>; }
function Partial({ children }: { children: React.ReactNode }) { return <span className="text-[12px] text-white/40 italic">{children}</span>; }

export default function ComparisonSection() {
  return (
    <section className={SECTION_TIERS.standard.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">04 &middot; Why not just use…</div>
            <h2 className="mt-3 font-serif font-bold text-white text-balance" style={SECTION_TIERS.standard.title}>
              The tools you&rsquo;ve tried,<br />
              honestly compared.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-white/65 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              Scrivener, Vellum, and Word leave gaps in your workflow. makeEbook combines cloud-based writing with professional-grade export. Everything you need to write, organise, and publish.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          <div className="hidden lg:block mt-14 bg-[#262626] border border-[#2f2f2f] rounded-[20px] overflow-hidden shadow-[0_24px_40px_-30px_rgba(0,0,0,.5)]">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] bg-[#1a1a1a] border-b border-[#2f2f2f] text-[12px] uppercase tracking-[0.16em] font-bold text-white/40">
              <div className="p-5">Capability</div>
              <div className="p-5 bg-gray-900 text-[#faf9f5] relative">
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-blue-600" />
                makeEbook
              </div>
              <div className="p-5">Scrivener</div>
              <div className="p-5">Vellum</div>
              <div className="p-5">Word</div>
            </div>
            {ROWS.map((r, i) => (
              <div key={i} className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] items-center ${i !== ROWS.length - 1 ? 'border-b border-[#2f2f2f]' : ''}`}>
                <div className="p-5 text-sm">
                  <div className="font-medium text-white/85">{r.feat}</div>
                  <div className="text-[12px] text-white/35 mt-1">{r.sub}</div>
                </div>
                <div className="p-5 text-sm text-white font-semibold bg-blue-600/[0.08] border-x border-blue-600/20">{r.us}</div>
                <div className="p-5 text-sm text-white/55">{r.scrivener}</div>
                <div className="p-5 text-sm text-white/55">{r.vellum}</div>
                <div className="p-5 text-sm text-white/55">{r.word}</div>
              </div>
            ))}
          </div>

          <div className="lg:hidden mt-10 space-y-4">
            {ROWS.map((r, i) => (
              <div key={i} className="bg-[#262626] border border-[#2f2f2f] rounded-2xl p-5">
                <div className="font-medium text-white/85">{r.feat}</div>
                <div className="text-[12px] text-white/35 mt-1 mb-4">{r.sub}</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-blue-600/[0.08] border border-blue-600/20">
                    <span className="font-semibold text-white">makeEbook</span>
                    <span className="text-white font-semibold">{r.us}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-white/50">Scrivener</span>
                    <span className="text-white/55">{r.scrivener}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-white/50">Vellum</span>
                    <span className="text-white/55">{r.vellum}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-white/50">Word</span>
                    <span className="text-white/55">{r.word}</span>
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
