'use client';

import React from 'react';
import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import { ModKey } from './PlatformKey';

export default function BookMindPitchSection() {
  return (
    <section id="book-mind" className={`${SECTION_TIERS.cinematic.section} bg-[#141413] text-[#faf9f5]`}>
      <style>{`
        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes take-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">02 &middot; Book Mind</div>

            <h2 className="mt-3 font-serif font-bold text-white text-balance" style={SECTION_TIERS.cinematic.title}>
              An editorial brain<br />
              that lives inside your draft.
            </h2>
            <p className="mt-6 text-xl sm:text-2xl text-white/70 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
              Select a sentence. Press <span className="font-mono bg-white/10 px-2 py-1 rounded text-[0.85em]"><ModKey keyName="K" /></span>. Three rewrites appear, not one. Keep the one that sounds like you, branch on it, or leave the page untouched.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <FadeIn>
            <div className="border border-[#2f2f2f] rounded-2xl overflow-hidden">
              <div className="px-5 py-6">
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,.70)' }}>
                  Sarah pressed on, even as the familiar doubt crept in.{' '}
                  <span
                    className="px-1 py-1 rounded-[3px]"
                    style={{
                      background: 'rgba(37,99,235,.18)',
                      boxShadow: 'inset 0 0 0 1px rgba(37,99,235,.45)',
                    }}
                  >
                    The story had been waiting too long, and she could feel it in her bones like a forgotten promise.
                  </span>{' '}
                  There was no going back now.
                </p>
              </div>

              <div className="border-t border-[#2f2f2f]">
                <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-[#2f2f2f] bg-[#262626]">
                  <span className="font-mono text-[11px] text-white/35 bg-[#1e1e1e] border border-[#2f2f2f] px-2 py-1 rounded"><ModKey keyName="K" /></span>
                  <span className="font-mono text-[13px] text-white/80">rewrite tighter, keep the rhythm</span>
                  <span className="inline-block w-0.5 h-3.5 bg-white/80" style={{ animation: 'blink 1s step-end infinite' }} />
                  <span className="ml-auto flex gap-1">
                    <kbd className="font-mono bg-[#1e1e1e] border border-[#2f2f2f] text-white/40 text-[10px] px-2 py-1 rounded">↑↓</kbd>
                    <kbd className="font-mono bg-[#1e1e1e] border border-[#2f2f2f] text-white/40 text-[10px] px-2 py-1 rounded">↵</kbd>
                  </span>
                </div>
                <div className="divide-y divide-[#2f2f2f]">
                  <Take n={1} tag="Tighter · Your voice" featured delay={0.5}>
                    The story had waited too long. She knew it in her bones.
                  </Take>
                  <Take n={2} tag="Sharper rhythm" delay={1.3}>
                    Too long. A promise, forgotten, pressing against her ribs.
                  </Take>
                  <Take n={3} tag="Original meaning, cleaner" delay={2.1}>
                    Something in her bones told her the story could wait no longer.
                  </Take>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="divide-y divide-white/10">
              <Feature n={1} title="It reads your whole book.">
                Themes, characters, pacing, tonal consistency. All pre-computed the moment you start writing, not stuffed into a prompt.
              </Feature>
              <Feature n={2} title="It remembers your rules.">
                &ldquo;Never use &lsquo;suddenly&rsquo; in narration.&rdquo; &ldquo;Sarah has green eyes.&rdquo; Book Mind holds your editorial decisions across sessions.
              </Feature>
              <Feature n={3} title="It guards your listing.">
                Amazon KDP pre-flight catches what would get your book delisted before you upload. AI disclosure, metadata, formatting: all checked.
              </Feature>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Take({ n, tag, featured = false, delay = 0, children }: { n: number; tag: string; featured?: boolean; delay?: number; children: React.ReactNode }) {
  return (
    <div
      className={`flex gap-4 px-4 py-3.5 ${featured ? 'bg-white/[0.04]' : ''}`}
      style={{ opacity: 0, animation: `take-in 0.4s ease forwards ${delay}s` }}
    >
      <span className="font-mono text-[11px] text-white/25 pt-0.5 w-4 flex-shrink-0 select-none">{n}</span>
      <div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-white/35 font-semibold mb-2">{tag}</div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,.75)' }}>{children}</div>
      </div>
    </div>
  );
}

function Feature({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="py-7 flex gap-5 items-start">
      <span className="font-mono text-[11px] text-white/25 pt-1 w-5 flex-shrink-0 select-none">
        {String(n).padStart(2, '0')}
      </span>
      <div>
        <h4 className="font-serif text-[20px] font-semibold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>{title}</h4>
        <p className="text-white/60 m-0" style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.6 }}>{children}</p>
      </div>
    </div>
  );
}
