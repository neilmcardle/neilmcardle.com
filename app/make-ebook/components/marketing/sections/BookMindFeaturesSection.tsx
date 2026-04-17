'use client';

// Three visual demos of Book Mind Pro features. Each card is a
// self-contained mock that animates on scroll, showing the feature
// exactly as it looks in the product. Sits below the Book Mind pitch
// section to turn "tell" into "show".

import React, { useState, useRef, useEffect } from 'react';
import FadeIn from '../FadeIn';
import { SECTION_TIERS } from '../sectionTiers';

export default function BookMindFeaturesSection() {
  return (
    <section className={SECTION_TIERS.standard.section}>
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <FadeIn>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Pro features
          </p>
          <h2 className="font-serif font-bold text-gray-900 text-balance mb-12 sm:mb-16" style={SECTION_TIERS.standard.title}>
            See it in action.
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <FadeIn delay={0}>
            <CmdKDemo />
          </FadeIn>
          <FadeIn delay={150}>
            <PreflightDemo />
          </FadeIn>
          <FadeIn delay={300}>
            <InsightsDemo />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ── Cmd-K Inline Edit Demo ─────────────────────────────────────────

function CmdKDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setStep(1), 300);
          setTimeout(() => setStep(2), 1200);
          setTimeout(() => setStep(3), 2400);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm min-h-[340px] flex flex-col">
      <div className="mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          {"\u2318"}K Inline Edit
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Rewrite in place.</h3>
      <p className="text-sm text-gray-500 mb-5">Select text, press {"\u2318"}K, get instant rewrites without leaving the page.</p>

      <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm space-y-3 overflow-hidden">
        {/* Original text with highlight */}
        <p className="text-gray-700 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
          The morning was cold.{' '}
          <span
            className="transition-all duration-500"
            style={{
              backgroundColor: step >= 1 ? 'rgba(64,112,255,0.15)' : 'transparent',
              borderRadius: 2,
              padding: '0 2px',
            }}
          >
            He walked slowly to the window and looked outside at the grey sky.
          </span>
        </p>

        {/* Popover mock */}
        <div
          className="transition-all duration-500"
          style={{
            opacity: step >= 2 ? 1 : 0,
            transform: step >= 2 ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              <span className="text-xs text-gray-500">Make this more vivid</span>
            </div>

            {/* Rewrite result */}
            <div
              className="transition-all duration-500"
              style={{
                opacity: step >= 3 ? 1 : 0,
                transform: step >= 3 ? 'translateY(0)' : 'translateY(4px)',
              }}
            >
              <p className="text-sm text-gray-800 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
                He drifted to the window, pressing his forehead against the cold glass while the sky sagged low and colourless above the rooftops.
              </p>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">Press Tab to accept</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── KDP Pre-flight Demo ────────────────────────────────────────────

function PreflightDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const checks = [
    { label: 'Word count', status: 'pass' as const, detail: '48,230 words' },
    { label: 'Title', status: 'pass' as const, detail: '"The Widened Present"' },
    { label: 'Author', status: 'pass' as const, detail: 'Set' },
    { label: 'Cover image', status: 'warn' as const, detail: 'Missing. Recommended.' },
    { label: 'AI disclosure', status: 'pass' as const, detail: 'Ready to paste into KDP' },
  ];

  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm min-h-[340px] flex flex-col">
      <div className="mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
          KDP Pre-flight
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Ship without fear.</h3>
      <p className="text-sm text-gray-500 mb-5">Amazon catches what other tools miss. Pre-flight catches it first.</p>

      <div className="flex-1 rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2.5 overflow-hidden">
        {checks.map((check, i) => (
          <div
            key={check.label}
            className="flex items-center gap-2.5 transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateX(0)' : 'translateX(-12px)',
              transitionDelay: `${i * 150}ms`,
            }}
          >
            <span className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
              check.status === 'pass'
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}>
              {check.status === 'pass' ? (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-[8px] font-bold">!</span>
              )}
            </span>
            <span className="text-xs font-medium text-gray-900">{check.label}</span>
            <span className="text-xs text-gray-500 ml-auto">{check.detail}</span>
          </div>
        ))}

        {visible && (
          <div className="mt-3 pt-3 border-t border-gray-100 transition-all duration-500" style={{ transitionDelay: '800ms' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Disclosure (ready to paste)</p>
            <p className="text-xs text-gray-600 italic leading-relaxed">
              "This book was written by a human author with AI assistance for editing and suggestions. All creative decisions are the author's own."
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Insights Cards Demo ────────────────────────────────────────────

function InsightsDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), 300);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cards = [
    {
      type: 'Theme',
      color: 'text-blue-600 bg-blue-50',
      title: 'The cost of presence',
      quote: '"He chose the widened present permanently."',
      chapter: 'Chapter 16',
    },
    {
      type: 'Character',
      color: 'text-emerald-600 bg-emerald-50',
      title: 'R.',
      quote: 'A guide who speaks in riddles and reads the ground with his hands.',
      chapter: 'Chapter 4',
    },
    {
      type: 'Issue',
      color: 'text-amber-600 bg-amber-50',
      title: 'Timeline gap',
      quote: 'Transit Day 50 is referenced twice with different events.',
      chapter: 'Chapter 8',
    },
  ];

  return (
    <div ref={ref} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm min-h-[340px] flex flex-col">
      <div className="mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
          Insights & Issues
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Know your book cold.</h3>
      <p className="text-sm text-gray-500 mb-5">Themes, characters, and problems, all pre-computed and instant.</p>

      <div className="flex-1 space-y-2.5 overflow-hidden">
        {cards.map((card, i) => (
          <div
            key={card.title}
            className="rounded-xl bg-gray-50 border border-gray-100 p-3 transition-all duration-500"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transitionDelay: `${i * 200}ms`,
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${card.color}`}>
                {card.type}
              </span>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
                {card.chapter}
              </span>
            </div>
            <p className="text-xs font-medium text-gray-900 mb-0.5">{card.title}</p>
            <p className="text-[11px] text-gray-500 italic leading-snug">{card.quote}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
