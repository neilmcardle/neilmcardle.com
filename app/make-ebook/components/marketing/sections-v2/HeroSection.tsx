'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';

type HeroSectionProps = {
  onPrimaryClick: () => void;
  onSecondaryClick?: () => void;
};

/**
 * v2 Hero — maximalist cinematic.
 *
 * Adds:
 *  • Eyebrow with pulse dot
 *  • Italic final word + blinking caret (writer-cursor motif)
 *  • Book Mind constellation: central manuscript card orbited by 6 insight cards,
 *    tied together by an animated dashed SVG.
 *
 * Keeps:
 *  • Same headline copy, same primary CTA handler contract
 *  • Same Playfair/Georgia type treatment as v1
 */
export default function HeroSection({ onPrimaryClick, onSecondaryClick }: HeroSectionProps) {
  return (
    <section className="relative pt-10 pb-24 sm:pt-14 sm:pb-28 lg:pt-16 lg:pb-32 overflow-hidden">
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
        {/* Eyebrow */}
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          A free, browser-based editor &middot; Made in the open
        </div>

        {/* Headline */}
        <h1
          className="mt-5 font-serif font-bold text-gray-900 text-balance"
          style={{
            fontSize: 'clamp(2.75rem, 7vw, 5.75rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.95,
          }}
        >
          <span className="block">Write the</span>
          <span className="block">book you&rsquo;ve been</span>
          <span className="block">
            <em className="font-medium not-italic" style={{ fontStyle: 'italic', fontWeight: 500 }}>
              putting off
            </em>
            <span
              aria-hidden
              className="inline-block align-[-0.08em] ml-1 bg-gray-900"
              style={{ width: '0.035em', height: '0.85em', animation: 'caretBlink 1.06s steps(2, end) infinite' }}
            />
            <style>{`@keyframes caretBlink { 0%,50% { opacity: 1 } 50.01%,100% { opacity: 0 } }`}</style>
          </span>
        </h1>

        {/* Sub */}
        <p
          className="mt-6 sm:mt-7 max-w-xl text-gray-600 text-pretty"
          style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1rem, 1vw + 0.5rem, 1.25rem)', lineHeight: 1.55 }}
        >
          A distraction-free editor with an AI editorial brain that reads your entire manuscript, catching inconsistencies, rewriting inline, and turning rough drafts into store-ready EPUBs.
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-9 flex flex-wrap items-center gap-x-8 gap-y-5">
          <button
            onClick={onPrimaryClick}
            className="group px-8 py-4 text-base sm:text-lg font-semibold bg-gray-900 text-white rounded-full inline-flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            Start writing
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          {onSecondaryClick && (
            <button onClick={onSecondaryClick} className="group inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium">
              See how it thinks
              <span aria-hidden className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
            </button>
          )}
        </div>

        {/* Tiny line */}
        <div className="mt-11 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] text-gray-400">
          <span>Free forever &middot; No credit card</span>
          <span className="inline-block w-1 h-1 rounded-full bg-gray-400/50" />
          <span>EPUB &middot; PDF &middot; DOCX &middot; Kindle &middot; Apple Books &middot; Kobo</span>
          <span className="inline-block w-1 h-1 rounded-full bg-gray-400/50" />
          <span>Works offline</span>
        </div>

        {/* Constellation */}
        <Constellation />
      </div>
    </section>
  );
}

/* —— Book Mind constellation —————————————————————————————— */

function Constellation() {
  return (
    <div className="relative mt-16 sm:mt-20 pt-14 border-t border-gray-200/80">
      <span className="absolute -top-2.5 left-0 bg-[#faf9f5] px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-500">
        Book Mind &middot; Live analysis of your manuscript
      </span>

      <div className="relative h-[680px] hidden lg:flex items-center justify-center">
        {/* Connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" viewBox="0 0 1200 680" preserveAspectRatio="none">
          <g fill="none" stroke="#141413" strokeWidth={1} strokeDasharray="2 4" opacity={0.5}>
            <path d="M 600 340 Q 350 180 140 80" className="[animation:dashMove_3s_linear_infinite]" />
            <path d="M 600 340 Q 900 200 1060 150" className="[animation:dashMove_3s_linear_infinite]" />
            <path d="M 600 340 Q 320 500 140 620" className="[animation:dashMove_3s_linear_infinite]" />
            <path d="M 600 340 Q 900 540 1060 640" className="[animation:dashMove_3s_linear_infinite]" />
            <path d="M 600 340 Q 340 340 110 340" className="[animation:dashMove_3s_linear_infinite]" />
            <path d="M 600 340 Q 880 340 1090 340" className="[animation:dashMove_3s_linear_infinite]" />
          </g>
          <g fill="#4070ff">
            <circle cx={140} cy={80} r={3} />
            <circle cx={1060} cy={150} r={3} />
            <circle cx={140} cy={620} r={3} />
            <circle cx={1060} cy={640} r={3} />
            <circle cx={110} cy={340} r={3} />
            <circle cx={1090} cy={340} r={3} />
          </g>
        </svg>
        <style>{`@keyframes dashMove { to { stroke-dashoffset: -60 } }`}</style>

        {/* Manuscript */}
        <div
          className="relative z-[3] w-[360px] aspect-[2/3] bg-[#fffdf5] border border-gray-200 rounded-[3px] px-9 py-11"
          style={{ boxShadow: '0 40px 60px -30px rgba(20,20,19,.25), 0 2px 4px rgba(20,20,19,.08)', transform: 'rotate(-2.2deg)' }}
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Chapter Seven · Draft 04</div>
          <h3 className="font-serif font-bold text-[22px] leading-[1.1] text-gray-900 mb-4">The Midnight Garden</h3>
          <div className="text-[12.5px] leading-[1.6] text-[#3d3c36] space-y-2.5" style={{ fontFamily: 'Georgia, serif' }}>
            <p>
              The morning light fell across the old manuscript pages, illuminating years of careful revision.{' '}
              <span className="relative px-0.5" style={{ background: 'linear-gradient(transparent 60%, rgba(64,112,255,.22) 60%)' }}>
                Sarah&rsquo;s blue eyes narrowed
                <span className="absolute -inset-[3px] border border-blue-600/60 rounded-[2px] animate-pulse" />
              </span>{' '}
              at the paragraph she had rewritten a hundred times.
            </p>
            <p>She pressed on, even as the familiar doubt crept in. The story had been waiting too long.</p>
            <p>She pressed on, even as the familiar doubt crept in. The story had been waiting too long. There was no going back now.</p>
            <p className="opacity-40">She pressed on, even as the familiar doubt crept&hellip;</p>
          </div>
        </div>

        {/* Insight cards */}
        <InsightCard kind="warn" label="Inconsistency" title="Sarah&rsquo;s eyes changed color" body="Chapter 3 describes them as green. Chapter 7 says blue. Want me to show both passages?" className="top-[2%] left-[6%] w-[240px]" rotate={-4} delay={0} />
        <InsightCard kind="info" label="Theme" title="Recurring motif: light falling" body="Appears 14 times across 5 chapters. Strong pattern. Intentional?" className="top-[18%] right-[4%] w-[240px]" rotate={3} delay={0.4} />
        <InsightCard kind="good" label="Pacing" title="Chapter 7 reads fast" body="58% dialogue vs 23% book-average. Good lift after the slower Chapter 6." className="bottom-[4%] left-[2%] w-[240px]" rotate={2} delay={0.2} />
        <InsightCard kind="warn" label="KDP Pre-flight" title="Missing AI disclosure" body="Amazon requires it if any generative AI was used. Click to add." className="bottom-[2%] right-[8%] w-[240px]" rotate={-3} delay={0.9} />
        <InsightCard kind="info" label="Character" title="Sarah · 247 mentions" body="Introduced Ch 1 · last seen Ch 9" className="top-[44%] left-[-2%] w-[190px]" rotate={1} delay={0.6} />
        <InsightCard kind="info" label="Memory" title="Rule noted" body="&ldquo;Never use &lsquo;suddenly&rsquo; in narration.&rdquo; Applied across 38 suggestions." className="top-[40%] right-[-2%] w-[200px]" rotate={-2} delay={1.2} />
      </div>

      {/* Mobile stack */}
      <div className="lg:hidden grid gap-4 mt-4">
        <div className="bg-[#fffdf5] border border-gray-200 rounded p-6">
          <div className="text-[9px] font-bold uppercase tracking-[0.24em] text-gray-400 mb-3">Chapter Seven · Draft 04</div>
          <h3 className="font-serif font-bold text-[20px] leading-[1.1] text-gray-900 mb-3">The Midnight Garden</h3>
          <p className="text-[13px] leading-[1.6] text-[#3d3c36]" style={{ fontFamily: 'Georgia, serif' }}>
            The morning light fell across the old manuscript pages&hellip;
          </p>
        </div>
        <InsightCard kind="warn" label="Inconsistency" title="Sarah&rsquo;s eyes changed color" body="Chapter 3 green, Chapter 7 blue." className="w-full" />
        <InsightCard kind="info" label="Theme" title="Recurring motif: light falling" body="14 times across 5 chapters." className="w-full" />
        <InsightCard kind="good" label="Pacing" title="Chapter 7 reads fast" body="58% dialogue vs 23% book-average." className="w-full" />
      </div>
    </div>
  );
}

type InsightKind = 'info' | 'warn' | 'good';
function InsightCard({
  kind,
  label,
  title,
  body,
  className = '',
  rotate = 0,
  delay = 0,
}: {
  kind: InsightKind;
  label: string;
  title: string;
  body: string;
  className?: string;
  rotate?: number;
  delay?: number;
}) {
  const dotColor = kind === 'warn' ? 'bg-amber-700' : kind === 'good' ? 'bg-emerald-700' : 'bg-blue-600';
  const dotRing = kind === 'warn' ? 'ring-amber-700/20' : kind === 'good' ? 'ring-emerald-700/20' : 'ring-blue-600/20';
  const labelColor = kind === 'warn' ? 'text-amber-700' : kind === 'good' ? 'text-emerald-700' : 'text-gray-400';

  const hasPos = className.includes('top') || className.includes('bottom') || className.includes('left') || className.includes('right');
  void delay;
  const style: React.CSSProperties = hasPos
    ? {
        position: 'absolute',
        boxShadow: '0 24px 36px -22px rgba(20,20,19,.22), 0 2px 4px rgba(20,20,19,.05)',
        transform: `rotate(${rotate}deg)`,
        zIndex: 4,
      }
    : { boxShadow: '0 12px 24px -16px rgba(20,20,19,.2)' };

  return (
    <div className={`bg-[#fffdf5] border border-gray-200 rounded-[14px] p-4 ${className}`} style={style}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ring-4 ${dotRing}`} />
        <span className={`text-[10px] font-bold uppercase tracking-[0.18em] ${labelColor}`}>{label}</span>
      </div>
      <h4 className="text-[13px] font-semibold text-gray-900 mb-1" style={{ letterSpacing: '-0.01em' }} dangerouslySetInnerHTML={{ __html: title }} />
      <p className="text-[12px] leading-[1.5] text-gray-500 m-0" style={{ fontFamily: 'Georgia, serif' }} dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
