'use client';

import React, { forwardRef } from 'react';

import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

const EditorShowcaseSection = forwardRef<HTMLElement>(function EditorShowcaseSection(_, ref) {
  return (
    <section
      id="features"
      ref={ref}
      className={SECTION_TIERS.standard.section}
      style={{ scrollMarginTop: '6rem' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl mb-14 sm:mb-16">
            <h2 className="font-serif font-bold text-gray-900 text-balance" style={SECTION_TIERS.standard.title}>
              Everything a writer needs.
            </h2>
            <p className="mt-5 text-lg sm:text-xl text-gray-600 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.55 }}>
              A focused writing environment built from the ground up for ebook authors.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* Card 1: Formatting Toolbar */}
          <FadeIn delay={0}>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="p-8 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>Write without friction</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-pretty">Rich formatting tools built for authors. Headings, quotes, lists and more, all without leaving the keyboard.</p>
              </div>
              <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#2f2f2f]">
                {/* Toolbar */}
                <div className="bg-[#262626] flex items-center gap-0.5 px-2.5 py-2 border-b border-[#2f2f2f]">
                  {[['B','font-bold'],['I','italic'],['U','underline']].map(([l,c],i) => (
                    <button key={i} className={`w-7 h-7 flex items-center justify-center rounded text-white/70 text-xs ${c}`}>{l}</button>
                  ))}
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  {['H1','H2','H3'].map((l,i) => (
                    <button key={i} className={`w-8 h-7 flex items-center justify-center rounded text-[10px] font-medium ${i===1 ? 'bg-[#4070ff]/20 text-[#4070ff]' : 'text-white/70'}`}>{l}</button>
                  ))}
                  <div className="w-px h-4 bg-white/10 mx-1" />
                  <button className="w-7 h-7 flex items-center justify-center rounded text-white/70 text-sm font-serif">&ldquo;</button>
                  <button className="w-7 h-7 flex items-center justify-center rounded text-white/70">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  </button>
                </div>
                {/* Editor body */}
                <div className="bg-[#1e1e1e] px-6 py-5">
                  <div className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-3">Chapter Two</div>
                  <div className="text-white/90 text-base font-semibold mb-3" style={{ fontFamily: 'Georgia, serif', lineHeight: '1.3' }}>The Midnight Garden</div>
                  <div className="text-white/55 text-[13px] leading-relaxed space-y-3" style={{ fontFamily: 'Georgia, serif' }}>
                    <p>The morning light fell across the old manuscript pages, illuminating years of careful revision. She had written this story a hundred times in her mind before committing a single word to paper.</p>
                    <div className="border-l-2 border-[#4070ff] pl-3 text-white/40 italic">&ldquo;This time,&rdquo; she thought, &ldquo;it would be different.&rdquo;</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Card 2: Chapter Sidebar */}
          <FadeIn delay={100}>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="p-8 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>Every chapter in its place</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-pretty">Build and reorder your book structure at a glance. Drag chapters into place, track word counts, and never lose your thread.</p>
              </div>
              <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#2f2f2f] bg-[#1e1e1e]">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#2f2f2f]">
                  <span className="text-white/40 text-[10px] font-semibold uppercase tracking-widest">Your Library</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-white/30"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                {[
                  { title: 'Prologue', words: '420', active: false },
                  { title: 'Chapter One', words: '1,842', active: true },
                  { title: 'Chapter Two', words: '2,103', active: false },
                  { title: 'Chapter Three', words: '1,567', active: false },
                  { title: 'Chapter Four', words: '891', active: false },
                  { title: 'Epilogue', words: '345', active: false },
                ].map((ch, i) => (
                  <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 ${ch.active ? 'bg-[#4070ff]/10' : ''}`}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-white/20 flex-shrink-0"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
                    <span className={`flex-1 text-[13px] ${ch.active ? 'text-white' : 'text-white/45'}`}>{ch.title}</span>
                    <span className="text-white/25 text-[10px]">{ch.words}w</span>
                  </div>
                ))}
                <div className="px-3 py-2.5 border-t border-[#2f2f2f] flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="text-white/25"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  <span className="text-white/25 text-[12px]">Add chapter</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Card 3: EPUB Export */}
          <FadeIn delay={200}>
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="p-8 pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-balance" style={{ letterSpacing: '-0.02em' }}>Export in one click</h3>
                <p className="text-gray-600 text-sm leading-relaxed text-pretty">Pick a typography preset and get a publish-ready EPUB instantly. No formatting knowledge or extra tools required.</p>
              </div>
              <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-[#2f2f2f] bg-[#1e1e1e]">
                <div className="px-5 pt-5 pb-5">
                  <div className="text-white/80 text-sm font-semibold mb-5">Export EPUB</div>
                  <div className="text-white/35 text-[10px] uppercase tracking-widest mb-2.5">Typography preset</div>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {['Novel', 'Non-fiction', 'Technical', 'Poetry'].map((p, i) => (
                      <button key={i} className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${i === 0 ? 'bg-[#4070ff] text-white' : 'bg-[#262626] text-white/45 border border-[#2f2f2f]'}`}>{p}</button>
                    ))}
                  </div>
                  <div className="bg-[#262626] rounded-lg p-3.5 mb-5 border border-[#2f2f2f]">
                    <div className="flex items-baseline gap-2.5 mb-1.5">
                      <span className="text-white/80 text-xl" style={{ fontFamily: 'Georgia, serif' }}>Aa</span>
                      <div>
                        <div className="text-white/60 text-[11px]">Libre Baskerville &middot; 11pt</div>
                        <div className="text-white/30 text-[10px]">Line height 1.5 &middot; Margin 20mm</div>
                      </div>
                    </div>
                    <div className="text-white/35 text-[11px] leading-relaxed mt-2" style={{ fontFamily: 'Georgia, serif' }}>The quick brown fox jumps over the lazy dog.</div>
                  </div>
                  <button className="w-full py-2.5 rounded-full bg-white text-gray-900 text-[13px] font-semibold flex items-center justify-center gap-2">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export EPUB
                  </button>
                </div>
              </div>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
});

export default EditorShowcaseSection;
