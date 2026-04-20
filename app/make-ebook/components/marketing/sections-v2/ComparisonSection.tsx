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
function NoMark() { return <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-200 text-gray-400 text-xs">–</span>; }
function Partial({ children }: { children: React.ReactNode }) { return <span className="text-[12px] text-gray-500 italic">{children}</span>; }

export default function ComparisonSection() {
  return (
    <section className={SECTION_TIERS.standard.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">03 &middot; Why not just use…</div>
            <h2 className="mt-3 font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
              The tools you&rsquo;ve tried,<br />
              honestly <em className="font-medium">compared</em>.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              Scrivener, Vellum, and Word leave gaps in your workflow. makeEbook combines cloud-based writing with professional-grade export. Everything you need to write, organise, and publish.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={120}>
          {/* Desktop comparison grid */}
          <div className="hidden lg:block mt-14 bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-[0_24px_40px_-30px_rgba(20,20,19,.2)]">
            <div className="grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] bg-gray-100 border-b border-gray-200 text-[12px] uppercase tracking-[0.16em] font-bold text-gray-500">
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
              <div key={i} className={`grid grid-cols-[2fr_1.2fr_1fr_1fr_1fr] items-center ${i !== ROWS.length - 1 ? 'border-b border-gray-200/70' : ''}`}>
                <div className="p-5 text-sm">
                  <div className="font-medium text-gray-900">{r.feat}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">{r.sub}</div>
                </div>
                <div className="p-5 text-sm text-gray-900 font-semibold bg-blue-600/[0.04] border-x border-blue-600/15">{r.us}</div>
                <div className="p-5 text-sm text-gray-700">{r.scrivener}</div>
                <div className="p-5 text-sm text-gray-700">{r.vellum}</div>
                <div className="p-5 text-sm text-gray-700">{r.word}</div>
              </div>
            ))}
          </div>

          {/* Mobile comparison cards */}
          <div className="lg:hidden mt-10 space-y-4">
            {ROWS.map((r, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_8px_24px_-20px_rgba(20,20,19,.2)]">
                <div className="font-medium text-gray-900">{r.feat}</div>
                <div className="text-[12px] text-gray-400 mt-0.5 mb-4">{r.sub}</div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-md bg-blue-600/[0.04] border border-blue-600/15">
                    <span className="font-semibold text-gray-900">makeEbook</span>
                    <span className="text-gray-900 font-semibold">{r.us}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-gray-600">Scrivener</span>
                    <span className="text-gray-700">{r.scrivener}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-gray-600">Vellum</span>
                    <span className="text-gray-700">{r.vellum}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 py-2">
                    <span className="text-gray-600">Word</span>
                    <span className="text-gray-700">{r.word}</span>
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
