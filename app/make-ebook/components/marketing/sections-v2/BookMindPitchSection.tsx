'use client';

import React from 'react';
import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';
import { ModKey } from './PlatformKey';

/**
 * v2 Book Mind Pitch — cinematic dark stage with ⌘K branching takes.
 *
 * Shows a selected sentence, a ⌘K popover, and three alternative rewrites,
 * each labeled with its editorial intent. This replaces v1's chat-style
 * inconsistency dialog — the chat is now implied by the "three takes, keep one"
 * interaction.
 */
export default function BookMindPitchSection() {
  return (
    <section id="book-mind" className={`${SECTION_TIERS.cinematic.section} bg-[#141413] text-[#faf9f5]`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">02 &middot; Book Mind</div>
            <h2 className="mt-3 font-serif font-bold text-white text-balance" style={SECTION_TIERS.cinematic.title}>
              An editorial brain<br />
              that lives <em className="font-medium">inside</em> your draft.
            </h2>
            <p className="mt-6 text-xl sm:text-2xl text-white/70 max-w-xl text-pretty" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.5 }}>
              Select a sentence. Press <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[0.85em]"><ModKey keyName="K" /></span>. Three rewrites appear, not one. Keep the one that sounds like you, branch on it, or leave the page untouched.
            </p>
          </div>
        </FadeIn>

        <div className="mt-16 grid lg:grid-cols-[1.1fr_1fr] gap-14 items-center">
          <FadeIn>
            <div
              className="relative bg-[#0f0f0f] border border-[#2a2a28] rounded-[20px] p-10 min-h-[500px] overflow-hidden"
              style={{ boxShadow: '0 40px 80px -40px rgba(0,0,0,.6)' }}
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(ellipse at top, rgba(64,112,255,.15), transparent 60%)' }}
              />
              <div className="relative" style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.75, color: 'rgba(255,255,255,.78)' }}>
                Sarah pressed on, even as the familiar doubt crept in.{' '}
                <span
                  className="px-1 py-0.5 rounded-[3px] relative"
                  style={{
                    background: 'rgba(64,112,255,.25)',
                    boxShadow: 'inset 0 0 0 1px rgba(64,112,255,.5)',
                  }}
                >
                  The story had been waiting too long, and she could feel it in her bones like a forgotten promise.
                </span>{' '}
                There was no going back now.
              </div>

              <div className="relative mt-7 bg-[#1a1a1a] border border-[#2a2a28] rounded-xl overflow-hidden shadow-[0_24px_40px_-12px_rgba(0,0,0,.5)]">
                <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-[#2a2a28]">
                  <span className="font-mono text-[11px] text-white/40 bg-[#262626] border border-[#2f2f2f] px-1.5 py-0.5 rounded"><ModKey keyName="K" /></span>
                  <span className="font-mono text-[13px] text-white">rewrite tighter, keep the rhythm</span>
                  <span className="inline-block w-0.5 h-3.5 bg-blue-500 animate-pulse" />
                  <span className="ml-auto flex gap-1">
                    <kbd className="font-mono bg-[#262626] border border-[#2f2f2f] text-white/60 text-[10px] px-1.5 py-0.5 rounded">↑↓</kbd>
                    <kbd className="font-mono bg-[#262626] border border-[#2f2f2f] text-white/60 text-[10px] px-1.5 py-0.5 rounded">↵</kbd>
                  </span>
                </div>
                <div className="p-2.5">
                  <Take n={1} tag="Tighter · Your voice" color="bg-blue-600" featured>
                    The story had waited too long. She knew it in her bones.
                  </Take>
                  <Take n={2} tag="Sharper rhythm" color="bg-amber-700">
                    Too long. A promise, forgotten, pressing against her ribs.
                  </Take>
                  <Take n={3} tag="Original meaning, cleaner" color="bg-emerald-700">
                    Something in her bones told her the story could wait no longer.
                  </Take>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="grid gap-5">
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

function Take({ n, tag, color, featured = false, children }: { n: number; tag: string; color: string; featured?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${featured ? 'bg-blue-600/10' : 'hover:bg-blue-600/10'}`}>
      <span className={`w-5.5 h-5.5 min-w-[22px] h-[22px] rounded-full flex items-center justify-center font-mono text-[11px] text-white font-semibold ${color}`}>{n}</span>
      <div>
        <div className="text-[9px] uppercase tracking-[0.18em] text-white/40 font-semibold mb-1">{tag}</div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,.8)' }}>{children}</div>
      </div>
    </div>
  );
}

function Feature({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="font-serif font-bold text-[40px] text-blue-500 leading-none w-14" style={{ letterSpacing: '-0.04em' }}>{n}</span>
      <div>
        <h4 className="font-serif text-[22px] font-semibold text-white mb-1.5" style={{ letterSpacing: '-0.02em' }}>{title}</h4>
        <p className="text-white/65 m-0" style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.55 }}>{children}</p>
      </div>
    </div>
  );
}
